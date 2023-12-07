#!/bin/bash

echo "🟡 Deploy backend application..."

set -e

echo "🟡 Pulling code"
git pull origin main --no-edit

if docker info -ne 0 >/dev/null 2>&1; then
  echo -e "${CYAN}Docker is not running."

  exit 1
fi