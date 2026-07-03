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


export const userResolvers = {
  Query: {
    users: () => userService.getUsers(),

    user: (
        _parent: unknown,
        { id }: GetUserArgs
    ) => userService.getUserById(Number(id)),

    me: (
        _parent: unknown,
        _args: unknown,
        context: GraphQLContext
        ) => requireAuth(context),

  },

  Mutation: {
    updateUser: (
      _parent: unknown,
      { id, input }: UpdateUserArgs
    ) => userService.updateUser(Number(id), input),

    deleteUser: async (
        _parent: unknown,
        { id }: DeleteUserArgs,
        context: GraphQLContext
        ) => {
        requireRole(context, "ADMIN");

        await userService.deleteUser(Number(id));

        return true;
        },
  },
};