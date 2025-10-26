#!/usr/bin/env python3
"""
Test script for sending email and SMS notifications with provided credentials.
"""

import asyncio
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email Configuration (Gmail with App Password)
import os

MAIL_USERNAME = os.getenv("MAIL_USERNAME", "crimeeye935@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "YOUR_GMAIL_APP_PASSWORD_HERE")
MAIL_FROM = os.getenv("MAIL_FROM", "crimeeye935@gmail.com")
MAIL_TO = os.getenv("MAIL_TO", "crimeeye935@gmail.com")  # Send to self for testing
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "YOUR_ACCOUNT_SID_HERE")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "YOUR_AUTH_TOKEN_HERE")
TWILIO_PHONE_NUMBER = None  # Will need to get this from Twilio console
ADMIN_PHONE = os.getenv(
    "ADMIN_PHONE", "+917010132407"
)  # Your phone number to receive SMS


def test_email_basic():
    """Test basic email sending."""
    try:
        logger.info("📧 Testing basic email notification...")

        # Create message
        msg = MIMEMultipart()
        msg["From"] = MAIL_FROM
        msg["To"] = MAIL_TO
        msg["Subject"] = "✅ CrimeEye-Pro Test Alert - Email Working!"

        # Email body
        body = f"""
        🚨 CrimeEye-Pro Test Alert

        ✅ EMAIL NOTIFICATION SYSTEM IS WORKING!

        This is a test email from the CrimeEye-Pro surveillance system.

        Test Details:
        - Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        - Alert Type: Test Email
        - System Status: All systems operational
        - Email Service: Gmail SMTP

        Your email notification system is configured correctly and working!

        ---
        CrimeEye-Pro Security System
        Automated Test Message
        """

        msg.attach(MIMEText(body, "plain"))

        # Connect to Gmail SMTP server
        logger.info("🔐 Connecting to Gmail SMTP server...")
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()  # Enable encryption

        # Login with App Password
        logger.info("🔑 Logging in with Gmail App Password...")
        server.login(MAIL_USERNAME, MAIL_PASSWORD)

        # Send email
        logger.info("📤 Sending test email...")
        text = msg.as_string()
        server.sendmail(MAIL_FROM, MAIL_TO, text)
        server.quit()

        logger.info("✅ Basic email sent successfully!")
        return True

    except Exception as e:
        logger.error(f"❌ Error sending basic email: {e}")
        return False


def test_email_with_image():
    """Test email with threat image attachment."""
    try:
        logger.info("📧📷 Testing email with threat image...")

        # Check if threat image exists
        image_path = "captured_frames/threat_1760248816641.jpg"
        if not os.path.exists(image_path):
            logger.warning("⚠️  Threat image not found, sending without image")
            image_path = None

        # Create message
        msg = MIMEMultipart()
        msg["From"] = MAIL_FROM
        msg["To"] = MAIL_TO
        msg["Subject"] = "🚨 CrimeEye-Pro HIGH THREAT ALERT - Test with Image"

        # HTML email body
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ff4444;">🚨 CrimeEye Security Alert - TEST</h2>

                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold;">⚠️ This is a TEST alert</p>
                </div>

                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Alert Type:</strong> <span style="color: #ff4444; font-weight: bold;">HIGH THREAT TEST</span></p>
                    <p><strong>Camera:</strong> Test Camera</p>
                    <p><strong>Location:</strong> Main Entrance</p>
                    <p><strong>Detection:</strong> Person with weapon detected</p>
                    <p><strong>Confidence:</strong> 85%</p>
                    <p><strong>Time:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")}</p>
                </div>

                <div style="margin: 20px 0;">
                    <h3>Actions Taken:</h3>
                    <ul>
                        <li>✅ Alert sent to security team</li>
                        <li>✅ Recording saved to database</li>
                        <li>✅ Live monitoring activated</li>
                    </ul>
                </div>

                {f'<div style="margin: 20px 0;"><h3>Threat Detection Image:</h3><p><em>See attached image for visual confirmation</em></p></div>' if image_path else ""}

                <hr style="margin: 30px 0;">
                <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px;">
                    <p style="margin: 0; color: #155724;">
                        <strong>✅ Email System Status: WORKING</strong><br>
                        Your email notifications are configured correctly!
                    </p>
                </div>

                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    <em>This is a TEST alert from CrimeEye-Pro Security System.</em><br>
                    <em>In a real alert, immediate action would be required.</em>
                </p>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_body, "html"))

        # Attach threat image if it exists
        if image_path and os.path.exists(image_path):
            with open(image_path, "rb") as f:
                img_data = f.read()
                image = MIMEImage(img_data)
                image.add_header(
                    "Content-Disposition", "attachment", filename="threat_detection.jpg"
                )
                msg.attach(image)
                logger.info("📷 Threat image attached")

        # Connect to Gmail SMTP server
        logger.info("🔐 Connecting to Gmail SMTP server...")
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()

        # Login with App Password
        logger.info("🔑 Logging in with Gmail App Password...")
        server.login(MAIL_USERNAME, MAIL_PASSWORD)

        # Send email
        logger.info("📤 Sending email with threat image...")
        server.sendmail(MAIL_FROM, MAIL_TO, msg.as_string())
        server.quit()

        logger.info("✅ Email with threat image sent successfully!")
        return True

    except Exception as e:
        logger.error(f"❌ Error sending email with image: {e}")
        return False


