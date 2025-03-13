export interface User {
    email: string;
    id: string;
    isAdmin: Boolean;
    createAt: Date;
    updatedAt: Date;
}
export interface LoginUser {
    email: string;
    id: string;
    isAdmin: Boolean;
    passwordHash: string;
    createAt: Date;
    updatedAt: Date;
}
