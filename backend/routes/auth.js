console.log("--- Loading routes/auth.js ---"); // Debug log 1
const express = require('express');
const router = express.Router();

// Attempt to load controller functions
let authController;
let loginUserFunction;
try {
    authController = require('../controllers/authController');
    loginUserFunction = authController.loginUser; // Specifically get loginUser
    console.log("✅ Successfully required authController.");
} catch (error) {
    console.error("🚨 CRITICAL ERROR requiring authController:", error);
    // If the controller fails to load, the routes below won't work.
    // We should probably stop the server or handle this more gracefully.
    process.exit(1); // Exit if controller fails
}

const authMiddleware = require('../middleware/auth');

// Debug log 2: Check if loginUser is a function AFTER requiring
console.log(`>>> Type of loginUser imported: ${typeof loginUserFunction}`);

// --- Public Routes ---

// Register User
router.post('/register', authController.registerUser);

// Login User
// Ensure loginUserFunction is indeed a function before assigning it
if (typeof loginUserFunction === 'function') {
    router.post('/login', loginUserFunction);
    console.log("✅ Route POST /login configured.");
} else {
    console.error("🚨 ERROR: loginUser function was not loaded correctly. Route POST /login is NOT configured.");
    // Add a fallback route to indicate the error
    router.post('/login', (req, res) => {
        console.error("🚨 Attempted to access misconfigured POST /login route.");
        res.status(500).json({ message: "Server configuration error: Login handler missing." });
    });
}

// --- Private Routes ---

// Get Current User Info
router.get('/me', authMiddleware, authController.getMe);


// Test Route (Keep for debugging)
router.post('/test', (req, res) => {
  console.log("--- /api/auth/test route hit! ---");
  res.status(200).send('Auth Test Route OK');
});


module.exports = router;
console.log("--- Finished loading routes/auth.js ---"); // Debug log 3
