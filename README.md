# Simple Temporal

A production-ready Node.js microservice template demonstrating integration between Express.js and Temporal.io for building reliable, scalable distributed applications with workflow orchestration capabilities.

## Preview

![Preview](preview.gif)

## Quick Start

Get up and running in just two steps:

### 1. Start Infrastructure (Docker Compose)

```bash
cd infra/
docker compose up -d
```

This starts all infrastructure services:

- **Temporal Server** (port 7233) - Workflow orchestration engine
- **Temporal Web UI** (port 8080) - Workflow visualization at http://localhost:8080
- **PostgreSQL** (port 5433) - Database for Temporal
- **Prometheus** (port 9091) - Metrics collection at http://localhost:9091
- **Grafana** (port 3003) - Dashboards and monitoring at http://localhost:3003
- **OpenTelemetry Collector** (ports 4317, 4318, etc.) - Telemetry pipeline

### 2. Run the Application

**Option A: Using PM2 (Recommended)**

```bash
pm2 start ecosystem.config.cjs
```

**Option B: Manual (Two Terminals)**

```bash
# Terminal 1: Start Express API server
npm run dev

# Terminal 2: Start Temporal worker
npm run worker
```

That's it! The API is now available at http://localhost:3000

## Overview

This project showcases a practical implementation of Temporal workflow orchestration integrated with an Express.js REST API and PostgreSQL database. It demonstrates best practices for building resilient microservices with proper error handling, logging, validation, and database transaction management.

**Key Highlights:**

- **Temporal Workflows**: Durable, fault-tolerant workflow execution
- **Express.js API**: RESTful endpoints with modern middleware architecture
- **PostgreSQL + Prisma**: Type-safe database access with migrations
- **Winston Logging**: Structured logging with trace IDs
- **Request Tracing**: End-to-end request tracking across services
- **PM2 Process Management**: Production-ready deployment with auto-restart
- **Input Validation**: Zod schema validation for type safety
- **Modular Architecture**: Clean separation of concerns

## Features

- **Temporal Workflow Integration**
  - Separate worker process for executing workflows
  - Activity-based task execution with retry mechanisms
  - Workflow-activity communication patterns
  - Telemetry and monitoring support

- **Express REST API**
  - Health check endpoints
  - RESTful API structure with versioning (v1)
  - Custom response formatting middleware
  - Request/response logging with trace IDs
  - Centralized error handling

- **Database Layer**
  - Prisma ORM with PostgreSQL
  - Database connection pooling
  - Transaction support
  - Migration management
  - Custom schema output directory

- **Developer Experience**
  - Module scaffolding script
  - Hot reload with nodemon
  - Environment-based configuration
  - Comprehensive npm scripts
  - Winston-based structured logging

## Technologies & Stack

| Category               | Technologies                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| **Runtime**            | Node.js (ES Modules)                                                       |
| **Web Framework**      | Express.js 5.x                                                             |
| **Workflow Engine**    | Temporal.io (@temporalio/client, @temporalio/worker, @temporalio/workflow) |
| **Database**           | PostgreSQL with Prisma ORM 7.x                                             |
| **Validation**         | Zod 4.x                                                                    |
| **Logging**            | Winston 3.x                                                                |
| **Process Management** | PM2                                                                        |
| **Development**        | Nodemon                                                                    |
| **Utilities**          | dotenv, uuid, pg                                                           |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose** - For running infrastructure services
- **npm** package manager
- **PM2** (optional, but recommended) - Install globally: `npm install -g pm2`

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/2SSK/simple-temporal.git
cd simple-temporal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

The infrastructure services use an `.env` file in the `infra/` directory:

```bash
cd infra/
cp .env.example .env
```

Edit `infra/.env` with your desired settings (passwords, versions, etc.):

```env
# PostgreSQL
POSTGRES_PASSWORD=your_secure_password

# Grafana
GRAFANA_ADMIN_PASSWORD=your_admin_password

# Optional: Service versions
POSTGRES_VERSION=17.2-alpine3.21
TEMPORAL_VERSION=1.25.2
GRAFANA_VERSION=11.3.1
```

