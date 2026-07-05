import prisma from "../../config/prisma.js";

class RefreshTokenRepository {
  async create(
    token: string,
    userId: number,
    expiresAt: Date
  ) {
    return prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async delete(token: string) {
    return prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteByUserId(userId: number) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export default new RefreshTokenRepository();
