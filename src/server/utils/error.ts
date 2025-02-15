import { GraphQLError } from 'graphql';
import { graphqlErrorHandlerType } from '@server/types/config/error.types';
export const graphqlErrorHandler = (
    message: string,
    code: string,
    //设置默认值
    statusCode: string = '500',
    errMessage: string = 'Unknown Error',
    path?: string[],
) => {
    const extensionsObj: graphqlErrorHandlerType = {
        code,
        success: false,
        message: errMessage,
        status: statusCode,
    };
    throw new GraphQLError(message, {
        extensions: extensionsObj,
        path,
    });
};
