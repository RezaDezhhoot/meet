#!/bin/bash

set -e

echo "🟡 Deploying application..."
cd ./src

echo "🟡 Update code base"
git pull origin main

echo "Installing npm dependencies..."
docker-compose run --rm npm npm install

echo "Installing composer dependencies..."
docker-compose run --rm composer composer install

echo "Migrating..."
docker-compose run --rm artisan migrate

echo "🚀 Application deployed!"