// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updatePortfolio,
  addPortfolioItem,
  updateSkills,
  searchFreelancers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Search freelancers (public)
router.get('/freelancers', searchFreelancers);

// Get public user profile by ID
router.get('/:id', getUserProfile);

// Portfolio routes
router.put('/portfolio', protect, updatePortfolio);
router.post('/portfolio', protect, addPortfolioItem);

// Skills
router.put('/skills', protect, updateSkills);

module.exports = router;
