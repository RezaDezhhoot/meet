#!/bin/bash

source ./.env

set -e

CYAN='\033[0;36m'

docker-compose -f $COMPOSE_FILE down mysql

docker-compose -f $COMPOSE_FILE up -d mysql

while ! docker-compose -f $COMPOSE_FILE exec mysql mysqladmin --user="$DATABASE_USER" --password="$DATABASE_PASSWORD" --host 127.0.0.1 ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 3
done

echo "Database connected successfully."

read -r -p "Would you like to install phpmyadmin?[yes/no] no " PHPMYADMIN

if [[ $PHPMYADMIN == 'yes' || $PHPMYADMIN == 'YES' || $PHPMYADMIN == "y" || $PHPMYADMIN == "Y" ]]; then
  docker-compose -f $COMPOSE_FILE up -d $phpmyadmin

  echo -e "\n"

  echo "Phpmyadmin installed successfully."
fi