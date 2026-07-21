# Task: Phase 3 - Asynchronous Queue Refactoring & Secure Payment Webhooks

- `[x]` Step 1: Install Dependencies
  - `[x]` Install `bullmq` and `@nestjs/bullmq`
  - `[x]` Install `razorpay`
- `[x]` Step 2: Implement Redis-based Virtual Waiting Room
  - `[x]` Create `WaitingRoomGuard` at `src/booking/guards/waiting-room.guard.ts`
  - `[x]` Create `WaitingRoomProcessor` at `src/booking/processors/waiting-room.processor.ts`
- `[x]` Step 3: Configure Asynchronous Ticket Queue (BullMQ)
  - `[x]` Configure BullMQ connection globally in `AppModule`
  - `[x]` Create `TicketProcessor` at `src/booking/processors/ticket.processor.ts`
  - `[x]` Inject the queue into `BookingService` and dispatch tasks on success
- `[x]` Step 4: Implement Razorpay Payments Module
  - `[x]` Create `PaymentService` to create orders and verify webhook signatures
  - `[x]` Create `PaymentController` with order creation and webhook routes
  - `[x]` Register `PaymentModule` in `AppModule`
- `[x]` Step 5: Verification & Walkthrough
  - `[x]` Build and run verification scripts
  - `[x]` Provide a detailed walkthrough of the final Phase 3 architecture
