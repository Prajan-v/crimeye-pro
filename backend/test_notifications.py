#!/usr/bin/env python3
"""
Test script for sending email and SMS notifications with threat images.
This script simulates a threat detection and sends notifications.
"""

import asyncio
import os
import sys
from datetime import datetime
from uuid import uuid4
from pathlib import Path

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import AsyncSessionLocal
from app.models.detection_frame import DetectionFrame
from app.models.camera import Camera
from app.models.alert import Alert
from app.services.notification_service import notification_service
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_test_detection():
    """Create a test detection frame for notification testing."""
    async with AsyncSessionLocal() as session:
        try:
            # Get or create a test camera
            from sqlalchemy import select
            camera_result = await session.execute(
                select(Camera).where(Camera.name == "Test Camera")
            )
            camera = camera_result.scalar_one_or_none()
            
            if not camera:
                # Create a test camera
                camera = Camera(
                    name="Test Camera",
                    rtsp_url="rtsp://test.example.com/stream",
                    location="Test Location",
                    status="online",
                    is_system_camera=False
                )
                session.add(camera)
                await session.flush()  # Get the ID
                logger.info("✅ Created test camera")
            
            # Create a test detection frame
            frame_id = uuid4()
            
            # Read the threat image as binary data
            threat_image_path = "captured_frames/threat_1760248816641.jpg"
            with open(threat_image_path, 'rb') as f:
                frame_data = f.read()
            
            detection_frame = DetectionFrame(
                id=frame_id,
                camera_id=camera.id,
                frame_data=frame_data,  # Binary frame data
                detections=[  # JSON array of detections
                    {
                        "class": "person",
                        "confidence": 0.85,
                        "bbox": [100, 100, 200, 300]
                    },
                    {
                        "class": "knife", 
                        "confidence": 0.75,
                        "bbox": [150, 200, 180, 250]
                    }
                ],
                threat_level="high",
                timestamp=datetime.utcnow()
            )
            
            session.add(detection_frame)
            await session.commit()
            
            logger.info(f"✅ Created test detection frame: {frame_id}")
            return frame_id
            
        except Exception as e:
            logger.error(f"❌ Error creating test detection: {e}")
            await session.rollback()
            return None

async def test_email_notification(frame_id):
    """Test email notification with threat image."""
    try:
        logger.info("📧 Testing email notification...")
        
        # Check if email is configured
        if not settings.MAIL_PASSWORD or settings.MAIL_PASSWORD == "":
            logger.warning("⚠️  Email password not configured. Please set MAIL_PASSWORD in .env")
            return False
        
        # Send email alert
        success = await notification_service.send_alert(
            alert_type="test_threat",
            frame_id=frame_id,
            message="TEST ALERT: High threat detected - Person with weapon",
            sent_via="email"
        )
        
        if success:
            logger.info("✅ Email notification sent successfully!")
            return True
        else:
            logger.error("❌ Failed to send email notification")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error testing email notification: {e}")
        return False

async def test_sms_notification(frame_id):
    """Test SMS notification."""
    try:
        logger.info("📱 Testing SMS notification...")
        
        # Check if SMS is configured
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("⚠️  Twilio not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env")
            return False
        
        # Send SMS alert
        success = await notification_service.send_alert(
            alert_type="test_threat",
            frame_id=frame_id,
            message="TEST ALERT: High threat detected - Person with weapon",
            sent_via="sms"
        )
        
        if success:
            logger.info("✅ SMS notification sent successfully!")
            return True
        else:
            logger.error("❌ Failed to send SMS notification")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error testing SMS notification: {e}")
        return False

async def test_both_notifications(frame_id):
    """Test both email and SMS notifications."""
    try:
        logger.info("📧📱 Testing both email and SMS notifications...")
        
        # Send both email and SMS alerts
        success = await notification_service.send_alert(
            alert_type="test_threat",
            frame_id=frame_id,
            message="TEST ALERT: High threat detected - Person with weapon",
            sent_via="both"
        )
        
        if success:
            logger.info("✅ Both email and SMS notifications sent successfully!")
            return True
        else:
            logger.error("❌ Failed to send notifications")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error testing notifications: {e}")
        return False

async def main():
    """Main test function."""
    print("🚨 CrimeEye-Pro Notification Test")
    print("=" * 50)
    
    # Check configuration
    print(f"📧 Email configured: {'✅' if settings.MAIL_PASSWORD else '❌'}")
    print(f"📱 SMS configured: {'✅' if settings.TWILIO_ACCOUNT_SID else '❌'}")
    print()
    
    # Create test detection
    print("🔍 Creating test detection...")
    frame_id = await create_test_detection()
    
    if not frame_id:
        print("❌ Failed to create test detection. Exiting.")
        return
    
    print(f"✅ Test detection created: {frame_id}")
    print()
    
    # Test notifications
    print("🧪 Testing notifications...")
    
    # Test email only
    email_success = await test_email_notification(frame_id)
    print()
    
    # Test SMS only
    sms_success = await test_sms_notification(frame_id)
    print()
    
    # Test both
    both_success = await test_both_notifications(frame_id)
    print()
    
    # Summary
    print("📊 Test Results Summary:")
    print(f"  📧 Email: {'✅ Success' if email_success else '❌ Failed'}")
    print(f"  📱 SMS: {'✅ Success' if sms_success else '❌ Failed'}")
    print(f"  📧📱 Both: {'✅ Success' if both_success else '❌ Failed'}")
    
    if not email_success and not sms_success:
        print("\n💡 Configuration Tips:")
        print("  📧 For email: Set MAIL_PASSWORD in .env (Gmail App Password)")
        print("  📱 For SMS: Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env")
        print("  📚 See README.md for detailed setup instructions")

if __name__ == "__main__":
    asyncio.run(main())
