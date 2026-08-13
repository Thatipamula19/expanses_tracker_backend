#!/bin/bash

set -e

APP_DIR="/var/www/nestjs-build"

cd "$APP_DIR"

npm ci --omit=dev

npx prisma generate

pm2 delete nestjs-build || true

pm2 start dist/main.js --name nestjs-build

pm2 save

echo "NestJS application started"
