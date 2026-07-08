import taskRepository from "./task.repository.js";
import taskService from "./task.service.js";

import type { Resolvers } from "../../generated/resolvers.js";

import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";

import {
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors.js";

import type { TaskFilter } from "./task.types.js";

export const taskResolvers: Pick<
  Resolvers,
  "Query" | "Mutation" | "Task"
> = {
  Query: {
    tasks: async  (_parent, { filter }, context) => {
      const user = requireAuth(context);
      
      const page = filter?.page ?? 1;
      const limit = filter?.limit ?? 10;

      const result =
      await taskRepository.findAllAccessible(
        user.id,
        user.role,
        (filter ?? {}) as TaskFilter
      );
      return {
          data: result.data,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
    };

    },

    task: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const task =
        await taskRepository.findAccessibleById(
          id,
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
    createTask: (_parent, { input }, context) => {
      const user = requireRole(context, ["ADMIN", "MANAGER"]);
      return taskService.createTask({
        ...input,
        description: input.description ?? undefined,
        dueDate: input.dueDate ?? undefined,
      }, user);
    },

    updateTask: (_parent, { id, input }, context) => {
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
        id,
        {
          ...input,
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          status: input.status ?? undefined,
          priority: input.priority ?? undefined,
          dueDate: input.dueDate ?? undefined,
        },
        user
      );
    },

    deleteTask: async (_parent, { id }, context) => {
      requireRole(context, ["ADMIN"]);

      await taskService.deleteTask(id);

      return true;
    },

    updateTaskStatus: (
      _parent,
      { id, status },
      context
    ) => {
      const user = requireAuth(context);

      return taskService.updateStatus(
        id,
        status,
        user
      );
    },

    assignTask: (
      _parent,
      { taskId, userId },
      context
    ) => {
      const user = requireRole(context, [
        "ADMIN",
        "MANAGER",
      ]);

      return taskService.assignTask(
        taskId,
        userId,
        user
      );
    },
  },

  Task: {
    board: async (parent, _args, context) => {
    const board =
      await context.loaders.boardLoader.load(
        parent.boardId
      );

    if (!board) {
      throw new NotFoundError("Board not found");
    }
    return board;
  },

    assignee: (parent, _args, context) =>
      parent.assigneeId
        ? context.loaders.taskAssigneeLoader.load(parent.assigneeId)
        : null,
  },
};