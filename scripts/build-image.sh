#!/usr/bin/env bash
# Build and optionally push the Docker image locally
set -euo pipefail

NAME=${1:-ghcr.io/$(git config user.name || echo zeropointbruh)/icecast-autodj}
TAG=${2:-dev}
PUSH=${3:-false}

echo "Building image ${NAME}:${TAG} from docker/Dockerfile"
docker build -t ${NAME}:${TAG} -f docker/Dockerfile .

echo "Built ${NAME}:${TAG}"
if [ "$PUSH" = "true" ]; then
  echo "Pushing ${NAME}:${TAG}"
  docker push ${NAME}:${TAG}
fi
