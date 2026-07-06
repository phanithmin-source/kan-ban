import boardService from "./board.service.js";
import boardRepository from "./board.repository.js";

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
      const user = requireAuth(context);

      return boardRepository.findAllAccessible(
        user.id,
        user.role
      );
    },

    board: async (
      _parent: unknown,
      { id }: GetBoardArgs,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const board =
        await boardRepository.findAccessibleById(
          Number(id),
          user.id,
          user.role
        );

      if (!board) {
        throw new ForbiddenError(
          "Board not found or access denied"
        );
      }

      return board;
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
    owner: (parent: { ownerId: number }, _args: unknown, context: GraphQLContext) =>
      context.loaders.boardOwnerLoader.load(parent.ownerId),

    tasks: (parent: { id: number }, _args: unknown, context: GraphQLContext) =>
      context.loaders.boardTasksLoader.load(parent.id),
  },
};