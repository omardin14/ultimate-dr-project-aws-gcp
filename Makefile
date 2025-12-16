.PHONY: help install build test clean dev dev-primary dev-dr dev-frontend dev-all stop switch-to-primary switch-to-dr sync-dr-data status logs-primary logs-dr logs-primary logs-dr

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
	@echo "Pre-Production (Minikube):"
	@echo "  make minikube-setup - Setup minikube environment"
	@echo "  make minikube-deploy - Deploy to minikube"
	@echo "  make minikube-logs  - View logs in minikube"
	@echo "  make minikube-clean - Clean minikube environment"
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

# Minikube commands
minikube-setup:
	./scripts/setup-minikube.sh

minikube-deploy:
	eval $$(minikube docker-env) && \
	kubectl apply -f k8s/minikube/

minikube-logs:
	kubectl logs -f deployment/card-service -n rewards-app

minikube-clean:
	kubectl delete namespace rewards-app

clean:
	find . -type d -name node_modules -exec rm -rf {} +
	find . -type d -name dist -exec rm -rf {} +
	find . -type d -name build -exec rm -rf {} +

