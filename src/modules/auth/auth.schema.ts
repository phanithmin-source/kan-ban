export const authTypeDefs =`#graphql

input LoginInput {
  email: String!
  password: String!
}

type AuthPayload {
  token: String!
  user: User!
}

extend type Mutation {
  login(input: LoginInput!): AuthPayload!
}
`;