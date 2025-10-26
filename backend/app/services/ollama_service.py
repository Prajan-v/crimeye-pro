import httpx
import logging
from typing import Optional, Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class OllamaService:
    """Service for integrating with Ollama LLM for contextual threat analysis."""
    
    def __init__(self):
        self.ollama_url = getattr(settings, 'OLLAMA_URL', 'http://localhost:11434')
        self.model = getattr(settings, 'OLLAMA_MODEL', 'llama3.2')
        self.client = None
    
    async def initialize(self):
        """Initialize the HTTP client for Ollama service."""
        try:
            self.client = httpx.AsyncClient(timeout=30.0)
            
            # Test connection to Ollama
            response = await self.client.get(f"{self.ollama_url}/api/tags")
            if response.status_code == 200:
                logger.info(f"✅ Connected to Ollama service at {self.ollama_url}")
                models = response.json().get('models', [])
                logger.info(f"Available models: {[m.get('name') for m in models]}")
            else:
                logger.warning(f"⚠️ Ollama service responded with status {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Ollama service: {e}")
            logger.info("System will continue without LLM analysis")
    
    async def close(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()
    
    async def analyze_detection(
        self, 
        camera_id: str,
        camera_name: str,
        alerts: List[str],
        threat_level: str,
        person_count: int = 0
    ) -> Optional[Dict[str, Any]]:
        """
        Analyze detection alerts using Ollama LLM for contextual understanding.
        
        Args:
            camera_id: ID of the camera
            camera_name: Name of the camera
            alerts: List of YOLO alert messages
            threat_level: Overall threat level (low, medium, high)
            person_count: Number of people detected
            
        Returns:
            Dict with analysis results or None if analysis fails
        """
        if not self.client:
            logger.warning("Ollama client not initialized")
            return None
        
        try:
            # Build context prompt
            alert_text = "\n".join(alerts) if alerts else "No specific alerts"
            
            prompt = f"""You are a security AI assistant analyzing surveillance camera footage.

Camera: {camera_name} (ID: {camera_id})
Threat Level: {threat_level.upper()}
People Detected: {person_count}

Detection Alerts:
{alert_text}

Provide a brief security assessment (2-3 sentences) covering:
1. What is happening in the scene
2. Whether immediate action is needed
3. Any recommended security response

Keep your response concise and actionable."""

            # Call Ollama API
            response = await self.client.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,  # Lower temperature for more consistent responses
                        "num_predict": 150   # Limit response length
                    }
                },
                timeout=20.0
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = result.get('response', '').strip()
                
                return {
                    'success': True,
                    'analysis': analysis_text,
                    'camera_id': camera_id,
                    'threat_level': threat_level,
                    'model': self.model
                }
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return None
                
        except httpx.TimeoutException:
            logger.warning(f"Ollama request timeout for camera {camera_id}")
            return None
        except Exception as e:
            logger.error(f"Error analyzing detection with Ollama: {e}")
            return None
    
    async def health_check(self) -> bool:
        """Check if Ollama service is healthy."""
        try:
            if not self.client:
                return False
            
            response = await self.client.get(
                f"{self.ollama_url}/api/tags",
                timeout=5.0
            )
            return response.status_code == 200
        except Exception:
            return False

# Global Ollama service instance
ollama_service = OllamaService()
