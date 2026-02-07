import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
  constructor(path, method = "GET") {
    super(`Route not found: ${method} ${path}`, 404);
  }
}
