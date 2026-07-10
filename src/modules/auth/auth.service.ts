import bcrypt from "bcrypt";
import { ZodError } from "zod";
import type { Request, Response } from "express";

import authRepository from "./auth.repository.js";
import refreshTokenRepository from "./refresh-token.repository.js";
import type { RegisterInput, LoginInput } from "../../generated/schema.js";

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


class AuthService {
  async register(input: RegisterInput, res?: Response) {
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

      if (res) {
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 3 * 24 * 60 * 60 * 1000,
        });
      }

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

  async login(input: LoginInput, res?: Response) {
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

      if (res) {
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 3 * 24 * 60 * 60 * 1000,
        });
      }

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

  async logout(userId: number, res?: Response) {
    await refreshTokenRepository.deleteByUserId(
      userId
    );

    if (res) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
    }

    return {
      success: true,
      message: "Logged out successfully.",
    };
  }

  async refreshAccessToken(
    refreshToken: string | undefined | null,
    res?: Response,
    req?: Request
  ) {
    try {
      let token = refreshToken;
      if (!token && req) {
        token = req.cookies?.refreshToken;
      }

      if (!token) {
        throw new UnauthorizedError(
          "Refresh token is invalid or expired"
        );
      }

      const decoded = verifyToken(token);

      const storedToken =
        await refreshTokenRepository.findByToken(
          token
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

      if (res) {
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 60 * 1000,
        });
      }

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError(
        "Refresh token is invalid or expired"
      );
    }
  }
}

export default new AuthService();