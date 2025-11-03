"""Camera API tests for CrimeEye-Pro"""
import pytest
from httpx import AsyncClient
from app.main import app
import uuid


@pytest.mark.asyncio
async def test_create_camera():
    """Test camera creation"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login first
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        token = login_response.json()["access_token"]
        
        # Create camera
        response = await client.post(
            "/api/cameras",
            json={
                "name": "Test Camera",
                "rtsp_url": "rtsp://test.stream/live",
                "location": "Test Location"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Camera"
        assert data["location"] == "Test Location"
        assert "id" in data


@pytest.mark.asyncio
async def test_get_cameras():
    """Test getting list of cameras"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login first
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        token = login_response.json()["access_token"]
        
        # Get cameras
        response = await client.get(
            "/api/cameras",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_update_camera():
    """Test camera update"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login first
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        token = login_response.json()["access_token"]
        
        # Create camera first
        create_response = await client.post(
            "/api/cameras",
            json={
                "name": "Camera to Update",
                "rtsp_url": "rtsp://test.stream/live",
                "location": "Initial Location"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        camera_id = create_response.json()["id"]
        
        # Update camera
        response = await client.put(
            f"/api/cameras/{camera_id}",
            json={
                "name": "Updated Camera",
                "location": "Updated Location"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Camera"
        assert data["location"] == "Updated Location"


@pytest.mark.asyncio
async def test_delete_camera():
    """Test camera deletion"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login first
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        token = login_response.json()["access_token"]
        
        # Create camera first
        create_response = await client.post(
            "/api/cameras",
            json={
                "name": "Camera to Delete",
                "rtsp_url": "rtsp://test.stream/live",
                "location": "Delete Location"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        camera_id = create_response.json()["id"]
        
        # Delete camera
        response = await client.delete(
            f"/api/cameras/{camera_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 204
        
        # Verify camera is deleted
        get_response = await client.get(
            f"/api/cameras/{camera_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_camera_validation():
    """Test camera input validation"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login first
        login_response = await client.post("/api/auth/login", json={
            "username": "CrimeEye",
            "password": "CrimeEye@"
        })
        token = login_response.json()["access_token"]
        
        # Try to create camera with invalid RTSP URL
        response = await client.post(
            "/api/cameras",
            json={
                "name": "Invalid Camera",
                "rtsp_url": "not-a-valid-url",
                "location": "Test Location"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 422
        assert "Invalid stream URL format" in str(response.json())