The application also needs environment variables in the root `.env` file:

```bash
cd ..  # Back to root directory
cp .env.example .env
```

Edit `.env` with your application settings:

```env
# ENVIRONMENT
NODE_ENV="development"
PORT="3000"

# DATABASE (matches infra PostgreSQL)
DB_HOST="localhost"
DB_PORT="5433"
DB_USER="temporal"
DB_PASSWORD="your_secure_password"
DB_NAME="temporal"
DB_SCHEMA="public"
DB_CONNECTION_TIMEOUT=5000
DB_IDLE_TIMEOUT=10000
DB_MAX_POOL=10
DB_SSL=false

# TEMPORAL (matches infra Temporal Server)
TEMPORAL_HOST="localhost"
TEMPORAL_PORT="7233"
TEMPORAL_NAMESPACE="default"
TEMPORAL_TASK_QUEUE="greet-queue"
TEMPORAL_ACTIVITY_TIMEOUT=10
TEMPORAL_WORKFLOW_TIMEOUT=30
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

## Usage

### Step 1: Start Infrastructure Services

Navigate to the `infra/` directory and start all infrastructure services using Docker Compose:

```bash
cd infra/
docker compose up
```

Or run in detached mode (background):

```bash
docker compose up -d
```

To stop the infrastructure:

```bash
docker compose down
```

**What's Running:**

| Service                     | Port       | URL                   | Description                                 |
| --------------------------- | ---------- | --------------------- | ------------------------------------------- |
| **Temporal Server**         | 7233       | gRPC endpoint         | Workflow orchestration engine               |
| **Temporal Web UI**         | 8080       | http://localhost:8080 | Workflow visualization and debugging        |
| **PostgreSQL**              | 5433       | localhost:5433        | Database for Temporal                       |
| **Prometheus**              | 9091       | http://localhost:9091 | Metrics collection and storage              |
| **Grafana**                 | 3003       | http://localhost:3003 | Monitoring dashboards (admin/your_password) |
| **OpenTelemetry Collector** | 4317, 4318 | -                     | Telemetry data pipeline                     |

### Step 2: Run the Application

Choose one of the following methods to run the application:

#### Option A: Using PM2 (Recommended for Development)

PM2 manages both the Express API server and Temporal worker as separate processes with automatic restart and logging.

**Start both services:**

```bash
# From the project root directory
pm2 start ecosystem.config.cjs
```

**Useful PM2 commands:**

```bash
# View logs from both services
pm2 logs

