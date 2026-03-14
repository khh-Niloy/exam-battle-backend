import Redis from "ioredis";
import { envVars } from "../config/env";

let redisClient: Redis | null = null;

export const getRedisClient = () => {
  if (!redisClient) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }

  return redisClient;
};

