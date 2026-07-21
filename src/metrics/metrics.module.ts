import { Module, Global } from "@nestjs/common";
import { PrometheusModule, makeCounterProvider, makeGaugeProvider } from "@willsoto/nestjs-prometheus";

const bookingRequestsCounterProvider = makeCounterProvider({
  name: "booking_requests_total",
  help: "Total number of booking creation requests",
  labelNames: ["status"], // e.g. success, conflict, queued
});

const redisLockFailuresCounterProvider = makeCounterProvider({
  name: "booking_redis_lock_failures_total",
  help: "Total number of Redis seat lock acquisition failures",
});

const waitingRoomQueueGaugeProvider = makeGaugeProvider({
  name: "waiting_room_queue_size",
  help: "Current number of users waiting in the virtual queue",
});

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: "/metrics",
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    bookingRequestsCounterProvider,
    redisLockFailuresCounterProvider,
    waitingRoomQueueGaugeProvider,
  ],
  exports: [
    PrometheusModule,
    bookingRequestsCounterProvider,
    redisLockFailuresCounterProvider,
    waitingRoomQueueGaugeProvider,
  ],
})
export class MetricsModule {}
