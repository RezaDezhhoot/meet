#!/bin/bash

source ./.env

set -e

docker-compose -f $COMPOSE_FILE down rabbitmq

docker-compose -f $COMPOSE_FILE up -d rabbitmq

while ! docker-compose -f $COMPOSE_FILE exec rabbitmq rabbitmqctl --version >/dev/null 2>&1 ; do
  echo "Waiting for rabbitmq connection..."

  sleep 3;
done

echo "Rabbitmq connected successfully."
