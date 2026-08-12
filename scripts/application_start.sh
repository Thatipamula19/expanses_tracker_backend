#!/bin/bash

set -e

APP_DIR="/var/www/nestjs-api"

cd $APP_DIR

echo "Starting NestJS application..."

pm2 start dist/main.js \
  --name nestjs-api \
  --update-env

pm2 save

echo "NestJS application started successfully"
