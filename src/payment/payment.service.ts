import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BookingService } from "../booking/booking.service";
import { BookingStatus } from "@prisma/client";
import Razorpay from "razorpay";
import * as crypto from "crypto";

@Injectable()
export class PaymentService {
  private readonly razorpay: Razorpay;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
    });
  }

  async createOrder(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new BadRequestException("Unauthorized access to this booking");
    }

    if (booking.status !== BookingStatus.RESERVED) {
      throw new BadRequestException(`Cannot create payment order for booking in status ${booking.status}`);
    }

    // Razorpay amounts are in Paise (1 INR = 100 Paise)
    const amountPaise = Math.round(Number(booking.totalAmount) * 100);

    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: booking.id,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking.id,
      };
    } catch (error) {
      throw new BadRequestException("Failed to create Razorpay order", (error as Error).message);
    }
  }

  async verifyWebhook(rawBody: string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "webhook_secret_123";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle order.paid or payment.captured
    if (event === "order.paid" || event === "payment.captured") {
      const bookingId = payload.payload.order?.entity?.receipt || payload.payload.payment?.entity?.description;

      if (!bookingId) {
        return { received: true, error: "No bookingId receipt found in payload" };
      }

      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return { received: true, error: "Booking not found" };
      }

      if (booking.status === BookingStatus.SUCCESS) {
        // Idempotency: Ignore duplicate webhook calls
        return { received: true, message: "Booking already confirmed" };
      }

      // Confirm the booking (executes transaction, locks DB, releases Redis, broadcasts WebSockets, and runs BullMQ)
      await this.bookingService.confirmBooking(booking.userId, bookingId);
      return { success: true, message: "Booking successfully confirmed via webhook" };
    }

    return { received: true, message: `Ignored unhandled event: ${event}` };
  }
}
