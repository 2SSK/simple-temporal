import express from "express";
import router from "./internals/router/router.js";
import { errorHandler } from "./internals/middlewares/errorHandler.middleware.js";
import { requestLogger } from "./internals/middlewares/requestLogger.middleware.js";
import { notFound } from "./internals/middlewares/notFound.middleware.js";
import { traceIdMiddleware } from "./internals/middlewares/traceId.middleware.js";
import { responseMiddleware } from "./internals/middlewares/response.middleware.js";

// Expressjs app
const app = express();

// Middlewares
app.use(express.json());
app.use(traceIdMiddleware);
app.use(requestLogger);
app.use(responseMiddleware);

// Centeral Router
app.use("/", router);

// ErrorHandling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
