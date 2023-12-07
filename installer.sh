#!/bin/bash

SLEEP_VAL=3

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

read -r -p 'Database config? (no/yes)? no ' CONFIG_DATABASE

read -r -p 'Install specified service? (admin,backend,frontend,shared): ' SPECIFIED_SERVICE

if [[ $CONFIG_DATABASE == "yes" || $CONFIG_DATABASE == "YES" ]];then
  read -r -p 'ENTER DATABASE USER: ' DATABASE_USER
  read -r -p 'ENTER DATABASE DB: ' DATABASE_DB
  read -r -sp 'ENTER DATABASE PASSWORD: ' DATABASE_PASSWORD

  sed -i "s/^DATABASE_USER=.*/DATABASE_USER=$DATABASE_USER/" "./.env"
  sed -i "s/^DATABASE_DB=.*/DATABASE_DB=$DATABASE_DB/" "./.env"
  sed -i "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$DATABASE_PASSWORD/" "./.env"
fi

echo -e "\n"

if [ -z "$SPECIFIED_SERVICE" ]; then
  echo "Shared Installer"
  bash ./scripts/shared/installer.sh

  sleep $SLEEP_VAL

  echo "Admin installer"
  bash  ./scripts/admin/installer.sh

  sleep $SLEEP_VAL

  echo "Backend Installer"
  bash ./scripts/backend/installer.sh

  sleep $SLEEP_VAL

  echo "Frontend Installer"
  bash ./scripts/client/installer.sh
else
  echo "$SPECIFIED_SERVICE" "installer"
  bash ./scripts/"$SPECIFIED_SERVICE"/installer.sh
fi




