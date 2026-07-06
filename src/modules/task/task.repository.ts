import { Prisma, Role } from "@prisma/client";

import prisma from "../../config/prisma.js";
import type { TaskFilter } from "./task.types.js";

class TaskRepository {
  private buildWhere(filter: TaskFilter): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (filter.search) {
      where.title = {
        contains: filter.search,
      };
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.priority) {
      where.priority = filter.priority;
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
   * ADMIN -> all tasks
   * Others -> only tasks in boards they own
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
        ownerId: userId,
      };
    }

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
              ownerId: userId,
            },
          }),
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

  create(data: Prisma.TaskCreateInput) {
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
}

export default new TaskRepository();