.PHONY: help install build test clean dev dev-primary dev-dr dev-frontend dev-all stop

help:
	@echo "Available commands:"
	@echo ""
	@echo "Local Development (Docker):"
	@echo "  make setup         - Setup local environment (no Docker)"
	@echo "  make dev           - Start all services with Docker Compose"
	@echo "  make dev-primary   - Start primary services only"
	@echo "  make dev-dr        - Start DR services only"
	@echo "  make dev-frontend  - Start frontend only (requires backend running)"
	@echo "  make stop          - Stop all docker services"
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
	docker-compose -f docker-compose.dev.yml up --build

# Start all services (primary + DR)
dev-all:
	docker-compose -f docker-compose.primary.yml -f docker-compose.dr.yml up

dev-primary:
	docker-compose -f docker-compose.primary.yml up --build

dev-dr:
	docker-compose -f docker-compose.dr.yml up --build

dev-frontend:
	cd frontend && npm run dev

stop:
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.primary.yml down
	docker-compose -f docker-compose.dr.yml down

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

