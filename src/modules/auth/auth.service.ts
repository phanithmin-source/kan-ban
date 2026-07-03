import bcrypt from "bcrypt";
import { ZodError } from "zod";

import authRepository from "./auth.repository.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.validation.js";

import { generateToken } from "../../utils/jwt.js";

import { BadRequestError } from "../../utils/errors.js";

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

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
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

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
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

  logout() {
    return {
      success: true,
      message: "Logged out successfully",
  };
}
}

export default new AuthService();