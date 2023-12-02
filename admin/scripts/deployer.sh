#!/bin/bash

source ./shared/.env

echo "🟡 Deploy admin application"
set -e

CYAN='\033[0;36m'
COMPOSE_FILE="./admin/docker-compose.yml"

DATABASE_CONTAINER=$DATABASE_CONTAINER
DATABASE_USER=$DATABASE_USER
DATABASE_DB=$DATABASE_USER
DATABASE_PASSWORD=$DATABASE_PASSWORD

echo "🟡 Pulling code"
git pull origin main --no-edit

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

while ! docker container exec -it $DATABASE_CONTAINER  mysql mysqladmin --user="$DATABASE_USER" --password="$DATABASE_PASSWORD" --host 127.0.0.1 ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 3
done

echo "🔴 Building images"
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up --build -d nginx

echo "🔴 Remove old images"
if [[ $(docker images --filter "dangling=true" -q --no-trunc) ]]; then
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
fi;

echo "🔴 Installing dependencies..."
docker-compose -f $COMPOSE_FILE exec -T app bash <<EOF
  echo "🔴 Installing composer dependencies..."
  composer install --ignore-platform-reqs

  echo "🔴 Migrating"
  php artisan migrate

  echo "🔴 Optimizing"
  php artisan optimize
EOF

echo "🔴 Installing npm dependencies..."
docker-compose -f $COMPOSE_FILE run --rm npm install --force
