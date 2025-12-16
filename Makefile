.PHONY: help install build test clean dev dev-primary dev-dr dev-frontend dev-all stop switch-to-primary switch-to-dr sync-dr-data status logs-primary logs-dr minikube-setup minikube-deploy minikube-logs minikube-clean kind-setup kind-deploy kind-logs kind-clean k8s-setup-all k8s-status k8s-switch-primary k8s-switch-dr k8s-port-forward-primary k8s-port-forward-dr k8s-stop-port-forward logs-primary logs-dr

help:
	@echo "Available commands:"
	@echo ""
	@echo "Local Development (Docker):"
	@echo "  make setup         - Setup local environment (no Docker)"
	@echo "  make dev           - Start all primary services + frontend"
	@echo "  make dev-primary   - Start primary services only (no frontend)"
	@echo "  make dev-dr        - Start all DR services + frontend"
	@echo "  make dev-frontend  - Start frontend only (requires backend running)"
	@echo "  make stop          - Stop all docker services"
	@echo ""
	@echo "Mode Switching:"
	@echo "  make switch-to-primary - Stop DR, start primary mode"
	@echo "  make switch-to-dr      - Stop primary, start DR mode"
	@echo "  make sync-dr-data     - Sync data from primary to DR database"
	@echo "  make status            - Show which mode is currently running"
	@echo "  make logs-primary      - View primary service logs (follow mode)"
	@echo "  make logs-dr           - View DR service logs (follow mode)"
	@echo "  make logs-primary      - View primary service logs"
	@echo "  make logs-dr           - View DR service logs"
	@echo ""
	@echo "Pre-Production (Kubernetes Clusters):"
	@echo "  Primary (Minikube - AWS simulation):"
	@echo "    make minikube-setup   - Setup minikube cluster (primary)"
	@echo "    make minikube-deploy  - Deploy to minikube"
	@echo "    make minikube-logs    - View logs in minikube"
	@echo "    make minikube-clean  - Clean minikube environment"
	@echo "  DR (Kind - GCP simulation):"
	@echo "    make kind-setup       - Setup kind cluster (DR)"
	@echo "    make kind-deploy      - Deploy to kind"
	@echo "    make kind-logs        - View logs in kind"
	@echo "  Data Sync:"
	@echo "    make k8s-sync-dr-data - Sync cards from primary to DR cluster"
	@echo "    make kind-clean       - Clean kind environment"
	@echo "  Dual-Cluster:"
	@echo "    make k8s-setup-all         - Setup both clusters"
	@echo "    make k8s-status            - Show status of both clusters"
	@echo "    make k8s-switch-primary    - Switch to primary (failover simulation)"
	@echo "    make k8s-switch-dr         - Switch to DR (failover simulation)"
	@echo "    make k8s-port-forward-primary - Port forward primary services"
	@echo "    make k8s-port-forward-dr   - Port forward DR services"
	@echo "    make k8s-stop-port-forward  - Stop all port forwarding"
	@echo "    make k8s-sync-dr-data      - Sync cards from primary to DR cluster"
	@echo ""
	@echo "General:"
	@echo "  make install       - Install all dependencies"
	@echo "  make build         - Build all services"
	@echo "  make test          - Run all tests"
	@echo "  make clean         - Clean build artifacts"

setup:
	@./setup-local.sh

install:
	npm install
	cd frontend && npm install
	cd packages/shared && npm install
	cd services/primary/card-service && npm install

build:
	npm run build:all

test:
	npm run test:all

# Start everything for local development
dev:
	docker-compose -f docker-compose.dev.yml up --build -d
	@echo ""
	@echo "✓ Primary services started in background!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Card Service: http://localhost:3001"
	@echo "  Barcode Service: http://localhost:3002"
	@echo "  Balance Service: http://localhost:3003"
	@echo ""
	@echo "View logs: docker-compose -f docker-compose.dev.yml logs -f"

# Start all services (primary + DR)
dev-all:
	docker-compose -f docker-compose.primary.yml -f docker-compose.dr.yml up

dev-primary:
	docker-compose -f docker-compose.primary.yml up --build -d
	@echo ""
	@echo "✓ Primary services started in background!"
	@echo "View logs: docker-compose -f docker-compose.primary.yml logs -f"

