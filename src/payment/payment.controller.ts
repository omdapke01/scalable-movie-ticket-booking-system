import { Controller, Post, Body, Headers, Req, UseGuards, BadRequestException } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import * as express from "express";

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("create-order")
  @UseGuards(JwtAuthGuard)
  async createOrder(@Req() req: any, @Body("bookingId") bookingId: string) {
    if (!bookingId) {
      throw new BadRequestException("bookingId is required");
    }
    return this.paymentService.createOrder(bookingId, req.user.id);
  }

  @Post("webhook")
  async webhook(@Req() req: express.Request, @Headers("x-razorpay-signature") signature: string) {
    if (!signature) {
      throw new BadRequestException("x-razorpay-signature header is missing");
    }

    const rawBodyBuffer = (req as any).rawBody;
    if (!rawBodyBuffer) {
      throw new BadRequestException("Raw request body is missing. Ensure NestJS rawBody option is enabled.");
    }

    const rawBody = rawBodyBuffer.toString("utf8");
    return this.paymentService.verifyWebhook(rawBody, signature);
  }
}
