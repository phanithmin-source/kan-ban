import userService from "./user.service.js";
import type { Resolvers } from "../../generated/resolvers.js";
import {
  requireAuth,
  requireRole,
} from "../../utils/auth.js";

import type { GraphQLContext } from "../../graphql/context.js";

import { ForbiddenError } from "../../utils/errors.js";


export const userResolvers: Pick<
  Resolvers,
  "Query" | "Mutation" | "User"
> = {
  Query: {
    users: (
      _parent,
      _args,
      context: GraphQLContext
    ) => {
      requireRole(context, ["ADMIN"]);

      return userService.getUsers();
    },

    user: (
        _parent,
        { id },
        context
      ) => {
      requireRole(context, ["ADMIN"]);

      return userService.getUserById(Number(id));
    },
  },

  Mutation: {
    updateUser: (
       _parent,
      { id, input },
       context
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

      return userService.updateUser(
        Number(id),
        {
          ...input,
          name: input.name ?? undefined,
          email: input.email ?? undefined,
        }
      );
    },

    deleteUser: async (
        _parent,
  { id },
  context
) => {
      requireRole(context, ["ADMIN"]);

      await userService.deleteUser(Number(id));

      return true;
    },
  },
};