import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

class UserRepository {
  findAll() {
    return prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  update(
    id: number,
    data: Prisma.UserUpdateInput
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  delete(id: number) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  }
}

export default new UserRepository();