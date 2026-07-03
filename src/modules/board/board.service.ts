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
}

export default new BoardService();