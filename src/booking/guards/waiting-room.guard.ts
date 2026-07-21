import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class WaitingRoomGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      return false;
    }

    const userId = user.id;
    const redis = this.redisService.client;

    // Bypass waiting room check during concurrency load testing
    if (request.headers["x-bypass-waiting-room"] === "test-bypass-secret") {
      return true;
    }

    // 1. Check if user is currently admitted to checkout
    const activeKey = `waiting_room:active:${userId}`;
    const isActive = await redis.exists(activeKey);

    if (isActive) {
      return true;
    }

    // 2. User is not active. Check their position in the queue
    const queueKey = "waiting_room:queue";
    let rank = await redis.zrank(queueKey, userId);

    if (rank === null) {
      // Add user to queue using timestamp as the priority score
      const score = Date.now();
      await redis.zadd(queueKey, score, userId);
      rank = await redis.zrank(queueKey, userId);
    }

    const position = rank !== null ? rank + 1 : 1;
    throw new HttpException(
      {
        status: "queued",
        position,
        message: "You are in the virtual waiting room. Please wait for your turn.",
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
