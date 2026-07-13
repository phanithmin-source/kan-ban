import prisma from "../../config/prisma.js";
import { Prisma, Role, BoardRole } from "@prisma/client";
import cache from "../../utils/cache/index.js";

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
  async findAllAccessible(
    userId: number,
    role: Role
  ) {
    const cacheKey = `boards:user:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached as Awaited<ReturnType<typeof prisma.board.findMany>>;

    const result = await prisma.board.findMany({
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
      relationLoadStrategy: "join",
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    await cache.set(cacheKey, result, 60);
    return result;
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
  async findAccessibleById(
    id: number,
    userId: number,
    role: Role
  ) {
    const cacheKey = `board:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached as Awaited<ReturnType<typeof prisma.board.findFirst>>;

    const result = await prisma.board.findFirst({
      where: {
        id,
        ...(role === Role.ADMIN
          ? {}
          : {
              members: {
                some: { userId },
              },
            }),
      },
      relationLoadStrategy: "join",
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    await cache.set(cacheKey, result, 60);
    return result;
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

  async update(
    id: number,
    data: Prisma.BoardUpdateInput
  ) {
    const result = await prisma.board.update({
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
    await cache.invalidate(`board:${id}`);
    await cache.invalidateByPrefix(`boards:user:`);
    return result;
  }

  async delete(id: number) {
    const result = await prisma.board.delete({
      where: {
        id,
      },
    });
    await cache.invalidate(`board:${id}`);
    await cache.invalidateByPrefix(`boards:user:`);
    await cache.invalidateByPrefix(`tasks:${id}:`);
    return result;
  }

  // Board Member queries
  findMember(boardId: number, userId: number) {
    return prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId, userId },
      },
    });
  }

  async addMember(boardId: number, userId: number, role: BoardRole) {
    const result = await prisma.boardMember.create({
      data: {
        boardId,
        userId,
        role,
      },
      include: {
        user: true,
      },
    });
    await cache.invalidate(`board:${boardId}`);
    await cache.invalidateByPrefix(`boards:user:`);
    return result;
  }

  async removeMember(boardId: number, userId: number) {
    const result = await prisma.boardMember.delete({
      where: {
        boardId_userId: { boardId, userId },
      },
    });
    await cache.invalidate(`board:${boardId}`, `boards:user:${userId}`);
    await cache.invalidateByPrefix(`boards:user:`);
    return result;
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