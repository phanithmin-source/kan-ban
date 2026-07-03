import { z } from "zod";

import {
  updateUserSchema,
} from "../user.validation.js";


export type UpdateUserInput =
  z.infer<typeof updateUserSchema>;

export interface GetUserArgs {
  id: string;
}

export interface DeleteUserArgs {
  id: string;
}
export interface UpdateUserArgs {
  id: string;
  input: UpdateUserInput;
}