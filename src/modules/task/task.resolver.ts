import taskRepository from "./task.repository.js";
import taskService from "./task.service.js";

import type { Resolvers } from "../../generated/resolvers.js";

import {
  requireAuth,
} from "../../utils/auth.js";

import {
  NotFoundError,
} from "../../utils/errors.js";

import type { TaskFilter } from "./task.types.js";
import { TaskStatus } from "@prisma/client";

export const taskResolvers: Pick<
  Resolvers,
  "Query" | "Mutation" | "Task" | "Comment"
> = {
  Query: {
    tasks: async (_parent, { filter }, context) => {
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
      const user = requireAuth(context);
      return taskService.createTask({
        ...input,
        description: input.description ?? undefined,
        dueDate: input.dueDate ?? undefined,
      }, user);
    },

    updateTask: (_parent, { id, input }, context) => {
      const user = requireAuth(context);

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
      const user = requireAuth(context);

      await taskService.deleteTask(id, user);

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
        status as TaskStatus,
        user
      );
    },

    assignTask: (
      _parent,
      { taskId, userId },
      context
    ) => {
      const user = requireAuth(context);

      return taskService.assignTask(
        taskId,
        userId,
        user
      );
    },

    archiveTask: (_parent, { id }, context) => {
      const user = requireAuth(context);
      return taskService.archiveTask(id, user);
    },

    restoreTask: (_parent, { id }, context) => {
      const user = requireAuth(context);
      return taskService.restoreTask(id, user);
    },

    addComment: (_parent, { taskId, content }, context) => {
      const user = requireAuth(context);
      return taskService.addComment(taskId, user.id, content);
    },

    updateComment: (_parent, { id, content }, context) => {
      const user = requireAuth(context);
      return taskService.updateComment(id, user.id, content);
    },

    deleteComment: async (_parent, { id }, context) => {
      const user = requireAuth(context);
      await taskService.deleteComment(id, user.id, user.role);
      return true;
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

    creator: async (parent, _args, context) => {
      const creator = await context.loaders.taskCreatorLoader.load(parent.creatorId);
      if (!creator) {
        throw new Error("Creator user not found");
      }
      return creator;
    },

    comments: (parent, _args, context) =>
      context.loaders.taskCommentsLoader.load(parent.id),

    isArchived: (parent) => parent.archived,
  },

  Comment: {
    user: async (parent, _args, context) => {
      const user = await context.loaders.userLoader.load(parent.userId);
      if (!user) {
        throw new Error("Comment author user not found");
      }
      return user;
    },
  },
};