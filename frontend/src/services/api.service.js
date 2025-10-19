import axios from 'axios';
import AuthService from './auth.service';

// This constructs the base URL: http://localhost:5001/api/
// It correctly reads from your .env file
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api/';

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL
});

// VERY IMPORTANT: This adds your login token to every API request
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      // This is how the backend (authMiddleware) authenticates you
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Define your API functions ---

class ApiService {
  
  /**
   * Gets the system health (DB, YOLO, LLM status)
   * GET /api/system/health
   */
  getSystemHealth() {
    return api.get('system/health');
  }

  /**
   * Gets the list of recent detections
   * GET /api/analysis/detections
   */
  getDetections(limit = 10) {
    // This will now correctly call:
    // http://localhost:5001/api/analysis/detections
    return api.get('analysis/detections', {
      params: { limit }
    });
  }

  /**
   * Analyzes a single camera frame
   * POST /api/analysis/frame
   */
  analyzeFrame(frame, cameraId) {
    return api.post('analysis/frame', {
      frame: frame,
      camera_id: cameraId
    });
  }
}

// Export a singleton instance
export default new ApiService();