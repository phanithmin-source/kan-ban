import boardService from "./board.service.js";
import prisma from "../../config/prisma.js";

import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";

import { ForbiddenError } from "../../utils/errors.js";
import type { GraphQLContext } from "../../graphql/context.js";

import type {
  CreateBoardArgs,
  DeleteBoardArgs,
  GetBoardArgs,
  UpdateBoardArgs,
} from "./dto/board.dto.js";

export const boardResolvers = {
  Query: {
    boards: (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      requireAuth(context);

      return boardService.getBoards();
    },

    board: (
      _parent: unknown,
      { id }: GetBoardArgs,
      context: GraphQLContext
    ) => {
      requireAuth(context);

      return boardService.getBoardById(Number(id));
    },
  },

  Mutation: {
    createBoard: (
      _parent: unknown,
      { input }: CreateBoardArgs,
      context: GraphQLContext
    ) => {
      const user = requireRole(
        context,
        ["ADMIN", "MANAGER"]
      );

      return boardService.createBoard(
        input.name,
        user.id
      );
    },

    updateBoard: async (
      _parent: unknown,
      { id, input }: UpdateBoardArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(
        Number(id)
      );

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      return boardService.updateBoard(
        Number(id),
        input.name
      );
    },

    deleteBoard: async (
      _parent: unknown,
      { id }: DeleteBoardArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(
        Number(id)
      );

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      await boardService.deleteBoard(Number(id));

      return true;
    },
  },

  Board: {
    tasks: (parent: { id: number }) =>
      prisma.task.findMany({
        where: {
          boardId: parent.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

    owner: (parent: { ownerId: number }) =>
      prisma.user.findUnique({
        where: {
          id: parent.ownerId,
        },
      }),
  },
};