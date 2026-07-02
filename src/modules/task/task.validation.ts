import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";

export const createTaskSchema = z.object({
  boardId: z.coerce.number().int().positive(),

  title: z
    .string()
    .min(1, "Title is required")
    .max(100),

  description: z.string().optional(),

  status: z.nativeEnum(TaskStatus),

  priority: z.nativeEnum(TaskPriority),

  dueDate: z.string().date().optional(),
});

export const updateTaskSchema = createTaskSchema
  .omit({ boardId: true })
  .partial();