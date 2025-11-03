from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import time
import os

from app.core.config import settings
from app.core.database import async_engine, Base, AsyncSessionLocal
from app.routers import auth, cameras, analytics
from app.services.cleanup_service import cleanup_service
from app.services.yolo_integration import yolo_integration
from app.services.ollama_service import ollama_service
from app.services.websocket_manager import manager
from app.services.webcam_service import webcam_service
from app.middleware.rate_limit import general_rate_limit
from app.middleware.security import SecurityHeadersMiddleware, CSRFProtectionMiddleware, RequestSizeLimitMiddleware
from app.cli import create_default_webcam
from app.models.camera import Camera
from sqlalchemy import select

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("🚀 Starting CrimeEye-Pro FastAPI Backend...")
    
    # Create database tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables initialized")
    
    # Initialize YOLO integration service
    await yolo_integration.initialize()
    logger.info("✅ YOLO integration service initialized")
    
    # Initialize Ollama service
    await ollama_service.initialize()
    logger.info("✅ Ollama service initialized")
    
    # Start cleanup service
    await cleanup_service.start()
    logger.info("✅ Cleanup service started")
    
    # Create static directories
    os.makedirs("static/detections", exist_ok=True)
    logger.info("✅ Static directories created")
    
    # Initialize default webcam camera and stream
    try:
        async with AsyncSessionLocal() as session:
            # Create default webcam camera if it doesn't exist
            webcam_camera = await create_default_webcam(session)
            
            if webcam_camera and settings.ENABLE_DEFAULT_WEBCAM:
                # Start FFmpeg stream
                stream_started = await webcam_service.start_ffmpeg_stream()
                
                if stream_started:
                    # Update camera status to online
                    webcam_camera.status = "online"
                    await session.commit()
                    logger.info("✅ Default webcam camera is online")
                else:
                    # Keep camera offline if stream failed
                    webcam_camera.status = "offline"
                    await session.commit()
                    logger.warning("⚠️  Default webcam camera is offline (stream failed)")
            else:
                logger.info("ℹ️  Default webcam is disabled or not available")
                
    except Exception as e:
        logger.error(f"❌ Error initializing default webcam: {e}")
    
    logger.info(f"✅ CrimeEye-Pro FastAPI Backend running on port {settings.FASTAPI_PORT}")
    logger.info(f"📡 WebSocket endpoint: ws://localhost:{settings.FASTAPI_PORT}/ws")
    logger.info(f"📚 API Documentation: http://localhost:{settings.FASTAPI_PORT}/docs")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down CrimeEye-Pro Backend...")
    await cleanup_service.stop()
    await yolo_integration.close()
    await ollama_service.close()
    
    # Stop webcam stream
    try:
        await webcam_service.stop_ffmpeg_stream()
        logger.info("✅ Webcam stream stopped")
    except Exception as e:
        logger.error(f"❌ Error stopping webcam stream: {e}")
    
    logger.info("✅ CrimeEye-Pro Backend shutdown complete")

# Create FastAPI application
app = FastAPI(
    title="CrimeEye-Pro API",
    description="Enterprise-grade surveillance system API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add CSRF protection
app.add_middleware(CSRFProtectionMiddleware, secret_key=settings.SECRET_KEY)

# Add request size limit
app.add_middleware(RequestSizeLimitMiddleware, max_size=10 * 1024 * 1024)  # 10MB

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, settings.NODEJS_BACKEND_URL, "http://localhost:3000", "http://localhost:5001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-CSRF-Token"]
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "CrimeEye-Pro API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(cameras.router)
app.include_router(analytics.router)

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Receive messages from client
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get('type')
            
            if message_type == 'subscribe_camera':
                camera_id = data.get('camera_id')
                if camera_id:
                    manager.subscribe_to_camera(websocket, camera_id)
                    await manager.send_personal_message({
                        'type': 'subscription_confirmed',
                        'camera_id': camera_id
                    }, websocket)
            
            elif message_type == 'unsubscribe_camera':
                camera_id = data.get('camera_id')
                if camera_id:
                    manager.unsubscribe_from_camera(websocket, camera_id)
                    await manager.send_personal_message({
                        'type': 'unsubscription_confirmed',
                        'camera_id': camera_id
                    }, websocket)
            
            elif message_type == 'frame':
                # Handle incoming frame from desktop webcam
                camera_id = data.get('camera_id')
                frame_data = data.get('frame')
                
                if camera_id and frame_data:
                    try:
                        # Decode base64 frame
                        import base64
                        import numpy as np
                        import cv2
                        
                        # Remove data URL prefix if present
                        if ',' in frame_data:
                            frame_data = frame_data.split(',')[1]
                        
                        # Decode base64 to bytes
                        frame_bytes = base64.b64decode(frame_data)
                        
                        # Convert to numpy array
                        nparr = np.frombuffer(frame_bytes, np.uint8)
                        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        
                        if frame is not None:
                            # Process frame through YOLO
                            yolo_result = await yolo_integration.process_frame(frame, camera_id)
                            
                            if yolo_result:
                                # Parse YOLO response
                                alerts, threat_level, trigger_llm = yolo_integration.parse_yolo_response(yolo_result)
                                
                                # Extract detections for frontend
                                detections = []
                                if yolo_result.get('success') and yolo_result.get('detections'):
                                    for det in yolo_result['detections']:
                                        detections.append({
                                            'class_name': det.get('class', 'unknown'),
                                            'confidence': det.get('confidence', 0),
                                            'bbox': det.get('bbox', [0, 0, 0, 0]),
                                            'threat_level': threat_level
                                        })
                                
                                # Send detection update to subscribers
                                await manager.broadcast_to_camera_subscribers(camera_id, {
                                    'type': 'detection',
                                    'camera_id': camera_id,
                                    'detections': detections,
                                    'alerts': alerts,
                                    'threat_level': threat_level,
                                    'timestamp': time.time()
                                })
                                
                                # If LLM should be triggered, process with Ollama
                                if trigger_llm and alerts:
                                    logger.info(f"LLM analysis triggered for camera {camera_id}")
                                    
                                    # Get camera name (default if not found)
                                    camera_name = "Desktop Camera" if camera_id == "DESKTOP_WEBCAM" else f"Camera {camera_id}"
                                    person_count = yolo_result.get('person_count', 0)
                                    
                                    # Analyze with Ollama
                                    llm_result = await ollama_service.analyze_detection(
                                        camera_id=camera_id,
                                        camera_name=camera_name,
                                        alerts=alerts,
                                        threat_level=threat_level,
                                        person_count=person_count
                                    )
                                    
                                    if llm_result and llm_result.get('success'):
                                        # Send LLM analysis to subscribers
                                        await manager.broadcast_to_camera_subscribers(camera_id, {
                                            'type': 'llm_analysis',
                                            'camera_id': camera_id,
                                            'analysis': llm_result.get('analysis'),
                                            'threat_level': threat_level,
                                            'timestamp': time.time()
                                        })
                                        logger.info(f"LLM analysis sent for camera {camera_id}")
                                    
                    except Exception as e:
                        logger.error(f"Error processing frame: {e}")
            
            elif message_type == 'ping':
                await manager.send_personal_message({
                    'type': 'pong',
                    'timestamp': time.time()
                }, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Apply rate limiting to all routes
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for health check
    if request.url.path == "/health":
        return await call_next(request)
    
    try:
        await general_rate_limit(request)
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail}
        )
    
    return await call_next(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.FASTAPI_PORT,
        reload=True,
        log_level="info",
        ws_ping_interval=20,
        ws_ping_timeout=20
    )
