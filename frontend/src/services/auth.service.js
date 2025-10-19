import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// This constructs the correct URL: http://localhost:5001/api/auth/
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api/auth/';

class AuthService {
  /**
   * Logs in a user.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    try {
      // POST to http://localhost:5001/api/auth/login
      const response = await axios.post(API_URL + 'login', { username, password });
      
      if (response.data.token) {
        localStorage.setItem('crimeeye_token', response.data.token);
        console.log('Login successful, token stored.');
      }
      return response.data;
    } catch (error) {
      console.error('AuthService Login Error:', error.response ? error.response.data : error.message);
      throw error; // Re-throw for the component to handle (e.g., show "Login failed")
    }
  }

  /**
   * Logs out the current user by removing the token.
   */
  logout() {
    localStorage.removeItem('crimeeye_token');
    console.log('User logged out, token removed.');
  }

  /**
   * Registers a new user.
   * @param {string} username
   * @param {string} password
   * @param {string} email
   */
  async register(username, password, email) {
     try {
       // POST to http://localhost:5001/api/auth/register
       const response = await axios.post(API_URL + 'register', { 
         username, 
         password, 
         email 
       });
       
       console.log('Registration successful:', response.data);
       return response.data;
     } catch (error) {
       console.error('AuthService Register Error:', error.response ? error.response.data : error.message);
       throw error;
     }
  }

  /**
   * Gets the decoded user data from the stored token.
   * Handles token expiry.
   */
  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        console.warn('Token expired, logging out.');
        this.logout(); // Clean up expired token
        return null;
      }
      
      return decoded.user; // Contains { id, username }
    } catch (e) {
      console.error("Invalid token:", e.message);
      this.logout(); // Clean up invalid token
      return null;
    }
  }

  /**
   * Retrieves the raw JWT token from localStorage.
   */
  getToken() {
    return localStorage.getItem('crimeeye_token');
  }
}

// Export a singleton instance so all components use the same service
export default new AuthService();