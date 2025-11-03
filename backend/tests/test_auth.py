"""Authentication tests for CrimeEye-Pro"""
import pytest
from httpx import AsyncClient
from app.main import app
from app.core.security import get_password_hash
import asyncio


@pytest.mark.asyncio
async def test_login_success():
    """Test successful login"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        
        # Check response
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "username": "invalid",
            "password": "wrong"
        })
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_missing_fields():
    """Test login with missing fields"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "username": "CrimeEye"
            # Missing password
        })
        
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_protected_endpoint_without_token():
    """Test accessing protected endpoint without token"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/auth/me")
        
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]


@pytest.mark.asyncio
async def test_protected_endpoint_with_token():
    """Test accessing protected endpoint with valid token"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # First login to get token
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        
        token = login_response.json()["access_token"]
        
        # Access protected endpoint with token
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "CrimeEye"


@pytest.mark.asyncio
async def test_refresh_token():
    """Test token refresh functionality"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login to get refresh token
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        
        # Get refresh token from cookies
        cookies = login_response.cookies
        
        # Refresh token
        response = await client.post("/api/auth/refresh", cookies=cookies)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data


@pytest.mark.asyncio
async def test_logout():
    """Test logout functionality"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login first
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        
        token = login_response.json()["access_token"]
        
        # Logout
        response = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"
