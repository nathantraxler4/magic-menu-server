import { GraphQLError } from 'graphql';

export enum Errors {
    LLM_RESPONSE_MISSING_CONTENT,
    LLM_RESPONSE_PARSE_ERROR,
    LLM_API_ERROR
}

/**
 *
 */
export function logAndThrowError({
    message,
    error,
    code
}: {
    message: string;
    error?: unknown;
    code: Errors;
}): never {
    const errorMessage = `${message}${error ? ` Error: ${error}` : ''}`;
    console.error(errorMessage);
    throw new GraphQLError(errorMessage, { extensions: { code } });
}
