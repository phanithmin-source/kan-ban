import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";

import authService from "../src/modules/auth/auth.service.ts";
import { BadRequestError, UnauthorizedError } from "../src/utils/errors.ts";

const prisma = new PrismaClient();

describe("authService", () => {
  before(async () => {
    await prisma.user.deleteMany();
    await prisma.refreshToken.deleteMany();
  });

  after(async () => {
    await prisma.user.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.$disconnect();
  });

  it("registers a new user and returns access and refresh tokens", async () => {
    const result = await authService.register({
      name: "Auth User",
      email: "auth-user@example.com",
      password: "password123",
    });

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.equal(result.user.email, "auth-user@example.com");
  });

  it("rejects duplicate email registration", async () => {
    await assert.rejects(
      () =>
        authService.register({
          name: "Another User",
          email: "auth-user@example.com",
          password: "password123",
        }),
      (error: unknown) => {
        assert.ok(error instanceof BadRequestError);
        assert.match(error.message, /Email already exists/i);
        return true;
      }
    );
  });

  it("refreshes access token using valid refresh token", async () => {
    const registered = await authService.register({
      name: "Refresh Test User",
      email: "refresh-user@example.com",
      password: "password123",
    });

    const refreshed = await authService.refreshAccessToken(
      registered.refreshToken
    );

    assert.ok(refreshed.accessToken);
    assert.equal(typeof refreshed.accessToken, "string");
    assert.ok(refreshed.accessToken.length > 0);
  });

  it("rejects invalid or expired refresh tokens", async () => {
    await assert.rejects(
      () =>
        authService.refreshAccessToken(
          "invalid.token.here"
        ),
      (error: unknown) => {
        assert.ok(error instanceof UnauthorizedError);
        return true;
      }
    );
  });

  it("invalidates all refresh tokens on logout", async () => {
    const registered = await authService.register({
      name: "Logout Test User",
      email: "logout-user@example.com",
      password: "password123",
    });

    await authService.logout(registered.user.id);

    await assert.rejects(
      () =>
        authService.refreshAccessToken(
          registered.refreshToken
        ),
      (error: unknown) => {
        assert.ok(error instanceof UnauthorizedError);
        return true;
      }
    );
  });
});
