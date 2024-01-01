#!/bin/bash

source ./.env

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'

docker-compose -f $COMPOSE_FILE down frontend

docker-compose -f $COMPOSE_FILE up --build -d frontend
