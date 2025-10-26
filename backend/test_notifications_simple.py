#!/usr/bin/env python3
"""
Simple test script for sending email and SMS notifications.
This script tests the notification system with provided credentials.
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

# Email Configuration
import os

MAIL_USERNAME = os.getenv("MAIL_USERNAME", "crimeeye935@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "YOUR_GMAIL_APP_PASSWORD_HERE")
MAIL_FROM = os.getenv("MAIL_FROM", "crimeeye935@gmail.com")
MAIL_TO = os.getenv("MAIL_TO", "crimeeye935@gmail.com")  # Send to self for testing
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))

# SMS Configuration (Twilio - Optional)
ADMIN_PHONE = os.getenv("ADMIN_PHONE", "+917010132407")


def test_email_basic():
    """Test basic email sending without images."""
    try:
        logger.info("📧 Testing basic email notification...")

        # Create message
        msg = MIMEMultipart()
        msg["From"] = MAIL_FROM
        msg["To"] = MAIL_TO
        msg["Subject"] = "CrimeEye-Pro Test Alert - Basic Email"

        # Email body
        body = f"""
        🚨 CrimeEye-Pro Test Alert

        This is a test email from the CrimeEye-Pro surveillance system.

        Test Details:
        - Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        - Alert Type: Test Email
        - System Status: All systems operational

        If you receive this email, the email notification system is working correctly!

        ---
        CrimeEye-Pro Security System
        Automated Test Message
        """

        msg.attach(MIMEText(body, "plain"))

        # Connect to Gmail SMTP server
        logger.info("🔐 Connecting to Gmail SMTP server...")
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()  # Enable encryption

        # Login
        logger.info("🔑 Logging in to Gmail...")
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
            logger.warning("⚠️  Threat image not found, using placeholder text")
            return test_email_basic()

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
                <h2 style="color: #ff4444;">🚨 CrimeEye Security Alert</h2>

                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Alert Type:</strong> <span style="color: #ff4444; font-weight: bold;">HIGH THREAT TEST</span></p>
                    <p><strong>Camera:</strong> Test Camera</p>
                    <p><strong>Location:</strong> Test Location</p>
                    <p><strong>Message:</strong> TEST ALERT: High threat detected - Person with weapon</p>
                    <p><strong>Time:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")}</p>
                </div>

                <div style="margin: 20px 0;">
                    <h3>Threat Detection Image:</h3>
                    <p><em>See attached image for visual confirmation</em></p>
                </div>

                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    <em>This is a TEST alert from CrimeEye-Pro Security System.</em><br>
                    <em>Email notification system is working correctly!</em>
                </p>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_body, "html"))

        # Attach threat image
        with open(image_path, "rb") as f:
            img_data = f.read()
            image = MIMEImage(img_data)
            image.add_header(
                "Content-Disposition", "attachment", filename="threat_detection.jpg"
            )
            msg.attach(image)

        # Connect to Gmail SMTP server
        logger.info("🔐 Connecting to Gmail SMTP server...")
        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()

        # Login
        logger.info("🔑 Logging in to Gmail...")
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
    """Test SMS notification (requires Twilio credentials)."""
    try:
        logger.info("📱 Testing SMS notification...")

        # For SMS testing, we'd need Twilio credentials
        # This is a placeholder since Twilio credentials weren't provided
        logger.warning(
            "⚠️  SMS testing requires Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)"
        )
        logger.info("💡 To enable SMS notifications:")
        logger.info("   1. Sign up for Twilio account")
        logger.info("   2. Get Account SID and Auth Token")
        logger.info("   3. Get Twilio phone number")
        logger.info("   4. Add credentials to .env file")

        return False

    except Exception as e:
        logger.error(f"❌ Error testing SMS: {e}")
        return False


def main():
    """Main test function."""
    print("🚨 CrimeEye-Pro Notification Test (Simple)")
    print("=" * 50)
    print(f"📧 Email: {MAIL_USERNAME}")
    print(f"📱 Admin Phone: {ADMIN_PHONE}")
    print()

    # Test basic email
    print("🧪 Test 1: Basic Email Notification")
    email_basic_success = test_email_basic()
    print()

    # Test email with image
    print("🧪 Test 2: Email with Threat Image")
    email_image_success = test_email_with_image()
    print()

    # Test SMS (placeholder)
    print("🧪 Test 3: SMS Notification")
    sms_success = test_sms()
    print()

    # Summary
    print("📊 Test Results Summary:")
    print(f"  📧 Basic Email: {'✅ Success' if email_basic_success else '❌ Failed'}")
    print(
        f"  📧📷 Email + Image: {'✅ Success' if email_image_success else '❌ Failed'}"
    )
    print(f"  📱 SMS: {'✅ Success' if sms_success else '❌ Failed (No Twilio)'}")
    print()

    if email_basic_success or email_image_success:
        print("🎉 Email notifications are working!")
        print("💡 Check your inbox at crimeeye935@gmail.com")
    else:
        print("❌ Email notifications failed!")
        print("💡 Troubleshooting tips:")
        print("   • Check if password 'crimeeye935password' is correct")
        print("   • Verify Gmail account allows less secure apps or use App Password")
        print("   • Check internet connection")
        print("   • Verify Gmail SMTP settings")

    if not sms_success:
        print()
        print("📱 To enable SMS notifications:")
        print("   • Sign up for Twilio: https://twilio.com")
        print("   • Get Account SID, Auth Token, and phone number")
        print("   • Add to .env file in backend directory")


if __name__ == "__main__":
    main()
