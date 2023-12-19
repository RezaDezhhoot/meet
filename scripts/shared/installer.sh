#!/bin/bash

source ./.env

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

docker-compose -f $COMPOSE_FILE down mysql

docker-compose -f $COMPOSE_FILE up -d mysql

while ! docker-compose -f $COMPOSE_FILE exec mysql mysqladmin --user="$DATABASE_USER" --password="$DATABASE_PASSWORD" --host 127.0.0.1 ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 3
done

echo "Database connected successfully."