import taskService from "./task.service.js";
import taskRepository from "./task.repository.js";

import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";

import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
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
      const user = requireAuth(context);

      return taskRepository.findAllAccessible(
        user.id,
        user.role,
        filter ?? {}
      );
    },

    task: async (
      _parent: unknown,
      { id }: GetTaskArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const task =
        await taskRepository.findAccessibleById(
          Number(id),
          user.id,
          user.role
        );

      if (!task) {
        throw new NotFoundError("Task not found");
      }

      return task;
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

    updateTask: (
      _parent: unknown,
      { id, input }: UpdateTaskArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

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
        input,
        user
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

    updateTaskStatus: (
      _parent: unknown,
      { id, status }: UpdateTaskStatusArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

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

    assignTask: (
      _parent: unknown,
      {
        taskId,
        userId,
      }: {
        taskId: string;
        userId: string;
      },
      context: GraphQLContext
    ) => {
      const user = requireRole(context, [
        "ADMIN",
        "MANAGER",
      ]);

      return taskService.assignTask(
        Number(taskId),
        Number(userId),
        user
      );
    },
  },

  Task: {
    board: (parent: { boardId: number }, _args: unknown, context: GraphQLContext) =>
      context.loaders.boardLoader.load(parent.boardId),

    assignee: (parent: { assigneeId: number | null }, _args: unknown, context: GraphQLContext) =>
      context.loaders.taskAssigneeLoader.load(parent.assigneeId),
  },
};