dev-dr:
	docker-compose -f docker-compose.dr.yml up --build -d
	@echo ""
	@echo "✓ DR services started in background!"
	@echo "  Frontend: http://localhost:3000 (will show DR banner)"
	@echo "  DR Card Service: http://localhost:4001"
	@echo "  DR Barcode Service: http://localhost:4002"
	@echo ""
	@echo "View logs: docker-compose -f docker-compose.dr.yml logs -f"

dev-frontend:
	cd frontend && npm run dev

stop:
	docker-compose -f docker-compose.dev.yml down --remove-orphans
	docker-compose -f docker-compose.primary.yml down --remove-orphans
	docker-compose -f docker-compose.dr.yml down --remove-orphans
	@docker network prune -f >/dev/null 2>&1 || true

# Switch to primary mode (stops DR, starts primary)
switch-to-primary:
	@echo "Switching to PRIMARY mode..."
	@docker-compose -f docker-compose.dr.yml down --remove-orphans >/dev/null 2>&1 || true
	@docker network prune -f >/dev/null 2>&1 || true
	@sleep 1
	@echo "Starting primary services..."
	@docker-compose -f docker-compose.dev.yml up --build -d >/dev/null 2>&1
	@echo ""
	@echo "✓ Primary mode active!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Card Service: http://localhost:3001"
	@echo "  Barcode Service: http://localhost:3002"
	@echo "  Balance Service: http://localhost:3003"
	@echo ""
	@echo "View logs: docker-compose -f docker-compose.dev.yml logs -f"

# Switch to DR mode (stops primary, starts DR)
switch-to-dr:
	@echo "Switching to DR mode..."
	@docker-compose -f docker-compose.dev.yml down --remove-orphans >/dev/null 2>&1 || true
	@docker network prune -f >/dev/null 2>&1 || true
	@sleep 1
	@echo "Starting DR services..."
	@docker-compose -f docker-compose.dr.yml up --build -d >/dev/null 2>&1
	@echo ""
	@echo "✓ DR mode active!"
	@echo "  Frontend: http://localhost:3000 (will show DR banner)"
	@echo "  DR Card Service: http://localhost:4001"
	@echo "  DR Barcode Service: http://localhost:4002"
	@echo ""
	@echo "View logs: docker-compose -f docker-compose.dr.yml logs -f"

# Show current status
status:
	@echo "Checking service status..."
	@echo ""
	@if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "card-service\|dr-card-service"; then \
		if docker ps --format "{{.Names}}" | grep -q "dr-card-service"; then \
			echo "Current Mode: ⚠️  DR (Disaster Recovery)"; \
			echo ""; \
			echo "Running services:"; \
			docker ps --format "  - {{.Names}} ({{.Status}})" | grep -E "(dr-|postgres-dr|frontend)"; \
		else \
			echo "Current Mode: ✓ PRIMARY (Full Functionality)"; \
			echo ""; \
			echo "Running services:"; \
			docker ps --format "  - {{.Names}} ({{.Status}})" | grep -E "(card-service|balance-service|barcode-service|postgres-primary|frontend)"; \
		fi; \
	else \
		echo "Current Mode: ❌ No services running"; \
		echo ""; \
		echo "Start a mode with:"; \
		echo "  make dev          (primary mode)"; \
		echo "  make dev-dr       (DR mode)"; \
	fi
	@echo ""

# Sync data from primary to DR database
sync-dr-data:
	@./scripts/sync-dr-data.sh

# View logs
logs-primary:
	docker-compose -f docker-compose.dev.yml logs -f

logs-dr:
	docker-compose -f docker-compose.dr.yml logs -f

# Minikube commands (Primary - AWS simulation)
minikube-setup:
	./scripts/setup-minikube.sh

minikube-deploy:
	eval $$(minikube docker-env) && \
	kubectl apply -f k8s/minikube/

minikube-logs:
	kubectl logs -f deployment/card-service -n rewards-app

minikube-clean:
	kubectl delete namespace rewards-app

# Kind commands (DR - GCP simulation)
kind-setup:
	./scripts/setup-kind.sh

kind-deploy:
	kubectl apply -f k8s/kind/ --context kind-rewards-dr-cluster

kind-logs:
	kubectl logs -f deployment/dr-card-service -n rewards-app --context kind-rewards-dr-cluster

kind-clean:
	kubectl delete namespace rewards-app --context kind-rewards-dr-cluster || true
	kind delete cluster --name rewards-dr-cluster || true

