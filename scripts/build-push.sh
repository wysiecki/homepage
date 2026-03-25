#!/usr/bin/env bash
set -euo pipefail

# Build and push multi-arch images to Docker Hub
# Usage: ./scripts/build-push.sh [tag]

TAG="${1:-latest}"
REPO="whyzzie/homepage"

echo "Building and pushing ${REPO}:${TAG} (linux/amd64)..."

docker buildx build \
  --platform linux/amd64 \
  --file docker/Dockerfile \
  --tag "${REPO}:${TAG}" \
  --tag "${REPO}:latest" \
  --push \
  .

echo "Building and pushing ${REPO}-api:${TAG} (linux/amd64)..."

docker buildx build \
  --platform linux/amd64 \
  --file server/Dockerfile \
  --tag "${REPO}-api:${TAG}" \
  --tag "${REPO}-api:latest" \
  --push \
  ./server

echo "Done. Images pushed to Docker Hub."
