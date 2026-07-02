import authService from "./auth.service.js";

import type {
  LoginArgs,
} from "./dto/auth.dto.js";

export const authResolvers = {
  Mutation: {
    login: (
      _parent: unknown,
      { input }: LoginArgs
    ) => authService.login(input),
  },
};