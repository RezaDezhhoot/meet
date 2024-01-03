#!/bin/bash

source ./.env

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'

if [ ! -f ./admin/.env ]; then
  cp ./admin/.env.example ./admin/.env
fi

docker-compose -f $COMPOSE_FILE up --build -d admin

docker-compose -f $COMPOSE_FILE exec -T admin bash << EOF
  echo "Generating key..."
  php artisan key:generate

  echo "🔴 Migrating"
  php artisan migrate

  echo "🔴 Optimizing"
  php artisan optimize

  echo "Link storage."
  php artisan storage:link

  service supervisor start

  supervisorctl reread
  supervisorctl update
  supervisorctl start all
EOF

echo "🔴 Installing npm dependencies..."
docker-compose -f $COMPOSE_FILE run --rm npm install --force