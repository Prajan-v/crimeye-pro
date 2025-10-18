import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'react-feather';
import authService from '../services/auth.service';
import styles from '../styles/Login.module.css';

// Animation variants for the form elements
const formVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({ // Custom function to stagger animation
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  }),
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: 15, transition: { duration: 0.3 } }
};

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(username, password);
      // No navigation here, App.js handles redirect via PrivateRoute
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
      setLoading(false); // Only set loading false on error
    }
    // Don't setLoading(false) on success, let the redirect happen
  };

  return (
    <div className={styles.container}>
      <motion.form
        onSubmit={handleLogin}
        className={styles.form}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit" // Useful if Login page animates out
      >
        <motion.div className={styles.title} variants={inputVariants} custom={0}>
            <Shield size={32} /> CrimeEye-Pro
        </motion.div>

        <motion.input
          variants={inputVariants} custom={1} // Stagger input 1
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <motion.input
          variants={inputVariants} custom={2} // Stagger input 2
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <AnimatePresence>
          {error && (
            <motion.p
              key="error-message"
              className={styles.error}
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <AlertCircle size={16} /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          variants={inputVariants} custom={3} // Stagger button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: error ? '5px' : '20px' }} // Adjust margin based on error
          disabled={loading}
          whileTap={{ scale: 0.98 }} // Add tap effect
        >
          {loading ? 'Logging in...' : 'Login'}
        </motion.button>

        <motion.p variants={inputVariants} custom={4} className={styles.toggleText}>
          Don't have an account? <Link to="/register">Register</Link>
        </motion.p>
      </motion.form>
    </div>
  );
}
export default Login;
