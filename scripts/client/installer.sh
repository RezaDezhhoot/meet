#!/bin/bash

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

docker-compose -f $COMPOSE_FILE up --build -d frontend