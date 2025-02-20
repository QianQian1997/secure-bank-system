import {
    getUserByID,
    getAllUsers,
    createUser,
    getUserByEmail,
} from '@server/services/authServices';
import { generateJwtToken } from '@server/utils/authUtils';
import bcrypt from 'bcrypt';
import { graphqlErrorHandler } from '@server/utils/error';
const saltRounds = 10;
export const userResolvers = {
    Query: {
        getUserByID: async (_: any, { id }: { id: number }) => {
            const user = await getUserByID(id);
            if (!user) {
                graphqlErrorHandler(
                    `this user with id: ${id} cannot be found in the database`,
                    'USER_NOT_FOUND',
                    '404',
                    undefined,
                    ['getUserByID'],
                );
                //404找不到指定用户
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
                graphqlErrorHandler(
                    `this user with email: ${email} has already signed up`,
                    'USER_EXISTS',
                    '409',
                    undefined,
                    ['signup'],
                );
                //409 conflict 请求资源与当前已有资源冲突 例如注册一个已经注册的邮箱
            }
            try {
                let hashedPassword;
                try {
                    hashedPassword = await bcrypt.hash(password, saltRounds);
                } catch (e: any) {
                    throw new Error(`bcrypt error: ${e.message}`);
                }
                const newUser = await createUser(email, hashedPassword);
                if (newUser === null) {
                    return graphqlErrorHandler(
                        `Failed to create user with email: ${email}`,
                        'USER_CREATION_FAILED',
                        '500',
                        'User creation failed for unknown reasons',
                        ['signup'],
                    );
                } else {
                    try {
                        const jwtToken = generateJwtToken(newUser.id);
                        return { user: newUser, token: jwtToken };
                    } catch (e: any) {
                        throw new Error(`jwt error: ${e.message}`);
                    }
                }
            } catch (err: any) {
                console.error('error in signing up user', err);
                if (err.message.includes('bcrypt')) {
                    return graphqlErrorHandler(
                        `Error in hashing pwd during signup for email: ${email}`,
                        'BCRYPT_ERROR',
                        '500',
                        err.message,
                        ['signup'],
                    );
                }
                if (err.message.includes('jwt')) {
                    return graphqlErrorHandler(
                        `Error in generating jwt during signup for email: ${email}`,
                        'JWT_ERROR',
                        '500',
                        err.message,
                        ['signup'],
                    );
                }
                return graphqlErrorHandler(
                    `Unexpected error during signup for email: ${email}`,
                    'UNKNOWN_ERROR',
                    '500',
                    err.message,
                    ['signup'],
                );
            }
        },
        login: async (_: any, { email, password }: { email: string; password: string }) => {
            const existingUser = await getUserByEmail(email);
            //entered email has not been signed up
            if (existingUser === null) {
                graphqlErrorHandler(
                    `this user with email: ${email} does not exists in database`,
                    'USER_NOT_FOUND',
                    '404',
                    undefined,
                    ['getUserByEmail'],
                );
            } else {
                const { passwordHash, id } = existingUser;
                const isPwdMatch = await bcrypt.compare(password, passwordHash);
                if (isPwdMatch) {
                    //login的时候也是生成新的jwt发送给前端
                    const jwtToken = generateJwtToken(id);
                    return { user: existingUser, token: jwtToken };
                } else {
                    //password entered does not match the record
                    graphqlErrorHandler(
                        `Invalid credentials for user with email: ${email} `,
                        'INVALID_PASSWORD',
                        '401',
                        undefined,
                        ['login'],
                    );
                    //凭证错误 密码不正确
                }
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
