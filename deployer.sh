#!/bin/bash

SLEEP_VAL=3

echo "🟡 Deploy backend application..."

set -e

echo "🟡 Pulling code"
git pull origin main --no-edit

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

echo -e "\n"

if [ -z "$1" ]; then
  echo "Admin Deployer"
  bash  ./scripts/admin/deployer.sh

  sleep $SLEEP_VAL

  echo "Backend Deployer"
  bash ./scripts/backend/deployer.sh

  sleep $SLEEP_VAL

  echo "Frontend Deployer"
  bash ./scripts/client/deployer.sh
else
  echo "$1" "Deployer"
  bash ./scripts/"$1"/deployer.sh
fi