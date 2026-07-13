import redis from "../config/redis.js";

/**
 * Generic cache helper wrapping Upstash Redis.
 * All values are JSON-serialized so any object can be stored.
 */
const cache = {
  /**
   * Get a cached value by key.
   * Returns null on a cache miss.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get<T>(key);
      return value ?? null;
    } catch (err) {
      console.error(`[cache] GET error for key "${key}":`, err);
      return null; // Fail open — never block the app due to cache errors
    }
  },

  /**
   * Store a value in the cache with a TTL in seconds.
   */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } catch (err) {
      console.error(`[cache] SET error for key "${key}":`, err);
    }
  },

  /**
   * Delete one or more exact cache keys.
   */
  async invalidate(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      console.error(`[cache] DEL error for keys [${keys.join(", ")}]:`, err);
    }
  },

  /**
   * Scan and delete all keys matching a prefix pattern.
   * Uses SCAN to avoid blocking Redis on large keyspaces.
   * e.g. invalidateByPrefix("tasks:42:") deletes all column-status keys for board 42.
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    try {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          match: `${prefix}*`,
          count: 100,
        });
        cursor = Number(nextCursor);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== 0);
    } catch (err) {
      console.error(`[cache] SCAN/DEL error for prefix "${prefix}":`, err);
    }
  },
};

export default cache;
