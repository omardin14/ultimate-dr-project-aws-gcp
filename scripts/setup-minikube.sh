#!/bin/bash

# Setup script for minikube pre-prod environment

set -e

echo "🚀 Setting up minikube pre-prod environment..."
echo ""

# Check if minikube is installed
if ! command -v minikube &> /dev/null; then
    echo "❌ minikube is not installed."
    echo ""
    echo "Please install minikube:"
    echo "  macOS: brew install minikube"
    echo "  Linux: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed."
    echo ""
    echo "Please install kubectl:"
    echo "  macOS: brew install kubectl"
    echo "  Linux: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Start minikube if not running
if ! minikube status &> /dev/null; then
    echo "📦 Starting minikube cluster..."
    minikube start --driver=docker --memory=4096 --cpus=2
else
    echo "✅ Minikube is already running"
fi

# Set docker environment to use minikube's docker
echo "🐳 Configuring Docker to use minikube..."
eval $(minikube docker-env)

# Enable ingress addon
echo "🌐 Enabling ingress addon..."
minikube addons enable ingress

# Build Docker images
echo "🔨 Building Docker images..."
echo "  - Building card-service..."
docker build -t card-service:latest -f services/primary/card-service/Dockerfile .

echo "  - Building balance-service..."
docker build -t balance-service:latest -f services/primary/balance-service/Dockerfile .

echo "  - Building barcode-service..."
docker build -t barcode-service:latest -f services/primary/barcode-service/Dockerfile .

echo "  - Building frontend..."
# Frontend Dockerfile expects to be run from frontend directory
# Build with environment variables for port forwarding (localhost URLs)
cd frontend
if [ -f Dockerfile ]; then
  docker build \
    --build-arg VITE_API_URL=http://localhost:8001 \
    --build-arg VITE_DR_API_URL=http://localhost:9001 \
    --build-arg VITE_BALANCE_API_URL=http://localhost:8003 \
    --build-arg VITE_BARCODE_API_URL=http://localhost:8002 \
    --build-arg VITE_DR_BARCODE_API_URL=http://localhost:9002 \
    -t frontend:latest -f Dockerfile .
else
  docker build \
    --build-arg VITE_API_URL=http://localhost:8001 \
    --build-arg VITE_DR_API_URL=http://localhost:9001 \
    --build-arg VITE_BALANCE_API_URL=http://localhost:8003 \
    --build-arg VITE_BARCODE_API_URL=http://localhost:8002 \
    --build-arg VITE_DR_BARCODE_API_URL=http://localhost:9002 \
    -t frontend:latest -f Dockerfile.dev .
fi
cd ..

# Apply Kubernetes manifests
echo "📋 Applying Kubernetes manifests..."
# Apply namespace first and wait for it
kubectl apply -f k8s/minikube/namespace.yaml
sleep 2
# Apply rest of manifests
kubectl apply -f k8s/minikube/

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/card-service -n rewards-app || true
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n rewards-app || true

# Get service URLs
echo ""
echo "✅ Minikube setup complete!"
echo ""
echo "📍 Access points:"
echo ""
minikube service list -n rewards-app
echo ""
echo "To access the frontend:"
echo "  minikube service frontend -n rewards-app"
echo ""
echo "Or add to /etc/hosts:"
echo "  $(minikube ip) rewards.local"
echo "Then visit: http://rewards.local"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/card-service -n rewards-app"
echo "  kubectl logs -f deployment/frontend -n rewards-app"

