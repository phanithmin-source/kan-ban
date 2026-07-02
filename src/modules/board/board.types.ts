import { Board } from "@prisma/client";

export interface BoardConnection {
  data: Board[];
  total: number;
}

export interface BoardFilter {
  search?: string;
}

export interface CreateBoardInput {
  name: string;
}

export interface UpdateBoardInput {
  name: string
}