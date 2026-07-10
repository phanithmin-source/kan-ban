import prisma from "../config/prisma.js";
import DataLoader from "dataloader";

import type { User, Board, Task, BoardMember, Comment } from "@prisma/client";
import type { Request, Response } from "express";

import { verifyToken } from "../utils/jwt.js";

export interface GraphQLContext {
  prisma: typeof prisma;
  user: User | null;
  req?: Request;
  res?: Response;
  loaders: {
    userLoader: DataLoader<number, User | null>;
    boardLoader: DataLoader<number, Board | null>;
    taskLoader: DataLoader<number, Task | null>;
    boardTasksLoader: DataLoader<number, Task[]>;
    userBoardsLoader: DataLoader<number, Board[]>;
    taskCommentsLoader: DataLoader<number, Comment[]>;
    boardMembersLoader: DataLoader<number, BoardMember[]>;
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


const createUserBoardsLoader = () =>
  new DataLoader<number, Board[]>(async (userIds) => {
    const boards = await prisma.board.findMany({
      where: { ownerId: { in: userIds as number[] } },
      orderBy: { createdAt: "asc" },
    });
    const boardsByUser = new Map<number, Board[]>();
    userIds.forEach((id) => boardsByUser.set(id, []));
    boards.forEach((board) => {
      boardsByUser.get(board.ownerId)?.push(board);
    });
    return userIds.map((id) => boardsByUser.get(id) || []);
  });


const createTaskCommentsLoader = () =>
  new DataLoader<number, Comment[]>(async (taskIds) => {
    const comments = await prisma.comment.findMany({
      where: { taskId: { in: taskIds as number[] } },
      orderBy: { createdAt: "desc" },
    });
    const commentsByTask = new Map<number, Comment[]>();
    taskIds.forEach((id) => commentsByTask.set(id, []));
    comments.forEach((c) => {
      commentsByTask.get(c.taskId)?.push(c);
    });
    return taskIds.map((id) => commentsByTask.get(id) || []);
  });

const createBoardMembersLoader = () =>
  new DataLoader<number, BoardMember[]>(async (boardIds) => {
    const members = await prisma.boardMember.findMany({
      where: { boardId: { in: boardIds as number[] } },
      orderBy: { createdAt: "asc" },
    });
    const membersByBoard = new Map<number, BoardMember[]>();
    boardIds.forEach((id) => membersByBoard.set(id, []));
    members.forEach((m) => {
      membersByBoard.get(m.boardId)?.push(m);
    });
    return boardIds.map((id) => membersByBoard.get(id) || []);
  });

export const createContext = async ({
  req,
  res,
}: {
  req: Request;
  res?: Response;
}): Promise<GraphQLContext> => {
  let user: User | null = null;

  let token = req.cookies?.accessToken;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    try {
      const payload = verifyToken(token);

      user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: "",
        password: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch {
      // Invalid token
      user = null;
    }
  }

  return {
    prisma,
    user,
    req,
    res,
    loaders: {
      userLoader: createUserLoader(),
      boardLoader: createBoardLoader(),
      taskLoader: createTaskLoader(),
      boardTasksLoader: createBoardTasksLoader(),
      userBoardsLoader: createUserBoardsLoader(),
      taskCommentsLoader: createTaskCommentsLoader(),
      boardMembersLoader: createBoardMembersLoader(),
    },
  };
};