#!/bin/bash

source ./.env

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

DATABASE_CONTAINER=$DATABASE_CONTAINER

DATABASE_USER=$DATABASE_USER

DATABASE_DB=$DATABASE_DB

DATABASE_PASSWORD=$DATABASE_PASSWORD

if [ ! -f ./backend/.env ]; then
  cp ./backend/.env.example ./backend/.env
fi

sed -i "s/^DB_HOST=.*/DB_HOST=$DATABASE_CONTAINER/" "./backend/.env"

sed -i "s/^DB_DATABASE=.*/DB_DATABASE=$DATABASE_DB/" "./backend/.env"

sed -i "s/^DB_USERNAME=.*/DB_USERNAME=$DATABASE_USER/" "./backend/.env"

sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DATABASE_PASSWORD/" "./backend/.env"

docker-compose -f $COMPOSE_FILE up -d --build backend