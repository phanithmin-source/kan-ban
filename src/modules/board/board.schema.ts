export const boardTypeDefs = `#graphql

type Board {
  id: ID!
  name: String!
  createdAt: String!
  updatedAt: String!

  owner: User!
  tasks: [Task!]!
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
}
`;