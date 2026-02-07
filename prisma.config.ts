import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/internals/config/env.js";
import { logInfo } from "./src/internals/utils/logger.js";

const buildDatabaseUrl = () => {
  const sslParam = env?.DB_SSL === "true" ? "?sslmode=require" : "";
  return `postgresql://${env?.DB_USER}:${env?.DB_PASSWORD}@${env?.DB_HOST}:${env?.DB_PORT}/${env?.DB_NAME}${sslParam}`;
};

const databaseUrl = buildDatabaseUrl();

logInfo("Prisma configuration loaded", {
  host: env?.DB_HOST,
  port: env?.DB_PORT,
  database: env?.DB_NAME,
  schema: env?.DB_SCHEMA,
  ssl: env?.DB_SSL,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
