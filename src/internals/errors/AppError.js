export class AppError extends Error {
  constructor(message, statusCode, meta = {}) {
    super(message);

    this.statusCode = statusCode;
    this.meta = meta;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
