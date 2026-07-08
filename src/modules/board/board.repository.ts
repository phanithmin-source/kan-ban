import prisma from "../../config/prisma.js";
import { Prisma, Role, BoardRole } from "@prisma/client";

class BoardRepository {
  /**
   * Internal use.
   * Returns all active boards.
   */
  findAll() {
    return prisma.board.findMany({
      where: {
        archived: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * RBAC.
   * ADMIN -> all active boards
   * Others -> boards they are members of
   */
  findAllAccessible(
    userId: number,
    role: Role
  ) {
    return prisma.board.findMany({
      where: {
        archived: false,
        ...(role === "ADMIN"
          ? {}
          : {
              members: {
                some: { userId },
              },
            }),
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Internal use.
   * Find board regardless of owner or membership.
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
   * ADMIN -> any board by ID
   * Others -> only boards they are members of
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
              members: {
                some: { userId },
              },
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
        members: {
          create: {
            userId: data.ownerId,
            role: BoardRole.OWNER,
          },
        },
      },
      include: {
        owner: true,
        tasks: true,
        members: true,
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
        members: true,
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

  // Board Member queries
  findMember(boardId: number, userId: number) {
    return prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId, userId },
      },
    });
  }

  addMember(boardId: number, userId: number, role: BoardRole) {
    return prisma.boardMember.create({
      data: {
        boardId,
        userId,
        role,
      },
      include: {
        user: true,
      },
    });
  }

  removeMember(boardId: number, userId: number) {
    return prisma.boardMember.delete({
      where: {
        boardId_userId: { boardId, userId },
      },
    });
  }

  updateMemberRole(boardId: number, userId: number, role: BoardRole) {
    return prisma.boardMember.update({
      where: {
        boardId_userId: { boardId, userId },
      },
      data: {
        role,
      },
      include: {
        user: true,
      },
    });
  }
}

export default new BoardRepository();