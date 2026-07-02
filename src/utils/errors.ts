export class AppError extends Error {
  constructor(
    message: string,
    public code = "INTERNAL_SERVER_ERROR",
    public statusCode = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, "BAD_USER_INPUT", 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHENTICATED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}