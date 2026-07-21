import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  get client(): Redis {
    return this.redisClient;
  }

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is not defined");
    }
    this.redisClient = new Redis(redisUrl);

    this.redisClient.on("connect", () => {
      this.logger.log("Successfully connected to Redis");
    });

    this.redisClient.on("error", (err) => {
      this.logger.error("Redis connection error", err);
    });
  }

  /**
   * Acquires a lock on a key with a TTL in milliseconds.
   * NX: Set only if it does not exist.
   * PX: Set expiration in milliseconds.
   */
  async acquireLock(key: string, value: string, ttlMs: number): Promise<boolean> {
    const result = await this.redisClient.set(key, value, "PX", ttlMs, "NX");
    return result === "OK";
  }

  /**
   * Releases a lock on a key ONLY if the stored value matches the provided value.
   * Uses an atomic Lua script to prevent a client from deleting another client's lock.
   */
  async releaseLock(key: string, value: string): Promise<boolean> {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redisClient.eval(luaScript, 1, key, value);
    return result === 1;
  }

  /**
   * Force releases a lock key regardless of its stored value.
   */
  async forceReleaseLock(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key);
    return result > 0;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    this.logger.log("Redis client disconnected cleanly");
  }
}
