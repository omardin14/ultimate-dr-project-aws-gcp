#!/bin/bash

# Setup script for kind cluster (DR/GCP simulation)

set -e

echo "🚀 Setting up kind cluster for DR environment (GCP simulation)..."
echo ""

# Check if kind is installed
if ! command -v kind &> /dev/null; then
    echo "❌ kind is not installed."
    echo ""
    echo "Please install kind:"
    echo "  macOS: brew install kind"
    echo "  Linux: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
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

# Cluster name
CLUSTER_NAME="rewards-dr-cluster"

# Check if cluster already exists
if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
    echo "⚠️  Cluster '${CLUSTER_NAME}' already exists."
    read -p "Delete and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Deleting existing cluster..."
        kind delete cluster --name "${CLUSTER_NAME}"
    else
        echo "✅ Using existing cluster"
        kubectl cluster-info --context "kind-${CLUSTER_NAME}"
        exit 0
    fi
fi

# Create kind cluster
echo "📦 Creating kind cluster '${CLUSTER_NAME}'..."
cat <<EOF | kind create cluster --name "${CLUSTER_NAME}" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 8080
    protocol: TCP
  - containerPort: 443
    hostPort: 8443
    protocol: TCP
EOF

# Set kubectl context
echo "🔧 Setting kubectl context..."
kubectl cluster-info --context "kind-${CLUSTER_NAME}"

# Wait for cluster to be ready
echo "⏳ Waiting for cluster to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s --context "kind-${CLUSTER_NAME}"

# Load Docker images into kind
echo "🐳 Loading Docker images into kind cluster..."
echo "  Note: Images need to be built first. Building now..."

# Build images (from project root)
echo "  - Building DR card-service..."
docker build -t dr-card-service:latest -f services/dr/card-service/Dockerfile .
kind load docker-image dr-card-service:latest --name "${CLUSTER_NAME}"

echo "  - Building DR barcode-service..."
docker build -t dr-barcode-service:latest -f services/dr/barcode-service/Dockerfile .
kind load docker-image dr-barcode-service:latest --name "${CLUSTER_NAME}"

echo "  - Building frontend..."
# Frontend Dockerfile expects to be run from frontend directory
# Build with environment variables for port forwarding (localhost URLs for DR)
# IMPORTANT: VITE_FORCE_DR_MODE=true forces DR mode detection
cd frontend
if [ -f Dockerfile ]; then
  docker build \
    --build-arg VITE_API_URL=http://localhost:8001 \
    --build-arg VITE_DR_API_URL=http://localhost:9001 \
    --build-arg VITE_BALANCE_API_URL=http://localhost:8003 \
    --build-arg VITE_BARCODE_API_URL=http://localhost:8002 \
    --build-arg VITE_DR_BARCODE_API_URL=http://localhost:9002 \
    --build-arg VITE_FORCE_DR_MODE=true \
    -t frontend:latest -f Dockerfile .
else
  docker build \
    --build-arg VITE_API_URL=http://localhost:8001 \
    --build-arg VITE_DR_API_URL=http://localhost:9001 \
    --build-arg VITE_BALANCE_API_URL=http://localhost:8003 \
    --build-arg VITE_BARCODE_API_URL=http://localhost:8002 \
    --build-arg VITE_DR_BARCODE_API_URL=http://localhost:9002 \
    --build-arg VITE_FORCE_DR_MODE=true \
    -t frontend:latest -f Dockerfile.dev .
fi
cd ..
kind load docker-image frontend:latest --name "${CLUSTER_NAME}"

# Apply Kubernetes manifests
echo "📋 Applying Kubernetes manifests..."
# Apply namespace first and wait for it
kubectl apply -f k8s/kind/namespace.yaml --context "kind-${CLUSTER_NAME}"
sleep 2
# Apply rest of manifests
kubectl apply -f k8s/kind/ --context "kind-${CLUSTER_NAME}"

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/dr-card-service -n rewards-app --context "kind-${CLUSTER_NAME}" || true
kubectl wait --for=condition=available --timeout=300s deployment/dr-barcode-service -n rewards-app --context "kind-${CLUSTER_NAME}" || true
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n rewards-app --context "kind-${CLUSTER_NAME}" || true

# Get service URLs
echo ""
echo "✅ Kind cluster setup complete!"
echo ""
echo "📍 Cluster: ${CLUSTER_NAME}"
echo "📍 Context: kind-${CLUSTER_NAME}"
echo ""
echo "To access services:"
echo "  kubectl port-forward -n rewards-app service/frontend 3000:80 --context kind-${CLUSTER_NAME}"
echo ""
echo "Or use ingress (if configured):"
echo "  kubectl get ingress -n rewards-app --context kind-${CLUSTER_NAME}"

