#!/bin/bash

set -e

APP_DIR="/var/www/nestjs-build"

echo "======================================"
echo "Starting NestJS application"
echo "======================================"

cd "$APP_DIR"

echo "Node version:"
node -v

echo "NPM version:"
npm -v

echo "PM2 version:"
pm2 -v

echo "Installing production dependencies..."

npm ci --omit=dev

echo "Starting NestJS..."

pm2 delete nestjs-build || true

pm2 start dist/main.js --name nestjs-build

pm2 save

echo "======================================"
echo "NestJS application started successfully"
echo "======================================"

pm2 status