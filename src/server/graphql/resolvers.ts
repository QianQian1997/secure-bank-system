import { userResolvers } from './resolvers/authResolvers';
export const resolvers = {
    Query: {
        ...userResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
    },
};
