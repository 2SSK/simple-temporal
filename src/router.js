import express from "express";
import { healthHandler } from "./handler/health.js";
import { apiHandler } from "./handler/api.js";
import {
  createOrderHandler,
  getOrderStatusHandler,
  listOrdersHandler,
  cancelOrderHandler,
} from "./handler/order.js";
import {
  registerUserHandler,
  getUserStatusHandler,
  listUsersHandler,
  suspendUserHandler,
} from "./handler/user.js";
import { expressLogger } from "../utils/logger.js";

const router = express.Router();

// Apply request logging middleware
router.use(expressLogger);

// Health and API info endpoints
router.get("/health", healthHandler);
router.get("/api", apiHandler);

// Order endpoints
router.post("/orders", createOrderHandler);
router.get("/orders", listOrdersHandler);
router.get("/orders/:id", getOrderStatusHandler);
router.post("/orders/:id/cancel", cancelOrderHandler);

// User endpoints
router.post("/users/register", registerUserHandler);
router.get("/users", listUsersHandler);
router.get("/users/:id", getUserStatusHandler);
router.post("/users/:id/suspend", suspendUserHandler);

export default router;

