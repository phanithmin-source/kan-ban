import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

class BoardRepository {
  findAll() {
    return prisma.board.findMany({
      include: {
        owner: true,
        tasks: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  findById(id: number) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        owner: true,
        tasks: true,
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
      where: { id },
      data,
      include: {
        owner: true,
        tasks: true,
      },
    });
  }

  delete(id: number) {
    return prisma.board.delete({
      where: { id },
    });
  }
}

export default new BoardRepository();