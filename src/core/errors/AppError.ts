export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  CONFLICT = 'CONFLICT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    userMessage?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage || message;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string, userMessage?: string) {
    const msg = id ? `${entity} with ID '${id}' was not found.` : `${entity} was not found.`;
    const kmMsg = userMessage || `រកមិនឃើញ ${entity} ក្នុងប្រព័ន្ធទេ`;
    super(msg, ErrorCode.NOT_FOUND, 404, kmMsg, { entity, id });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage?: string, details?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, userMessage || message, details);
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName: string, requestedQty: number, availableQty: number) {
    const msg = `Insufficient stock for product '${productName}'. Requested: ${requestedQty}, Available: ${availableQty}`;
    const kmMsg = `ស្តុកមិនគ្រប់គ្រាន់សម្រាប់ទំនិញ "${productName}" (សល់ក្នុងស្តុក: ${availableQty} ${requestedQty > 0 ? `, ត្រូវការ: ${requestedQty}` : ''})`;
    super(msg, ErrorCode.INSUFFICIENT_STOCK, 400, kmMsg, {
      productName,
      requestedQty,
      availableQty,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'User is unauthorized', userMessage?: string) {
    super(message, ErrorCode.UNAUTHORIZED, 401, userMessage || 'សូមចូលប្រើប្រាស់ប្រព័ន្ធជាមុនសិន', undefined);
  }
}

export class DatabaseError extends AppError {
  constructor(originalError: any, context?: string) {
    const msg = originalError?.message || 'Database operation failed';
    const kmMsg = `មានបញ្ហាបច្ចេកទេសបណ្តាញ/ទិន្នន័យ (${context || 'ប្រតិបត្តិការបរាជ័យ'})`;
    super(msg, ErrorCode.DATABASE_ERROR, 500, kmMsg, {
      originalError: originalError?.message || String(originalError),
      context,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, userMessage?: string, details?: Record<string, any>) {
    super(message, ErrorCode.CONFLICT, 409, userMessage || message, details);
  }
}
