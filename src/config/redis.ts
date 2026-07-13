import { Redis as UpstashRedis } from "@upstash/redis";
import { createClient } from "redis";
import { env } from "./env.js";

export const useUpstash = env.CACHE_PROVIDER === "upstash";
export const localRedis = createClient({
  url: env.REDIS_URL,
});

localRedis.on("connect", () => {
  console.log("✅ Local Redis connected");
});

localRedis.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

export async function connectRedis() {
  if (!useUpstash && !localRedis.isOpen) {
    await localRedis.connect();
  }
}

export const upstashRedis = useUpstash
  ? new UpstashRedis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;