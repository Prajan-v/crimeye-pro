from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import redis
import json
from datetime import datetime, timedelta
from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL)

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request):
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"
        
        # Get current count
        current_count = redis_client.get(key)
        
        if current_count is None:
            # First request in window
            redis_client.setex(key, self.window_seconds, 1)
        else:
            count = int(current_count)
            if count >= self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later."
                )
            redis_client.incr(key)
        
        return True

# Rate limiters
general_rate_limit = RateLimiter(settings.RATE_LIMIT_PER_MINUTE, 60)
login_rate_limit = RateLimiter(settings.LOGIN_ATTEMPTS_LIMIT, settings.LOGIN_ATTEMPTS_WINDOW)
