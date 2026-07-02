import type { User } from "@prisma/client";

export interface UserConnection {
  data: User[];
  total: number;
}