# View status of all processes
pm2 status

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Delete all processes from PM2
pm2 delete all
```

Or use the npm scripts:

```bash
npm start      # Start with PM2
npm run logs   # View logs
npm restart    # Restart all
npm stop       # Stop all
```

**Logs are stored in:**

- `logs/api.out.log` - API server output
- `logs/api.error.log` - API server errors
- `logs/worker.out.log` - Temporal worker output
- `logs/worker.error.log` - Temporal worker errors

#### Option B: Manual (Two Terminals)

Run the API server and worker in separate terminal windows for more granular control during development.

**Terminal 1 - Express API Server:**

```bash
npm run dev
```

This starts the Express server with nodemon (hot reload enabled).

**Terminal 2 - Temporal Worker:**

```bash
npm run worker
```

This starts the Temporal worker that executes workflows and activities.

### Making API Requests

**Create a greeting (triggers Temporal workflow):**

```bash
curl -X POST http://localhost:3000/api/v1/greet \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Greeted John Doe successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "message": "Hello, John Doe! Welcome to our service.",
    "createdAt": "2026-02-07T17:30:00.000Z"
  },
  "timestamp": "2026-02-07T17:30:00.123Z"
}
```

**Get all greetings:**

```bash
curl http://localhost:3000/api/v1/greet
```

**Health check:**

```bash
curl http://localhost:3000/health
```

## Project Structure

```
simple-temporal/
├── infra/                                # Infrastructure services (Docker)
│   ├── docker-compose.yml                # All infrastructure services
│   ├── .env                              # Infrastructure configuration
│   ├── config/
│   │   └── dynamicconfig/                # Temporal dynamic config
│   ├── monitoring/
│   │   ├── prometheus/                   # Prometheus configuration
│   │   │   ├── prometheus.yml
│   │   │   └── alerts/
│   │   ├── grafana/                      # Grafana dashboards & config
│   │   │   ├── provisioning/
│   │   │   └── dashboards/
│   │   └── otel-collector/               # OpenTelemetry config
│   │       └── config.yaml
│   └── scripts/
│       └── init-db.sh                    # Database initialization
├── src/
│   ├── index.js                          # Express app initialization
│   └── internals/
│       ├── config/                       # Configuration management
│       │   ├── config.js                 # Centralized config
│       │   └── env.js                    # Environment variable loading
│       ├── db/                           # Database layer
│       │   ├── db.js                     # Database connection
│       │   ├── prisma.js                 # Prisma client
│       │   └── transaction.js            # Transaction utilities
│       ├── errors/                       # Custom error classes
│       │   ├── AppError.js
│       │   ├── NotFoundError.js
│       │   └── ValidationError.js
│       ├── middlewares/                  # Express middlewares
│       │   ├── asyncHandler.middleware.js
│       │   ├── errorHandler.middleware.js
│       │   ├── notFound.middleware.js
│       │   ├── requestLogger.middleware.js
│       │   ├── response.middleware.js
│       │   ├── traceId.middleware.js
│       │   └── validate.middleware.js
│       ├── modules/                      # Feature modules
│       │   └── greet/                    # Example greet module
│       │       ├── greet.controller.js   # Request handlers
│       │       ├── greet.repository.js   # Database operations
│       │       ├── greet.route.js        # Route definitions
│       │       ├── greet.schema.js       # Validation schemas
│       │       └── greet.service.js      # Business logic
│       ├── router/                       # Route configuration
│       │   ├── health.router.js          # Health check routes
│       │   ├── router.js                 # Main router
│       │   └── v1.router.js              # API v1 routes
│       ├── temporal/                     # Temporal integration
│       │   ├── activities/               # Temporal activities
│       │   │   ├── greet.activity.js
│       │   │   └── index.js
│       │   ├── workflows/                # Temporal workflows
│       │   │   ├── greet.workflow.js
│       │   │   └── index.js
│       │   ├── utils/                    # Temporal utilities
│       │   │   ├── proxyActivity.js      # Activity proxy helper
│       │   │   └── telemetry.js          # Telemetry setup
│       │   ├── client.js                 # Temporal client
│       │   └── worker.js                 # Temporal worker
│       └── utils/                        # Shared utilities
│           └── logger.js                 # Winston logger
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── migrations/                       # Database migrations
├── scripts/
│   └── create-module.js                  # Module scaffolding script
├── static/                               # Static files
├── logs/                                 # Application logs
├── generated/                            # Generated files (Prisma client)
├── ecosystem.config.cjs                  # PM2 configuration
├── server.js                             # Server entry point
├── package.json                          # Project dependencies
└── .env.example                          # Environment variables template
```

## Available Scripts

| Script                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `npm run dev`             | Start Express server with hot reload (nodemon) |
| `npm run worker`          | Start Temporal worker process                  |
| `npm start`               | Start both API and worker with PM2             |
| `npm stop`                | Stop all PM2 processes                         |
| `npm restart`             | Restart all PM2 processes                      |
| `npm run logs`            | View PM2 logs in real-time                     |
| `npm run create:module`   | Generate a new feature module scaffold         |
| **Database Scripts**      |                                                |
| `npm run db:generate`     | Generate Prisma client                         |
| `npm run db:migrate`      | Run database migrations (dev)                  |
| `npm run db:migrate:name` | Create a new named migration                   |
| `npm run db:migrate:prod` | Deploy migrations (production)                 |
| `npm run db:push`         | Push schema changes without migration          |
| `npm run db:pull`         | Pull schema from database                      |
| `npm run db:reset`        | Reset database (⚠️ deletes all data)           |
| `npm run db:studio`       | Open Prisma Studio                             |
| `npm run db:validate`     | Validate Prisma schema                         |
| `npm run db:format`       | Format Prisma schema                           |
| `npm run db:status`       | Check migration status                         |
| `npm run db:deploy`       | Generate client + deploy migrations            |
| `npm run db:check`        | Validate schema + check migration status       |

## Architecture

### Request Flow

```
Client Request
    ↓
