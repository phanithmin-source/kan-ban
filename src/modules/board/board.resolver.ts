import boardRepository from "./board.repository.js";
import boardService from "./board.service.js";

import type { Resolvers } from "../../generated/resolvers.js";

import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";

import { ForbiddenError } from "../../utils/errors.js";
import { BoardRole } from "@prisma/client";

export const boardResolvers: Pick<
  Resolvers,
  "Query" | "Mutation" | "Board" | "BoardMember"
> = {
  Query: {
    boards: (_parent, _args, context) => {
      const user = requireAuth(context);

      return boardRepository.findAllAccessible(
        user.id,
        user.role
      );
    },

    board: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const board =
        await boardRepository.findAccessibleById(
          id,
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
    createBoard: (_parent, { input }, context) => {
      const user = requireRole(
        context,
        ["ADMIN", "MANAGER"]
      );

      return boardService.createBoard(
        input.name,
        user.id
      );
    },

    updateBoard: async (_parent, { id, input }, context) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(id);

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      return boardService.updateBoard(
        id,
        input.name
      );
    },

    deleteBoard: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(id);

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      await boardService.deleteBoard(id);

      return true;
    },

    archiveBoard: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(id);

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission to archive this board"
        );
      }

      return boardService.archiveBoard(id);
    },

    restoreBoard: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(id);

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission to restore this board"
        );
      }

      return boardService.restoreBoard(id);
    },

    addBoardMember: async (_parent, { boardId, userId, role }, context) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(boardId);

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission to add members to this board"
        );
      }

      return boardService.addBoardMember(boardId, userId, role as BoardRole);
    },

    removeBoardMember: async (_parent, { boardId, userId }, context) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(boardId);

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission to remove members from this board"
        );
      }

      return boardService.removeBoardMember(boardId, userId);
    },

    updateBoardMemberRole: async (_parent, { boardId, userId, role }, context) => {
      const user = requireAuth(context);

      const board = await boardService.getBoardById(boardId);

      if (
        user.role !== "ADMIN" &&
        board.ownerId !== user.id
      ) {
        throw new ForbiddenError(
          "You do not have permission to update member roles on this board"
        );
      }

      return boardService.updateBoardMemberRole(boardId, userId, role as BoardRole);
    },
  },

  Board: {
    owner: async (parent, _args, context) => {
      const owner =
        await context.loaders.boardOwnerLoader.load(parent.ownerId);

      if (!owner) {
        throw new Error("Board owner not found");
      }
      return owner;
    },
    tasks: (parent, _args, context) =>
      context.loaders.boardTasksLoader.load(parent.id),
    isArchived: (parent) => parent.archived,
    members: (parent, _args, context) =>
      context.loaders.boardMembersLoader.load(parent.id),
  },

  BoardMember: {
    user: (parent, _args, context) =>
      context.loaders.userLoader.load(parent.userId).then((user) => {
        if (!user) {
          throw new Error("User not found for board membership");
        }
        return user;
      }),
  },
};