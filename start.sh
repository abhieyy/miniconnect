#!/bin/bash
set -e

echo "Installing dependencies..."
cd /home/runner/miniconnect/server
npm install --production

echo "Starting server..."
npm start
