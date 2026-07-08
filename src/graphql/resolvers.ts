import { GraphQLScalarType, Kind } from "graphql";
import { taskResolvers } from "../modules/task/index.js";
import { boardResolvers } from "../modules/board/index.js";
import { userResolvers } from "../modules/user/user.resolver.js";
import { authResolvers } from "../modules/auth/auth.resolver.js";

const IDScalar = new GraphQLScalarType({
  name: "ID",
  description: "Custom ID scalar to parse IDs as integers",
  serialize: (value) => String(value),
  parseValue: (value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10);
    }
    if (ast.kind === Kind.STRING) {
      const parsed = Number(ast.value);
      return Number.isNaN(parsed) ? ast.value : parsed;
    }
    return null;
  },
});

export const resolvers = [
  { ID: IDScalar } as any,
  taskResolvers,
  boardResolvers,
  userResolvers,
  authResolvers
];