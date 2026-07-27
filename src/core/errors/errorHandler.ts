import { AppError, DatabaseError } from './AppError';

export interface ErrorLogPayload {
  timestamp: string;
  name: string;
  code?: string;
  statusCode?: number;
  message: string;
  userMessage?: string;
  context?: string;
  details?: any;
  stack?: string;
}

export const logError = (error: unknown, context?: string): ErrorLogPayload => {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    const payload: ErrorLogPayload = {
      timestamp: error.timestamp || timestamp,
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      userMessage: error.userMessage,
      context,
      details: error.details,
      stack: error.stack,
    };
    console.error(`[AppError][${context || 'General'}]`, payload);
    return payload;
  }

  const errObj = error instanceof Error ? error : new Error(String(error));
  const payload: ErrorLogPayload = {
    timestamp,
    name: errObj.name || 'Error',
    message: errObj.message,
    userMessage: errObj.message,
    context,
    stack: errObj.stack,
  };
  console.error(`[UnhandledError][${context || 'General'}]`, payload);
  return payload;
};

export const formatUserErrorMessage = (error: unknown, fallbackMessage = 'មានបញ្ហាមិនរំពឹងទុកបានកើតឡើង'): string => {
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallbackMessage;
};

export async function safeAsync<T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  context?: string
): Promise<[T | null, AppError | null]> {
  try {
    const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
    const data = await promise;
    return [data, null];
  } catch (err: any) {
    if (err instanceof AppError) {
      logError(err, context);
      return [null, err];
    }
    const dbErr = new DatabaseError(err, context);
    logError(dbErr, context);
    return [null, dbErr];
  }
}
