import { Task } from "@prisma/client";

export type TaskSortField =
  | "CREATED_AT"
  | "UPDATED_AT"
  | "DUE_DATE"
  | "TITLE"
  | "PRIORITY";

export type SortOrder = "ASC" | "DESC";

export interface TaskFilter {
  search?: string;

  status?: Task["status"];

  priority?: Task["priority"];

  boardId?: number;
  assigneeId?: number;

  page?: number;

  limit?: number;

  sortBy?: TaskSortField;

  order?: SortOrder;
}

export interface TaskConnection {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}