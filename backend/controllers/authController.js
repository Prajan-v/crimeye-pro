const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- Registration ---
exports.registerUser = async (req, res) => {
  console.log("--- registerUser function called ---");
  const { username, password, email } = req.body; // Expect email now

  // Basic Input Validation
  if (!username || !password || !email) {
    console.warn("Registration attempt failed: Missing fields");
    return res.status(400).json({ message: 'Please provide username, password, and email' });
  }
  if (password.length < 6) {
    console.warn(`Registration attempt failed for ${username}: Password too short`);
     return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  // Basic email format check (optional but good)
  if (!/\S+@\S+\.\S+/.test(email)) {
     console.warn(`Registration attempt failed for ${username}: Invalid email format`);
     return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    // Check if username or email already exists
    const userCheck = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userCheck.rows.length > 0) {
      console.warn(`Registration attempt failed: Username '${username}' or email '${email}' already exists.`);
      return res.status(400).json({ message: 'Username or email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`Password hashed for user: ${username}`);

    // Insert new user
    const newUser = await db.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, hashedPassword, email]
    );

    console.log(`✅ User registered successfully: ${newUser.rows[0].username} (ID: ${newUser.rows[0].id})`);
    // Return only non-sensitive info
    res.status(201).json({ id: newUser.rows[0].id, username: newUser.rows[0].username, email: newUser.rows[0].email });

  } catch (err) {
    console.error('🚨 Registration Error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// --- Login ---
exports.loginUser = async (req, res) => {
  console.log("--- loginUser function called ---"); // <<< DEBUG LOG
  const { username, password } = req.body;

  if (!username || !password) {
    console.warn("Login attempt failed: Missing username or password");
    return res.status(400).json({ message: 'Please provide both username and password' });
  }

  try {
    // Find user by username
    console.log(`Attempting login for user: ${username}`);
    const userResult = await db.query('SELECT id, username, password FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      console.warn(`Login failed: User '${username}' not found.`);
      return res.status(400).json({ message: 'Invalid credentials' }); // User not found
    }
    const user = userResult.rows[0];
    console.log(`User found: ${user.username} (ID: ${user.id}). Comparing password...`);

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.warn(`Login failed: Password mismatch for user '${username}'.`);
      return res.status(400).json({ message: 'Invalid credentials' }); // Password incorrect
    }
    console.log(`Password match successful for user: ${user.username}`);

    // Generate JWT Payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        // Add roles or other relevant info here if needed in the token
      },
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token valid for 5 hours
      (err, token) => {
        if (err) {
           console.error('🚨 JWT Signing Error:', err);
           // Throwing here will be caught by the outer try/catch
           throw new Error('Could not sign token');
        }
        console.log(`✅ JWT generated for user: ${user.username}`);
        res.json({ token }); // Send token to client
      }
    );

  } catch (err) {
    console.error('🚨 Login Process Error:', err.message);
    // Ensure a response is always sent on error
    res.status(500).json({ message: 'Server error during login process' });
  }
};

// --- Get Current User ---
exports.getMe = async (req, res) => {
  console.log(`--- getMe function called for user ID: ${req.user?.id} ---`); // req.user comes from authMiddleware
  if (!req.user || !req.user.id) {
     return res.status(401).json({ message: 'User data not found in token' });
  }
  try {
    // Fetch fresh user data (excluding password)
    const userResult = await db.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
       console.warn(`getMe warning: User ID ${req.user.id} found in token but not in DB.`);
       return res.status(404).json({ message: 'User not found' });
    }
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error('🚨 GetMe Error:', err.message);
    res.status(500).json({ message: 'Server Error retrieving user data' });
  }
};
