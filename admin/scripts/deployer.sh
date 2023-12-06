#!/bin/bash

echo "🟡 Deploy admin application"
set -e

echo "🟡 Pulling code"
git pull origin main --no-edit

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

echo "🔴 Building images"
docker-compose -f $COMPOSE_FILE down

docker-compose -f $COMPOSE_FILE build --no-cache

docker-compose -f $COMPOSE_FILE up -d nginx

echo "🔴 Remove old images"
if [[ $(docker images --filter "dangling=true" -q --no-trunc) ]]; then
  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
fi;

echo "🔴 Installing dependencies..."
docker-compose -f $COMPOSE_FILE exec -T app bash <<EOF
  echo "🔴 Migrating"
  php artisan migrate

  echo "🔴 Optimizing"
  php artisan optimize
EOF

echo "🔴 Installing npm dependencies..."
docker-compose -f $COMPOSE_FILE run --rm npm install --force
