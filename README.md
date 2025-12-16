# Ultimate DR Project - Multi-Cloud Rewards Card Aggregator

A microservices-based rewards card aggregation app with Disaster Recovery (DR) capabilities across AWS and GCP.

## Overview

This project demonstrates a multi-cloud Disaster Recovery (DR) solution where:
- **Primary Environment**: Full-featured services deployed on AWS
- **DR Stand-In Environment**: Lightweight, read-only services deployed on GCP
- **Data Sync**: Cross-cloud replication from AWS to GCP

## Architecture

### Primary Services (AWS)
- **Card Service**: Full CRUD operations for card management
- **Barcode Service**: Barcode/QR code generation
- **Balance Service**: Real-time balance updates from external APIs

**Deployment**: AWS EKS (Kubernetes), RDS PostgreSQL, Application Load Balancer, S3

### DR Services (GCP)
- **DR Card Service**: Read-only card access (no writes)
- **DR Barcode Service**: Barcode generation (same as primary, stateless)

**Deployment**: GCP GKE (Kubernetes), Cloud SQL PostgreSQL, Cloud Load Balancing, Cloud Storage

### Shared Services
- **Data Sync Service**: Cross-cloud data replication (AWS → GCP)
- **Frontend**: Web application that adapts to primary/DR mode

## Data Flow

1. User interacts with Frontend
2. Frontend calls Primary Load Balancer (AWS EKS)
3. Kubernetes routes to appropriate services
4. Services process requests
5. Data stored in RDS (AWS)
6. Sync service replicates to Cloud SQL (GCP)
7. On failover, Frontend switches to DR Load Balancer (GCP GKE)

## Failover Process

1. Health check detects primary failure
2. DNS/Route 53 switches to DR endpoint
3. Frontend shows "Limited Mode" banner
4. DR services serve read-only data
5. On recovery, sync service reconciles data

## Project Structure

```
ultimate-dr-project-aws-gcp/
│
├── README.md                          # This file
├── package.json                       # Root package.json (workspaces)
├── Makefile                           # Common commands
├── .gitignore                         # Git ignore rules
├── .prettierrc                        # Code formatting
├── .eslintrc.json                     # Linting rules
│
├── docker-compose.primary.yml          # Local primary environment
├── docker-compose.dr.yml               # Local DR environment
│
├── k8s/                                # Kubernetes manifests
│   ├── primary/                        # Primary cluster configs (AWS EKS)
│   │   ├── namespaces/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── ingress/
│   │   ├── configmaps/
│   │   └── secrets/
│   │
│   └── dr/                             # DR cluster configs (GCP GKE)
│       ├── namespaces/
│       ├── deployments/
│       ├── services/
│       ├── ingress/
│       ├── configmaps/
│       └── secrets/
│
├── packages/                           # Shared libraries
│   └── shared/
│       ├── package.json
│       ├── src/
│       │   ├── models/                # Database models
│       │   ├── types/                 # TypeScript types
│       │   ├── utils/                 # Utility functions
│       │   ├── constants/             # Constants
│       │   └── validation/            # Validation schemas
│       └── tests/
│
├── services/                           # Microservices
│   │
│   ├── primary/                       # Primary services (AWS)
│   │   ├── card-service/
│   │   │   ├── package.json
│   │   │   ├── Dockerfile
│   │   │   ├── k8s/                    # Kubernetes manifests
│   │   │   │   ├── deployment.yaml
│   │   │   │   ├── service.yaml
│   │   │   │   └── configmap.yaml
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── routes/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── middleware/
│   │   │   └── tests/
│   │   │
│   │   ├── barcode-service/
│   │   │   ├── package.json
│   │   │   ├── Dockerfile
│   │   │   ├── k8s/
│   │   │   │   ├── deployment.yaml
│   │   │   │   └── service.yaml
│   │   │   ├── src/
│   │   │   └── tests/
│   │   │
│   │   └── balance-service/
│   │       ├── package.json
│   │       ├── Dockerfile
│   │       ├── k8s/
│   │       │   ├── deployment.yaml
│   │       │   └── service.yaml
│   │       ├── src/
│   │       └── tests/
│   │
│   ├── dr/                            # DR services (GCP)
│   │   ├── card-service/
│   │   │   ├── package.json
│   │   │   ├── Dockerfile
│   │   │   ├── k8s/
│   │   │   │   ├── deployment.yaml
│   │   │   │   └── service.yaml
│   │   │   ├── src/
│   │   │   └── tests/
│   │   │
│   │   └── barcode-service/
│   │       ├── package.json
│   │       ├── Dockerfile
│   │       ├── k8s/
│   │       │   ├── deployment.yaml
│   │       │   └── service.yaml
│   │       ├── src/
│   │       └── tests/
│   │
│   └── sync/                          # Cross-cloud sync
│       └── data-sync-service/
│           ├── package.json
│           ├── Dockerfile
│           ├── k8s/
│           │   ├── deployment.yaml
│           │   ├── service.yaml
│           │   └── cronjob.yaml       # Scheduled sync job
│           ├── src/
│           └── tests/
│
├── frontend/                          # Web application
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── public/
│
└── infrastructure/                    # Infrastructure as Code
    ├── aws/                           # AWS resources
    │   ├── terraform/
    │   │   ├── eks/                   # EKS cluster
    │   │   ├── rds/                   # RDS database
    │   │   ├── networking/            # VPC, subnets, etc.
    │   │   ├── iam/                   # IAM roles
    │   │   └── s3/                    # S3 buckets
    │   └── eksctl/                    # EKS cluster config (alternative)
    │
    └── gcp/                           # GCP resources
        └── terraform/
            ├── gke/                   # GKE cluster
            ├── cloud-sql/             # Cloud SQL database
            ├── networking/            # VPC, subnets, etc.
            ├── iam/                   # IAM roles
            └── storage/               # Cloud Storage buckets
```

