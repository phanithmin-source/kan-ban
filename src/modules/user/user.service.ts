import { ZodError } from "zod";

import userRepository from "./user.repository.js";

import {
  updateUserSchema,
} from "./user.validation.js";

import type {
  UpdateUserInput,
} from "../../generated/schema.js";

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