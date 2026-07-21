import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { ShowModule } from "../show/show.module";
import { WaitingRoomProcessor } from "./processors/waiting-room.processor";
import { WaitingRoomGuard } from "./guards/waiting-room.guard";
import { BullModule } from "@nestjs/bullmq";
import { TicketProcessor } from "./processors/ticket.processor";
import { PrismaModule } from "../prisma/prisma.module";
import { CatalogModule } from "../catalog/catalog.module";

@Module({
  imports: [
    ShowModule,
    PrismaModule,
    CatalogModule,
    BullModule.registerQueue({
      name: "ticket-processing",
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, WaitingRoomProcessor, WaitingRoomGuard, TicketProcessor],
  exports: [BookingService],
})
export class BookingModule {}
