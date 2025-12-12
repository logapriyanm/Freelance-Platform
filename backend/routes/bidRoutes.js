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
  acceptBid
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Submit bid (freelancer only)
router.post('/', authorize('freelancer'), submitBid);

// Get project bids
router.get('/project/:projectId', getProjectBids);

// Get single bid
router.get('/:id', getBidById);

// Update bid (freelancer only)
router.put('/:id', authorize('freelancer'), updateBid);

// Accept bid (client only)
router.put('/:id/accept', authorize('client'), acceptBid);

module.exports = router;