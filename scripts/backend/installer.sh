#!/bin/bash

source ./.env

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'

if [ ! -f ./backend/.env ]; then
  cp ./backend/.env.example ./backend/.env
fi

docker-compose -f $COMPOSE_FILE up -d --build backend