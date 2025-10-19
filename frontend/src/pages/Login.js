import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import './Login.css'; // <-- Import the new animated CSS

// --- Icons (using simple emojis for easy setup) ---
const UserIcon = () => <span>👤</span>; 
const LockIcon = () => <span>🔒</span>;
const ShieldIcon = () => <span>🛡️</span>;
// ---------------------------------------------------

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Stop the form from reloading the page
    setMessage('');
    setLoading(true); // --- This triggers the "Logging in..." text

    try {
      console.log('Attempting login...');
      // Call the login function from auth.service.js
      await AuthService.login(username, password);
      
      console.log('Login successful! Navigating to dashboard...');
      
      // --- THIS IS THE FIX for the "stuck" login ---
      navigate('/dashboard'); 
      // window.location.reload(); // Not always needed, navigate is cleaner

    } catch (error) {
      // Get the error message from the backend
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Login failed. Please check credentials."; // Default error

      console.error("Login component error:", resMessage);
      setMessage(resMessage); // --- This shows the error message
      setLoading(false); // --- Stop the loading spinner
    }
  };

  // This is the new, animated, and correctly aligned JSX
  return (
    <div className="login-page">
      <div className="login-container-new">
        
        <div className="login-title">
          <span className="icon"><ShieldIcon /></span>
          CrimeEye-Pro
        </div>
        
        <form onSubmit={handleLogin} className="login-form-new">
          
          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <span className="input-icon"><UserIcon /></span>
          </div>
          
          <div className="input-group">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span className="input-icon"><LockIcon /></span>
          </div>

          {/* This part only shows if there is an error */}
          {message && (
            <div className="error-message" role="alert">
              {message}
            </div>
          )}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="register-link">
            {/* You can create a /register route later */}
            {/* Don't have an account? <Link to="/register">Register</Link> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;