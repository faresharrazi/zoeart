#!/bin/bash

# Aether Art Space - Startup Script
echo "🚀 Starting Aether Art Space..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if config.js exists
if [ ! -f "config.js" ]; then
    echo "⚠️  config.js not found. Please copy config.example.js to config.js and update with your database credentials."
    exit 1
fi

# Start the server
echo "🎨 Starting Aether Art Space server..."
node server.cjs
