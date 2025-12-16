#!/bin/bash

# Script to handle port forwarding in background

CLUSTER_TYPE=$1
PID_FILE="/tmp/k8s-port-forward.pids"

# Stop existing port forwarding
if [ -f "$PID_FILE" ]; then
  while read pid; do
    kill $pid 2>/dev/null || true
  done < "$PID_FILE"
  rm -f "$PID_FILE"
fi

pkill -f "kubectl port-forward" 2>/dev/null || true

if [ "$CLUSTER_TYPE" == "primary" ]; then
  echo "📍 Starting port forwarding for PRIMARY services (K8s)..."
  # Check if cluster is accessible
  if ! kubectl cluster-info --context minikube >/dev/null 2>&1; then
    echo "❌ Error: Minikube cluster is not accessible"
    echo "   Make sure Docker is running and minikube is started:"
    echo "   docker ps  # Check Docker is running"
    echo "   minikube start  # Start minikube"
    exit 1
  fi
  
  # Check if services exist
  if ! kubectl get svc frontend -n rewards-app --context minikube >/dev/null 2>&1; then
    echo "❌ Error: Frontend service not found in minikube cluster"
    echo "   Deploy services first: make minikube-deploy"
    exit 1
  fi
  
  # Use ports 8000+ for Kubernetes to avoid conflicts with Docker (3000+)
  kubectl port-forward -n rewards-app service/frontend 8000:80 --context minikube >/dev/null 2>&1 &
  PF_PID=$!
  echo $PF_PID >> "$PID_FILE"
  sleep 1
  
  kubectl port-forward -n rewards-app service/card-service 8001:3001 --context minikube >/dev/null 2>&1 &
  echo $! >> "$PID_FILE"
  sleep 2
  
  # Verify port forwarding is working
  if ! kill -0 $PF_PID 2>/dev/null; then
    echo "❌ Error: Port forwarding failed to start"
    echo "   Check if ports 8000, 8001 are already in use"
    exit 1
  fi
  
  echo "✅ Port forwarding active:"
  echo "  Frontend: http://localhost:8000"
  echo "  Card Service: http://localhost:8001"
  echo ""
  echo "ℹ️  Using ports 8000+ for Kubernetes (Docker uses 3000+)"
elif [ "$CLUSTER_TYPE" == "dr" ]; then
  echo "📍 Starting port forwarding for DR services (K8s)..."
  # Check if cluster is accessible
  if ! kubectl cluster-info --context kind-rewards-dr-cluster >/dev/null 2>&1; then
    echo "❌ Error: Kind cluster is not accessible"
    echo "   Setup DR cluster first: make kind-setup"
    exit 1
  fi
  
  # Check if services exist
  if ! kubectl get svc frontend -n rewards-app --context kind-rewards-dr-cluster >/dev/null 2>&1; then
    echo "❌ Error: Frontend service not found in kind cluster"
    echo "   Deploy services first: make kind-deploy"
    exit 1
  fi
  
  # Use ports 9000+ for DR Kubernetes to avoid conflicts
  kubectl port-forward -n rewards-app service/frontend 9000:80 --context kind-rewards-dr-cluster >/dev/null 2>&1 &
  PF_PID=$!
  echo $PF_PID >> "$PID_FILE"
  sleep 1
  
  kubectl port-forward -n rewards-app service/dr-card-service 9001:4001 --context kind-rewards-dr-cluster >/dev/null 2>&1 &
  echo $! >> "$PID_FILE"
  kubectl port-forward -n rewards-app service/dr-barcode-service 9002:4002 --context kind-rewards-dr-cluster >/dev/null 2>&1 &
  echo $! >> "$PID_FILE"
  sleep 2
  
  # Verify port forwarding is working
  if ! kill -0 $PF_PID 2>/dev/null; then
    echo "❌ Error: Port forwarding failed to start"
    echo "   Check if ports 9000, 9001, 9002 are already in use"
    exit 1
  fi
  
  echo "✅ Port forwarding active:"
  echo "  Frontend: http://localhost:9000 (DR mode)"
  echo "  DR Card Service: http://localhost:9001"
  echo "  DR Barcode Service: http://localhost:9002"
  echo ""
  echo "ℹ️  Using ports 9000+ for DR Kubernetes"
  echo "ℹ️  Frontend will detect DR mode (primary API not accessible)"
fi

echo ""
echo "To stop: make k8s-stop-port-forward"

