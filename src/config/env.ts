import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string(),

  JWT_SECRET: z.string().min(32),

  FRONTEND_URL: z.string().default("http://localhost:5173,https://kan-ban-phi.vercel.app"),

  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

export const env = envSchema.parse(process.env);