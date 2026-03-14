#!/bin/bash

#
# Pelican Panel Compatible Entrypoint with Cleanup Support
# This script ensures proper execution of startup commands
#

cd /home/container || exit 1

echo "╔════════════════════════════════════════════════════════╗"
echo "║         AutoDJ-Extreme Radio Server Startup           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "User: $(whoami)"
echo "Working Directory: $(pwd)"
echo ""

# Run cleanup if UPDATE_CONFIGS environment variable is set
# This allows fresh configuration updates while preserving music/playlists
if [ "$UPDATE_CONFIGS" = "true" ] || [ "$UPDATE_CONFIGS" = "1" ]; then
    echo "ℹ UPDATE_CONFIGS detected - running cleanup..."
    if [ -x /usr/local/bin/cleanup-container.sh ]; then
        /usr/local/bin/cleanup-container.sh
        echo ""
    fi
fi

# Make run.sh executable if it exists
if [ -f /home/container/run.sh ]; then
    chmod +x /home/container/run.sh
fi

# Determine ports: primary (Icecast) and public (Bun admin)
# If PUBLIC_PORT is set and not empty, use it; otherwise use primary_port + 1
PRIMARY_PORT="${ICECAST_PORT:-8000}"
if [ -z "$PUBLIC_PORT" ] || [ "$PUBLIC_PORT" = "" ]; then
    PUBLIC_PORT=$((PRIMARY_PORT + 1))
    echo "PUBLIC_PORT not set, auto-calculated: ${PRIMARY_PORT} + 1 = ${PUBLIC_PORT}"
fi
export PUBLIC_PORT

# Start Bun public service in background (if not already running)
if command -v bun &> /dev/null; then
    echo "Starting Bun public service on port ${PUBLIC_PORT}..."
    cd /home/container
    AUTODJ_HOST="localhost" AUTODJ_PORT="${PRIMARY_PORT}" PUBLIC_PORT="${PUBLIC_PORT}" bun /home/container/public.ts &
    BUN_PID=$!
    echo "  Bun service started (PID: $BUN_PID)"
else
    echo "⚠ Bun not available - public service will not run"
fi

# Replace Startup Variables
MODIFIED_STARTUP=$(echo -e "${STARTUP}" | sed -e 's/{{/${/g' -e 's/}}/}/g')
echo "Startup Command: ${MODIFIED_STARTUP}"
echo ""

# Run the Server
eval ${MODIFIED_STARTUP}
