#!/bin/bash

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

# chmod -R 777 ./admin/bootstrap/cache ./admin/storage


docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up --build -d nginx

while ! docker container exec app_mysql mysqladmin --user=admin --password=secret --host 127.0.0.1 ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 3
done

echo "Installing npm dependencies..."
docker-compose run --rm npm npm install

echo "Installing composer dependencies..."
docker-compose run --rm composer composer install

echo "Generating key..."
docker-compose run artisan key:generate

echo "Migrating..."
docker-compose run artisan migrate

docker-compose run --rm artisan storage:link
