#!/bin/bash

source ./.env

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'

echo "🔴 Building images"
docker-compose -f $COMPOSE_FILE down admin
docker-compose -f $COMPOSE_FILE up -d --build admin

echo "🔴 Installing dependencies..."
docker-compose -f $COMPOSE_FILE exec -T admin bash <<EOF
  echo "🔴 Migrating"
  php artisan migrate

  echo "🔴 Optimizing"
  php artisan optimize

  service supervisor start
  supervisorctl reread
  supervisorctl update
  supervisorctl start all
EOF

echo "🔴 Installing npm dependencies..."
docker-compose -f $COMPOSE_FILE run --rm npm install --force
