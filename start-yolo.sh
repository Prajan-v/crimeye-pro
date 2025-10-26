#!/bin/bash

echo "🎯 Starting YOLO Detection Service..."
echo "=================================="

cd "$(dirname "$0")/yolo-service"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if YOLO model exists
if [ ! -f "yolov8n.pt" ]; then
    echo "📥 Downloading YOLOv8n model..."
fi

echo "🚀 Starting YOLO service on port 5002..."
python app.py

