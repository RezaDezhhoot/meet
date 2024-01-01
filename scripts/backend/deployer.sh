#!/bin/bash

source ./.env

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'

echo "🔴 Building images"
docker-compose -f $COMPOSE_FILE down backend
docker-compose -f $COMPOSE_FILE up -d --build backend