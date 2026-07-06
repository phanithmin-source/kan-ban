import bcrypt from "bcrypt";
import { ZodError } from "zod";

import authRepository from "./auth.repository.js";
import refreshTokenRepository from "./refresh-token.repository.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.validation.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt.js";

import {
  BadRequestError,
  UnauthorizedError,
} from "../../utils/errors.js";

import type { LoginInput } from "./dto/login.dto.js";
import type { RegisterInput } from "./dto/register.dto.js";

class AuthService {
  async register(input: RegisterInput) {
    try {
      const data = registerSchema.parse(input);

      const existingUser =
        await authRepository.findByEmail(data.email);

      if (existingUser) {
        throw new BadRequestError(
          "Email already exists"
        );
      }

      const hashedPassword = await bcrypt.hash(
        data.password,
        10
      );

      const user = await authRepository.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      );

      await refreshTokenRepository.create(
        refreshToken,
        user.id,
        expiresAt
      );

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.issues[0].message
        );
      }

      throw error;
    }
  }

  async login(input: LoginInput) {
    try {
      const data = loginSchema.parse(input);

      const user =
        await authRepository.findByEmail(data.email);

      if (!user) {
        throw new BadRequestError(
          "Invalid email or password"
        );
      }

      const validPassword =
        await bcrypt.compare(
          data.password,
          user.password
        );

      if (!validPassword) {
        throw new BadRequestError(
          "Invalid email or password"
        );
      }

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      );

      await refreshTokenRepository.create(
        refreshToken,
        user.id,
        expiresAt
      );

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.issues[0].message
        );
      }

      throw error;
    }
  }

  async logout(userId: number) {
    await refreshTokenRepository.deleteByUserId(
      userId
    );

    return {
      success: true,
      message: "Logged out successfully.",
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = verifyToken(refreshToken);

      const storedToken =
        await refreshTokenRepository.findByToken(
          refreshToken
        );

      if (
        !storedToken ||
        storedToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedError(
          "Refresh token is invalid or expired"
        );
      }

      const accessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError(
        "Refresh token is invalid or expired"
      );
    }
  }
}

export default new AuthService();