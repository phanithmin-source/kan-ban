import authService from "./auth.service.js";
import { requireAuth } from "../../utils/auth.js";

import type { GraphQLContext } from "../../graphql/context.js";
import type { LoginArgs } from "./dto/login.dto.js";
import type { RegisterArgs } from "./dto/register.dto.js";

export const authResolvers = {
  Query: {
    me: (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => requireAuth(context),
  },

  Mutation: {
    register: (
      _parent: unknown,
      { input }: RegisterArgs
    ) => authService.register(input),

    login: (
      _parent: unknown,
      { input }: LoginArgs
    ) => authService.login(input),

    logout: (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      requireAuth(context);

      return authService.logout();
    },
  },
};