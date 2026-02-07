import { PrismaClient } from "../../../generated/prisma/client.ts";
import { logInfo, logError } from "../utils/logger.js";
import Config from "../config/config.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis;

const pool = new pg.Pool({
  connectionString: Config.database.DATABASE_URL,
  connectionTimeoutMillis: Config.database.connectionTimeout,
  idleTimeoutMillis: Config.database.idleTimeout,
  max: Config.database.maxPool,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      Config.server.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    adapter,
  });

if (Config.server.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

prisma
  .$connect()
  .then(() => {
    logInfo("Database connected successfully", {
      host: Config.database.host,
      port: Config.database.port,
    });
  })
  .catch((error) => {
    logError("Database connection failed", {
      error: error.message,
      host: Config.database.host,
      port: Config.database.port,
    });
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async () => {
  logInfo("Shutting down database connections...");
  try {
    await prisma.$disconnect();
    await pool.end();
    logInfo("Database connections closed.");
    process.exit(0);
  } catch (error) {
    logError("Error closing database connections", { error: error.message });
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("beforeExit", shutdown);

export { pool };
