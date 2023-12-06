#!/bin/bash

SLEEP_VAL=3

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

read -p 'CONFIG DATABASE(no/yes)? no ' CONFIG_DATABASE

if [[ $CONFIG_DATABASE == "yes" ]];then
  read -p 'ENTER DATABASE USER:' DATABASE_USER
  read -p 'ENTER DATABASE DB:' DATABASE_DB
  read -sp 'ENTER DATABASE PASSWORD:' DATABASE_PASSWORD

  sed -i "s/^DATABASE_USER=.*/DATABASE_USER=$DATABASE_USER/" "./.env"
  sed -i "s/^DATABASE_DB=.*/DATABASE_DB=$DATABASE_DB/" "./.env"
  sed -i "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$DATABASE_PASSWORD/" "./.env"
fi

windows_runner () {
  echo "Shared Installer"
  ./scripts/shared/installer.sh

  sleep $SLEEP_VAL

  echo "Backend Installer"
  ./scripts/backend/installer.sh

  sleep $SLEEP_VAL

  echo "Frontend Installer"
  ./scripts/client/installer.sh

  sleep $SLEEP_VAL

  echo "Admin installer"
  ./scripts/admin/installer.sh
}

linux_runner () {
  echo "Shared Installer"
  bash ./scripts/shared/installer.sh

  sleep $SLEEP_VAL

  echo "Backend Installer"
  bash ./scripts/backend/installer.sh

  sleep $SLEEP_VAL

  echo "Frontend Installer"
  bash ./scripts/client/installer.sh

  sleep $SLEEP_VAL

  echo "Admin installer"
  bash  ./scripts/admin/installer.sh
}

case "$OSTYPE" in
  solaris*) echo "SOLARIS" ;;
  darwin*)  linux_runner ;;
  linux*)   linux_runner ;;
  bsd*)     linux_runner ;;
  msys*)    windows_runner ;;
  *)        echo "unknown: $OSTYPE" ;;
esac



