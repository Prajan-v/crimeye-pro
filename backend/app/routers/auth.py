from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    verify_token
)
from app.core.schemas import (
    UserLogin, 
    UserCreate, 
    UserResponse, 
    UserUpdate, 
    PasswordChange,
    Token
)
from app.models.admin_user import AdminUser
from app.middleware.auth import get_current_active_user
from app.middleware.rate_limit import login_rate_limit
from datetime import timedelta
import redis
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()
redis_client = redis.from_url(settings.REDIS_URL)

@router.post("/login", response_model=Token, dependencies=[Depends(login_rate_limit)])
async def login(
    user_credentials: UserLogin,
    response: Response
):
    """Login endpoint for admin user."""
    # Check if user exists
    async with get_db() as db:
        result = await db.execute(
            select(AdminUser).where(AdminUser.username == user_credentials.username)
        )
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(user_credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.username})
        refresh_token = create_refresh_token(data={"sub": user.username})
        
        # Set refresh token as HTTPOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    response: Response,
    request: Request
):
    """Refresh access token using refresh token cookie."""
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    try:
        payload = verify_token(refresh_token, "refresh")
        username = payload.get("sub")
        
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new access token
        access_token = create_access_token(data={"sub": username})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        # Clear invalid refresh token
        response.delete_cookie("refresh_token")
        raise

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: AdminUser = Depends(get_current_active_user)
):
    """Get current user information."""
    return current_user

@router.post("/logout")
async def logout(response: Response):
    """Logout and clear refresh token."""
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.post("/update-credentials")
async def update_credentials(
    user_update: UserUpdate,
    current_password: str,
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user credentials (username, email)."""
    # Verify current password
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Check for username/email uniqueness
    if user_update.username and user_update.username != current_user.username:
        result = await db.execute(
            select(AdminUser).where(AdminUser.username == user_update.username)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
    
    if user_update.email and user_update.email != current_user.email:
        result = await db.execute(
            select(AdminUser).where(AdminUser.email == user_update.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
    
    # Update user
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    return {"message": "Credentials updated successfully"}

@router.post("/change-password")
async def change_password(
    password_change: PasswordChange,
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password."""
    # Verify current password
    if not verify_password(password_change.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(password_change.new_password)
    await db.commit()
    
    # Invalidate all existing tokens (in a real app, you'd maintain a token blacklist)
    return {"message": "Password changed successfully. Please log in again."}

@router.post("/create-admin")
async def create_admin(
    admin_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create the initial admin user (first-run setup)."""
    # Check if any admin already exists
    result = await db.execute(select(AdminUser))
    existing_admin = result.scalar_one_or_none()
    
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # Create admin user
    admin_user = AdminUser(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=get_password_hash(admin_data.password),
        phone=admin_data.phone
    )
    
    try:
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        return {"message": "Admin user created successfully", "user_id": str(admin_user.id)}
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
