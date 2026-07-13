import { TaskStatus, BoardRole } from "@prisma/client";
import { ZodError } from "zod";

import taskRepository from "./task.repository.js";
import boardService from "../board/board.service.js";
import boardRepository from "../board/board.repository.js";
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

      // Enforce board membership for non-admins
      if (currentUser.role !== "ADMIN") {
        const member = await boardRepository.findMember(data.boardId, currentUser.id);
        if (!member || member.role === BoardRole.VIEWER) {
          throw new ForbiddenError(
            "You do not have permission to add tasks to this board"
          );
        }
      }

      return taskRepository.create({
        title: data.title,
        description: data.description ?? undefined,
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
        creator: {
          connect: {
            id: currentUser.id,
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

    // ADMIN and MANAGER can always edit tasks
    if (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER") {
      const member = await boardRepository.findMember(task.boardId, currentUser.id);

      // Must be a board member (not VIEWER)
      if (!member || member.role === BoardRole.VIEWER) {
        throw new ForbiddenError(
          "You do not have permission to edit tasks on this board"
        );
      }

      // Board MEMBERs (not OWNER) can only edit tasks they created or are assigned to
      if (
        member.role !== "OWNER" &&
        task.creatorId !== currentUser.id &&
        task.assigneeId !== currentUser.id
      ) {
        throw new ForbiddenError(
          "You can only edit tasks you created or are assigned to"
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

  async deleteTask(id: number, currentUser: { id: number; role: string }) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    // ADMIN and MANAGER can always delete tasks
    if (currentUser.role === "ADMIN" || currentUser.role === "MANAGER") {
      return taskRepository.delete(id);
    }

    // For regular USERs: must be board OWNER or the task creator
    const member = await boardRepository.findMember(task.boardId, currentUser.id);
    const isOwner = member?.role === "OWNER";
    const isCreator = task.creatorId === currentUser.id;

    if (!isOwner && !isCreator) {
      throw new ForbiddenError("Only board owners, task creators, managers, or admins can delete tasks");
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

    // ADMIN and MANAGER can always move tasks
    if (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER") {
      const member = await boardRepository.findMember(task.boardId, currentUser.id);

      // VIEWER cannot move tasks
      if (!member || member.role === BoardRole.VIEWER) {
        throw new ForbiddenError(
          "You do not have permission to move tasks on this board"
        );
      }

      // Board MEMBERs (not OWNER) can only move tasks assigned to them
      if (member.role !== "OWNER" && task.assigneeId !== currentUser.id) {
        throw new ForbiddenError("You can only move tasks that are assigned to you");
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
      const member = await boardRepository.findMember(task.boardId, currentUser.id);
      if (!member || member.role === BoardRole.VIEWER) {
        throw new ForbiddenError(
          "You do not have permission to access this board"
        );
      }
    }

    // Verify the assignee is a member of the board (and not a viewer)
    const assigneeMembership = await boardRepository.findMember(task.boardId, userId);
    if (!assigneeMembership || assigneeMembership.role === BoardRole.VIEWER) {
      throw new BadRequestError("Assignee must be a member of the board");
    }

    return taskRepository.assignTask(
      taskId,
      userId
    );
  }

  async archiveTask(id: number, currentUser: { id: number; role: string }) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (currentUser.role !== "ADMIN") {
      const member = await boardRepository.findMember(task.boardId, currentUser.id);
      if (!member || member.role === BoardRole.VIEWER) {
        throw new ForbiddenError("You do not have access to this board");
      }
    }

    return taskRepository.update(id, {
      archived: true,
    });
  }

  async restoreTask(id: number, currentUser: { id: number; role: string }) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (currentUser.role !== "ADMIN") {
      const member = await boardRepository.findMember(task.boardId, currentUser.id);
      if (!member || member.role === BoardRole.VIEWER) {
        throw new ForbiddenError("You do not have access to this board");
      }
    }

    return taskRepository.update(id, {
      archived: false,
    });
  }

  // Comment logic
  async addComment(taskId: number, userId: number, content: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const member = await boardRepository.findMember(task.boardId, userId);
    const user = await userRepository.findById(userId);
    if (
      (!member || member.role === BoardRole.VIEWER) &&
      user?.role !== "ADMIN"
    ) {
      throw new ForbiddenError("You must be a board member to add comments");
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestError("Comment content cannot be empty");
    }

    return taskRepository.addComment(taskId, userId, content);
  }

  async updateComment(id: number, userId: number, content: string) {
    const comment = await taskRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError("You do not have permission to edit this comment");
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestError("Comment content cannot be empty");
    }

    return taskRepository.updateComment(id, content);
  }

  async deleteComment(id: number, userId: number, userRole: string) {
    const comment = await taskRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const task = await taskRepository.findById(comment.taskId);
    let isBoardOwner = false;
    if (task) {
      const member = await boardRepository.findMember(task.boardId, userId);
      isBoardOwner = member?.role === "OWNER";
    }

    if (
      comment.userId !== userId &&
      userRole !== "ADMIN" &&
      !isBoardOwner
    ) {
      throw new ForbiddenError("You do not have permission to delete this comment");
    }

    await taskRepository.deleteComment(id);
    return true;
  }
}

export default new TaskService();