Express API (server.js)
    ↓
Middleware Chain (traceId → logger → response)
    ↓
Router → Controller
    ↓
Service Layer
    ↓
Temporal Client (starts workflow)
    ↓
Temporal Server
    ↓
Temporal Worker (executes workflow)
    ↓
Activity (greet.activity.js)
    ↓
Repository Layer (Prisma)
    ↓
PostgreSQL Database
    ↓
Response back through chain
```

### Key Design Patterns

1. **Modular Architecture**: Each feature is a self-contained module with controller, service, repository, routes, and schemas.

2. **Separation of Concerns**:
   - Controllers handle HTTP requests/responses
   - Services contain business logic
   - Repositories manage data access
   - Workflows orchestrate long-running processes
   - Activities perform individual tasks

3. **Error Handling**: Centralized error handling with custom error classes and async handler wrapper.

4. **Request Tracing**: Every request gets a unique trace ID that flows through the entire stack for debugging.

5. **Dependency Injection**: Configuration and dependencies are injected rather than hardcoded.

## 🏗️ Infrastructure Architecture

The `infra/` directory contains a complete Docker Compose stack with production-grade configurations:

### Services Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Infrastructure Stack                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐      ┌──────────────┐      ┌───────────────┐   │
│  │  Temporal   │◄────►│  PostgreSQL  │      │  Temporal UI  │   │
│  │   Server    │      │   Database   │      │  (Web View)   │   │
│  │  (port 7233)│      │  (port 5433) │      │  (port 8080)  │   │
│  └──────┬──────┘      └──────────────┘      └───────────────┘   │
│         │                                                       │
│         │ metrics                                               │
│         ▼                                                       │
│  ┌─────────────┐      ┌──────────────┐      ┌───────────────┐   │
│  │ Prometheus  │      │     OTEL     │      │    Grafana    │   │
│  │  (Metrics)  │◄────►│  Collector   │◄────►│ (Dashboards)  │   │
│  │ (port 9091) │      │ (4317, 4318) │      │  (port 3003)  │   │
│  └─────────────┘      └──────────────┘      └───────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features

- **Health Checks**: All services have proper health check configurations
- **Resource Limits**: CPU and memory limits configured for all services
- **Persistent Storage**: Named volumes for PostgreSQL, Prometheus, and Grafana data
- **Security**: `no-new-privileges` security option enabled on all containers
- **Logging**: JSON file logging with rotation (max 10MB, 3 files)
- **Networking**: Isolated bridge network for service communication
- **Auto-restart**: Services restart automatically on failure

### Service Details

| Service                     | Purpose                       | Dependencies    | Key Ports                           |
| --------------------------- | ----------------------------- | --------------- | ----------------------------------- |
| **PostgreSQL**              | Temporal's persistence layer  | None            | 5433→5432                           |
| **Temporal Server**         | Workflow orchestration engine | PostgreSQL      | 7233, 7234, 7235, 7239, 9090        |
| **Temporal UI**             | Web interface for workflows   | Temporal Server | 8080                                |
| **Temporal Admin Tools**    | CLI tools for debugging       | Temporal Server | N/A (CLI only)                      |
| **Prometheus**              | Metrics collection & storage  | Temporal Server | 9091→9090                           |
| **OpenTelemetry Collector** | Telemetry data pipeline       | Prometheus      | 4317, 4318, 8888, 8889, 13133, 9464 |
| **Grafana**                 | Metrics visualization         | Prometheus      | 3003→3000                           |

### Starting Infrastructure

```bash
# Start all services
cd infra/
docker compose up

