import { upstashRedis as redis } from "../../config/redis.js";
import type { CacheProvider } from "./cache.interface.js";

class UpstashCache implements CacheProvider {
  async get<T>(key: string): Promise<T | null> {
    return await redis!.get<T>(key);
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number
  ): Promise<void> {
    await redis!.set(
      key,
      JSON.stringify(value),
      {
        ex: ttlSeconds,
      }
    );
  }

  async invalidate(...keys: string[]): Promise<void> {
    if (!keys.length) return;

    await redis!.del(...keys);
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    let cursor = 0;

    do {
      const [nextCursor, keys] = await redis!.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });

      cursor = Number(nextCursor);

      if (keys.length) {
        await redis!.del(...keys);
      }
    } while (cursor !== 0);
  }
}

export default new UpstashCache();