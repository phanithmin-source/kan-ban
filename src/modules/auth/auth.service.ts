import bcrypt from "bcrypt";
import { ZodError } from "zod";

import userRepository from "../user/user.repository.js";
import { loginSchema } from "./auth.validation.js";
import { generateToken } from "../../utils/jwt.js";

import { BadRequestError } from "../../utils/errors.js";

import type {
  LoginInput,
} from "./dto/auth.dto.js";

class AuthService {
  async login(input: LoginInput) {
    try {
      const data = loginSchema.parse(input);

      const user = await userRepository.findByEmail(data.email);

      if (!user) {
        throw new BadRequestError("Invalid email or password");
      }

      const validPassword = await bcrypt.compare(
        data.password,
        user.password
      );

      if (!validPassword) {
        throw new BadRequestError("Invalid email or password");
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
        throw new BadRequestError(error.issues[0].message);
      }

      throw error;
    }
  }
}

export default new AuthService();