#!/bin/bash

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

docker-compose -f $COMPOSE_FILE down frontend

docker-compose -f $COMPOSE_FILE up --build -d frontend

echo "🔴 Remove old images"
if [[ $(docker images --filter "dangling=true" -q --no-trunc) ]]; then
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
fi;


