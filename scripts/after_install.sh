#!/bin/bash

set -e

APP_DIR="/var/www/nestjs-api"

echo "Installing production dependencies..."

cd $APP_DIR

npm ci --omit=dev

echo "Generating Prisma Client..."

npx prisma generate

echo "Running Prisma migrations..."

npx prisma migrate deploy

echo "AfterInstall completed successfully"
