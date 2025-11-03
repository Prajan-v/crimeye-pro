"""Security middleware for enhanced protection"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import hashlib
import hmac


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(self)"
        
        return response


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """CSRF protection for state-changing operations"""
    
    def __init__(self, app, secret_key: str):
        super().__init__(app)
        self.secret_key = secret_key
    
    def generate_csrf_token(self, session_id: str) -> str:
        """Generate CSRF token for session"""
        timestamp = str(int(time.time()))
        message = f"{session_id}:{timestamp}".encode()
        signature = hmac.new(self.secret_key.encode(), message, hashlib.sha256).hexdigest()
        return f"{timestamp}:{signature}"
    
    def verify_csrf_token(self, token: str, session_id: str) -> bool:
        """Verify CSRF token"""
        try:
            timestamp, signature = token.split(':')
            # Check if token is not too old (1 hour)
            if int(time.time()) - int(timestamp) > 3600:
                return False
            
            message = f"{session_id}:{timestamp}".encode()
            expected_signature = hmac.new(self.secret_key.encode(), message, hashlib.sha256).hexdigest()
            return hmac.compare_digest(signature, expected_signature)
        except:
            return False
    
    async def dispatch(self, request: Request, call_next):
        # Skip CSRF check for safe methods and specific paths
        if request.method in ["GET", "HEAD", "OPTIONS"] or \
           request.url.path in ["/health", "/docs", "/openapi.json", "/ws"]:
            return await call_next(request)
        
        # For now, we'll just add the header requirement
        # In production, you'd implement full CSRF token validation
        csrf_header = request.headers.get("X-CSRF-Token")
        if not csrf_header and request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            # Allow requests with valid JWT for now
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF token missing"}
                )
        
        return await call_next(request)


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Limit request body size to prevent DoS attacks"""
    
    def __init__(self, app, max_size: int = 10 * 1024 * 1024):  # 10MB default
        super().__init__(app)
        self.max_size = max_size
    
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_size:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request body too large"}
            )
        return await call_next(request)
