#!/bin/bash

SLEEP_VAL=3

echo "🟡 Deploy backend application..."

set -e

# shellcheck disable=SC2034
read -r -p 'Install specified service? (admin,backend,frontend): ' SPECIFIED_SERVICE

echo "🟡 Pulling code"
git pull origin main --no-edit

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi

echo -e "\n"

if [ -z "$SPECIFIED_SERVICE" ]; then
  echo "Backend Deployer"
  bash ./scripts/backend/deployer.sh

  sleep $SLEEP_VAL

  echo "Frontend Deployer"
  bash ./scripts/client/deployer.sh

  sleep $SLEEP_VAL

  echo "Admin Deployer"
  bash  ./scripts/admin/deployer.sh
else
  echo "$SPECIFIED_SERVICE" "Deployer"
  bash ./scripts/"$SPECIFIED_SERVICE"/deployer.sh
fi