import prisma from "../../config/prisma.js";
import { Prisma, Role } from "@prisma/client";

class BoardRepository {
  /**
   * Internal use.
   * Returns all boards.
   */
  findAll() {
    return prisma.board.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * RBAC.
   * ADMIN -> all boards
   * Others -> only their own boards
   */
  findAllAccessible(
    userId: number,
    role: Role
  ) {
    return prisma.board.findMany({
      where:
        role === "ADMIN"
          ? {}
          : {
              ownerId: userId,
            },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Internal use.
   * Find board regardless of owner.
   */
  findById(id: number) {
    return prisma.board.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * RBAC.
   * ADMIN -> any board
   * Others -> only their own board
   */
  findAccessibleById(
    id: number,
    userId: number,
    role: Role
  ) {
    return prisma.board.findFirst({
      where: {
        id,

        ...(role === "ADMIN"
          ? {}
          : {
              ownerId: userId,
            }),
      },
    });
  }

  create(data: {
    name: string;
    ownerId: number;
  }) {
    return prisma.board.create({
      data: {
        name: data.name,

        owner: {
          connect: {
            id: data.ownerId,
          },
        },
      },

      include: {
        owner: true,
        tasks: true,
      },
    });
  }

  update(
    id: number,
    data: Prisma.BoardUpdateInput
  ) {
    return prisma.board.update({
      where: {
        id,
      },

      data,

      include: {
        owner: true,
        tasks: true,
      },
    });
  }

  delete(id: number) {
    return prisma.board.delete({
      where: {
        id,
      },
    });
  }
}

export default new BoardRepository();