## Key Directories

### `packages/shared/`
Common code used across all services:
- Database models/schemas
- API contracts/interfaces
- Utilities
- Types/constants
- Validation logic

### `services/primary/`
Full-featured services for AWS deployment:
- **Card Service**: Create, Read, Update, Delete cards, card metadata management, image upload handling
- **Barcode Service**: Generate barcodes from card data, QR code generation, format validation
- **Balance Service**: Fetch balances from external APIs, balance caching, update scheduling

**Deployment**: AWS EKS (Kubernetes) - Deployments with auto-scaling

### `services/dr/`
Read-only, lightweight services for GCP deployment:
- **DR Card Service**: Read cards only (no writes), minimal dependencies, fast failover
- **DR Barcode Service**: Same functionality as primary, stateless operation, works with cached data

**Deployment**: GCP GKE (Kubernetes) - Deployments with minimal resources

### `services/sync/`
Cross-cloud data replication:
- **Data Sync Service**: Sync card data from AWS to GCP, scheduled replication, error handling and retry logic

**Deployment**: Kubernetes CronJob in EKS cluster (scheduled replication)

### `frontend/`
Web application for rewards card management:
- View all cards
- Display barcodes
- Add/edit cards (primary mode)
- Read-only mode (DR mode)
- Balance display

**Tech Stack**: React/Next.js or Vue.js

### `infrastructure/`
Infrastructure as Code (to be implemented after app development):
- **Kubernetes Clusters**: EKS (AWS) and GKE (GCP)
- **Terraform**: EKS cluster, RDS, networking, IAM (AWS)
- **Terraform**: GKE cluster, Cloud SQL, networking, IAM (GCP)
- **Kubernetes Manifests**: Deployments, Services, Ingress, ConfigMaps, Secrets
- **Networking**: VPC, subnets, security groups, load balancers

## Technology Stack

### Services
- **Language**: Node.js/TypeScript or Python
- **Framework**: Express.js (Node) or FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: Prisma, TypeORM, or SQLAlchemy

### Frontend
- **Framework**: React/Next.js or Vue.js
- **State Management**: Redux, Zustand, or Pinia
- **Styling**: Tailwind CSS or Material-UI

