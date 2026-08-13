#!/bin/bash

echo "Checking PM2 application..."

pm2 status

if pm2 describe nestjs-build > /dev/null 2>&1; then
    echo "NestJS application is running."
    exit 0
else
    echo "NestJS application is NOT running."
    exit 1
fi
