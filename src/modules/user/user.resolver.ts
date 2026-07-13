import userService from "./user.service.js";
import type { Resolvers } from "../../generated/resolvers.js";
import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";

import { ForbiddenError } from "../../utils/errors.js";


export const userResolvers: Pick<
  Resolvers,
  "Query" | "Mutation" | "User"
> = {
  Query: {
    users: (_parent, _args, context) => {
      requireRole(context, ["ADMIN", "MANAGER"]);

      return userService.getUsers();
    },

    user: (_parent, { id }, context) => {
      requireRole(context, ["ADMIN", "MANAGER"]);

      return userService.getUserById(id);
    },
  },

  Mutation: {
    updateUser: (_parent, { id, input }, context) => {
      const currentUser = requireAuth(context);

      if (input.role && currentUser.role !== "ADMIN") {
        throw new ForbiddenError(
          "Only administrators can change user roles."
        );
      }

      if (
        currentUser.role !== "ADMIN" &&
        currentUser.id !== id
      ) {
        throw new ForbiddenError(
          "You do not have permission"
        );
      }

      return userService.updateUser(id, {
        name: input.name ?? undefined,
        email: input.email ?? undefined,
        role: input.role ?? undefined,
      });
    },

    deleteUser: async (_parent, { id }, context) => {
      requireRole(context, ["ADMIN"]);

      await userService.deleteUser(id);

      return true;
    },
  },

  User: {
    boards: (parent, _args, context) => {
      return context.loaders.userBoardsLoader.load(parent.id);
    },
  },
};