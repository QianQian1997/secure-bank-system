import { Request } from 'express';
import { JwtPayload } from '@server/types/config/auth.types';
import { verifyJwtToken } from '@server/utils/authUtils';
import { BaseContext } from '@apollo/server';
export interface GraphQLContext {
    user: JwtPayload | null;
}
export const context = ({ req }: { req: Request }): BaseContext & GraphQLContext => {
    const reqHeader = req.headers.authorization ?? '';
    const token = reqHeader.replace('Bearer', '').trim();
    if (!token) return { user: null };
    try {
        const decoded = verifyJwtToken(token) as JwtPayload;
        return { user: decoded };
    } catch (e) {
        return { user: null };
    }
};
