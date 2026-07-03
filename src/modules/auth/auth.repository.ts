import prisma from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

class AuthRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }
}

export default new AuthRepository();