import prisma from '@server/config/prisma';
import { User, LoginUser } from '@server/types/config/user.types';
import { graphqlErrorHandler } from '@server/utils/error';
export const createUser = async (
    email: string,
    hashedPassword: string,
    isAdmin: boolean,
    phoneNumber?: string,
): Promise<User | null> => {
    try {
        const user = await prisma.user.create({
            data: { email, passwordHash: hashedPassword, isAdmin, phoneNumber: phoneNumber || '' },
            select: {
                id: true,
                email: true,
                isAdmin: true,
                createAt: true,
                updatedAt: true,
                currentBalance: true,
            },
        });
        return user;
    } catch (err: any) {
        console.error('error in connecting prisma database: ', err);
        graphqlErrorHandler(
            `fail to create user with email: ${email} in database`,
            'DATABASE_ERROR',
            '500',
            err.message,
            ['createUser'],
        );
        return null;
    }
};

export const getUserByEmail = async (email: string): Promise<LoginUser | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                email: true,
                id: true,
                isAdmin: true,
                passwordHash: true,
                createAt: true,
                updatedAt: true,
            },
            //等真正getUser Transaction By email的时候再include
            // include: { transactions: true },
        });
        return user;
    } catch (err: any) {
        console.error('error in getting user by email from database', err);
        graphqlErrorHandler(
            `fail to get user with email: ${email} in database`,
            'DATABASE_ERROR',
            '500',
            err.message,
            ['getUserByEmail'],
        );
        return null;
    }
};
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const users = await prisma.user.findMany();
        //if cannot find, will return []
        return users;
    } catch (err: any) {
        console.error('error in getting all user info from database:', err);
        graphqlErrorHandler(
            'fail to get all users from database',
            'DATABASE_ERROR',
            '500',
            err.message,
            ['getUserByEmail'],
        );
        return [];
    }
};
