#!/bin/bash

set -e

APP_DIR="/var/www/nestjs-build"

echo "Starting NestJS application..."

cd $APP_DIR

npm install --omit=dev

npx prisma generate

npm run build

pm2 start dist/main.js --name nestjs-build

pm2 save

echo "NestJS application started successfully."
