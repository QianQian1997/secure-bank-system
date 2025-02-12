import { createUser, getSpecificUser, getAllUsers } from '@server/services/userServices';

export const userResolvers = {
    Query: {
        getSpecificUser: async (_: any, { id }: { id: number }) => {
            const user = await getSpecificUser(id);
            if (!user) {
                throw new Error('cannot find user in database');
            }
            return user;
        },
        getAllUsers: async (_: any, __: any) => {
            return await getAllUsers();
        },
    },
    Mutation: {
        async createUser(_: any, { email }: { email: string }) {
            return await createUser(email);
        },
    },
};

/**
 * GraphQL Type Handling:
 *
 * 1. Type Validation:
 *    GraphQL automatically validates that return types match the schema definition.
 *    If schema defines `type Query { user: User }`, the resolver must return User type.
 *
 * 2. Promise Resolution:
 *    GraphQL automatically resolves Promises returned by resolvers.
 *    No need to explicitly handle async/await in the schema.
 *
 * 3. Data Structure Validation:
 *    GraphQL ensures the returned data structure matches the schema.
 *    If a field is marked as non-null (`!`), GraphQL enforces this at runtime.
 *
 * Benefit: Type safety is managed by the schema, eliminating the need for
 * redundant TypeScript return types in resolvers.
 */
