import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { RedisService } from "../../redis/redis.service";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Gauge } from "prom-client";

@Injectable()
export class WaitingRoomProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WaitingRoomProcessor.name);
  private intervalId?: NodeJS.Timeout;
  private readonly BATCH_SIZE = 5; // Promoting 5 users every 10 seconds
  private readonly INTERVAL_MS = 10000; // 10 seconds

  constructor(
    private readonly redisService: RedisService,
    @InjectMetric("waiting_room_queue_size") private readonly waitingRoomQueueGauge: Gauge<string>,
  ) {}

  onModuleInit() {
    this.logger.log("Starting Virtual Waiting Room background worker...");
    this.intervalId = setInterval(() => {
      this.promoteQueueUsers();
    }, this.INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.logger.log("Stopped Virtual Waiting Room background worker.");
  }

  private async promoteQueueUsers() {
    const redis = this.redisService.client;
    const queueKey = "waiting_room:queue";

    try {
      // 1. Update queue size telemetry gauge
      const queueLength = await redis.zcard(queueKey);
      this.waitingRoomQueueGauge.set(queueLength);

      // 2. Get first BATCH_SIZE users from the queue
      const userIds = await redis.zrange(queueKey, 0, this.BATCH_SIZE - 1);

      if (userIds.length === 0) {
        return;
      }

      this.logger.log(`Promoting ${userIds.length} users from waiting room to active checkout...`);

      // 2. Promote users atomically using a pipeline
      const pipeline = redis.pipeline();
      for (const userId of userIds) {
        const activeKey = `waiting_room:active:${userId}`;
        // Create active token with 5 minutes (300,000ms) TTL
        pipeline.set(activeKey, "1", "PX", 300000);
        // Remove user from the waiting queue
        pipeline.zrem(queueKey, userId);
      }

      await pipeline.exec();
      this.logger.log(`Successfully promoted users: ${userIds.join(", ")}`);
    } catch (error) {
      this.logger.error("Failed to promote users from waiting room queue", error);
    }
  }
}
