#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting build process..."

# Setup Python virtual environment for building
echo "📦 Setting up Python build environment..."
python3 -m venv build_venv
source build_venv/bin/activate
pip install pyinstaller

# Create dist directory if it doesn't exist
mkdir -p dist

# Build Python API
echo "📦 Building Python API..."
cd api
pip install -r requirements.txt
pyinstaller --clean --onefile --name api main.py
mv dist/api ../dist/api
cd ..

# Cleanup Python build environment
deactivate
rm -rf build_venv

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install

# Build Electron app
echo "🏗️ Building Electron app..."
npm run make

echo "✅ Build complete!" 