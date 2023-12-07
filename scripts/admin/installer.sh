#!/bin/bash

source ./.env

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'
COMPOSE_FILE="docker-compose.yml"

if [ ! -f ./admin/.env ]; then
  cp ./admin/.env.example ./admin/.env
fi

sed -i "s/^DB_HOST=.*/DB_HOST=$DATABASE_CONTAINER/" "./admin/.env"

sed -i "s/^DB_DATABASE=.*/DB_DATABASE=$DATABASE_DB/" "./admin/.env"

sed -i "s/^DB_USERNAME=.*/DB_USERNAME=$DATABASE_USER/" "./admin/.env"

sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DATABASE_PASSWORD/" "./admin/.env"

docker-compose -f $COMPOSE_FILE up --build -d admin

docker-compose -f $COMPOSE_FILE exec -T admin bash <<EOF
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