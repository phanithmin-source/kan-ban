import boardService from "./board.service.js";
import prisma from "../../config/prisma.js";
import { requireAuth } from "../../utils/auth.js";
import type { GraphQLContext } from "../../graphql/context.js";

import type {
  CreateBoardArgs,
  DeleteBoardArgs,
  GetBoardArgs,
  UpdateBoardArgs,
} from "./dto/board.dto.js";

export const boardResolvers = {
  Query: {
    boards: () => boardService.getBoards(),

    board: (_parent: unknown, { id }: GetBoardArgs) =>
      boardService.getBoardById(Number(id)),
  },

  Mutation: {
    createBoard: (
      _parent: unknown,
      { input }: CreateBoardArgs,
      context: GraphQLContext
      ) => {
      const user = requireAuth(context);

      return boardService.createBoard(
        input.name,
        user.id
      );
    },

    updateBoard: (
      _parent: unknown,
      { id, input }: UpdateBoardArgs
    ) =>
      boardService.updateBoard(
        Number(id),
        input.name
      ),

    deleteBoard: async (
      _parent: unknown,
      { id }: DeleteBoardArgs
    ) => {
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