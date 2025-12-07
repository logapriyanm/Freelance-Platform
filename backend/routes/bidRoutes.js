const express = require('express');
const router = express.Router();
const {
  submitBid,
  getProjectBids,
  getMyBids,
  updateBid,
  withdrawBid,
  getBidById,
  acceptBid
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Submit a bid (freelancer)
router.route('/')
  .post(protect, authorize('freelancer'), submitBid);

// Get my bids (freelancer)
router.route('/my-bids')
  .get(protect, authorize('freelancer'), getMyBids);

// Get bids for a project
router.route('/project/:projectId')
  .get(protect, getProjectBids);

// Get single bid, update bid
router.route('/:id')
  .get(protect, getBidById)
  .put(protect, authorize('freelancer'), updateBid);

// Withdraw bid (freelancer)
router.put('/:id/withdraw', protect, authorize('freelancer'), withdrawBid);

// Accept bid (client)
router.put('/:id/accept', protect, authorize('client'), acceptBid);

module.exports = router;
