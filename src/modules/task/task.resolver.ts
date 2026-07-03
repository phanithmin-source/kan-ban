import prisma from "../../config/prisma.js";

import taskService from "./task.service.js";

import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";

import { ForbiddenError } from "../../utils/errors.js";
import type { GraphQLContext } from "../../graphql/context.js";

import type {
  CreateTaskArgs,
  DeleteTaskArgs,
  GetTaskArgs,
  UpdateTaskArgs,
  UpdateTaskStatusArgs,
} from "./dto/task.dto.js";

import type { TaskFilter } from "./task.types.js";

export const taskResolvers = {
  Query: {
    tasks: (
      _parent: unknown,
      { filter }: { filter?: TaskFilter },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      return taskService.getTasks(filter ?? {});
    },

    task: (
      _parent: unknown,
      { id }: GetTaskArgs,
      context: GraphQLContext
    ) => {
      requireAuth(context);

      return taskService.getTaskById(Number(id));
    },
  },

  Mutation: {
    createTask: (
      _parent: unknown,
      { input }: CreateTaskArgs,
      context: GraphQLContext
    ) => {
      requireRole(context, ["ADMIN", "MANAGER"]);

      return taskService.createTask(input);
    },

    updateTask: async (
      _parent: unknown,
      { id, input }: UpdateTaskArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const task = await taskService.getTaskById(Number(id));

      // Admin can update everything.
      // Managers can update everything.
      // Users can only update tasks assigned to them (we'll fully support this after assignee is added).
      if (
        user.role !== "ADMIN" &&
        user.role !== "MANAGER"
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      return taskService.updateTask(
        Number(id),
        input
      );
    },

    deleteTask: async (
      _parent: unknown,
      { id }: DeleteTaskArgs,
      context: GraphQLContext
    ) => {
      requireRole(context, ["ADMIN"]);

      await taskService.deleteTask(Number(id));

      return true;
    },

    updateTaskStatus: async (
      _parent: unknown,
      { id, status }: UpdateTaskStatusArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const task = await taskService.getTaskById(Number(id));

      if (
        user.role !== "ADMIN" &&
        user.role !== "MANAGER"
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      return taskService.updateStatus(
        Number(id),
        status
      );
    },

    assignTask: async (
      _parent: unknown,
      { taskId, userId }: { taskId: string; userId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      if (user.role !== "ADMIN" && user.role !== "MANAGER") {
        throw new ForbiddenError("You do not have permission");
      }

      return taskService.assignTask(
        Number(taskId),
        Number(userId)
      );
    },

  },

  Task: {
    board: (parent: { boardId: number }) =>
      prisma.board.findUnique({
        where: {
          id: parent.boardId,
        },
      }),

    assignee: (parent: { assigneeId: number }) =>
      prisma.user.findUnique({
        where: {
          id: parent.assigneeId ,
        },
      }),
  },

};