#!/bin/bash

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="./frontend/docker-compose.yml"

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

docker-compose -f $COMPOSE_FILE down

docker-compose -f $COMPOSE_FILE build --no-cache

docker-compose -f $COMPOSE_FILE up -d frontend

echo "🔴 Remove old images"
if [[ $(docker images --filter "dangling=true" -q --no-trunc) ]]; then
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
fi;


