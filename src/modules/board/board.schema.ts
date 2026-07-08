export const boardTypeDefs = `#graphql

enum BoardRole {
  OWNER
  MEMBER
  VIEWER
}

type BoardMember {
  id: ID!
  boardId: ID!
  userId: ID!
  role: BoardRole!
  user: User!
}

type Board {
  id: ID!
  name: String!
  isArchived: Boolean!
  createdAt: String!
  updatedAt: String!

  owner: User!
  tasks: [Task!]!
  members: [BoardMember!]!
}

extend type Query {
  boards: [Board!]!
  board(id: ID!): Board
}

input CreateBoardInput {
  name: String!
}

input UpdateBoardInput {
  name: String!
}

extend type Mutation {
  createBoard(input: CreateBoardInput!): Board!
  updateBoard(id: ID!, input: UpdateBoardInput!): Board!
  deleteBoard(id: ID!): Boolean!
  
  # Archiving Board
  archiveBoard(id: ID!): Board!
  restoreBoard(id: ID!): Board!

  # Board Membership Management
  addBoardMember(boardId: ID!, userId: ID!, role: BoardRole!): BoardMember!
  removeBoardMember(boardId: ID!, userId: ID!): Boolean!
  updateBoardMemberRole(boardId: ID!, userId: ID!, role: BoardRole!): BoardMember!
}
`;