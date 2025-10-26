"""
Webcam service for CrimeEye-Pro.
Manages FFmpeg stream for Mac FaceTime HD Camera.
"""
import subprocess
import logging
import asyncio
import signal
import os
import time
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class WebcamService:
    """Service to manage Mac webcam FFmpeg streaming."""
    
    def __init__(self):
        self.ffmpeg_process: Optional[subprocess.Popen] = None
        self.is_streaming = False
        self.stream_start_time: Optional[float] = None
        
    async def check_webcam_availability(self) -> bool:
        """Check if webcam device is available."""
        try:
            # Use FFmpeg to list devices and check if our device exists
            result = subprocess.run([
                'ffmpeg', '-f', 'avfoundation', '-list_devices', 'true', '-i', ''
            ], capture_output=True, text=True, timeout=10)
            
            # Check if our device ID is in the output
            device_id = settings.WEBCAM_DEVICE_ID
            return f'[{device_id}]' in result.stderr
            
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError) as e:
            logger.warning(f"Could not check webcam availability: {e}")
            return False
    
    def get_stream_status(self) -> dict:
        """Get current stream status."""
        return {
            "is_streaming": self.is_streaming,
            "process_running": self.ffmpeg_process is not None and self.ffmpeg_process.poll() is None,
            "stream_start_time": self.stream_start_time,
            "uptime_seconds": time.time() - self.stream_start_time if self.stream_start_time else 0
        }
    
    async def start_ffmpeg_stream(self) -> bool:
        """Start FFmpeg stream for webcam."""
        if not settings.ENABLE_DEFAULT_WEBCAM:
            logger.info("Default webcam is disabled in configuration")
            return False
            
        if self.is_streaming and self.ffmpeg_process and self.ffmpeg_process.poll() is None:
            logger.info("FFmpeg stream is already running")
            return True
            
        # Check webcam availability first
        if not await self.check_webcam_availability():
            logger.warning("Webcam device not available, marking camera as offline")
            return False
            
        try:
            # Stop any existing stream
            await self.stop_ffmpeg_stream()
            
            # Build FFmpeg command for optimized demo streaming
            ffmpeg_cmd = [
                'ffmpeg',
                '-f', 'avfoundation',
                '-i', settings.WEBCAM_DEVICE_ID,
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '25',
                '-maxrate', '1M',
                '-bufsize', '2M',
                '-r', '15',
                '-s', '1280x720',
                '-f', 'rtsp',
                settings.DEFAULT_WEBCAM_RTSP_URL
            ]
            
            logger.info(f"Starting FFmpeg stream: {' '.join(ffmpeg_cmd)}")
            
            # Start FFmpeg process
            self.ffmpeg_process = subprocess.Popen(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid if os.name != 'nt' else None
            )
            
            # Wait a moment to check if process started successfully
            await asyncio.sleep(2)
            
            if self.ffmpeg_process.poll() is None:
                self.is_streaming = True
                self.stream_start_time = time.time()
                logger.info("✅ FFmpeg webcam stream started successfully")
                return True
            else:
                # Process died immediately
                stdout, stderr = self.ffmpeg_process.communicate()
                logger.error(f"FFmpeg process failed to start: {stderr.decode()}")
                self.ffmpeg_process = None
                return False
                
        except Exception as e:
            logger.error(f"Error starting FFmpeg stream: {e}")
            await self.stop_ffmpeg_stream()
            return False
    
    async def stop_ffmpeg_stream(self) -> bool:
        """Stop FFmpeg stream gracefully."""
        if not self.ffmpeg_process:
            return True
            
        try:
            logger.info("Stopping FFmpeg webcam stream...")
            
            # Send SIGTERM to the process group
            if os.name != 'nt':
                os.killpg(os.getpgid(self.ffmpeg_process.pid), signal.SIGTERM)
            else:
                self.ffmpeg_process.terminate()
            
            # Wait for graceful shutdown
            try:
                self.ffmpeg_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                # Force kill if graceful shutdown fails
                logger.warning("FFmpeg process did not stop gracefully, forcing kill")
                if os.name != 'nt':
                    os.killpg(os.getpgid(self.ffmpeg_process.pid), signal.SIGKILL)
                else:
                    self.ffmpeg_process.kill()
                self.ffmpeg_process.wait()
            
            logger.info("✅ FFmpeg webcam stream stopped")
            return True
            
        except Exception as e:
            logger.error(f"Error stopping FFmpeg stream: {e}")
            return False
        finally:
            self.ffmpeg_process = None
            self.is_streaming = False
            self.stream_start_time = None
    
    async def restart_stream(self) -> bool:
        """Restart the FFmpeg stream."""
        logger.info("Restarting FFmpeg webcam stream...")
        await self.stop_ffmpeg_stream()
        await asyncio.sleep(1)  # Brief pause before restart
        return await self.start_ffmpeg_stream()
    
    async def monitor_stream(self):
        """Monitor stream health and restart if needed."""
        while True:
            try:
                if self.is_streaming and self.ffmpeg_process:
                    # Check if process is still running
                    if self.ffmpeg_process.poll() is not None:
                        logger.warning("FFmpeg process died unexpectedly, attempting restart...")
                        await self.restart_stream()
                
                # Check every 30 seconds
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Error in stream monitoring: {e}")
                await asyncio.sleep(30)

# Global webcam service instance
webcam_service = WebcamService()

