# NestJS Automated CI/CD Pipeline & Delivery Engine

> High-reliability automated CI/CD pipeline for NestJS microservices featuring automated E2E testing, Docker containerization, continuous deployment via GitHub Actions self-hosted runners, and real-time Telegram operational alerting.

[![CI/CD Pipeline](https://github.com/NURJAKS/CI-CD-pipeline-project/actions/workflows/main.yml/badge.svg)](https://github.com/NURJAKS/CI-CD-pipeline-project/actions/workflows/main.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Automated-2088FF?style=flat&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Telegram](https://img.shields.io/badge/Telegram-Notifications-2CA5E0?style=flat&logo=telegram&logoColor=white)](https://core.telegram.org/bots)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Pitch & Executive Summary

In modern cloud-native architectures, manual deployments and unmonitored code integrations introduce high operational risk: untested regressions slip into runtime environments, service restarts cause prolonged downtime, and engineers remain blind to pipeline failures until customers report outages.

**NestJS CI/CD Pipeline Engine** eliminates manual overhead through a fully automated, multi-stage delivery pipeline:
- **Strict Quality Gates**: Every code push automatically executes Jest and Supertest E2E integration suites inside an isolated Ubuntu runtime.
- **Continuous Containerized Delivery**: Verified builds trigger an automated CD workflow executing on target host infrastructure via a GitHub Actions Self-Hosted Runner.
- **Zero Configuration Drift**: The target application is rebuilt into a hardened, lightweight Docker container (`node:20-alpine`) with clean container lifecycle recycling.
- **Instant Telemetry**: Build outcomes, commit metadata, and failure traces are dispatched in real time to engineering channels via an automated Telegram Bot.

---

## Architecture & Pipeline Flow

The workflow enforces a strict three-tier lifecycle (`Test` $\rightarrow$ `Deploy` $\rightarrow$ `Notify`):

```mermaid
flowchart TD
    subgraph VCS ["1. VCS & Trigger"]
        Developer["👨‍💻 Developer Push"] -->|git push origin main| Repo["🐙 GitHub Repository"]
        Repo -->|Trigger webhook| Workflow["⚙️ GitHub Actions Workflow (.github/workflows/main.yml)"]
    end

    subgraph CI ["2. Automated Quality Gate (CI)"]
        Workflow --> JobTest["🧪 Job: Build & Test\n(runs-on: ubuntu-latest)"]
        JobTest --> StepSetup["Checkout Code & Setup Node.js 20"]
        StepSetup --> StepDeps["Install Dependencies (npm install)"]
        StepDeps --> StepE2E["Execute E2E Integration Suite (npm run test:e2e)"]
    end

    subgraph CD ["3. Continuous Deployment (CD)"]
        StepE2E -->|Success: Passed Quality Gate| JobDeploy["🚀 Job: Deploy to Host\n(runs-on: self-hosted)"]
        JobDeploy --> StepCheckoutHost["Checkout Source on Target Host"]
        StepCheckoutHost --> StepBuildDocker["Build Image: cicd-nest-api (node:20-alpine)"]
        StepBuildDocker --> StepCycleContainer["Stop & Remove Old Container (nest_container)"]
        StepCycleContainer --> StepRunContainer["Run New Container (-p 3000:3000)"]
    end

    subgraph Telemetry ["4. Operational Telemetry & Alerting"]
        JobTest -.->|Always Run (needs: [test, deploy])| JobNotify["📢 Job: Telegram Notify\n(runs-on: ubuntu-latest)"]
        JobDeploy -.->|Always Run| JobNotify
        JobNotify --> EvaluateOutcome{"Pipeline Status?"}
        EvaluateOutcome -->|All Succeeded| MsgSuccess["✅ Success Alert:\nCommit message & Actor"]
        EvaluateOutcome -->|Any Stage Failed| MsgFailure["❌ Failure Alert:\nFailed stage diagnosis & Commit"]
        MsgSuccess --> TelegramBot["📱 Telegram Channel / Bot Notification"]
        MsgFailure --> TelegramBot
    end
```

---

## Pipeline Stages Breakdown

| Stage | Name | Runner Environment | Key Actions & Responsibilities |
| :--- | :--- | :--- | :--- |
| **01. CI** | `🧪 Build & Test` | `ubuntu-latest` (Cloud) | Checkouts branch, initializes Node.js 20, resolves dependency tree, executes automated Supertest E2E tests validating HTTP status contracts. |
| **02. CD** | `🚀 Deploy to Local Laptop` | `self-hosted` (Bare Metal / Host) | Triggers only upon CI success. Builds multi-stage production Docker image, executes zero-drift container recycling, binds to host port `3000`. |
| **03. Notify** | `📢 Telegram Notify` | `ubuntu-latest` (Cloud) | Executes unconditionally (`if: always()`). Dispatches structured Telegram alerts with execution status, commit title, and author info via `appleboy/telegram-action`. |

---

## Tech Stack & Ecosystem

- **Backend Framework**: [NestJS 10](https://nestjs.com/) (TypeScript)
- **Runtime**: [Node.js 20 LTS](https://nodejs.org/)
- **Testing Engine**: [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest)
- **Containerization**: [Docker](https://www.docker.com/) (Multi-stage `node:20-alpine`) & [Docker Compose](https://docs.docker.com/compose/)
- **Automation / Orchestrator**: [GitHub Actions](https://github.com/features/actions) with Self-Hosted Runner integration
- **Operational Alerting**: [Telegram Bot API](https://core.telegram.org/bots) (`appleboy/telegram-action`)

---

## Directory Structure

```
CI-CD-pipeline-project/
├── .github/
│   └── workflows/
│       └── main.yml           # Complete 3-stage CI/CD pipeline definition
├── src/
│   ├── app.controller.ts      # Healthcheck & API status endpoint
│   ├── app.controller.spec.ts # Controller unit test suite
│   ├── app.module.ts          # Core application module definition
│   ├── app.service.ts         # Business logic layer
│   └── main.ts                # Application bootstrap entry point
├── test/
│   ├── app.e2e-spec.ts        # End-to-end integration test suite
│   └── jest-e2e.json          # E2E test runner configuration
├── docker-compose.yml         # Local infrastructure (PostgreSQL service)
├── Dockerfile                 # Optimized multi-stage Docker build
├── .dockerignore              # Build context exclusion rules
├── nest-cli.json              # NestJS CLI schema configuration
├── package.json               # Scripts and production/dev dependencies
├── tsconfig.json              # TypeScript compiler configuration
└── README.md                  # Architecture & deployment documentation
```

---

## Quickstart & Local Development

### 1. Prerequisites

- [Node.js](https://nodejs.org/) 20.x or later
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

### 2. Installation & Running Locally

```bash
# Clone the repository
git clone https://github.com/NURJAKS/CI-CD-pipeline-project.git
cd CI-CD-pipeline-project

# Install dependencies
npm install

# Start in development mode with hot reload
npm run start:dev
```

The service will be accessible at: `http://localhost:3000/` returning:
```json
{
  "status": "v1.0",
  "message": "CI/CD works!"
}
```

### 3. Running Test Suites

```bash
# Run unit tests
npm run test

# Run E2E integration test suite
npm run test:e2e

# Generate test coverage reports
npm run test:cov
```

---

## Docker Deployment

### Manual Docker Build & Run

```bash
# Build the container image
docker build -t cicd-nest-api .

# Run the containerized service
docker run -d -p 3000:3000 --name nest_container cicd-nest-api

# Inspect container logs
docker logs -f nest_container
```

### Local Database Environment (Docker Compose)

```bash
# Launch background PostgreSQL service
docker compose up -d

# Verify container status
docker compose ps
```

---

## CI/CD Pipeline Configuration

### 1. Setting Up the Self-Hosted Runner

To enable continuous deployment to your target host/server:
1. Navigate to **GitHub Repository** $\rightarrow$ **Settings** $\rightarrow$ **Actions** $\rightarrow$ **Runners**.
2. Click **New self-hosted runner** and select the host operating system (`Linux x64`).
3. Download, configure, and register the runner agent with the generated token:
   ```bash
   # Create runner folder and unpack
   mkdir actions-runner && cd actions-runner
   curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/download/...
   tar xzf actions-runner-linux-x64.tar.gz

   # Configure and connect
   ./config.sh --url https://github.com/NURJAKS/CI-CD-pipeline-project --token <REGISTRATION_TOKEN>
   ./run.sh
   ```

### 2. Configuring Telegram Alerts

Add the following encrypted secrets under **GitHub Repository** $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**:

| Secret Name | Description | Source / How to Obtain |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | API token for your Telegram alerting bot | Generated via [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Numeric Chat ID of developer or channel | Obtained via [@userinfobot](https://t.me/userinfobot) or API |

---

## Telegram Notification Format

### ✅ Success Notification Example
```text
✅ Ура! Новая версия успешно развернута!
📝 Коммит: feat: optimize dockerfile and update endpoint contracts
👨‍💻 Автор: NURJAKS
```

### ❌ Failure Notification Example
```text
❌ Внимание! Пайплайн упал с ошибкой.
Тесты: failure
Деплой: skipped
📝 Коммит: fix: update test expectations
```

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
