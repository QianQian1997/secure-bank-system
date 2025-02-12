import prisma from '@server/config/prisma';
import { User } from '@server/types/config/user.types';
export const createUser = async (email: string): Promise<User> => {
    try {
        const user = await prisma.user.create({ data: { email } });
        return user;
    } catch (err: any) {
        console.error('error in connecting prisma database: ', err);
        throw new Error(`fail to create user in database ${err.message || 'Unknown Error'}`);
    }
};
export const getSpecificUser = async (userID: number): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userID,
            },
        });
        //user can be null if not found
        return user;
    } catch (err: any) {
        console.error('error in getting specific user info from database:', err);
        throw new Error(
            `fail to get user info for userID${userID} ${err.message || 'Unknown Error'}`,
        );
    }
};
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const users = await prisma.user.findMany();
        //if cannot find, will return []
        return users;
    } catch (err: any) {
        console.error('error in getting all user info from database:', err);
        throw new Error(`fail to get all userInfo ${err.message || 'Unknown Error'}`);
    }
};
