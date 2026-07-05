import prisma from "../config/prisma.js";
import DataLoader from "dataloader";

import type { User, Board, Task } from "@prisma/client";
import type { Request } from "express";

import { verifyToken } from "../utils/jwt.js";

export interface GraphQLContext {
  prisma: typeof prisma;
  user: User | null;
  loaders: {
    userLoader: DataLoader<number, User | null>;
    boardLoader: DataLoader<number, Board | null>;
    taskLoader: DataLoader<number, Task | null>;
    boardTasksLoader: DataLoader<number, Task[]>;
    boardOwnerLoader: DataLoader<number, User | null>;
    taskAssigneeLoader: DataLoader<number | null, User | null>;
  };
}

const createUserLoader = () =>
  new DataLoader<number, User | null>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as number[] } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return userIds.map((id) => userMap.get(id) || null);
  });

const createBoardLoader = () =>
  new DataLoader<number, Board | null>(async (boardIds) => {
    const boards = await prisma.board.findMany({
      where: { id: { in: boardIds as number[] } },
    });
    const boardMap = new Map(boards.map((b) => [b.id, b]));
    return boardIds.map((id) => boardMap.get(id) || null);
  });

const createTaskLoader = () =>
  new DataLoader<number, Task | null>(async (taskIds) => {
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds as number[] } },
    });
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    return taskIds.map((id) => taskMap.get(id) || null);
  });

const createBoardTasksLoader = () =>
  new DataLoader<number, Task[]>(async (boardIds) => {
    const tasks = await prisma.task.findMany({
      where: { boardId: { in: boardIds as number[] } },
      orderBy: { createdAt: "desc" },
    });
    const tasksByBoard = new Map<number, Task[]>();
    boardIds.forEach((id) => tasksByBoard.set(id, []));
    tasks.forEach((task) => {
      tasksByBoard.get(task.boardId)?.push(task);
    });
    return boardIds.map((id) => tasksByBoard.get(id) || []);
  });

const createBoardOwnerLoader = () =>
  new DataLoader<number, User | null>(async (boardIds) => {
    const boards = await prisma.board.findMany({
      where: { id: { in: boardIds as number[] } },
      include: { owner: true },
    });
    const boardMap = new Map(boards.map((b) => [b.id, b.owner]));
    return boardIds.map((id) => boardMap.get(id) || null);
  });

const createTaskAssigneeLoader = () =>
  new DataLoader<number | null, User | null>(async (assigneeIds) => {
    const validIds = assigneeIds.filter((id) => id !== null) as number[];
    const users = await prisma.user.findMany({
      where: { id: { in: validIds } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return assigneeIds.map((id) =>
      id === null ? null : userMap.get(id) || null
    );
  });

export const createContext = async ({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> => {
  let user: User | null = null;

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const payload = verifyToken(token);

      user = await prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });
    } catch {
      // Invalid token
      user = null;
    }
  }

  return {
    prisma,
    user,
    loaders: {
      userLoader: createUserLoader(),
      boardLoader: createBoardLoader(),
      taskLoader: createTaskLoader(),
      boardTasksLoader: createBoardTasksLoader(),
      boardOwnerLoader: createBoardOwnerLoader(),
      taskAssigneeLoader: createTaskAssigneeLoader(),
    },
  };
};