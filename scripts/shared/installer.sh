#!/bin/bash

source ./.env

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

docker-compose -f $COMPOSE_FILE down

docker-compose -f $COMPOSE_FILE up -d mysql

while ! docker-compose -f $COMPOSE_FILE exec mysql mysqladmin --user="$DATABASE_USER" --password="$DATABASE_PASSWORD" --host 127.0.0.1 ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 3
done

echo "Database connected successfully."