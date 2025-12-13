/**
 * Bid Routes
 */
const express = require('express');
const router = express.Router();
const {
  submitBid,
  getProjectBids,
  getBidById,
  updateBid,
  acceptBid,
  hasApplied
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Submit bid (freelancer only)
router.post('/', authorize('freelancer'), submitBid);

// 🔥 MUST BE BEFORE /:id
router.get('/applied/:projectId', authorize('freelancer'), hasApplied);

// Get project bids
router.get('/project/:projectId', getProjectBids);

// Get single bid
router.get('/:id', getBidById);

// Update bid
router.put('/:id', authorize('freelancer'), updateBid);

// Accept bid (client only)
router.put('/:id/accept', authorize('client'), acceptBid);

module.exports = router;
