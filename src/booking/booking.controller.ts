import { Controller, Post, Get, Body, Param, UseGuards, Req } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/booking.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WaitingRoomGuard } from "./guards/waiting-room.guard";

@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getMyBookings(@Req() req: any) {
    return this.bookingService.getUserBookings(req.user.id);
  }

  @Post()
  @UseGuards(WaitingRoomGuard)
  async createBooking(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, dto);
  }

  @Post(":id/confirm")
  async confirmBooking(@Req() req: any, @Param("id") bookingId: string) {
    return this.bookingService.confirmBooking(req.user.id, bookingId);
  }

  @Post(":id/cancel")
  async cancelBooking(@Req() req: any, @Param("id") bookingId: string) {
    return this.bookingService.cancelBooking(req.user.id, bookingId);
  }
}
