import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtPayload } from '@server/types/config/auth.types';
dotenv.config();
const privateKey = process.env.JWT_SECRET as string; //have to asset privateKey as string with TS
if (!privateKey) {
    throw new Error('jwt_token is missing');
}
export const generateJwtToken = (userID: string): string => {
    const token = jwt.sign({ userID }, privateKey, { expiresIn: '15m' });
    return token;
};
export const verifyJwtToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, privateKey) as JwtPayload;
        //decoded返回什么结构和payload传进去什么结构完全挂钩
        return decoded;
    } catch (err) {
        //这里不应该throw new error 因为只是想verify是否token有效 并不想break整个app
        // throw new Error('error in verifying jwt token'); 错误！！！
        //verify出错时直接返回null
        return null;
    }
};
