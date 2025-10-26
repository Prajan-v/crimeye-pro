import asyncio
import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from twilio.rest import Client as TwilioClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.alert import Alert
from app.models.detection_frame import DetectionFrame
from app.models.camera import Camera
import logging

logger = logging.getLogger(__name__)

# Email configuration
mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_TLS,
    MAIL_SSL_TLS=not settings.MAIL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fastmail = FastMail(mail_config)

# Twilio client (if configured)
twilio_client = None
if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
    twilio_client = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

class NotificationService:
    """Service for sending email and SMS notifications."""
    
    async def send_alert(
        self,
        alert_type: str,
        frame_id: UUID,
        message: str,
        sent_via: str = "both"
    ) -> bool:
        """Send alert notification via email and/or SMS."""
        try:
            # Get frame and camera information
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(DetectionFrame, Camera)
                    .join(Camera, DetectionFrame.camera_id == Camera.id)
                    .where(DetectionFrame.id == frame_id)
                )
                frame_data = result.first()
                
                if not frame_data:
                    logger.error(f"Frame {frame_id} not found")
                    return False
                
                frame, camera = frame_data
                
                # Create alert record
                alert = Alert(
                    frame_id=frame_id,
                    alert_type=alert_type,
                    message=message,
                    sent_via=sent_via,
                    sent_at=datetime.utcnow(),
                    acknowledged=False
                )
                db.add(alert)
                await db.commit()
                
                # Send notifications
                success = True
                
                if sent_via in ["email", "both"]:
                    email_success = await self._send_email_alert(
                        camera_name=camera.name,
                        location=camera.location,
                        threat_level=frame.threat_level,
                        message=message,
                        timestamp=frame.timestamp,
                        frame_data=frame.frame_data
                    )
                    success = success and email_success
                
                if sent_via in ["sms", "both"] and twilio_client:
                    sms_success = await self._send_sms_alert(
                        message=f"CrimeEye Alert: {message} at {camera.name}"
                    )
                    success = success and sms_success
                
                return success
                
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
            return False
    
    async def _send_email_alert(
        self,
        camera_name: str,
        location: Optional[str],
        threat_level: str,
        message: str,
        timestamp: datetime,
        frame_data: Optional[bytes] = None
    ) -> bool:
        """Send email alert with threat image."""
        try:
            subject = f"CrimeEye Alert - {threat_level.upper()} Threat Detected"
            
            # Check if threat image data exists
            image_html = ""
            if frame_data:
                # Save frame data to temporary file for email attachment
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    temp_file.write(frame_data)
                    temp_path = temp_file.name
                
                # Convert to absolute path for email attachment
                abs_frame_path = os.path.abspath(temp_path)
                image_html = f"""
                <div style="margin: 20px 0;">
                    <h3>Threat Detection Image:</h3>
                    <img src="file://{abs_frame_path}" alt="Threat Detection" style="max-width: 100%; height: auto; border: 2px solid #ff4444;">
                    <p><em>Image captured at {timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}</em></p>
                </div>
                """
                
                # Clean up temp file after email is sent
                try:
                    os.unlink(temp_path)
                except:
                    pass
            
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #ff4444;">🚨 CrimeEye Security Alert</h2>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Threat Level:</strong> <span style="color: #ff4444; font-weight: bold;">{threat_level.upper()}</span></p>
                        <p><strong>Camera:</strong> {camera_name}</p>
                        <p><strong>Location:</strong> {location or 'Unknown'}</p>
                        <p><strong>Message:</strong> {message}</p>
                        <p><strong>Time:</strong> {timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                    </div>
                    
                    {image_html}
                    
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        <em>This is an automated alert from CrimeEye-Pro Security System.</em><br>
                        <em>Please review this alert and take appropriate action if necessary.</em>
                    </p>
                </div>
            </body>
            </html>
            """
            
            email_message = MessageSchema(
                subject=subject,
                recipients=[settings.MAIL_FROM],  # Send to admin email
                body=body,
                subtype="html"
            )
            
            await fastmail.send_message(email_message)
            logger.info("Email alert sent successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email alert: {e}")
            return False
    
    async def _send_sms_alert(self, message: str) -> bool:
        """Send SMS alert via Twilio."""
        try:
            if not twilio_client:
                logger.warning("Twilio not configured, skipping SMS")
                return False
            
            message_obj = twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=settings.ADMIN_PHONE
            )
            
            logger.info(f"SMS alert sent: {message_obj.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending SMS alert: {e}")
            return False
    
    async def send_daily_summary(self, summary_data: dict) -> bool:
        """Send daily summary report."""
        try:
            subject = f"CrimeEye Daily Summary - {summary_data.get('date', 'Unknown')}"
            
            body = f"""
            <html>
            <body>
                <h2>📊 CrimeEye Daily Summary</h2>
                <p><strong>Date:</strong> {summary_data.get('date', 'Unknown')}</p>
                <p><strong>Total Detections:</strong> {summary_data.get('total_detections', 0)}</p>
                <p><strong>High Threat:</strong> {summary_data.get('high_threat', 0)}</p>
                <p><strong>Medium Threat:</strong> {summary_data.get('medium_threat', 0)}</p>
                <p><strong>Low Threat:</strong> {summary_data.get('low_threat', 0)}</p>
                <p><strong>Active Cameras:</strong> {summary_data.get('active_cameras', 0)}</p>
                <hr>
                <p><em>This is an automated daily summary from CrimeEye-Pro Security System.</em></p>
            </body>
            </html>
            """
            
            email_message = MessageSchema(
                subject=subject,
                recipients=[settings.MAIL_FROM],
                body=body,
                subtype="html"
            )
            
            await fastmail.send_message(email_message)
            logger.info("Daily summary sent successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error sending daily summary: {e}")
            return False

# Global notification service
notification_service = NotificationService()

# Convenience function for external use
async def send_alert(alert_type: str, frame_id: UUID, message: str, sent_via: str = "both") -> bool:
    """Send alert notification."""
    return await notification_service.send_alert(alert_type, frame_id, message, sent_via)