def test_sms():
    """Test SMS notification using Twilio."""
    try:
        logger.info("📱 Testing SMS notification with Twilio...")

        # Import Twilio client
        try:
            from twilio.rest import Client
        except ImportError:
            logger.error("❌ Twilio library not installed. Run: pip install twilio")
            return False

        # Create Twilio client with correct credentials
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        # Try to get the first phone number from the account
        try:
            logger.info("📞 Getting Twilio phone number from account...")
            incoming_phone_numbers = client.incoming_phone_numbers.list(limit=1)

            if incoming_phone_numbers:
                twilio_from_number = incoming_phone_numbers[0].phone_number
                logger.info(f"✅ Found Twilio phone number: {twilio_from_number}")
            else:
                logger.error("❌ No Twilio phone numbers found in account")
                logger.info("💡 You need to purchase a phone number from Twilio:")
                logger.info("   1. Visit: https://console.twilio.com/")
                logger.info("   2. Go to Phone Numbers → Buy a Number")
                logger.info("   3. Select a number with SMS capability")
                logger.info("   4. Purchase the number ($1-2/month)")
                return False

        except Exception as e:
            error_str = str(e)
            if "geographic permission" in error_str.lower():
                logger.error("❌ Geographic permission error")
                logger.info("💡 To fix this:")
                logger.info(
                    "   1. Go to: https://console.twilio.com/us1/develop/sms/settings/geo-permissions"
                )
                logger.info("   2. Enable 'India' in the SMS Geographic Permissions")
                logger.info("   3. Save changes and try again")
                return False
            else:
                logger.error(f"❌ Error getting Twilio phone number: {e}")
                return False

        # Create SMS message
        message_body = f"""
🚨 CrimeEye Alert - TEST

HIGH THREAT DETECTED
Location: Main Entrance
Detection: Person with weapon
Time: {datetime.now().strftime("%H:%M:%S")}

This is a TEST message.
SMS notifications are WORKING!

- CrimeEye Security
        """

        logger.info(f"📤 Sending SMS to {ADMIN_PHONE}...")

        # Send SMS
        try:
            message = client.messages.create(
                body=message_body.strip(), from_=twilio_from_number, to=ADMIN_PHONE
            )

            logger.info(f"✅ SMS sent successfully! Message SID: {message.sid}")
            logger.info(f"📱 Check your phone ({ADMIN_PHONE}) for the test message")
            return True

        except Exception as e:
            error_str = str(e)
            if "geographic" in error_str.lower() or "permission" in error_str.lower():
                logger.error("❌ SMS failed: Geographic permissions issue")
                logger.info("💡 To enable SMS to India (+91):")
                logger.info(
                    "   1. Go to: https://console.twilio.com/us1/develop/sms/settings/geo-permissions"
                )
                logger.info("   2. Check/Enable 'India' in the list")
                logger.info("   3. Save changes")
                logger.info("   4. Wait a few minutes and try again")
            elif "unverified" in error_str.lower():
                logger.error("❌ SMS failed: Phone number not verified")
                logger.info(
                    "💡 For trial accounts, you need to verify the recipient number:"
                )
                logger.info(
                    "   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
                )
                logger.info(f"   2. Add and verify: {ADMIN_PHONE}")
                logger.info("   3. Complete the verification process")
                logger.info("   4. Try sending SMS again")
            else:
                logger.error(f"❌ Error sending SMS: {e}")
            return False

    except Exception as e:
        logger.error(f"❌ Error in SMS test: {e}")
        return False


