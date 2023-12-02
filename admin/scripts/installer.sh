#!/bin/bash

source ./shared/.env

set -e

CYAN='\033[0;36m'
COMPOSE_FILE="./admin/docker-compose.yml"

DATABASE_CONTAINER=$DATABASE_CONTAINER

DATABASE_USER=$DATABASE_USER

DATABASE_DB=$DATABASE_DB

DATABASE_PASSWORD=$DATABASE_PASSWORD

sed -i "s/^DB_HOST=.*/DB_HOST=$DATABASE_CONTAINER/" "./admin/src/.env"

sed -i "s/^DB_DATABASE=.*/DB_DATABASE=$DATABASE_DB/" "./admin/src/.env"

sed -i "s/^DB_USERNAME=.*/DB_USERNAME=$DATABASE_USER/" "./admin/src/.env"

sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DATABASE_PASSWORD/" "./admin/src/.env"


if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

while ! docker container exec -it $DATABASE_CONTAINER mysqladmin --user="$DATABASE_USER" --password="$DATABASE_PASSWORD" --host 127.0.0.1 ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 3
done

docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up --build -d nginx

docker-compose -f $COMPOSE_FILE exec -T app bash <<EOF
  echo "🔴 Installing composer dependencies..."
  composer install --ignore-platform-reqs

  echo "Generating key..."
  php artisan key:generate

  echo "🔴 Migrating"
  php artisan migrate

  echo "🔴 Optimizing"
  php artisan optimize

  echo "Link storage."
  php artisan storage:link
EOF

echo "🔴 Installing npm dependencies..."
docker-compose -f $COMPOSE_FILE run --rm npm install --force