#!/bin/bash

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

docker-compose -f $COMPOSE_FILE up --build -d frontend