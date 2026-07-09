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
      { input }
    ) => authService.register(input),

    login: (
      _parent,
      { input }
    ) => authService.login(input),

    logout: (
      _parent,
      _args,
      context
    ) => {
      const user = requireAuth(context);

      return authService.logout(user.id);
    },

    refreshToken: (
      _parent,
      { token }
    ) => authService.refreshAccessToken(token),
  },
};