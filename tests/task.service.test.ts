import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";

import taskService from "../src/modules/task/task.service.ts";
import { BadRequestError, ForbiddenError } from "../src/utils/errors.ts";

const prisma = new PrismaClient();

describe("taskService.updateTask", () => {
  let taskId: number;

  before(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "task-service-test@example.com",
        password: "hashed-password",
      },
    });

    const board = await prisma.board.create({
      data: {
        name: "Test Board",
        owner: {
          connect: { id: user.id },
        },
      },
    });

    const task = await prisma.task.create({
      data: {
        title: "Existing task",
        description: "Task for validation test",
        status: "TODO",
        priority: "MEDIUM",
        board: {
          connect: { id: board.id },
        },
      },
    });

    taskId = task.id;
  });

  after(async () => {
    await prisma.task.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("wraps invalid update input in BadRequestError", async () => {
    await assert.rejects(
      () => taskService.updateTask(taskId, { title: "" }),
      (error: unknown) => {
        assert.ok(error instanceof BadRequestError);
        assert.match(error.message, /Title is required/i);
        return true;
      }
    );
  });

  it("allows a USER to update a task assigned to them", async () => {
    const assignee = await prisma.user.create({
      data: {
        name: "Assignee",
        email: "assignee-user@example.com",
        password: "hashed-password",
      },
    });

    const task = await prisma.task.create({
      data: {
        title: "Assigned task",
        description: "Assigned to current user",
        status: "TODO",
        priority: "MEDIUM",
        assignee: {
          connect: { id: assignee.id },
        },
        board: {
          connect: { id: (await prisma.board.findFirst({ where: {} }))!.id },
        },
      },
    });

    const updatedTask = await taskService.updateTask(
      task.id,
      { title: "Updated by assignee" },
      { id: assignee.id, role: "USER" }
    );

    assert.equal(updatedTask.title, "Updated by assignee");
  });

  it("rejects a USER updating a task not assigned to them", async () => {
    const otherUser = await prisma.user.create({
      data: {
        name: "Other User",
        email: "other-user@example.com",
        password: "hashed-password",
      },
    });

    const task = await prisma.task.create({
      data: {
        title: "Unassigned task",
        description: "Not assigned to current user",
        status: "TODO",
        priority: "MEDIUM",
        board: {
          connect: { id: (await prisma.board.findFirst({ where: {} }))!.id },
        },
      },
    });

    await assert.rejects(
      () =>
        taskService.updateTask(
          task.id,
          { title: "Should not update" },
          { id: otherUser.id, role: "USER" }
        ),
      (error: unknown) => {
        assert.ok(error instanceof ForbiddenError);
        return true;
      }
    );
  });
});