### Infrastructure
- **Orchestration**: Kubernetes (EKS on AWS, GKE on GCP)
- **IaC**: Terraform (both clouds)
- **Container**: Docker
- **Service Mesh**: Optional (Istio/Linkerd)
- **Ingress**: NGINX Ingress Controller or AWS ALB Ingress Controller
- **Monitoring**: Prometheus, Grafana, CloudWatch, Cloud Monitoring

## Development Environments

This project uses a **Kubernetes-first** approach with different environments:

### Local Development (Docker Containers)
- **Purpose**: Fast development, hot reload, easy debugging
- **Setup**: Individual Docker containers or Docker Compose
- **Use when**: Writing code, testing features, debugging

### Pre-Production (Minikube)
- **Purpose**: Test Kubernetes deployment, validate K8s configs
- **Setup**: Local Kubernetes cluster using minikube
- **Use when**: Testing deployments, validating manifests, pre-prod testing

### Production
- **AWS EKS**: Primary environment
- **GCP GKE**: DR stand-in environment

### Alternatives to Docker Compose

You can run services **without Docker Compose** if you prefer:

#### Option A: Local PostgreSQL + Node Services
**Best for**: Fast development, easier debugging

1. Install PostgreSQL locally (`brew install postgresql` or `apt-get install postgresql`)
2. Create database: `createdb rewards_db`
3. Run services directly:
   ```bash
   # Terminal 1
   cd services/primary/card-service && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

**Pros**: No Docker overhead, faster, direct database access  
**Cons**: Need to install PostgreSQL, less isolated

#### Option B: SQLite (No Database Server)
**Best for**: Simplest setup, no dependencies

Modify the database connection to use SQLite instead of PostgreSQL. No database server needed.

**Pros**: Zero configuration, file-based, fast  
**Cons**: Not production-like, different SQL syntax

#### Option C: Cloud Database (AWS RDS / GCP Cloud SQL)
**Best for**: Production-like testing

Use a small managed database instance in AWS/GCP, connect from local services.

**Pros**: Production-like, team can share  
**Cons**: Requires cloud account, costs money, needs internet

#### Option D: Individual Docker Containers
**Best for**: Database in container, services native

Run PostgreSQL in Docker, but run Node services directly with `npm run dev`.

**Pros**: Database isolated, services faster  
**Cons**: Manual container management

#### Option E: Kubernetes (minikube/kind)
**Best for**: Testing production Kubernetes setup

Use local Kubernetes cluster (minikube/kind) to run everything.

**Pros**: Production-like, tests K8s configs  
**Cons**: Complex, slower, resource intensive

**Recommendation**: Docker Compose for quick start, Local PostgreSQL for performance, SQLite for simplicity.

## Prerequisites Setup

### Docker Issues?

If you see Docker authentication errors, you have two options:

**Option A: Fix Docker (for Docker Compose setup)**
```bash
# Login to Docker Hub (free account works)
docker login

# Or use Docker Desktop settings to login
```

**Option B: Skip Docker - Use Local PostgreSQL (Recommended for Development)**
This is faster and doesn't require Docker for the database.

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15
   
   # Or download from: https://www.postgresql.org/download/
   ```

2. **Create database:**
   ```bash
   createdb rewards_db
   ```

3. **Run services directly (no Docker):**
   ```bash
   # Terminal 1 - Card Service
   cd services/primary/card-service
   npm install
   npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend
   npm install
   npm run dev
   ```

## Quick Start

### Local Development (Docker Containers)

For day-to-day development, use Docker containers:

#### Option 1: Docker Compose (Easiest)

```bash
# Start all services
make dev

# Or manually:
docker-compose -f docker-compose.dev.yml up --build
```

This starts:
- PostgreSQL database (container)
- Card Service (container)  
- Frontend (container)

Access: **http://localhost:3000**

**Troubleshooting Docker Auth Error**: If you see "unauthorized: incorrect username or password":
```bash
# Login to Docker Hub (free account works)
docker login

# Then try again
make dev
```

