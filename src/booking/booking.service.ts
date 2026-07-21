import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogService } from "../catalog/catalog.service";
import { RedisService } from "../redis/redis.service";
import { SeatsGateway } from "../show/seats.gateway";
import { CreateBookingDto } from "./dto/booking.dto";
import { SeatStatus, BookingStatus, Prisma } from "@prisma/client";
import * as crypto from "crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Gauge } from "prom-client";

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private readonly SEAT_PRICE = 250.0; // Fixed seat price in decimal

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly seatsGateway: SeatsGateway,
    private readonly catalogService: CatalogService,
    @InjectQueue("ticket-processing") private readonly ticketQueue: Queue,
    @InjectMetric("booking_requests_total") private readonly bookingRequestsCounter: Counter<string>,
    @InjectMetric("booking_redis_lock_failures_total") private readonly redisLockFailuresCounter: Counter<string>,
  ) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    this.bookingRequestsCounter.inc({ status: "initiated" });

    if (!dto.seatCodes || dto.seatCodes.length === 0) {
      throw new BadRequestException("No seats selected for booking");
    }

    // Sort seat codes alphabetically to prevent transactional deadlocks
    const sortedSeatCodes = [...dto.seatCodes].sort();

    // 1. Distributed Memory Locking (Redis NX)
    const lockValue = crypto.randomUUID();
    const acquiredLocks: string[] = [];

    this.logger.log(`Attempting Redis locks for user ${userId} on seats: ${sortedSeatCodes.join(", ")}`);

    for (const seatCode of sortedSeatCodes) {
      const lockKey = `lock:show:${dto.showId}:seat:${seatCode}`;
      const acquired = await this.redisService.acquireLock(lockKey, lockValue, 300000); // 5 min TTL
      if (!acquired) {
        // Fail Fast: Release all locks acquired in this request so far
        this.logger.warn(`Redis lock acquisition failed for key: ${lockKey}. Rolling back acquired locks.`);
        for (const acquiredKey of acquiredLocks) {
          await this.redisService.releaseLock(acquiredKey, lockValue);
        }
        this.redisLockFailuresCounter.inc();
        this.bookingRequestsCounter.inc({ status: "lock_failed" });
        throw new ConflictException("One or more seats are currently being locked by another transaction");
      }
      acquiredLocks.push(lockKey);
    }

    try {
      // 2. PostgreSQL Transaction & Pessimistic Row Locking (SELECT ... FOR UPDATE)
      const booking = await this.prisma.$transaction(async (tx) => {
        // Query and lock rows in the database
        const seats: any[] = await tx.$queryRaw`
          SELECT * FROM "ShowSeat"
          WHERE "showId" = ${dto.showId}
            AND "seatCode" IN (${Prisma.join(sortedSeatCodes)})
          FOR UPDATE
        `;

        if (seats.length !== sortedSeatCodes.length) {
          throw new NotFoundException("One or more selected seats do not exist for this show");
        }

        // Verify all seats are AVAILABLE
        for (const seat of seats) {
          if (seat.status !== SeatStatus.AVAILABLE) {
            throw new ConflictException(`Seat ${seat.seatCode} is no longer available`);
          }
        }

        // Calculate total amount
        const totalAmount = new Prisma.Decimal(sortedSeatCodes.length * this.SEAT_PRICE);

        // Create booking record with status RESERVED
        const newBooking = await tx.booking.create({
          data: {
            userId,
            showId: dto.showId,
            status: BookingStatus.RESERVED,
            totalAmount,
          },
        });

        // Update target seats to RESERVED and link to this booking
        await tx.showSeat.updateMany({
          where: {
            showId: dto.showId,
            seatCode: { in: sortedSeatCodes },
          },
          data: {
            status: SeatStatus.RESERVED,
            bookingId: newBooking.id,
            version: { increment: 1 },
          },
        });

        return newBooking;
      });

      // 3. Broadcast status change to connected clients
      for (const seatCode of sortedSeatCodes) {
        this.seatsGateway.broadcastSeatStatus(dto.showId, seatCode, SeatStatus.RESERVED);
      }

      // 4. Register short-lived 5-minute timeout for seat rollback (expire reservation)
      this.logger.log(`Booking ${booking.id} created. Initializing 5-minute reservation timer.`);
      setTimeout(() => {
        this.expireBooking(booking.id, dto.showId, sortedSeatCodes, lockKeysRelease(dto.showId, sortedSeatCodes), lockValue);
      }, 300000); // 5 minutes

      this.bookingRequestsCounter.inc({ status: "reserved" });
      return booking;
    } catch (error) {
      // In case DB write fails, release all Redis locks
      this.logger.error(`Database transaction failed. Releasing locks.`, error);
      for (const lockKey of acquiredLocks) {
        await this.redisService.releaseLock(lockKey, lockValue);
      }
      this.bookingRequestsCounter.inc({ status: "db_failed" });
      throw error;
    }
  }

  async confirmBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        reservedSeats: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const show = await this.catalogService.findShowById(booking.showId);
    const movie = show ? await this.catalogService.findMovieById(show.movieId) : null;
    const venue = show ? await this.catalogService.findVenueById(show.venueId) : null;

    if (booking.userId !== userId) {
      throw new BadRequestException("Unauthorized access to this booking");
    }

    if (booking.status === BookingStatus.SUCCESS) {
      return { success: true, message: "Booking already confirmed", booking };
    }

    if (booking.status !== BookingStatus.RESERVED) {
      throw new BadRequestException(`Booking cannot be confirmed from status ${booking.status}`);
    }

    const seatCodes = booking.reservedSeats.map((s) => s.seatCode);

    // Confirm booking in DB transaction
    await this.prisma.$transaction(async (tx) => {
      // Row lock seats
      await tx.$queryRaw`
        SELECT * FROM "ShowSeat"
        WHERE "bookingId" = ${bookingId}
        FOR UPDATE
      `;

      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.SUCCESS },
      });

      // Update seat status to BOOKED
      await tx.showSeat.updateMany({
        where: { bookingId },
        data: { status: SeatStatus.BOOKED },
      });
    });

    // Release Redis locks since seat is permanently BOOKED
    for (const seatCode of seatCodes) {
      const lockKey = `lock:show:${booking.showId}:seat:${seatCode}`;
      await this.redisService.forceReleaseLock(lockKey);
    }

    // Broadcast permanently BOOKED status
    for (const seatCode of seatCodes) {
      this.seatsGateway.broadcastSeatStatus(booking.showId, seatCode, SeatStatus.BOOKED);
    }

    // Dispatch background ticket generation and email notification asynchronously (BullMQ)
    await this.ticketQueue.add("generate-ticket", {
      bookingId: booking.id,
      email: booking.user.email,
      seatCodes,
      movieTitle: movie?.title || "Unknown Movie",
      venueName: venue?.name || "Unknown Venue",
    }).catch((err) => {
      this.logger.error(`Failed to push ticket generation job to queue for booking ${booking.id}`, err);
    });

    this.bookingRequestsCounter.inc({ status: "success" });

    return { success: true, message: "Booking confirmed successfully" };
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { reservedSeats: true },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new BadRequestException("Unauthorized access to this booking");
    }

    if (booking.status !== BookingStatus.RESERVED) {
      throw new BadRequestException("Only active reservations can be cancelled");
    }

    const seatCodes = booking.reservedSeats.map((s) => s.seatCode);

    // Cancel in DB transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT * FROM "ShowSeat"
        WHERE "bookingId" = ${bookingId}
        FOR UPDATE
      `;

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.FAILED },
      });

      await tx.showSeat.updateMany({
        where: { bookingId },
        data: {
          status: SeatStatus.AVAILABLE,
          bookingId: null,
        },
      });
    });

    // Release Redis locks
    for (const seatCode of seatCodes) {
      const lockKey = `lock:show:${booking.showId}:seat:${seatCode}`;
      await this.redisService.forceReleaseLock(lockKey);
    }

    // Broadcast AVAILABLE status
    for (const seatCode of seatCodes) {
      this.seatsGateway.broadcastSeatStatus(booking.showId, seatCode, SeatStatus.AVAILABLE);
    }

    return { success: true, message: "Booking cancelled successfully" };
  }

  private async expireBooking(
    bookingId: string,
    showId: string,
    seatCodes: string[],
    lockKeys: string[],
    lockValue: string,
  ) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking || booking.status !== BookingStatus.RESERVED) {
        // Booking is already confirmed (SUCCESS) or cancelled (FAILED)
        return;
      }

      this.logger.log(`Booking ${bookingId} reservation expired. Reverting seats.`);

      await this.prisma.$transaction(async (tx) => {
        // Lock seats
        await tx.$queryRaw`
          SELECT * FROM "ShowSeat"
          WHERE "bookingId" = ${bookingId}
          FOR UPDATE
        `;

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.EXPIRED },
        });

        await tx.showSeat.updateMany({
          where: { bookingId },
          data: {
            status: SeatStatus.AVAILABLE,
            bookingId: null,
          },
        });
      });

      // Release Redis locks
      for (const lockKey of lockKeys) {
        await this.redisService.releaseLock(lockKey, lockValue);
      }

      // Broadcast AVAILABLE status
      for (const seatCode of seatCodes) {
        this.seatsGateway.broadcastSeatStatus(showId, seatCode, SeatStatus.AVAILABLE);
      }
    } catch (error) {
      this.logger.error(`Failed to expire booking ${bookingId} cleanly`, error);
    }
  }

  async getUserBookings(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        reservedSeats: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = [];
    for (const b of bookings) {
      const show = await this.catalogService.findShowById(b.showId);
      const movie = show ? await this.catalogService.findMovieById(show.movieId) : null;
      const venue = show ? await this.catalogService.findVenueById(show.venueId) : null;
      enriched.push({
        id: b.id,
        showId: b.showId,
        status: b.status,
        totalAmount: b.totalAmount,
        createdAt: b.createdAt,
        movieTitle: movie?.title || "Unknown Movie",
        venueName: venue?.name || "Unknown Venue",
        date: show ? new Date(show.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Mar 03, 2026",
        time: show ? new Date(show.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "12:30 PM",
        seats: b.reservedSeats.map((s) => s.seatCode).join(", "),
      });
    }
    return enriched;
  }
}

function lockKeysRelease(showId: string, seatCodes: string[]): string[] {
  return seatCodes.map((code) => `lock:show:${showId}:seat:${code}`);
}
