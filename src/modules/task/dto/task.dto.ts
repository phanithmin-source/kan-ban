import { z } from "zod";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../task.validation.js";
import type { TaskPriority, TaskStatus } from "@prisma/client";

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export interface GetTaskArgs {
  id: string;
}

export interface DeleteTaskArgs {
  id: string;
}

export interface TasksByStatusArgs {
  status: TaskStatus;
}

export interface CreateTaskArgs {
  input: CreateTaskInput;
}

export interface UpdateTaskArgs {
  id: string;
  input: UpdateTaskInput;
}

export interface UpdateTaskStatusArgs {
  id: string;
  status: TaskStatus;
}