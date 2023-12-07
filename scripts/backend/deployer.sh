#!/bin/bash

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

echo "🔴 Building images"
docker-compose -f $COMPOSE_FILE down backend
docker-compose -f $COMPOSE_FILE up -d --build backend

echo "🔴 Remove old images"
if [[ $(docker images --filter "dangling=true" -q --no-trunc) ]]; then
  # shellcheck disable=SC2046
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
fi;