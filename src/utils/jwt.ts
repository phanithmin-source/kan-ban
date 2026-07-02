import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
  id: number;
  email: string;
  role: "ADMIN" | "MANAGER" | "USER";
}

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}