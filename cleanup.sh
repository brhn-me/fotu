#!/bin/bash

# cleanup.sh - Resets the application state

# 1. Load environment variables from backend/.env
if [ -f backend/.env ]; then
  # Use a more robust way to load .env that handles spaces/quotes if necessary
  # For now, a simple grep/export
  export $(grep -v '^#' backend/.env | xargs)
fi

DATA_ROOT=${FOTU_DATA_DIR:-/data/fotu}
CACHE_DIR="$DATA_ROOT/.cache"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 🧹 FOTU CLEANUP STARTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Reset Database
echo "📦 [1/3] Resetting Database..."
if [ -d "backend" ]; then
  (cd backend && npx prisma migrate reset --force)
else
  echo "❌ Error: backend directory not found."
fi

# 2. Flush Redis
# Extract port from REDIS_URL (e.g., redis://localhost:6380)
REDIS_PORT=$(echo $REDIS_URL | sed -e 's/.*:\([0-9]*\).*/\1/')
REDIS_PORT=${REDIS_PORT:-6379}
echo "🔄 [2/3] Flushing Redis (Port: $REDIS_PORT)..."
if command -v redis-cli >/dev/null 2>&1; then
  redis-cli -p "$REDIS_PORT" flushall
else
  echo "⚠️ Warning: redis-cli not found, skipping Redis flush."
fi

# 3. Delete Cache
echo "🗑️ [3/3] Deleting Cache ($CACHE_DIR)..."
if [ -d "$CACHE_DIR" ]; then
  rm -rf "$CACHE_DIR"
  echo "✅ Cache cleared."
else
  echo "ℹ️ Cache directory not found or already empty."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✨ CLEANUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