**Alternative**: Skip Docker entirely - use local PostgreSQL + npm (see Option 3 below).

#### Option 2: Individual Docker Containers (More K8s-like)

Run each service in its own container (more similar to Kubernetes):

```bash
# Start PostgreSQL
docker run -d --name postgres-dev \
  -e POSTGRES_DB=rewards_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Build and run Card Service
cd services/primary/card-service
docker build -t card-service:dev .
docker run -d --name card-service \
  --link postgres-dev:postgres \
  -e DB_HOST=postgres-dev \
  -e DB_PORT=5432 \
  -e DB_NAME=rewards_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -p 3001:3001 \
  card-service:dev

# Build and run Frontend
cd frontend
docker build -t frontend:dev .
docker run -d --name frontend \
  -e VITE_API_URL=http://localhost:3001 \
  -p 3000:80 \
  frontend:dev
```

#### Option 3: Local PostgreSQL + Node (No Docker)

**First time setup:**
```bash
./setup-local.sh
```

**Then start services:**
```bash
# Terminal 1 - Card Service
cd services/primary/card-service
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Pre-Production (Minikube)

For testing Kubernetes deployments locally before deploying to AWS/GCP:

#### Setup Minikube Environment

```bash
# One-time setup (installs minikube, builds images, deploys)
make minikube-setup

# Or manually:
./scripts/setup-minikube.sh
```

This will:
- Start minikube cluster
- Build Docker images
- Deploy to Kubernetes
- Set up ingress

#### Access Services

```bash
# Get service URLs
minikube service list -n rewards-app

# Access frontend
minikube service frontend -n rewards-app

# Or add to /etc/hosts:
# $(minikube ip) rewards.local
# Then visit: http://rewards.local
```

#### Useful Minikube Commands

```bash
# View pods
kubectl get pods -n rewards-app

# View logs
make minikube-logs
# Or: kubectl logs -f deployment/card-service -n rewards-app

# Restart deployment
kubectl rollout restart deployment/card-service -n rewards-app

# Clean up
make minikube-clean
# Or: kubectl delete namespace rewards-app
```

**First, login to Docker Hub:**
```bash
docker login
```

**Then start services:**
```bash
# Start all services
make dev

# Or manually:
docker-compose -f docker-compose.dev.yml up --build
```

**Note**: If you get authentication errors, use Option 1 (Local PostgreSQL) instead.

### Option 3: Manual Setup (Run Services Separately)

1. **Start Database:**
   ```bash
   docker-compose -f docker-compose.dev.yml up postgres-primary
   ```

2. **Start Card Service** (in new terminal):
   ```bash
   cd services/primary/card-service
   npm install
   npm run dev
   ```

3. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Local Development - Detailed Guide

### Service URLs

When running locally:

- **Frontend**: http://localhost:3000
- **Card Service API**: http://localhost:3001
  - Health: http://localhost:3001/health
  - Cards: http://localhost:3001/api/cards

### Environment Variables

#### Frontend

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_DR_API_URL=http://localhost:4001
```

#### Card Service

Create `services/primary/card-service/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rewards_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### Database Setup

The database will be automatically initialized when the card service starts. The schema includes:

- `cards` table with all necessary fields

### Testing the Setup

1. **Check database is running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Check card service health:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Test API:**
   ```bash
   # Get all cards
   curl http://localhost:3001/api/cards
   
   # Create a card
   curl -X POST http://localhost:3001/api/cards \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Tesco Clubcard",
       "cardNumber": "1234567890",
       "barcodeData": "1234567890123"
     }'
   ```

4. **Open frontend:**
   - Navigate to http://localhost:3000
   - You should see the rewards card aggregator interface

### Troubleshooting

#### Port Already in Use

If a port is already in use, you can:
- Change the port in docker-compose.yml
- Or stop the service using that port

#### Database Connection Issues

Make sure:
- PostgreSQL container is running: `docker ps`
- Database credentials match in `.env` file
- Wait a few seconds after starting postgres for it to be ready

#### Service Not Starting

1. Check logs: `docker-compose -f docker-compose.dev.yml logs <service-name>`
2. Rebuild: `docker-compose -f docker-compose.dev.yml up --build`
3. Clean and restart: `make stop && make dev`

#### Frontend Can't Connect to Backend

1. Check backend is running: `curl http://localhost:3001/health`
2. Check frontend `.env` has correct API URL
3. Check browser console for errors

