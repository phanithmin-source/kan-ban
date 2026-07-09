import boardRepository from "./board.repository.js";
import {
  createBoardSchema,
  updateBoardSchema,
} from "./board.validation.js";

import {
  BadRequestError,
  NotFoundError,
} from "../../utils/errors.js";

import { ZodError } from "zod";
import { BoardRole } from "@prisma/client";

class BoardService {
  getBoards() {
    return boardRepository.findAll();
  }

  async getBoardById(id: number) {
    const board = await boardRepository.findById(id);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    return board;
  }

  async createBoard(
    name: string,
    ownerId: number
  ) {
    try {
      const data = createBoardSchema.parse({
        name,
      });

      return boardRepository.create({
        name: data.name,
        ownerId,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.issues[0].message
        );
      }

      throw error;
    }
  }

  async updateBoard(
    id: number,
    name: string
  ) {
    const board = await boardRepository.findById(id);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    try {
      const data = updateBoardSchema.parse({
        name,
      });

      return boardRepository.update(id, {
        name: data.name,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.issues[0].message
        );
      }

      throw error;
    }
  }

  async deleteBoard(id: number) {
    const board = await boardRepository.findById(id);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    return boardRepository.delete(id);
  }

  async archiveBoard(id: number) {
    const board = await boardRepository.findById(id);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    return boardRepository.update(id, {
      archived: true,
    });
  }

  async restoreBoard(id: number) {
    const board = await boardRepository.findById(id);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    return boardRepository.update(id, {
      archived: false,
    });
  }

  // Board Membership operations
  async addBoardMember(boardId: number, userId: number, role: BoardRole) {
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    const existingMember = await boardRepository.findMember(boardId, userId);
    if (existingMember) {
      throw new BadRequestError("User is already a member of this board");
    }

    return boardRepository.addMember(boardId, userId, role);
  }

  async removeBoardMember(boardId: number, userId: number) {
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    const member = await boardRepository.findMember(boardId, userId);
    if (!member) {
      throw new NotFoundError("Board member not found");
    }

    if (member.role === BoardRole.OWNER) {
      throw new BadRequestError("Cannot remove the board owner");
    }

    await boardRepository.removeMember(boardId, userId);
    return true;
  }

  async updateBoardMemberRole(boardId: number, userId: number, role: BoardRole) {
    const board = await boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError("Board not found");
    }

    const member = await boardRepository.findMember(boardId, userId);
    if (!member) {
      throw new NotFoundError("Board member not found");
    }

    if (member.role === BoardRole.OWNER) {
      throw new BadRequestError("Cannot change role of the board owner");
    }

    if (role === BoardRole.OWNER) {
      throw new BadRequestError("Cannot transfer ownership via role change");
    }

    return boardRepository.updateMemberRole(boardId, userId, role);
  }
}

export default new BoardService();