#!/usr/bin/env python3
"""
Simple SMS test script for CrimeEye-Pro using Twilio.
Run this after purchasing a Twilio phone number.
"""

import os
import sys
from datetime import datetime
from twilio.rest import Client

# Twilio Configuration
import os

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "YOUR_ACCOUNT_SID_HERE")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "YOUR_AUTH_TOKEN_HERE")
TWILIO_PHONE_NUMBER = None  # Will auto-detect from account
RECIPIENT_PHONE = os.getenv(
    "ADMIN_PHONE", "+917010132407"
)  # Your verified phone number


def test_sms():
    """Test SMS notification using Twilio."""
    print("=" * 60)
    print("📱 CrimeEye-Pro SMS Notification Test")
    print("=" * 60)
    print(f"Account SID: {TWILIO_ACCOUNT_SID}")
    print(f"Recipient: {RECIPIENT_PHONE}")
    print("-" * 60)

    try:
        # Create Twilio client
        print("\n🔐 Connecting to Twilio...")
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        print("✅ Connected to Twilio successfully")

        # Get Twilio phone number from account
        print("\n📞 Getting your Twilio phone number...")
        incoming_numbers = client.incoming_phone_numbers.list(limit=1)

        if not incoming_numbers:
            print("\n❌ ERROR: No Twilio phone number found!")
            print("\n📱 To purchase a Twilio phone number:")
            print("   1. Go to: https://console.twilio.com/")
            print("   2. Click 'Phone Numbers' → 'Buy a number'")
            print("   3. Select a number with SMS capability")
            print("   4. Purchase the number ($1-2/month)")
            print("   5. Run this test again")
            return False

        twilio_phone = incoming_numbers[0].phone_number
        print(f"✅ Found Twilio number: {twilio_phone}")

        # Prepare test message
        message_body = f"""
🚨 CrimeEye-Pro TEST Alert

HIGH THREAT DETECTED
Camera: Test Camera
Location: Main Entrance
Detection: Person with weapon
Confidence: 85%
Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

Action Required: Check live feed immediately

This is a TEST message.
Your SMS notifications are working!

- CrimeEye Security System
        """.strip()

        # Send SMS
        print(f"\n📤 Sending SMS to {RECIPIENT_PHONE}...")
        print("Message preview:")
        print("-" * 40)
        print(message_body[:200] + "...")
        print("-" * 40)

        message = client.messages.create(
            body=message_body, from_=twilio_phone, to=RECIPIENT_PHONE
        )

        print(f"\n✅ SMS SENT SUCCESSFULLY!")
        print(f"Message SID: {message.sid}")
        print(f"Status: {message.status}")
        print(
            f"Price: {message.price} {message.price_unit if message.price_unit else 'USD'}"
        )
        print(f"\n📱 Check your phone ({RECIPIENT_PHONE}) for the test message!")

        return True

    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ ERROR: {error_msg}")

        # Provide specific troubleshooting based on error
        if "geographic" in error_msg.lower() or "permission" in error_msg.lower():
            print("\n💡 Fix: Enable SMS to India")
            print(
                "   1. Go to: https://console.twilio.com/us1/develop/sms/settings/geo-permissions"
            )
            print("   2. Enable 'India' in the list")
            print("   3. Save changes and try again")

        elif "unverified" in error_msg.lower():
            print("\n💡 Fix: Number verification needed")
            print(
                "   Your number appears unverified. This is strange since we can see it in the console."
            )
            print("   Try removing and re-adding it.")

        elif "authenticate" in error_msg.lower() or "401" in error_msg:
            print("\n💡 Fix: Authentication issue")
            print("   Double-check your Account SID and Auth Token")
            print("   Get them from: https://console.twilio.com/")

        elif "phone number" in error_msg.lower():
            print("\n💡 Fix: Purchase a phone number")
            print("   You need to buy a Twilio phone number first")
            print("   Go to: Phone Numbers → Buy a number")

        return False


def main():
    """Main function."""
    print("\n🚀 Starting SMS Test...\n")

    # Check if Twilio library is installed
    try:
        import twilio

        print(f"✅ Twilio library version: {twilio.__version__}")
    except ImportError:
        print("❌ Twilio library not installed!")
        print("Run: pip install twilio")
        sys.exit(1)

    # Run SMS test
    success = test_sms()

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    if success:
        print("✅ SMS NOTIFICATIONS ARE WORKING!")
        print("\nYour CrimeEye-Pro system can now send SMS alerts for:")
        print("  • High threat detections (weapons)")
        print("  • Critical security events")
        print("  • System alerts")
        print("\nSMS alerts will be sent to: " + RECIPIENT_PHONE)

        print("\n📝 To activate SMS in production:")
        print("  1. Update your .env file with Twilio credentials")
        print("  2. Restart the FastAPI backend")
        print("  3. SMS will be sent automatically for threats")
    else:
        print("❌ SMS TEST FAILED")
        print("\nPlease resolve the issues above and try again.")
        print("Most common issue: No Twilio phone number purchased")

    print("\n" + "=" * 60)
    print()


if __name__ == "__main__":
    main()
