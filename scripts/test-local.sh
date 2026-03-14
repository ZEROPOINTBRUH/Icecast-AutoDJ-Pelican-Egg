#!/usr/bin/env bash
# Quick local test: build and check public endpoints
set -euo pipefail

echo "Building and starting containers..."
docker compose up -d --build
sleep 5
PUBLIC_PORT=${PUBLIC_PORT:-$(grep PUBLIC_PORT .env || echo 8001)}
if [ -f .env ]; then
  PUBLIC_PORT=$(grep PUBLIC_PORT .env | cut -d'=' -f2)
fi
if [ -z "$PUBLIC_PORT" ]; then
  PUBLIC_PORT=8001
fi

echo "Checking /api/status/json on port $PUBLIC_PORT"
curl -sSf http://localhost:${PUBLIC_PORT}/api/status/json | jq . || true

echo "Listing tracks"
curl -sSf http://localhost:${PUBLIC_PORT}/api/tracks | jq . || true

echo "Done"
