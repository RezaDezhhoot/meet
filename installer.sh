#!/bin/bash

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

read -r -p 'Database config?[no/yes] no ' CONFIG_DATABASE

if [[ $CONFIG_DATABASE == "yes" || $CONFIG_DATABASE == "YES" ]];then
  read -r -p 'ENTER DATABASE USER: ' DATABASE_USER
  read -r -p 'ENTER DATABASE DB: ' DATABASE_DB
  read -r -sp 'ENTER DATABASE PASSWORD: ' DATABASE_PASSWORD

  sed -i "s/^DATABASE_USER=.*/DATABASE_USER=$DATABASE_USER/" "./.env"
  sed -i "s/^DATABASE_DB=.*/DATABASE_DB=$DATABASE_DB/" "./.env"
  sed -i "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$DATABASE_PASSWORD/" "./.env"
fi


read -r -p 'RabbitMQ config?[no/yes] no ' CONFIG_RABBITMQ

if [[ $CONFIG_RABBITMQ == "yes" || $CONFIG_RABBITMQ == "YES" ]];then
  read -r -p 'ENTER RABBITMQ USER: ' RABBITMQ_USER
  read -r -sp 'ENTER RABBITMQ PASSWORD: ' RABBITMQ_PASSWORD

  sed -i "s/^RABBITMQ_USER=.*/RABBITMQ_USER=$RABBITMQ_USER/" "./.env"
  sed -i "s/^RABBITMQ_PASSWORD=.*/RABBITMQ_PASSWORD=$RABBITMQ_PASSWORD/" "./.env"
fi

echo -e "\n"

echo "Select service to install:"

select service in shared admin backend frontend all; do
  case $REPLY in
    1)
      select shared_service in mysql rabbitmq both; do
        case $REPLY in
          1)
            installer shared
          ;;
          1)
            installer $shared_service
          ;;
          3)
            installer shared
            installer rabbitmq
          ;;
          *)
            echo "Invalid shared service"
          ;;
        esac
      done
    ;;
    [2,3])
      installer $service
    ;;
    4)
      installer client
    ;;
    5)
      installer shared
      installer rabbitmq
      installer admin
      installer backend
      installer client
    ;;
    *)
      echo -e "\n"
      echo "Invalid service"
      exit 1
  esac
done



