#!/usr/bin/env bash
# Start/stop the Next.js dev server or Docker container on port 3004
# Usage: ./local.sh            — start dev server
#        ./local.sh stop       — stop dev server (or Docker container)
#        ./local.sh docker     — build and run Docker container
#        ./local.sh docker stop — stop Docker container

PORT=3004
DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.local.yml"

# Helper: stop Docker containers
stop_docker() {
  cd "$DIR"
  # Stop the named container directly — avoids docker compose touching ghost containers
  if docker ps -q --filter "name=wysiecki-homepage-next" 2>/dev/null | grep -q .; then
    docker stop wysiecki-homepage-next 2>/dev/null
    docker rm wysiecki-homepage-next 2>/dev/null
    echo "Stopped Docker container"
    return 0
  fi
  return 1
}

# Helper: stop dev server process
stop_dev() {
  PID=$(lsof -ti:$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null
    echo "Stopped dev server on port $PORT (PID: $PID)"
    return 0
  fi
  return 1
}

# Stop mode (handles: stop, docker stop, docker down)
if [ "$1" = "stop" ] || ([ "$1" = "docker" ] && ([ "$2" = "stop" ] || [ "$2" = "down" ])); then
  stop_docker || stop_dev || echo "Nothing running on port $PORT"
  exit 0
fi

# Docker mode — build and run container on same port
if [ "$1" = "docker" ] && [ -z "$2" ]; then
  stop_docker 2>/dev/null
  stop_dev 2>/dev/null

  cd "$DIR"
  echo "Building Docker image..."
  docker compose $COMPOSE_FILES build || exit 1

  echo "Starting container on http://localhost:$PORT"
  # --force-recreate avoids stale container references; ignore non-fatal errors
  docker compose $COMPOSE_FILES up -d --force-recreate 2>&1 | grep -v "No such container"

  echo "Waiting for health check..."
  for i in $(seq 1 30); do
    if curl -sf http://localhost:$PORT/api/health >/dev/null 2>&1; then
      echo "Container healthy at http://localhost:$PORT"
      curl -s http://localhost:$PORT/api/health
      echo ""
      exit 0
    fi
    sleep 2
  done
  echo "Health check timed out — check logs with: docker compose $COMPOSE_FILES logs"
  exit 1
fi

# Ensure data dir for SQLite
mkdir -p "$DIR/data"

# Dev environment defaults
export BLOG_DB_PATH="${BLOG_DB_PATH:-$DIR/data/blog.db}"
export BLOG_API_KEY="${BLOG_API_KEY:-dev-blog-key}"

# Kill any existing process on the port
PID=$(lsof -ti:$PORT 2>/dev/null)
if [ -n "$PID" ]; then
  echo "Killing existing process on port $PORT (PID: $PID)"
  kill -9 $PID 2>/dev/null
  sleep 1
fi

echo "Starting Next.js dev server on http://localhost:$PORT"
cd "$DIR"
exec npx next dev -p $PORT
