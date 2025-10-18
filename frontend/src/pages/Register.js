import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle } from 'react-feather';
import authService from '../services/auth.service';
import styles from '../styles/Login.module.css'; // Re-use login styles

// Animation variants (can be shared or customized)
const formVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  }),
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: 15, transition: { duration: 0.3 } }
};

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      await authService.register(username, password);
      // On successful registration, log them in automatically
      await authService.login(username, password);
      // No navigation needed, App.js handles redirect
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different username.');
      setLoading(false); // Only set loading false on error
    }
  };

  return (
    <div className={styles.container}>
      <motion.form
        onSubmit={handleRegister}
        className={styles.form}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div className={styles.title} variants={inputVariants} custom={0}>
          <Shield size={32} /> Register Account
        </motion.div>

        <motion.input
          variants={inputVariants} custom={1}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <motion.input
          variants={inputVariants} custom={2}
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
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
          variants={inputVariants} custom={3}
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: error ? '5px' : '20px' }}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </motion.button>

        <motion.p variants={inputVariants} custom={4} className={styles.toggleText}>
          Already have an account? <Link to="/login">Login</Link>
        </motion.p>
      </motion.form>
    </div>
  );
}
export default Register;
