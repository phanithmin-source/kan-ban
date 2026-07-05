import userService from "./user.service.js";

import type {
  DeleteUserArgs,
  GetUserArgs,
  UpdateUserArgs,
} from "./dto/user.dto.js";
import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";
import type { GraphQLContext } from "../../graphql/context.js";
import { ForbiddenError } from "../../utils/errors.js";


export const userResolvers = {
  Query: {
    users: (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      requireRole(context, ["ADMIN"]);

      return userService.getUsers();
    },

    user: (
      _parent: unknown,
      { id }: GetUserArgs,
      context: GraphQLContext
    ) => {
      requireRole(context, ["ADMIN"]);

      return userService.getUserById(Number(id));
    },
  },

  Mutation: {
    updateUser: (
      _parent: unknown,
      { id, input }: UpdateUserArgs,
      context: GraphQLContext
    ) => {
      const currentUser = requireAuth(context);

      if (
        currentUser.role !== "ADMIN" &&
        currentUser.id !== Number(id)
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      return userService.updateUser(Number(id), input);
    },

    deleteUser: async (
      _parent: unknown,
      { id }: DeleteUserArgs,
      context: GraphQLContext
    ) => {
      requireRole(context, ["ADMIN"]);

      await userService.deleteUser(Number(id));

      return true;
    },
  },
};