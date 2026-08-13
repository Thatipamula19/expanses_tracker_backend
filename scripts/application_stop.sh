#!/bin/bash

echo "Stopping NestJS application..."

pm2 stop nestjs-build || true

echo "Application stopped."