# Start in background (detached)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v
```

## 🔧 Configuration

Configuration is managed through environment variables in two locations:

### 1. Infrastructure Configuration (`infra/.env`)

Controls Docker Compose services (Temporal, PostgreSQL, Prometheus, Grafana, etc.):

```env
# PostgreSQL
POSTGRES_PASSWORD=your_secure_password
POSTGRES_VERSION=17.2-alpine3.21

# Grafana
GRAFANA_ADMIN_PASSWORD=your_admin_password
GRAFANA_VERSION=11.3.1

# Service versions (optional)
TEMPORAL_VERSION=1.25.2
PROMETHEUS_VERSION=v2.55.1
OTEL_COLLECTOR_VERSION=0.115.1
```

### 2. Application Configuration (`.env`)

Controls Node.js application behavior:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database (must match infra PostgreSQL)
DB_HOST=localhost
DB_PORT=5433
DB_USER=temporal
DB_PASSWORD=your_secure_password
DB_NAME=temporal

# Temporal (must match infra Temporal Server)
TEMPORAL_HOST=localhost
TEMPORAL_PORT=7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=greet-queue
```

See `.env.example` and `infra/.env.example` for all available configuration options.

### Adding New Configuration

1. Add the environment variable to `.env.example`
2. Load it in `src/internals/config/env.js`
3. Add it to the config object in `src/internals/config/config.js`

## 🧪 Creating New Modules

Use the built-in scaffolding script to generate a new feature module:

```bash
npm run create:module
```

This will prompt you for a module name and generate:

- Controller
- Service
- Repository
- Routes
- Schema (validation)

## 🔍 Monitoring & Debugging

### Application Logs

Logs are stored in the `logs/` directory:

- `api.out.log` - API server standard output
- `api.error.log` - API server errors
- `worker.out.log` - Temporal worker output
- `worker.error.log` - Temporal worker errors

View logs in real-time with PM2:

```bash
pm2 logs
```

### Infrastructure Monitoring

Access the monitoring tools provided by the infrastructure stack:

#### Temporal Web UI

Monitor workflows, activities, and execution history:

```
http://localhost:8080
```

- View all workflow executions
- Inspect workflow history and event logs
- Debug failed workflows
- Query workflow state

#### Grafana Dashboards

Visualize metrics and create custom dashboards:

```
http://localhost:3003
```

- **Username:** admin
- **Password:** (set in `infra/.env`)

Pre-configured dashboards for Temporal metrics are available in `infra/monitoring/grafana/dashboards/`.

#### Prometheus Metrics

Raw metrics and query interface:

```
http://localhost:9091
```

- Query Temporal server metrics
- View time-series data
- Create custom queries

### Prisma Studio

Interactive database GUI:

```bash
npm run db:studio
# Opens at http://localhost:5555
```

### Trace IDs

Every request gets a unique trace ID that can be used to track the request through logs:

```json
{
  "level": "info",
  "timestamp": "2026-02-07T17:30:00.123Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Request received",
  "method": "POST",
  "path": "/api/v1/greet"
}
```

## 🚨 Error Handling

The application uses a three-tier error handling approach:

1. **Custom Error Classes**: `AppError`, `ValidationError`, `NotFoundError`
2. **Async Handler**: Wraps async route handlers to catch errors
3. **Global Error Middleware**: Formats and sends error responses

Example:

```javascript
throw new ValidationError("Name is required");
// Results in: 400 Bad Request with proper error message
```

## 🔐 Security Best Practices

- Environment variables for sensitive data
- Database connection pooling and timeouts
- Graceful shutdown handling
- Input validation with Zod schemas
- SQL injection protection via Prisma
- Error messages don't leak sensitive information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**SSK**

## 🙏 Acknowledgments

- [Temporal.io](https://temporal.io/) - Durable workflow orchestration
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [PM2](https://pm2.keymetrics.io/) - Production process manager

## 📚 Additional Resources

- [Temporal Documentation](https://docs.temporal.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Winston Logger](https://github.com/winstonjs/winston)

---

**Happy Coding! 🚀**

If you find this project useful, please consider giving it a ⭐️
