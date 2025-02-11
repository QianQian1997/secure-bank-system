import express, { Express } from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { defaultError } from '@server/types/express/express.types';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

const corsConfig = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const initMiddleware = (app: Express): void => {
    app.use(cors(corsConfig), express.json(), express.urlencoded({ extended: true }));
};

const initGraphQl = async (app: Express): Promise<ApolloServer<BaseContext>> => {
    const server = new ApolloServer({
        // typeDefs,
        // resolvers,
    });
    await server.start();
    return server;
};

const initGlobalErrorHandler = (app: Express): void => {
    app.use((err: defaultError, req: Request, res: Response, next: NextFunction): void => {
        const defaultError: defaultError = {
            log: 'there is an error in your middleware',
            status: 500,
            message: { error: 'An error occurred in your API' },
            success: false,
        };
        const resultError: defaultError = { ...defaultError, ...err };
        if (resultError.status) {
            res.status(resultError.status).json(resultError.message);
        }
        next(err);
    });
};

const startServer = async (): Promise<void> => {
    const app: Express = express();
    const PORT: number = 8080;
    initMiddleware(app);
    const server = await initGraphQl(app);
    app.use('/graphql', expressMiddleware(server));
    initGlobalErrorHandler(app);
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

try {
    await startServer();
} catch (error) {
    console.log(error, 'error when init startServer');
}
