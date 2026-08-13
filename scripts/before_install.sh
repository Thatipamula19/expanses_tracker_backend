#!/bin/bash

set -e

APP_DIR="/var/www/nestjs-build"

echo "Preparing application directory..."

mkdir -p "$APP_DIR"

chown -R ec2-user:ec2-user "$APP_DIR"

echo "Directory ready."