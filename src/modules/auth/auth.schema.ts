export const authTypeDefs = `#graphql

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  user: User!
}

type RefreshTokenPayload {
  accessToken: String!
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

type LogoutPayload {
  success: Boolean!
  message: String!
}

extend type Query {
  me: User
}

extend type Mutation {
  register(input: RegisterInput!): AuthPayload!

  login(input: LoginInput!): AuthPayload!

  logout: LogoutPayload!

  refreshToken(token: String!): RefreshTokenPayload!
}
`;