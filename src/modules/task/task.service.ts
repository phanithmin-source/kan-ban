import { TaskStatus } from "@prisma/client";
import { ZodError } from "zod";

import taskRepository from "./task.repository.js";
import boardService from "../board/board.service.js";
import userRepository from "../user/user.repository.js";
import { createTaskSchema, updateTaskSchema } from "./task.validation.js";
import type { CreateTaskInput , UpdateTaskInput } from "../../generated/schema.js";


import type {
  TaskConnection,
  TaskFilter,
} from "./task.types.js";

import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
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

  async createTask(
    input: CreateTaskInput,
    currentUser: {
      id: number;
      role: "ADMIN" | "MANAGER" | "USER";
    }
  ) {
    try {
      const data = createTaskSchema.parse(input);

      // Verify board exists
      const board = await boardService.getBoardById(data.boardId);

      if (currentUser.role !== "ADMIN" && board.ownerId !== currentUser.id) {
        throw new ForbiddenError(
          "You do not have permission to add tasks to this board"
        );
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

  async updateTask(
    id: number,
    input: UpdateTaskInput,
    currentUser: {
      id: number;
      role: "ADMIN" | "MANAGER" | "USER";
    }
  ) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (currentUser.role !== "ADMIN") {
      const accessibleTask = await taskRepository.findAccessibleById(
        id,
        currentUser.id,
        currentUser.role
      );

      if (!accessibleTask) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }
    }

    try {
      const data = updateTaskSchema.parse(input);

      return taskRepository.update(id, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(error.issues[0].message);
      }

      throw error;
    }
  }

  async deleteTask(id: number) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return taskRepository.delete(id);
  }

  async updateStatus(
    id: number,
    status: TaskStatus,
    currentUser: {
      id: number;
      role: "ADMIN" | "MANAGER" | "USER";
    }
  ) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (currentUser.role === "USER") {
      if (task.assigneeId !== currentUser.id) {
        throw new ForbiddenError(
          "You can only move tasks assigned to you"
        );
      }
    } else if (currentUser.role !== "ADMIN") {
      const accessibleTask = await taskRepository.findAccessibleById(
        id,
        currentUser.id,
        currentUser.role
      );

      if (!accessibleTask) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }
    }

    return taskRepository.update(id, {
      status,
    });
  }

  async assignTask(
    taskId: number,
    userId: number,
    currentUser: {
      id: number;
      role: "ADMIN" | "MANAGER" | "USER";
    }
  ) {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (currentUser.role !== "ADMIN") {
      const accessibleTask =
        await taskRepository.findAccessibleById(
          taskId,
          currentUser.id,
          currentUser.role
        );

      if (!accessibleTask) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }
    }

    return taskRepository.assignTask(
      taskId,
      userId
    );
  }
}

export default new TaskService();