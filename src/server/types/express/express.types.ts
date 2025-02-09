import { Request, Response, NextFunction } from 'express';

export type defaultError = {
    log?: string;
    status?: number;
    message?: { error: string };
    success?: boolean;
};
