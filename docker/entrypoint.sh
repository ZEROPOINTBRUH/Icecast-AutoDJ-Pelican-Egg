#!/bin/bash

#
# Pelican Panel Compatible Entrypoint
# This script ensures proper execution of startup commands
#

cd /home/container || exit 1

# Print environment info
echo "Starting AutoDJ-Extreme Radio Server..."
echo "User: $(whoami)"
echo "Working Directory: $(pwd)"

# Make run.sh executable if it exists
if [ -f /home/container/run.sh ]; then
    chmod +x /home/container/run.sh
fi

# Replace Startup Variables
MODIFIED_STARTUP=$(echo -e "${STARTUP}" | sed -e 's/{{/${/g' -e 's/}}/}/g')
echo "Startup Command: ${MODIFIED_STARTUP}"

# Run the Server
eval ${MODIFIED_STARTUP}
