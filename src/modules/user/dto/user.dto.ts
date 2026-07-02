import { z } from "zod";

import {
  createUserSchema,
  updateUserSchema,
} from "../user.validation.js";

export type CreateUserInput =
  z.infer<typeof createUserSchema>;

export type UpdateUserInput =
  z.infer<typeof updateUserSchema>;

export interface GetUserArgs {
  id: string;
}

export interface DeleteUserArgs {
  id: string;
}

export interface CreateUserArgs {
  input: CreateUserInput;
}

export interface UpdateUserArgs {
  id: string;
  input: UpdateUserInput;
}