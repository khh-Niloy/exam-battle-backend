import type { Request, Response, NextFunction } from "express";
import { getRedisClient } from "./redisClient";

type CacheKeyBuilder = (req: Request) => string | null;

export const cacheMiddleware =
  (keyBuilder: CacheKeyBuilder, ttlSeconds: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const key = keyBuilder(req);
    if (!key) return next();

    const redis = getRedisClient();

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Cache read error:", err);
    }

    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      originalJson(body);

      Promise.resolve()
        .then(async () => {
          try {
            await redis.setex(key, ttlSeconds, JSON.stringify(body));
          } catch (err) {
            console.error("Cache write error:", err);
          }
        })
        .catch(() => {});

      return res;
    };

    return next();
  };

export const invalidateKeys = async (keys: string | string[]) => {
  const redis = getRedisClient();
  const keyArray = Array.isArray(keys) ? keys : [keys];

  if (!keyArray.length) return;

  try {
    await redis.del(...keyArray);
  } catch (err) {
    console.error("Cache invalidate error:", err);
  }
};

