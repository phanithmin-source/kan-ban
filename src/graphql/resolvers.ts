import { taskResolvers } from "../modules/task/index.js";
import { boardResolvers } from "../modules/board/index.js";
import { userResolvers } from "../modules/user/user.resolver.js";
import { authResolvers } from "../modules/auth/auth.resolver.js";

export const resolvers = [
  taskResolvers,
  boardResolvers,
  userResolvers,
  authResolvers
];