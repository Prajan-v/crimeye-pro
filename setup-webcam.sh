#!/bin/bash

echo "🎥 CrimeEye-Pro Mac Webcam Setup"
echo "================================="
echo ""

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg not found. Installing..."
    brew install ffmpeg
fi

echo "✅ FFmpeg is installed"
echo ""

# List available video devices
echo "📹 Available video devices:"
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -A 20 "AVFoundation video devices"
echo ""

echo "🔧 Webcam Setup Options:"
echo ""
echo "1. 🚀 Quick Test (Recommended)"
echo "   Use this RTSP URL in your CrimeEye-Pro settings:"
echo "   rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4"
echo ""
echo "2. 📱 Mac Webcam Stream (Advanced)"
echo "   Run this command to stream your Mac webcam:"
echo "   ffmpeg -f avfoundation -i \"0\" -c:v libx264 -preset ultrafast -f rtsp rtsp://localhost:8554/webcam"
echo ""
echo "3. 🌐 HTTP Stream (Easier)"
echo "   Run this command for HTTP streaming:"
echo "   ffmpeg -f avfoundation -i \"0\" -c:v libx264 -preset ultrafast -f mpegts http://localhost:8080/webcam"
echo ""

echo "📋 Instructions:"
echo "1. Go to CrimeEye-Pro Settings → Cameras"
echo "2. Click 'Add Camera'"
echo "3. Enter camera details:"
echo "   - Name: Mac Webcam"
echo "   - RTSP URL: [Choose one from above]"
echo "   - Location: Desktop"
echo "4. Click 'Test Connection'"
echo "5. Save the camera"
echo ""

echo "🎯 For immediate testing, use the Quick Test option!"
echo ""

# Ask if user wants to start a webcam stream
read -p "Do you want to start streaming your Mac webcam now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting Mac webcam stream..."
    echo "Press Ctrl+C to stop"
    echo ""
    ffmpeg -f avfoundation -i "0" -c:v libx264 -preset ultrafast -f rtsp rtsp://localhost:8554/webcam
else
    echo "Setup complete! Use the instructions above to add your camera."
fi

