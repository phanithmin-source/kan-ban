import type { Role } from "@prisma/client";
import type { GraphQLContext } from "../graphql/context.js";

import {
  ForbiddenError,
  UnauthorizedError,
} from "./errors.js";

export function requireAuth(
  context: GraphQLContext
) {
  if (!context.user) {
    throw new UnauthorizedError(
      "Authentication required"
    );
  }

  return context.user;
}

export function requireRole(
  context: GraphQLContext,
  roles: Role[]
) {
  const user = requireAuth(context);

  if (!roles.includes(user.role)) {
    throw new ForbiddenError(
      "You do not have permission"
    );
  }

  return user;
}