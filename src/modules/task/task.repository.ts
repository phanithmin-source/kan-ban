import { Prisma, Role } from "@prisma/client";

import prisma from "../../config/prisma.js";
import type { TaskFilter } from "./task.types.js";

class TaskRepository {
  private buildWhere(filter: TaskFilter): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    where.archived = false;

    if (filter.boardId) {
      where.boardId = filter.boardId;
    }

    if (filter.search) {
      where.title = {
        contains: filter.search,
        mode: "insensitive",
      };
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.priority) {
      where.priority = filter.priority;
    }

    if (filter.assigneeId) {
      where.assigneeId = filter.assigneeId;
    }

    return where;
  }

  private buildOrderBy(
    filter: TaskFilter
  ): Prisma.TaskOrderByWithRelationInput {
    const sortFieldMap = {
      CREATED_AT: "createdAt",
      UPDATED_AT: "updatedAt",
      DUE_DATE: "dueDate",
      TITLE: "title",
      PRIORITY: "priority",
    } as const;

    const sortField =
      sortFieldMap[filter.sortBy ?? "CREATED_AT"];

    const sortOrder: Prisma.SortOrder =
      filter.order === "ASC" ? "asc" : "desc";

    return {
      [sortField]: sortOrder,
    };
  }

  /**
   * Internal use.
   * Returns all tasks.
   */
  async findAll(filter: TaskFilter) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(filter);
    const orderBy = this.buildOrderBy(filter);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),

      prisma.task.count({
        where,
      }),
    ]);

    return {
      data: tasks,
      total,
    };
  }

  /**
   * RBAC.
   * ADMIN -> all active tasks
   * Others -> only tasks in boards they are members of
   */
  async findAllAccessible(
    userId: number,
    role: Role,
    filter: TaskFilter
  ) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(filter);

    if (role !== Role.ADMIN) {
      where.board = {
        members: {
          some: { userId },
        },
      };
    }

    const orderBy = this.buildOrderBy(filter);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          board: true,
          assignee: true,
          creator: true,
        },
      }),

      prisma.task.count({
        where,
      }),
    ]);

    return {
      data: tasks,
      total,
    };
  }

  findManyAccessible(
    userId: number,
    role: Role,
    filter: TaskFilter
  ) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(filter);

    if (role !== Role.ADMIN) {
      where.board = {
        members: {
          some: { userId },
        },
      };
    }

    const orderBy = this.buildOrderBy(filter);

    return prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        board: true,
        assignee: true,
        creator: true,
      },
    });
  }

  countAccessible(
    userId: number,
    role: Role,
    filter: TaskFilter
  ) {
    const where = this.buildWhere(filter);

    if (role !== Role.ADMIN) {
      where.board = {
        members: {
          some: { userId },
        },
      };
    }

    return prisma.task.count({
      where,
    });
  }

  findAccessibleById(
    id: number,
    userId: number,
    role: Role
  ) {
    return prisma.task.findFirst({
      where: {
        id,
        ...(role === Role.ADMIN
          ? {}
          : {
              board: {
                members: {
                  some: { userId },
                },
              },
            }),
      },
      include: {
        board: true,
        assignee: true,
        creator: true,
      },
    });
  }

  findById(id: number) {
    return prisma.task.findUnique({
      where: {
        id,
      },
    });
  }

  create(data: {
    title: string;
    description?: string;
    status: Prisma.TaskCreateInput["status"];
    priority: Prisma.TaskCreateInput["priority"];
    dueDate?: Date | null;
    board: Prisma.BoardCreateNestedOneWithoutTasksInput;
    creator: Prisma.UserCreateNestedOneWithoutCreatedTasksInput;
  }) {
    return prisma.task.create({
      data,
    });
  }

  update(
    id: number,
    data: Prisma.TaskUpdateInput
  ) {
    return prisma.task.update({
      where: {
        id,
      },
      data,
    });
  }

  assignTask(
    taskId: number,
    userId: number
  ) {
    return prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        assignee: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  delete(id: number) {
    return prisma.task.delete({
      where: {
        id,
      },
    });
  }

  // Comments
  findCommentById(id: number) {
    return prisma.comment.findUnique({
      where: {
        id,
      },
    });
  }

  addComment(taskId: number, userId: number, content: string) {
    return prisma.comment.create({
      data: {
        content,
        task: {
          connect: { id: taskId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: true,
      },
    });
  }

  updateComment(id: number, content: string) {
    return prisma.comment.update({
      where: {
        id,
      },
      data: {
        content,
      },
      include: {
        user: true,
      },
    });
  }

  deleteComment(id: number) {
    return prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}

export default new TaskRepository();