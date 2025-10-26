#!/bin/bash

echo "🟢 Starting Node.js Backend..."
echo "=================================="

cd "$(dirname "$0")/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🚀 Starting Node.js service on port 5001..."
npm start

