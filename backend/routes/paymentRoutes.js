/**
 * Payment Routes
 */

const express = require('express');
const router = express.Router();
const {
  createPayment,
  completePayment,
  getTransactionHistory,
  requestWithdrawal,
  getWalletBalance,
  createDispute
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Payment operations
router.post('/create', createPayment);
router.post('/complete', completePayment);

// Withdrawal operations (freelancer only)
router.post('/withdraw', authorize('freelancer'), requestWithdrawal);

// Dispute operations
router.post('/dispute', createDispute);

// Get operations
router.get('/history', getTransactionHistory);
router.get('/wallet', getWalletBalance);

module.exports = router;