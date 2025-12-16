#!/bin/bash

# Script to sync data from primary (minikube) database to DR (kind) database
# This simulates cross-cloud data replication for pre-prod testing

set -e

echo "🔄 Syncing data from PRIMARY (minikube) to DR (kind) database..."
echo ""

# Check if minikube is running
if ! minikube status &>/dev/null; then
  echo "❌ Minikube cluster is not running"
  echo "   Start it with: minikube start"
  exit 1
fi

# Check if kind cluster exists
if ! kubectl cluster-info --context kind-rewards-dr-cluster &>/dev/null 2>&1; then
  echo "❌ Kind cluster is not accessible"
  echo "   Setup DR cluster first: make kind-setup"
  exit 1
fi

# Get pod names
PRIMARY_PG_POD=$(kubectl get pods -n rewards-app --context minikube -l app=postgres -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
DR_PG_POD=$(kubectl get pods -n rewards-app --context kind-rewards-dr-cluster -l app=postgres-dr -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$PRIMARY_PG_POD" ]; then
  echo "❌ Primary PostgreSQL pod not found in minikube cluster"
  echo "   Deploy services first: make minikube-deploy"
  exit 1
fi

if [ -z "$DR_PG_POD" ]; then
  echo "❌ DR PostgreSQL pod not found in kind cluster"
  echo "   Deploy services first: make kind-deploy"
  exit 1
fi

echo "Primary pod: $PRIMARY_PG_POD (minikube)"
echo "DR pod: $DR_PG_POD (kind)"
echo ""

# Export data from primary database
echo "📤 Exporting data from primary database..."
kubectl exec -n rewards-app --context minikube "$PRIMARY_PG_POD" -- \
  pg_dump -U postgres -d rewards_db -t cards --data-only --column-inserts > /tmp/k8s_cards_data.sql 2>/dev/null || {
  echo "⚠️  No data found in primary database or export failed"
  echo "   Creating empty cards table in DR..."
  
  # Ensure DR database has the schema
  kubectl exec -n rewards-app --context kind-rewards-dr-cluster "$DR_PG_POD" -- \
    psql -U postgres -d rewards_db_dr -c "
    CREATE TABLE IF NOT EXISTS cards (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      card_number VARCHAR(50) NOT NULL,
      barcode_data VARCHAR(200),
      balance DECIMAL(10, 2),
      balance_last_updated TIMESTAMP,
      image_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  " >/dev/null 2>&1
  
  echo "✓ DR database schema ready (empty)"
  rm -f /tmp/k8s_cards_data.sql
  exit 0
}

if [ ! -s /tmp/k8s_cards_data.sql ]; then
  echo "⚠️  No data found in primary database. Creating empty cards table in DR..."
  kubectl exec -n rewards-app --context kind-rewards-dr-cluster "$DR_PG_POD" -- \
    psql -U postgres -d rewards_db_dr -c "
    CREATE TABLE IF NOT EXISTS cards (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      card_number VARCHAR(50) NOT NULL,
      barcode_data VARCHAR(200),
      balance DECIMAL(10, 2),
      balance_last_updated TIMESTAMP,
      image_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  " >/dev/null 2>&1
  echo "✓ DR database schema ready (empty)"
  rm -f /tmp/k8s_cards_data.sql
  exit 0
fi

# Ensure DR database has the schema
echo "📋 Ensuring DR database schema exists..."
kubectl exec -n rewards-app --context kind-rewards-dr-cluster "$DR_PG_POD" -- \
  psql -U postgres -d rewards_db_dr -c "
  CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    card_number VARCHAR(50) NOT NULL,
    barcode_data VARCHAR(200),
    balance DECIMAL(10, 2),
    balance_last_updated TIMESTAMP,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
" >/dev/null 2>&1

# Clear existing data in DR (optional - comment out if you want to keep existing data)
echo "🗑️  Clearing existing DR data..."
kubectl exec -n rewards-app --context kind-rewards-dr-cluster "$DR_PG_POD" -- \
  psql -U postgres -d rewards_db_dr -c "TRUNCATE TABLE cards;" >/dev/null 2>&1 || true

# Import data into DR database
echo "📥 Importing data into DR database..."
kubectl exec -i -n rewards-app --context kind-rewards-dr-cluster "$DR_PG_POD" -- \
  psql -U postgres -d rewards_db_dr < /tmp/k8s_cards_data.sql >/dev/null 2>&1

# Verify sync
echo "✅ Verifying sync..."
CARD_COUNT=$(kubectl exec -n rewards-app --context kind-rewards-dr-cluster "$DR_PG_POD" -- \
  psql -U postgres -d rewards_db_dr -t -c "SELECT COUNT(*) FROM cards;" 2>/dev/null | tr -d ' ' || echo "0")

echo ""
echo "✅ Data sync complete!"
echo "   Cards in DR database: $CARD_COUNT"
echo ""
echo "💡 In production, this would be automated via:"
echo "   - AWS DMS (Database Migration Service)"
echo "   - GCP Database Migration Service"
echo "   - Or a Kubernetes CronJob running periodically"

# Cleanup
rm -f /tmp/k8s_cards_data.sql

