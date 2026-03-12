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

# Replace Startup Variables
MODIFIED_STARTUP=$(echo -e "${STARTUP}" | sed -e 's/{{/${/g' -e 's/}}/}/g')
echo "Startup Command: ${MODIFIED_STARTUP}"
echo ""

# Run the Server
eval ${MODIFIED_STARTUP}
