#!/bin/bash

set -e

APP_DIR="/var/www/nestjs-build"

cd "$APP_DIR"

echo "Node version:"
node -v

echo "NPM version:"
npm -v

echo "Installing production dependencies..."

npm ci --omit=dev

echo "Starting NestJS..."

pm2 delete nestjs-build || true

pm2 start dist/main.js \
  --name nestjs-build

pm2 save

echo "Application started successfully."

pm2 status