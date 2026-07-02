import prisma from "../config/prisma.js";

import type { User } from "@prisma/client";
import type { Request } from "express";

import { verifyToken } from "../utils/jwt.js";

export interface GraphQLContext {
  prisma: typeof prisma;
  user: User | null;
}

export const createContext = async ({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> => {
  let user: User | null = null;

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const payload = verifyToken(token);

      user = await prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });
    } catch {
      // Invalid token
      user = null;
    }
  }

  return {
    prisma,
    user,
  };
};