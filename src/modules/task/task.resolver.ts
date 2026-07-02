import prisma from "../../config/prisma.js";

import taskService from "./task.service.js";

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
      { filter }: { filter?: TaskFilter }
    ) => taskService.getTasks(filter ?? {}),

    task: (
      _parent: unknown,
      { id }: GetTaskArgs
    ) => taskService.getTaskById(Number(id)),
  },

  Mutation: {
    createTask: (
      _parent: unknown,
      { input }: CreateTaskArgs
    ) => taskService.createTask(input),

    updateTask: (
      _parent: unknown,
      { id, input }: UpdateTaskArgs
    ) => taskService.updateTask(Number(id), input),

    deleteTask: async (
      _parent: unknown,
      { id }: DeleteTaskArgs
    ) => {
      await taskService.deleteTask(Number(id));
      return true;
    },

    updateTaskStatus: (
      _parent: unknown,
      { id, status }: UpdateTaskStatusArgs
    ) => taskService.updateStatus(Number(id), status),
  },

  Task: {
    board: (parent: { boardId: number }) =>
      prisma.board.findUnique({
        where: {
          id: parent.boardId,
        },
      }),
  },
};