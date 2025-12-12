/**
 * User Routes (for both clients and freelancers)
 */
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getMyProfile,
  updatePortfolio,
  addPortfolioItem,
  updateSkills,
  searchFreelancers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/freelancers', searchFreelancers);
router.get('/:id', getUserProfile);

// Protected routes
router.use(protect);

// Profile
router.get('/profile/me', getMyProfile);

// Portfolio
router.put('/portfolio', updatePortfolio);
router.post('/portfolio', addPortfolioItem);

// Skills
router.put('/skills', updateSkills);

module.exports = router;