# Dual-cluster commands
k8s-setup-all:
	@echo "Setting up both clusters..."
	@echo ""
	@echo "1. Setting up Minikube (Primary)..."
	@make minikube-setup
	@echo ""
	@echo "2. Setting up Kind (DR)..."
	@make kind-setup
	@echo ""
	@echo "✅ Both clusters ready!"
	@echo ""
	@make k8s-status

k8s-status:
	@echo "=== Cluster Status ==="
	@echo ""
	@CURRENT_CTX=$$(kubectl config current-context 2>/dev/null || echo "none"); \
	echo "🔵 Current Active Context: $$CURRENT_CTX"; \
	if [ "$$CURRENT_CTX" = "minikube" ]; then \
		echo "   → PRIMARY cluster is active"; \
	elif [ "$$CURRENT_CTX" = "kind-rewards-dr-cluster" ]; then \
		echo "   → DR cluster is active"; \
	else \
		echo "   → No active context"; \
	fi
	@echo ""
	@echo "📡 Port Forwarding Status:"
	@if pgrep -f "kubectl port-forward.*8000" >/dev/null 2>&1; then \
		echo "   ✅ PRIMARY: http://localhost:8000 (Frontend), http://localhost:8001 (Card Service)"; \
	else \
		echo "   ❌ PRIMARY: Not forwarded"; \
	fi
	@if pgrep -f "kubectl port-forward.*9000" >/dev/null 2>&1; then \
		echo "   ✅ DR: http://localhost:9000 (Frontend), http://localhost:9001 (Card), http://localhost:9002 (Barcode)"; \
	else \
		echo "   ❌ DR: Not forwarded"; \
	fi
	@echo ""
	@echo "📦 Primary Cluster (Minikube - AWS simulation):"
	@if minikube status &>/dev/null; then \
		echo "  Status: Running"; \
		kubectl get pods -n rewards-app --context minikube 2>/dev/null | head -5 || echo "  No pods found"; \
	else \
		echo "  Status: Not running"; \
	fi
	@echo ""
	@echo "📦 DR Cluster (Kind - GCP simulation):"
	@if kubectl cluster-info --context kind-rewards-dr-cluster &>/dev/null 2>&1; then \
		echo "  Status: Running"; \
		kubectl get pods -n rewards-app --context kind-rewards-dr-cluster 2>/dev/null | head -5 || echo "  No pods found"; \
	else \
		echo "  Status: Not running"; \
	fi
	@echo ""
	@echo "To switch contexts:"
	@echo "  make k8s-switch-primary  (switch to primary + port forward)"
	@echo "  make k8s-switch-dr       (switch to DR + port forward)"
	@echo ""
	@echo "To sync data between clusters:"
	@echo "  make k8s-sync-dr-data    (sync cards from primary to DR)"

# Failover simulation commands
k8s-switch-primary:
	@echo "🔄 Switching to PRIMARY cluster (simulating failover to primary)..."
	@make k8s-stop-port-forward >/dev/null 2>&1 || true
	@kubectl config use-context minikube
	@echo "✅ Switched to primary cluster (minikube)"
	@echo ""
	@./scripts/k8s-port-forward.sh primary

k8s-switch-dr:
	@echo "🔄 Switching to DR cluster (simulating failover to DR)..."
	@make k8s-stop-port-forward >/dev/null 2>&1 || true
	@kubectl config use-context kind-rewards-dr-cluster
	@echo "✅ Switched to DR cluster (kind-rewards-dr-cluster)"
	@echo ""
	@./scripts/k8s-port-forward.sh dr

k8s-port-forward-primary:
	@./scripts/k8s-port-forward.sh primary

k8s-port-forward-dr:
	@./scripts/k8s-port-forward.sh dr

k8s-stop-port-forward:
	@echo "🛑 Stopping all port forwarding..."
	@if [ -f /tmp/k8s-port-forward.pids ]; then \
		while read pid; do \
			kill $$pid 2>/dev/null || true; \
		done < /tmp/k8s-port-forward.pids; \
		rm -f /tmp/k8s-port-forward.pids; \
	fi
	@pkill -f "kubectl port-forward" 2>/dev/null || true
	@echo "✅ Port forwarding stopped"

# Sync data from primary (minikube) to DR (kind) cluster
k8s-sync-dr-data:
	@./scripts/sync-k8s-dr-data.sh

clean:
	find . -type d -name node_modules -exec rm -rf {} +
	find . -type d -name dist -exec rm -rf {} +
	find . -type d -name build -exec rm -rf {} +

