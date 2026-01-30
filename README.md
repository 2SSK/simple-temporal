# Express + Temporal Workflow Starter

A production-ready Express.js API server with Temporal workflow integration, featuring automatic workflow/activity discovery, Docker Compose orchestration, PM2 process management, and comprehensive monitoring with Prometheus and Grafana.

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Development Workflow](#development-workflow)
- [Docker Services](#docker-services)
- [Monitoring](#monitoring)
- [PM2 Process Management](#pm2-process-management)
- [Environment Variables](#environment-variables)
- [Commands Reference](#commands-reference)

---

## Project Overview

This starter provides a complete foundation for building reliable, long-running workflows with Temporal.io while serving HTTP APIs with Express.js. It includes two professional-grade workflows out of the box:

### Core Features

- **Express.js API Server** - Modern HTTP API with auto-loading routes and controllers
- **Temporal Workflows** - Reliable, durable execution with automatic discovery
- **Order Processing Workflow** - Complete e-commerce order pipeline (validation → inventory → payment → fulfillment → confirmation)
- **User Registration Workflow** - Secure user onboarding flow (validation → user creation → welcome email → API key generation)
- **Docker Compose Stack** - One-command orchestration of all services
- **PM2 Process Management** - Production-grade process supervision with ecosystem configuration
- **Prometheus Metrics** - Built-in metrics endpoint at port 9464
- **Grafana Dashboards** - Pre-configured visualization for Temporal metrics

### Tech Stack

| Component        | Technology                        |
| ---------------- | --------------------------------- |
| API Server       | Express.js 5.x                    |
| Workflow Engine  | Temporal SDK 1.8.x                |
| Runtime          | Node.js                           |
| Process Manager  | PM2                               |
| Containerization | Docker / Docker Compose           |
| Metrics          | Prometheus                        |
| Visualization    | Grafana                           |
| Database         | PostgreSQL (Temporal persistence) |

---

## Quick Start

Get up and running in 5 minutes:

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PM2 (optional, for production)

### 1. Clone and Install

```bash
git clone <repository-url>
cd simple-temporal
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (defaults work for local dev)
```

### 3. Start Docker Services

```bash
cd docker
docker-compose up -d
```

This starts:

- Temporal Server (port 7233)
- Temporal UI (port 8080)
- Prometheus (port 9090)
- Grafana (port 3000)

### 4. Start the Application

**Development Mode:**

```bash
npm run dev
```

**Production Mode with PM2:**

```bash
pm2 start ecosystem.config.cjs
```

### 5. Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# View Temporal UI
# Open http://localhost:8080 in your browser
```

---

## Architecture

### Project Structure

```
simple-temporal/
├── docker/
│   ├── docker-compose.yml      # Service orchestration
│   ├── prometheus/
│   │   └── prometheus.yml      # Prometheus configuration
│   └── grafana/
│       └── provisioning/       # Dashboard & datasource configs
├── express/
│   ├── app.js                  # Express application factory
│   ├── controllers/            # Route handlers (auto-loaded)
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   └── index.js
│   └── routes/                 # Route definitions (auto-loaded)
│       ├── order.js
│       ├── user.js
│       └── index.js
├── temporal/
│   ├── client.js               # Temporal client singleton
│   ├── worker.js               # Worker entry point
│   ├── runtime.js              # Metrics initialization
│   └── src/
│       ├── index.js            # Module exports
│       ├── activities/         # Auto-loaded activities
│       │   ├── order/
│       │   │   └── activities.js
│       │   └── user/
│       │       └── activities.js
│       ├── workflows/          # Auto-loaded workflows
│       │   ├── order/
│       │   │   └── workflow.js
│       │   └── user/
│       │       └── workflow.js
│       └── utils/
│           └── autoLoader.js   # Module discovery utility
├── .env.example                # Environment template
├── ecosystem.config.cjs        # PM2 configuration
├── package.json
└── server.js                   # Application entry point
```

### Key Files

| File                   | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `server.js`            | Application entry point, graceful shutdown handling |
| `temporal/client.js`   | Singleton Temporal client with connection pooling   |
| `temporal/worker.js`   | Worker process with auto-discovery                  |
| `temporal/runtime.js`  | Prometheus metrics initialization                   |
| `express/app.js`       | Express app factory with middleware                 |
| `ecosystem.config.cjs` | PM2 process configuration                           |

### Auto-Loading Architecture

The project uses a modular, auto-loading architecture:

1. **Controllers** - Auto-discovered from `express/controllers/`
2. **Routes** - Auto-discovered from `express/routes/`
3. **Workflows** - Auto-discovered from `temporal/src/workflows/`
4. **Activities** - Auto-discovered from `temporal/src/activities/`

Adding a new workflow or activity is as simple as creating the file - no manual registration required.

---

## API Endpoints

### Health & Info

| Method | Endpoint  | Description                                             |
| ------ | --------- | ------------------------------------------------------- |
| GET    | `/health` | Health check with uptime and Temporal connection status |
| GET    | `/api`    | API information and available endpoints                 |

### Order Management

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| POST   | `/api/orders`            | Create a new order           |
| GET    | `/api/orders/:id`        | Get order status and details |
| GET    | `/api/orders`            | List all orders              |
| POST   | `/api/orders/:id/cancel` | Cancel an order              |

#### Create Order Request

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_123",
    "items": [
      {
        "productId": "prod_001",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "paymentMethod": {
      "type": "credit_card",
      "last4": "4242"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ord_1735689000_abc123",
    "status": "completed",
    "total": 64.78,
    "transactionId": "txn_1735689000_xyz789",
    "shipments": [
      {
        "trackingNumber": "TRK17356890000",
        "productId": "prod_001",
        "quantity": 2,
        "carrier": "FedEx",
        "estimatedDelivery": "2026-02-04T00:00:00.000Z"
      }
    ]
  }
}
```

### User Management

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| POST   | `/api/users/register`    | Register a new user         |
| GET    | `/api/users/:id`         | Get user workflow status    |
| GET    | `/api/users`             | List all user registrations |
| POST   | `/api/users/:id/suspend` | Suspend a user              |

#### Register User Request

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe",
    "preferences": {
      "language": "en",
      "theme": "dark"
    }
  }'
```

#### Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "usr_1735689000_def456",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "registered",
    "apiKey": "sk_1735689000_...",
    "preferences": {
      "notifications": { "email": true, "push": false, "sms": false },
      "language": "en",
      "theme": "dark"
    }
  },
  "warning": "Store the API key securely. It will not be shown again."
}
```

---

## Development Workflow

### Adding a New Workflow

#### 1. Create Activities

Create `temporal/src/activities/payment/activities.js`:

```javascript
/**
 * Payment processing activities
 */
const paymentActivities = {
  async authorizePayment({ orderId, amount, currency }) {
    // Implement payment authorization
    return { authorized: true, authCode: "AUTH123" };
  },

  async capturePayment({ orderId, authCode }) {
    // Implement payment capture
    return { captured: true, transactionId: "TXN456" };
  },

  async refundPayment({ orderId, amount }) {
    // Implement refund
    return { refunded: true, refundId: "REF789" };
  },
};

module.exports = paymentActivities;
```

#### 2. Create Workflow

Create `temporal/src/workflows/payment/workflow.js`:

```javascript
const { proxyActivities } = require("@temporalio/workflow");
const activities = require("../../activities").paymentActivities;

const WORKFLOW_CONFIG = {
  startToCloseTimeout: "2 minutes",
};

const proxiedActivities = proxyActivities(
  {
    startToCloseTimeout: WORKFLOW_CONFIG.startToCloseTimeout,
  },
  activities,
);

async function PaymentWorkflow({ orderId, amount, action }) {
  console.log(`[PaymentWorkflow] Processing ${action} for order: ${orderId}`);

  try {
    if (action === "authorize") {
      const result = await proxiedActivities.authorizePayment({
        orderId,
        amount,
        currency: "USD",
      });
      return { ...result, orderId, action, status: "completed" };
    }
    // Handle other actions...
  } catch (error) {
    return { orderId, action, status: "failed", error: error.message };
  }
}

module.exports = { PaymentWorkflow };
```

#### 3. Add API Endpoints

Create `express/controllers/paymentController.js`:

```javascript
const paymentController = {
  async processPayment(req, res, temporalClient, taskQueue) {
    const { orderId, amount, action } = req.body;

    const workflowClient = await temporalClient.getWorkflowClient(
      "PaymentWorkflow",
      taskQueue,
    );

    const result = await workflowClient.execute({ orderId, amount, action });
    res.json({ success: true, data: result });
  },
};

module.exports = paymentController;
```

Create `express/routes/payment.js`:

```javascript
const paymentController = require("../controllers/paymentController");

function paymentRoutes(app, temporalClient) {
  const basePath = "/api/payments";
  const taskQueue = process.env.PAYMENT_QUEUE || "payment_queue";

  app.post(basePath, async (req, res) => {
    await paymentController.processPayment(req, res, temporalClient, taskQueue);
  });

  console.log(`[Routes] Payment routes registered: ${basePath}`);
}

module.exports = paymentRoutes;
```

The new workflow and routes are automatically discovered and registered!

### Workflow Signals

Both example workflows support interactive signals:

```javascript
// Cancel an order
const handle = await temporalClient.getWorkflowHandle("ord_123");
await handle.signal("cancelOrder", "Customer requested cancellation");

// Update order status
await handle.signal("updateStatus", "processing");
```

### Activity Retries

Activities automatically retry on failure. Configure retry policies:

```javascript
const proxiedActivities = proxyActivities(
  {
    startToCloseTimeout: "1 minute",
    retry: {
      initialInterval: "1 second",
      backoffCoefficient: 2,
      maximumAttempts: 3,
      nonRetryableErrorTypes: ["ValidationError"],
    },
  },
  activities,
);
```

---

## Docker Services

### Service Overview

| Service     | Image                        | Port | Purpose                                     |
| ----------- | ---------------------------- | ---- | ------------------------------------------- |
| temporal    | temporalio/auto-setup:1.24.0 | 7233 | Temporal server with PostgreSQL persistence |
| temporal-ui | temporalio/ui:2.30.0         | 8080 | Temporal web UI                             |
| prometheus  | prom/prometheus:v2.51.0      | 9090 | Metrics collection and storage              |
| grafana     | grafana/grafana:10.2.0       | 3000 | Metrics visualization                       |

### Starting Services

```bash
cd docker
docker-compose up -d
```

### Service Management

```bash
# View logs
docker-compose logs -f temporal

# Check status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Temporal Configuration

The Temporal server is configured with:

- **Namespace**: `default`
- **Persistence**: PostgreSQL (DB_TYPE: postgres12)
- **Web UI**: Enabled at `/api/v1/namespaces/default/web`
- **Health Check**: TCP port 7233

### Network Architecture

All services connect via the `temporal-network` bridge network:

```
┌─────────────────────────────────────────────────────┐
│                   temporal-network                  │
│                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ temporal  │──│   prom-   │──│  grafana  │       │
│  │  server   │  │  etheus   │  │           │       │
│  └─────┬─────┘  └───────────┘  └───────────┘       │
│        │                                             │
│  ┌─────┴─────┐                                       │
│  │ temporal-ui                                   │       │
│  └───────────┘                                       │
└─────────────────────────────────────────────────────┘
         │
    (host ports)
```

---

## Monitoring

### Prometheus Metrics

Metrics are exposed at `http://localhost:9464/metrics` by the worker process.

#### Key Metrics

| Metric                        | Description              |
| ----------------------------- | ------------------------ |
| `temporal_worker_start`       | Worker startup counter   |
| `temporal_workflow_completed` | Completed workflow count |
| `temporal_workflow_failed`    | Failed workflow count    |
| `temporal_activity_completed` | Completed activity count |
| `temporal_activity_failed`    | Failed activity count    |
| `temporal_poller_counter`     | Poller activity metrics  |

#### Access Prometheus

1. Open http://localhost:9090
2. Query metrics directly:
   ```promql
   rate(temporal_workflow_completed[5m])
   ```

### Grafana Dashboards

Pre-configured dashboards are available at http://localhost:3000

**Default Credentials:**

- Username: `admin`
- Password: `admin`

#### Available Dashboards

- **Temporal Overview** - Workflow execution metrics
- **Activity Performance** - Activity duration and success rates
- **Worker Health** - Worker process metrics

#### Adding Dashboards

Dashboards are auto-provisioned from `docker/grafana/provisioning/dashboards/`. Add JSON dashboards to this directory.

---

## PM2 Process Management

### Configuration File

The `ecosystem.config.cjs` file defines all PM2 processes:

```javascript
module.exports = {
  apps: [
    {
      name: "temporal-worker",
      script: "temporal/worker.js",
      cwd: ".",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
        TEMPORAL_ADDRESS: "localhost:7233",
        // ... development settings
      },
      env_production: {
        NODE_ENV: "production",
        TEMPORAL_ADDRESS: "temporal:7233",
        // ... production settings
      },
    },
  ],
};
```

### Key Commands

| Command                                           | Description                    |
| ------------------------------------------------- | ------------------------------ |
| `pm2 start ecosystem.config.cjs`                  | Start all processes            |
| `pm2 start ecosystem.config.cjs --env production` | Start with production env      |
| `pm2 status`                                      | List all processes with status |
| `pm2 logs temporal-worker`                        | View real-time logs            |
| `pm2 restart temporal-worker`                     | Restart a specific process     |
| `pm2 stop temporal-worker`                        | Stop a process                 |
| `pm2 monit`                                       | Real-time monitoring dashboard |
| `pm2 save`                                        | Save current process list      |
| `pm2 startup`                                     | Generate startup script        |

### Process Management Workflow

```bash
# Start in development
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs temporal-worker

# Restart with production settings
pm2 restart ecosystem.config.cjs --env production

# Save process list for resurrection
pm2 save

# Generate startup script (run as root)
sudo pm2 startup
```

### Memory Management

The worker is configured to restart when memory exceeds 500MB:

```javascript
max_memory_restart: "500M";
```

### Log Management

Logs are stored in PM2's default directory (`~/.pm2/logs/`). Configure custom log paths:

```javascript
out_file: '/var/log/express-temporal/worker-out.log',
error_file: '/var/log/express-temporal/worker-err.log',
log_file: '/var/log/express-temporal/combined.log'
```

---

## Environment Variables

### Core Configuration

| Variable   | Default     | Description         |
| ---------- | ----------- | ------------------- |
| `PORT`     | 3000        | Express server port |
| `HOST`     | localhost   | Express server host |
| `NODE_ENV` | development | Environment mode    |

### Temporal Configuration

| Variable              | Default        | Description             |
| --------------------- | -------------- | ----------------------- |
| `TEMPORAL_ADDRESS`    | localhost:7233 | Temporal server address |
| `TEMPORAL_NAMESPACE`  | default        | Temporal namespace      |
| `DEFAULT_TASK_QUEUE`  | default_queue  | Default task queue      |
| `ORDER_QUEUE`         | order_queue    | Order workflow queue    |
| `USER_QUEUE`          | user_queue     | User workflow queue     |
| `WORKER_METRICS_PORT` | 9464           | Prometheus metrics port |

### Logging

| Variable    | Default | Description                              |
| ----------- | ------- | ---------------------------------------- |
| `LOG_LEVEL` | info    | Logging level (debug, info, warn, error) |

### Docker Compose Variables

| Variable                 | Default | Description             |
| ------------------------ | ------- | ----------------------- |
| `TEMPORAL_VERSION`       | 1.24.0  | Temporal server version |
| `TEMPORAL_UI_VERSION`    | 2.30.0  | Temporal UI version     |
| `PROMETHEUS_VERSION`     | v2.51.0 | Prometheus version      |
| `GRAFANA_VERSION`        | 10.2.0  | Grafana version         |
| `TEMPORAL_PORT`          | 7233    | Temporal server port    |
| `TEMPORAL_UI_PORT`       | 8080    | Temporal UI port        |
| `PROMETHEUS_PORT`        | 9090    | Prometheus port         |
| `GRAFANA_PORT`           | 3000    | Grafana port            |
| `GRAFANA_ADMIN_USER`     | admin   | Grafana admin username  |
| `GRAFANA_ADMIN_PASSWORD` | admin   | Grafana admin password  |

### Example .env File

```bash
# Temporal Configuration
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
DEFAULT_TASK_QUEUE=default_queue
ORDER_QUEUE=order_queue
USER_QUEUE=user_queue

# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Docker Services
TEMPORAL_UI_PORT=8080
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
```

---

## Commands Reference

### NPM Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm start`      | Start the Express server           |
| `npm run dev`    | Start with nodemon for development |
| `npm run worker` | Start only the Temporal worker     |
| `npm test`       | Run Jest tests                     |

### Docker Commands

```bash
# Start all services
cd docker && docker-compose up -d

# Start with custom env file
cd docker && docker-compose --env-file .env up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f temporal
docker-compose logs -f prometheus

# Check service health
docker-compose ps

# Restart a service
docker-compose restart temporal

# Stop all services
docker-compose down

# Stop and remove volumes (data loss)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

### PM2 Commands

```bash
# Start application
pm2 start ecosystem.config.cjs

# Start with specific environment
pm2 start ecosystem.config.cjs --env production

# List processes
pm2 status

# View logs
pm2 logs
pm2 logs --lines 100
pm2 logs temporal-worker --lines 50

# Restart processes
pm2 restart temporal-worker
pm2 restart all

# Stop processes
pm2 stop temporal-worker
pm2 stop all

# Delete process
pm2 delete temporal-worker

# Monitoring dashboard
pm2 monit

# Save process list
pm2 save

# Show startup configuration
pm2 startup

# Generate startup script (run as root)
sudo pm2 startup

# Save and setup startup
pm2 save && sudo pm2 startup

# Show environment variables
pm2 env temporal-worker

# Update PM2
npm install pm2@latest -g && pm2 update
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Temporal server health
curl http://localhost:7233

# Prometheus health
curl http://localhost:9090/-/healthy

# Grafana health
curl http://localhost:3000/api/health
```

### Workflow Management

```bash
# List running workflows
curl "http://localhost:3000/api/orders"
curl "http://localhost:3000/api/users"

# Get workflow status
curl http://localhost:3000/api/orders/ord_123

# Cancel order
curl -X POST http://localhost:3000/api/orders/ord_123/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "Customer requested"}'
```

---

## Troubleshooting

### Common Issues

**Temporal Connection Failed**

```bash
# Check if Temporal is running
docker-compose ps

# Check Temporal logs
docker-compose logs temporal

# Verify port
curl http://localhost:7233
```

**Worker Not Processing Workflows**

```bash
# Check worker logs
pm2 logs temporal-worker

# Verify worker is running
pm2 status

# Check Temporal namespace
# Open http://localhost:8080/namespaces/default/workflows
```

**Port Already in Use**

```bash
# Find process using port
lsof -i :3000

# Kill process
kill <PID>
```

**PM2 Processes Not Restarting on Boot**

```bash
# Generate startup script
sudo pm2 startup

# Save process list
pm2 save

# Verify systemd service
systemctl status pm2-pi
```

### Logs Location

| Component       | Log Location                      |
| --------------- | --------------------------------- |
| Application     | `~/.pm2/logs/`                    |
| Docker Services | `docker-compose logs`             |
| Prometheus      | `~/.pm2/logs/` (metrics endpoint) |
| Temporal        | `docker-compose logs temporal`    |

### Performance Tuning

For high-throughput scenarios, adjust worker configuration:

```javascript
// In ecosystem.config.cjs
{
  name: 'temporal-worker',
  script: 'temporal/worker.js',
  instances: 4,           // Match CPU cores
  max_memory_restart: '1G',
  env: {
    TEMPORAL_ADDRESS: 'temporal:7233',
    // Increase concurrent polls
    TEMPORAL_WORKER_POLLERS: '10'
  }
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-workflow`)
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -am 'Add new workflow'`)
6. Push to branch (`git push origin feature/new-workflow`)
7. Create a Pull Request

---

## License

MIT License - See LICENSE file for details.

---

## Support

- **Temporal Documentation**: https://docs.temporal.io/
- **Express.js Documentation**: https://expressjs.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Grafana Dashboards**: https://grafana.com/docs/grafana/latest/dashboards/
