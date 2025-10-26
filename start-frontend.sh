#!/bin/bash

echo "🎨 Starting React Frontend..."
echo "=================================="

cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

echo "🚀 Starting React app on port 3000..."
npm start

