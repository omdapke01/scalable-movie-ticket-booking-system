import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("ticket-processing")
export class TicketProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing background ticket job: ${job.id}`);
    const { bookingId, email, seatCodes, movieTitle, venueName } = job.data;

    this.logger.log(`[Queue Worker] Generating transaction PDF and barcode graphic for Booking: ${bookingId}...`);

    // Simulate heavy file generation and layout computation lag
    await new Promise((resolve) => setTimeout(resolve, 3000));

    this.logger.log(`[Queue Worker] Asynchronously sending booking confirmation email to: ${email}`);
    this.logger.log(
      `[Queue Worker] Ticket details: Movie: "${movieTitle}", Venue: "${venueName}", Seats: ${seatCodes.join(", ")}`,
    );

    return { success: true, ticketPdfPath: `/tickets/ticket-${bookingId}.pdf` };
  }
}
