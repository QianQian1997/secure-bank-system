import {
    getUserByID,
    getAllUsers,
    createUser,
    getUserByEmail,
} from '@server/services/authServices';
import { generateJwtToken } from '@server/utils/authUtils';
import bcrypt from 'bcrypt';
const saltRounds = 10;
export const userResolvers = {
    Query: {
        getUserByID: async (_: any, { id }: { id: number }) => {
            const user = await getUserByID(id);
            if (!user) {
                throw new Error(`cannot find user of id: ${id} in database`);
            }
            return user;
        },
        getAllUsers: async (_: any, __: any) => {
            return await getAllUsers();
        },
    },
    Mutation: {
        signup: async (_: any, { email, password }: { email: string; password: string }) => {
            const existingUser = await getUserByEmail(email);
            if (existingUser !== null) {
                throw new Error(`this user with email:${email} has already signed up`);
            }
            try {
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const newUser = await createUser(email, hashedPassword);
                const jwtToken = generateJwtToken(newUser.id);
                return { user: newUser, token: jwtToken };
            } catch (err: any) {
                console.error('error in signing up user', err);
                throw new Error(
                    `fail to generate signup for user with email:${email} with error ${err.message || 'Unknown Error'}}`,
                );
            }
        },
        login: async (_: any, { email, password }: { email: string; password: string }) => {
            const existingUser = await getUserByEmail(email);
            //entered email has not been signed up
            if (existingUser === null) {
                throw new Error(`cannot find user with email ${email} in database`);
            }
            const { passwordHash, id } = existingUser;
            const isPwdMatch = await bcrypt.compare(password, passwordHash);
            if (isPwdMatch) {
                //login的时候也是生成新的jwt发送给前端
                const jwtToken = generateJwtToken(id);
                return { user: existingUser, token: jwtToken };
            } else {
                //password entered does not match the record
                throw new Error(`Please check your email or password`);
            }
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
