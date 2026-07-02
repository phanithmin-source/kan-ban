import { TaskStatus } from "@prisma/client";
import { ZodError } from "zod";

import taskRepository from "./task.repository.js";
import boardRepository from "../board/board.repository.js";
import { createTaskSchema, updateTaskSchema } from "./task.validation.js";

import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "./dto/task.dto.js";

import type {
  TaskConnection,
  TaskFilter,
} from "./task.types.js";

import {
  BadRequestError,
  NotFoundError,
} from "../../utils/errors.js";

class TaskService {
  async getTasks(filter: TaskFilter): Promise<TaskConnection> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;

    const { data, total } = await taskRepository.findAll({
      ...filter,
      page,
      limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTaskById(id: number) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return task;
  }

  async createTask(input: CreateTaskInput) {
  try {
    const data = createTaskSchema.parse(input);

    // Verify board exists
    const board = await boardRepository.findById(data.boardId);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    return taskRepository.create({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,

      dueDate: data.dueDate
        ? new Date(data.dueDate)
        : null,

      board: {
        connect: {
          id: data.boardId,
        },
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestError(error.issues[0].message);
    }

    throw error;
  }
}

  async updateTask(id: number, input: UpdateTaskInput) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const data = updateTaskSchema.parse(input);

    return taskRepository.update(id, {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  }

  async deleteTask(id: number) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return taskRepository.delete(id);
  }

  async updateStatus(id: number, status: TaskStatus) {
    return taskRepository.update(id, {
      status,
    });
  }
}

export default new TaskService();