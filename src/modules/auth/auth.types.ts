import type { User } from "@prisma/client";

export interface AuthPayload {
  token: string;
  user: User;
}