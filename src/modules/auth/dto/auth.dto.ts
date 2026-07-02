import { z } from "zod";
import { loginSchema } from "../auth.validation.js";

export type LoginInput = z.infer<typeof loginSchema>;

export interface LoginArgs {
  input: LoginInput;
}