#!/bin/bash

echo "🟡 Deploy backend application..."

set -e

echo "🟡 Pulling code"
git pull origin main --no-edit

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

echo "🔴 Building images"
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE build --no-cache
docker-compose -f $COMPOSE_FILE up -d

echo "🔴 Remove old images"
if [[ $(docker images --filter "dangling=true" -q --no-trunc) ]]; then
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
fi;