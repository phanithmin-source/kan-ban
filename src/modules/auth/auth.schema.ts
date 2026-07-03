export const authTypeDefs = `#graphql

type AuthPayload {
  token: String!
  user: User!
}

input RegisterInput {
  name: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

extend type Query {
  me: User
}

extend type Mutation {
  register(input: RegisterInput!): AuthPayload!

  login(input: LoginInput!): AuthPayload!

  logout: Boolean!
}
`;