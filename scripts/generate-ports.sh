#!/usr/bin/env bash
# Generates a .env file setting AUTODJ_PORT and PUBLIC_PORT (AUTODJ_PORT + 1)

set -euo pipefail

# Read AUTODJ_PORT from env or default to 8000
AUTODJ_PORT=${AUTODJ_PORT:-8000}

# Compute public port = autodj port + 1
PUBLIC_PORT=$((AUTODJ_PORT + 1))

cat > .env <<EOF
AUTODJ_PORT=${AUTODJ_PORT}
PUBLIC_PORT=${PUBLIC_PORT}
EOF

echo ".env written with AUTODJ_PORT=${AUTODJ_PORT} and PUBLIC_PORT=${PUBLIC_PORT}"
