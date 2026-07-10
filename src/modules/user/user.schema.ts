export const userTypeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!

    boards: [Board!]!

    createdAt: String!
    updatedAt: String!
  }

  enum Role {
    ADMIN
    MANAGER
    USER
  }

  input UpdateUserInput {
    name: String
    email: String
    role: Role
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    updateUser(
      id: ID!
      input: UpdateUserInput!
    ): User!

    deleteUser(id: ID!): Boolean!
  }
`;