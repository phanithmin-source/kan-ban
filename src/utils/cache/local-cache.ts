import {
  localRedis,
} from "../../config/redis.js";
import type { CacheProvider } from "./cache.interface.js";

class LocalCache implements CacheProvider {
  async get<T>(key: string): Promise<T | null> {
    const value = await localRedis.get(key);

    return value ? JSON.parse(value) : null;
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number
  ): Promise<void> {
    await localRedis.set(
      key,
      JSON.stringify(value),
      {
        EX: ttlSeconds,
      }
    );
  }

  async invalidate(...keys: string[]): Promise<void> {
    if (!keys.length) return;

    await localRedis.del(keys);
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    let cursor = "0";

    do {
      const result = await localRedis.scan(cursor, {
        MATCH: `${prefix}*`,
        COUNT: 100,
      });

      cursor = result.cursor;

      if (result.keys.length) {
        await localRedis.del(result.keys);
      }
    } while (cursor !== "0");
  }
}

export default new LocalCache();