#!/bin/bash

# This script prepares the project for deployment
# Run this script after building but before deploying

echo "Preparing project for deployment..."
echo "====================================="

# Create dist directory if it doesn't exist
if [ ! -d "dist" ]; then
  echo "Creating dist directory..."
  mkdir -p dist
fi

# Copy uploads directory
if [ -d "uploads" ]; then
  echo "Copying uploads directory to dist..."
  mkdir -p dist/uploads
  cp -r uploads/* dist/uploads/
  echo "✓ Uploads directory copied!"
else
  echo "⚠️ Uploads directory not found"
fi

# Copy data directory
if [ -d "data" ]; then
  echo "Copying data directory to dist..."
  mkdir -p dist/data
  cp -r data/* dist/data/
  echo "✓ Data directory copied!"
else
  echo "⚠️ Data directory not found"
fi

echo "====================================="
echo "Deployment preparation complete!"
echo "Your project is now ready for deployment"