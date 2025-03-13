export const authTypeDefs = `#graphql
  type User {
    email: String!
    id: String!  
    # uuid in prisma
    isAdmin: Boolean!
    createAt: DateTime!
    updatedAt: DateTime!
  }
  type LoginUser {
    email: String!
    id: String!  
    isAdmin: Boolean!
    passwordHash: String!
    createAt: DateTime!
    updatedAt: DateTime!
  }
  type LoginUserResponse {
    email: String!
    isAdmin: Boolean!
    createAt: DateTime!
    updatedAt: DateTime!
  }
  type authAPIResponseSignUp {
    user: User!
    token: String!
  }
  type authAPIResponseLogin {
    user: LoginUserResponse!
    token: String! 
  }
  type Query {
    getAllUsers: [User!]!
    getUserByEmail(email: String!): LoginUser
  }
  type Mutation {
    createUser(email: String!, hashedPassword: String!, isAdmin: boolean!, phoneNumber: String): User
    signup(email: String!, password: String!, phoneNumber: String): authAPIResponseSignUp!
    login(email: String!, password: String!): authAPIResponseLogin!
  }
`;
