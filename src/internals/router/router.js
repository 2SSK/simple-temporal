import Router from "express";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { initV1Routes } from "./v1.router.js";
import healthRouter from "./health.router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// Serve static files (OpenAPI documentation)
router.use("/static", express.static(path.join(__dirname, "../../../static")));

// Serve OpenAPI documentation on root
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../static/openapi.html"));
});

// healthcheck (no versioning)
router.use("/health", healthRouter);

// API versioning
const v1Routes = await initV1Routes();
router.use("/api/v1", v1Routes);

export default router;
