export interface GetBoardArgs {
  id: string;
}

export interface CreateBoardArgs {
  input: {
    name: string;
  };
}

export interface UpdateBoardArgs {
  id: string;
  input: {
    name: string;
  };
}

export interface DeleteBoardArgs {
  id: string;
}