### Development Workflow

1. **Start services:**
   ```bash
   make dev
   ```

2. **Make changes** to code (hot reload should work)

3. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

4. **Stop services:**
   ```bash
   make stop
   # or
   docker-compose -f docker-compose.dev.yml down
   ```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for local development)
- Kubernetes CLI (kubectl) - for production deployment
- AWS CLI (for EKS) - for production deployment
- GCP CLI (gcloud) - for production deployment
- PostgreSQL (or use Docker)
- kubectl configured for EKS and GKE clusters

### Installation

```bash
# Install all dependencies
make install
# or
npm install
```

### Local Development

```bash
# Start primary services (Docker Compose)
make dev-primary
# or
docker-compose -f docker-compose.primary.yml up

# Start DR services (Docker Compose)
make dev-dr
# or
docker-compose -f docker-compose.dr.yml up

# Start frontend
make dev-frontend
# or
cd frontend && npm run dev

# Deploy to Kubernetes (Primary - EKS)
kubectl apply -f k8s/primary/

# Deploy to Kubernetes (DR - GKE)
kubectl apply -f k8s/dr/ --context=gke-cluster
```

### Build

```bash
# Build all services
make build
# or
npm run build:all
```

### Testing

```bash
# Run all tests
make test
# or
npm run test:all
```

## Available Commands

### Development
- `make install` - Install all dependencies
- `make build` - Build all services
- `make test` - Run all tests
- `make dev-primary` - Start primary services locally (Docker Compose)
- `make dev-dr` - Start DR services locally (Docker Compose)
- `make dev-frontend` - Start frontend locally
- `make clean` - Clean build artifacts

### Kubernetes Deployment
- `kubectl apply -f k8s/primary/` - Deploy primary services to EKS
- `kubectl apply -f k8s/dr/` - Deploy DR services to GKE
- `kubectl get pods -n rewards-app` - Check pod status
- `kubectl logs -f <pod-name> -n rewards-app` - View service logs
- `kubectl delete -f k8s/primary/` - Remove primary deployment

## Multi-Cloud DR Strategy

### Primary (AWS EKS)
- Full feature set with real-time updates
- Kubernetes cluster with multiple nodes across AZs
- Horizontal Pod Autoscaling (HPA)
- Vertical Pod Autoscaling (VPA) for resource optimization
- Cluster Autoscaling for node management
- Full monitoring with CloudWatch and Prometheus
- Ingress controller for load balancing

### DR Stand-In (GCP GKE)
- Read-only functionality
- Minimal Kubernetes cluster (fewer nodes, smaller instance types)
- Reduced replica counts for cost optimization
- Fast failover capability
- Cached data (last sync timestamp shown)
- Separate GKE cluster and deployment pipeline
- Can scale up quickly when needed

### Data Replication
- Kubernetes CronJob in EKS cluster for scheduled sync
- Syncs from AWS RDS to GCP Cloud SQL
- Application-level replication (simple and reliable for POV)
- Error handling and retry logic
- Eventual consistency acceptable for DR scenario
- Can be triggered manually via kubectl for testing

### Failover Mechanism
- Kubernetes liveness/readiness probes for health checks
- External monitoring (CloudWatch/Cloud Monitoring) detects cluster failures
- DNS-based failover (Route 53 or Cloud DNS)
- Kubernetes Service endpoints switch automatically
- Ingress controller routes to healthy pods
- Automatic or manual switch
- Frontend detects mode and adapts UI
- Can use Kubernetes Service Mesh for advanced traffic management

## License

[To be determined]
