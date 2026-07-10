import authService from "./auth.service.js";

import { requireAuth } from "../../utils/auth.js";

import type { Resolvers } from "../../generated/resolvers.js";


export const authResolvers: Pick<
  Resolvers,
  "Query" | "Mutation"
> = {
  Query: {
    me: async (
      _parent,
      _args,
      context
    ) => {
      const user = requireAuth(context);
      return context.loaders.userLoader.load(user.id);
    },
  },

  Mutation: {
    register: (
      _parent,
      { input },
      context
    ) => authService.register(input, context.res),

    login: (
      _parent,
      { input },
      context
    ) => authService.login(input, context.res),

    logout: (
      _parent,
      _args,
      context
    ) => {
      const user = requireAuth(context);

      return authService.logout(user.id, context.res);
    },

    refreshToken: (
      _parent,
      { token },
      context
    ) => authService.refreshAccessToken(token, context.res, context.req),
  },
};