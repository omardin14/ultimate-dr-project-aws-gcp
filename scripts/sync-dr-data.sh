#!/bin/bash

# Script to sync data from primary database to DR database for local testing

echo "Syncing data from primary to DR database..."

# Check if primary database is running
PRIMARY_CONTAINER=$(docker ps --format "{{.Names}}" | grep "postgres-primary" | head -1)
DR_CONTAINER=$(docker ps --format "{{.Names}}" | grep "postgres-dr" | head -1)

if [ -z "$PRIMARY_CONTAINER" ]; then
  echo "❌ Primary database container not found. Start primary services first: make dev"
  exit 1
fi

if [ -z "$DR_CONTAINER" ]; then
  echo "❌ DR database container not found. Start DR services first: make dev-dr"
  exit 1
fi

echo "Primary container: $PRIMARY_CONTAINER"
echo "DR container: $DR_CONTAINER"

# Export data from primary database
echo "Exporting data from primary database..."
docker exec "$PRIMARY_CONTAINER" pg_dump -U postgres -d rewards_db -t cards --data-only --column-inserts > /tmp/cards_data.sql 2>/dev/null

if [ ! -s /tmp/cards_data.sql ]; then
  echo "⚠️  No data found in primary database. Creating empty cards table in DR..."
  docker exec "$DR_CONTAINER" psql -U postgres -d rewards_db_dr -c "
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
  exit 0
fi

# Ensure DR database has the schema
echo "Ensuring DR database schema exists..."
docker exec "$DR_CONTAINER" psql -U postgres -d rewards_db_dr -c "
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
echo "Clearing existing DR data..."
docker exec "$DR_CONTAINER" psql -U postgres -d rewards_db_dr -c "TRUNCATE TABLE cards;" >/dev/null 2>&1

# Import data into DR database
echo "Importing data into DR database..."
docker exec -i "$DR_CONTAINER" psql -U postgres -d rewards_db_dr < /tmp/cards_data.sql >/dev/null 2>&1

# Verify sync
CARD_COUNT=$(docker exec "$DR_CONTAINER" psql -U postgres -d rewards_db_dr -t -c "SELECT COUNT(*) FROM cards;" 2>/dev/null | tr -d ' ')

echo ""
echo "✓ Data sync complete!"
echo "  Cards in DR database: $CARD_COUNT"

# Cleanup
rm -f /tmp/cards_data.sql

