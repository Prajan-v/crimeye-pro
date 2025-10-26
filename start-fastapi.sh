#!/bin/bash

echo "⚡ Starting FastAPI Backend..."
echo "=================================="

cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from env.example..."
    cp env.example .env
    echo "📝 Please edit .env file with your actual values"
    echo "   Especially: DATABASE_URL, MAIL_PASSWORD"
    read -p "Press Enter to continue after editing .env..."
fi

# Check if database is initialized
echo "🔍 Checking database..."
python -m app.cli init

echo "🚀 Starting FastAPI service on port 8000..."
python -m app.main

