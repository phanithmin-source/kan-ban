import bcrypt from "bcrypt";
import { ZodError } from "zod";

import userRepository from "./user.repository.js";

import {
  createUserSchema,
  updateUserSchema,
} from "./user.validation.js";

import type {
  CreateUserInput,
  UpdateUserInput,
} from "./dto/user.dto.js";

import {
  BadRequestError,
  NotFoundError,
} from "../../utils/errors.js";

class UserService {
  getUsers() {
    return userRepository.findAll();
  }

  async getUserById(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async createUser(input: CreateUserInput) {
    try {
      const data = createUserSchema.parse(input);

      const existingUser = await userRepository.findByEmail(
        data.email
      );

      if (existingUser) {
        throw new BadRequestError(
          "Email already exists"
        );
      }

      const hashedPassword = await bcrypt.hash(
        data.password,
        10
      );

      return userRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.issues[0].message
        );
      }

      throw error;
    }
  }

  async updateUser(
    id: number,
    input: UpdateUserInput
  ) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    try {
      const data = updateUserSchema.parse(input);

      return userRepository.update(id, data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.issues[0].message
        );
      }

      throw error;
    }
  }

  async deleteUser(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return userRepository.delete(id);
  }
}

export default new UserService();