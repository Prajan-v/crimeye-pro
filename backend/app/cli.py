"""
CLI commands for CrimeEye-Pro backend administration.
"""
import asyncio
import sys
from sqlalchemy import select
from app.core.database import async_engine, AsyncSessionLocal, Base
from app.core.security import get_password_hash
from app.models.admin_user import AdminUser
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
