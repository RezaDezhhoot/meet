#!/bin/bash

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

if [ ! -f ./frontend/.env ]; then
  cp ./frontend/.env.example ./frontend/.env
fi

docker-compose -f $COMPOSE_FILE up --build -d frontend