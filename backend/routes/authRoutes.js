// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Auth
router.post('/register', register);
router.post('/login', login);

// Get logged in user
router.get('/me', protect, getMe);

// Update profile (including avatar upload)
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
