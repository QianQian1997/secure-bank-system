import express, { Express } from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { defaultError } from '@server/types/express/express.types';
import { ApolloServer, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Server } from 'http';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';
import prisma from './config/prisma';
//这里一定要写上| undefined  这样写 TypeScript 就知道：server 可能不存在，要检查后再用
let server: Server | undefined;

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
        typeDefs,
        resolvers,
    });
    await server.start();
    return server;
};

const initGlobalErrorHandler = (app: Express): void => {
    app.use((err: defaultError, req: Request, res: Response, next: NextFunction): void => {
        if (req.path === '/graphql') {
            return next();
        }
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

// 封装成 Promise 的情形：
// 当你遇到 回调函数（比如 fs.readFile, server.close）时，它们不会返回 Promise，需要手动封装成 Promise 来使用 await。
// 当你需要 统一的错误处理 或者 简化异步逻辑 时。
// 当你希望多个异步操作 并行执行 并等待它们全部完成时。
// 不需要封装成 Promise 的情形：
// 如果你使用的 API 本身已经返回 Promise（如 fetch、setTimeout 等）。
// 如果是 同步操作，它们本身不会涉及到异步行为。

const shutDownServer = (server: Server): Promise<void> => {
    // 通过封装回调为 Promise 以便在异步函数中使用 await 处理 shutdown 操作
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};
//这个是个函数表达式 不管是同步异步 都不会被变量提升 所以一定要先定义再调用 如果换成async function cleanUp的方式就会有变量提升提升到全局变量 就可以先调用再定义
const cleanUp = async () => {
    try {
        if (server) {
            await shutDownServer(server);
        }
        console.log('closed http');
        //这个数据库关闭必须在服务器关闭之后执行
        await prisma.$disconnect();
        console.log('closed prisma database');
        process.exit(0);
    } catch (e: any) {
        console.error('error in cleaning up', e);
        process.exit(1);
    }
};

// 当一个 Promise 发生错误但没有 catch 处理时触发
const startServer = async (): Promise<void> => {
    const app: Express = express();
    const PORT: number = 8080;
    initMiddleware(app);
    const apolloServer = await initGraphQl(app);
    app.use('/graphql', expressMiddleware(apolloServer));
    initGlobalErrorHandler(app);
    //这里全局变量的server被赋值 不再是undefined
    server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

// process.on('uncaughtException', callback) 这一行代码是同步执行的，注册了监听器。但当 'uncaughtException' 事件发生时，回调函数才会被异步触发。
// 在回调函数内部，如果你使用了 async/await，那么这个回调函数就能处理异步操作（比如清理工作），但回调的执行本身是异步的，独立于事件注册之外。
const initProcessEvents = () => {
    //process这些事件监听要写在try catch的外面
    // process.on() 事件监听器 是事件驱动的，它会在 事件触发时 执行回调。因此，事件监听器的回调是异步执行的，而且通常是在主线程的事件循环（event loop）中触发。
    process.on('SIGINT', cleanUp);
    //监听 SIGINT 信号，当用户按下 Ctrl + C 时触发。
    //场景：通常用于让服务器在手动终止时进行清理（比如关闭数据库连接、保存日志等）。
    process.on('SIGTERM', cleanUp);
    // 监听 SIGTERM 信号，当进程被要求终止时触发。
    // 场景：一般由操作系统或容器编排工具（如 Docker、Kubernetes）发送，表示需要关闭进程。 kill <process_id>
    // 由于回调是异步执行的，事件触发时的错误不会被 try/catch 捕获，因此需要通过 uncaughtException 和 unhandledRejection 来进行捕获和处理
    process.on('uncaughtException', async (err) => {
        console.error('uncaughtException', err); //致命错误 throw 但未 try-catch 需要清理并推出
        await cleanUp();
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.log('unhandledRejection at', promise, 'reason', reason); //Promise.reject() 没有 catch 程序可以继续运行
    });
};

// try/catch 只能捕获同步代码中的异常，包括同步的函数调用或同步代码中的错误。它不能捕获异步回调中的错误，尤其是在事件监听器触发时的错误。
try {
    //await 关键字的帮助下，异步函数会被当做同步代码来处理。当你使用 await 调用异步函数时，await 会等待异步操作完成并返回结果。这时，await 实际上会暂停当前的执行上下文，直到异步操作完成或失败。
    await startServer();
} catch (error) {
    console.log(error, 'error when init startServer');
    process.exit(1);
}
//要startServer后面才可以call这个cleanUp因为这时候server才是被赋值了的状态
initProcessEvents();
