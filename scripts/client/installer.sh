#!/bin/bash

source ./.env

set -e

# shellcheck disable=SC2034
CYAN='\033[0;36m'

if [ ! -f ./frontend/.env ]; then
  cp ./frontend/.env.example ./frontend/.env
fi

read -r -p 'Stun server config?[no/yes] no ' CONFIG_STUN

echo -e "\n"

if [[ $CONFIG_STUN == "yes" || $CONFIG_STUN == "YES" || $CONFIG_STUN == "y" || $CONFIG_STUN == "Y" ]]; then
  read -r -p 'Ice server urls: ' VITE_ICE_SERVER_URL
  echo -e "\n"
  read -r -p 'Ice server username: ' VITE_ICE_SERVER_USERNAME
  echo -e "\n"
  read -r -p 'Ice server password: ' VITE_ICE_SERVER_PASSWORD

  sed -i "s/^VITE_ICE_SERVER_URL=.*/VITE_ICE_SERVER_URL=$VITE_ICE_SERVER_URL/" "./frontend/.env"
  sed -i "s/^VITE_ICE_SERVER_USERNAME=.*/VITE_ICE_SERVER_USERNAME=$VITE_ICE_SERVER_USERNAME/" "./frontend/.env"
  sed -i "s/^VITE_ICE_SERVER_PASSWORD=.*/VITE_ICE_SERVER_PASSWORD=$VITE_ICE_SERVER_PASSWORD/" "./frontend/.env"
fi

echo -e "\n"

sed -i "s/^VITE_BASE_URL=.*/VITE_BASE_URL=$VITE_BASE_URL/" "./frontend/.env"

echo -e "\n"

docker-compose -f $COMPOSE_FILE up --build -d frontend