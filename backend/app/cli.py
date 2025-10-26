"""
CLI commands for CrimeEye-Pro backend administration.
"""
import asyncio
import sys
from sqlalchemy import select
from app.core.database import async_engine, AsyncSessionLocal, Base
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.admin_user import AdminUser
from app.models.camera import Camera
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_tables():
    """Create all database tables."""
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False

async def create_admin_user(username: str, email: str, password: str, phone: str = None):
    """Create the initial admin user."""
    try:
        async with AsyncSessionLocal() as session:
            # Check if admin already exists
            result = await session.execute(select(AdminUser))
            existing_admin = result.scalar_one_or_none()
            
            if existing_admin:
                logger.warning(f"⚠️  Admin user already exists: {existing_admin.username}")
                return False
            
            # Create new admin user
            admin_user = AdminUser(
                username=username,
                email=email,
                password_hash=get_password_hash(password),
                phone=phone
            )
            
            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)
            
            logger.info(f"✅ Admin user created successfully")
            logger.info(f"   Username: {username}")
            logger.info(f"   Email: {email}")
            logger.info(f"   User ID: {admin_user.id}")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error creating admin user: {e}")
        return False

async def create_default_webcam(session):
    """Create default webcam camera if it doesn't exist."""
    try:
        # Check if default webcam already exists
        result = await session.execute(
            select(Camera).where(Camera.name == settings.DEFAULT_WEBCAM_NAME)
        )
        existing_camera = result.scalar_one_or_none()
        
        if existing_camera:
            logger.info(f"✅ Default webcam camera already exists: {existing_camera.name}")
            return existing_camera
        
        # Create new default webcam camera
        webcam_camera = Camera(
            name=settings.DEFAULT_WEBCAM_NAME,
            rtsp_url=settings.DEFAULT_WEBCAM_RTSP_URL,
            location=settings.DEFAULT_WEBCAM_LOCATION,
            status="offline",  # Will be updated by webcam service
            is_system_camera=True  # Mark as system camera
        )
        
        session.add(webcam_camera)
        await session.commit()
        await session.refresh(webcam_camera)
        
        logger.info(f"✅ Default webcam camera created successfully")
        logger.info(f"   Name: {webcam_camera.name}")
        logger.info(f"   RTSP URL: {webcam_camera.rtsp_url}")
        logger.info(f"   Location: {webcam_camera.location}")
        logger.info(f"   Camera ID: {webcam_camera.id}")
        return webcam_camera
        
    except Exception as e:
        logger.error(f"❌ Error creating default webcam camera: {e}")
        return None

async def init_database():
    """Initialize database with tables and admin user."""
    logger.info("🚀 Initializing CrimeEye-Pro database...")
    
    # Create tables
    if not await create_tables():
        return False
    
    # Create admin user with default credentials
    if not await create_admin_user(
        username="CrimeEye",
        email="crimeeye935@gmail.com",
        password="CrimeEye@",
        phone="+917010132407"
    ):
        logger.info("ℹ️  Skipping admin user creation (already exists)")
    
    # Create default webcam camera
    async with AsyncSessionLocal() as session:
        await create_default_webcam(session)
    
    logger.info("✅ Database initialization complete!")
    return True

async def reset_database():
    """Drop all tables and recreate them."""
    logger.warning("⚠️  This will delete all data!")
    confirm = input("Type 'YES' to confirm: ")
    
    if confirm != "YES":
        logger.info("❌ Database reset cancelled")
        return False
    
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            logger.info("✅ All tables dropped")
            await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ All tables recreated")
        
        # Recreate admin user
        await create_admin_user(
            username="CrimeEye",
            email="crimeeye935@gmail.com",
            password="CrimeEye@",
            phone="+917010132407"
        )
        
        # Recreate default webcam camera
        async with AsyncSessionLocal() as session:
            await create_default_webcam(session)
        
        logger.info("✅ Database reset complete!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error resetting database: {e}")
        return False

def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python -m app.cli <command>")
        print("\nCommands:")
        print("  init    - Initialize database and create admin user")
        print("  reset   - Reset database (WARNING: deletes all data)")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "init":
        asyncio.run(init_database())
    elif command == "reset":
        asyncio.run(reset_database())
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
