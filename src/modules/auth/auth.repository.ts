import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findUserById(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  updatePassword(
    id: number,
    password: string
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });
  }
}

export default new AuthRepository();