def update_env_file():
    """Update the .env file with the provided credentials."""
    try:
        logger.info("📝 Creating updated .env file with credentials...")

        # Get Twilio phone number if available
        twilio_phone = "YOUR_TWILIO_PHONE_HERE"
        try:
            from twilio.rest import Client

            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            numbers = client.incoming_phone_numbers.list(limit=1)
            if numbers:
                twilio_phone = numbers[0].phone_number
        except:
            pass

        env_content = f"""# Database Configuration
DATABASE_URL=postgresql://prajanv@localhost:5432/crimeye_db

# JWT Configuration
SECRET_KEY=crimeye-pro-secret-key-2024-secure-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Email Configuration (Gmail with App Password)
MAIL_USERNAME=crimeeye935@gmail.com
MAIL_PASSWORD=cwbubohyywsznqpn
MAIL_FROM=crimeeye935@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_TLS=true
MAIL_SSL=false

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID={TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN={TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER={twilio_phone}
ADMIN_PHONE={ADMIN_PHONE}

# Redis Configuration
REDIS_URL=redis://localhost:6379

# YOLO Configuration
YOLO_SERVICE_URL=http://localhost:5002
YOLO_CONFIDENCE_THRESHOLD=0.4
YOLO_FPS=10

# Frame Retention
FRAME_RETENTION_DAYS=30

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
LOGIN_ATTEMPTS_LIMIT=5
LOGIN_ATTEMPTS_WINDOW=900

# Server Ports
FASTAPI_PORT=8000
NODEJS_PORT=5001
YOLO_PORT=5002

# Default Webcam Configuration
ENABLE_DEFAULT_WEBCAM=true
DEFAULT_WEBCAM_NAME=Mac Webcam
DEFAULT_WEBCAM_RTSP_URL=rtsp://localhost:8554/demo
DEFAULT_WEBCAM_LOCATION=Demo Room
WEBCAM_DEVICE_ID=0
WEBCAM_RTSP_PORT=8554
"""

        with open(".env.updated", "w") as f:
            f.write(env_content)

        logger.info("✅ Created .env.updated file with all credentials")
        return True

    except Exception as e:
        logger.error(f"❌ Error updating env file: {e}")
        return False


def main():
    """Main test function."""
    print("\n" + "=" * 60)
    print("🚨 CrimeEye-Pro Notification Test - Complete Setup")
    print("=" * 60)
    print(f"📧 Email: {MAIL_USERNAME}")
    print(f"🔑 Gmail App Password: ****{MAIL_PASSWORD[-4:]}")
    print(f"📱 Twilio Account SID: {TWILIO_ACCOUNT_SID}")
    print(f"🔐 Twilio Auth Token: {TWILIO_AUTH_TOKEN[:5]}...")
    print(f"📞 Admin Phone: {ADMIN_PHONE}")
    print("=" * 60 + "\n")

    # Update env file
    print("📝 Step 1: Updating Environment Configuration")
    print("-" * 40)
    update_env_file()
    print()

    # Test basic email
    print("📧 Step 2: Testing Basic Email")
    print("-" * 40)
    email_basic_success = test_email_basic()
    print()

    # Test email with image
    print("📧 Step 3: Testing Email with Threat Image")
    print("-" * 40)
    email_image_success = test_email_with_image()
    print()

    # Test SMS
    print("📱 Step 4: Testing SMS Notification")
    print("-" * 40)
    sms_success = test_sms()
    print()

    # Summary
    print("=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(
        f"  📧 Basic Email:    {'✅ SUCCESS' if email_basic_success else '❌ FAILED'}"
    )
    print(
        f"  📧 Email + Image:  {'✅ SUCCESS' if email_image_success else '❌ FAILED'}"
    )
    print(f"  📱 SMS (Twilio):   {'✅ SUCCESS' if sms_success else '❌ FAILED'}")
    print("=" * 60)

    if email_basic_success or email_image_success:
        print("\n🎉 EMAIL NOTIFICATIONS ARE WORKING!")
        print("✅ Check your inbox at: crimeeye935@gmail.com")
        print("✅ Emails will be sent automatically for high-threat detections")

    if sms_success:
        print("\n🎉 SMS NOTIFICATIONS ARE WORKING!")
        print(f"✅ SMS messages will be sent to: {ADMIN_PHONE}")
        print("✅ SMS will be triggered for critical threats")
    else:
        print("\n⚠️  SMS Setup Requirements:")
        print("   1. Purchase a Twilio phone number ($1-2/month)")
        print("   2. Enable SMS Geographic Permissions for India")
        print("   3. For trial account: Verify recipient phone number")
        print("   Visit: https://console.twilio.com/")

    print("\n💡 Next Steps:")
    if email_basic_success or email_image_success:
        print("   1. ✅ Rename .env.updated to .env to apply credentials")
        print("      Command: mv .env.updated .env")
        print("   2. ✅ Restart FastAPI backend to use new settings")
        print("      Command: python -m app.main")
        print("   3. ✅ High-threat detections will trigger email alerts automatically")

    if not sms_success:
        print("\n   For SMS notifications:")
        print("   • Purchase Twilio phone number")
        print("   • Enable geographic permissions for India")
        print("   • Add phone number to .env file")

    print("\n🔍 Testing Complete!")
    print()


if __name__ == "__main__":
    main()
