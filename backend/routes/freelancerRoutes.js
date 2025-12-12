/**
 * Freelancer Routes
 */
const express = require('express');
const router = express.Router();
const {
  getFreelancerProjects,
  getEarnings,
  getMyBids,
  withdrawBid
} = require('../controllers/freelancerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('freelancer'));

// Freelancer projects
router.get('/projects', getFreelancerProjects);

// Earnings
router.get('/earnings', getEarnings);

// Bids
router.get('/my-bids', getMyBids);
router.put('/bids/:id/withdraw', withdrawBid);

module.exports = router;