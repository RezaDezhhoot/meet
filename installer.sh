#!/bin/bash

SLEEP_VAL=3

if ! docker info >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

function installer() {
  echo "$1" "installer"
  bash  ./scripts/"$1"/installer.sh
}

read -r -p 'Database config? (no/yes)? no ' CONFIG_DATABASE

if [[ $CONFIG_DATABASE == "yes" || $CONFIG_DATABASE == "YES" ]];then
  read -r -p 'ENTER DATABASE USER: ' DATABASE_USER
  read -r -p 'ENTER DATABASE DB: ' DATABASE_DB
  read -r -sp 'ENTER DATABASE PASSWORD: ' DATABASE_PASSWORD

  sed -i "s/^DATABASE_USER=.*/DATABASE_USER=$DATABASE_USER/" "./.env"
  sed -i "s/^DATABASE_DB=.*/DATABASE_DB=$DATABASE_DB/" "./.env"
  sed -i "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$DATABASE_PASSWORD/" "./.env"
fi

echo -e "\n"

select service in shared admin backend frontend all; do
  case $REPLY in
    1)
      installer $service
    ;;
    2)
      installer $service
    ;;
    3)
      installer $service
    ;;
    4)
      installer $service
    ;;
    5)
      installer "shared"
      installer "admin"
      installer "backend"
      installer "frontend"
  esac
done



