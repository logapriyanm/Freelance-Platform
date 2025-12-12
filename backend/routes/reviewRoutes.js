/**
 * Review Routes
 */
const express = require('express');
const router = express.Router();
const {
  submitReview,
  getUserReviews,
  getProjectReviews,
  updateReview,
  deleteReview,
  getRecentReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/recent', getRecentReviews);
router.get('/project/:projectId', getProjectReviews);

// Protected routes
router.use(protect);

// Submit review
router.post('/', submitReview);

// Get user reviews — explicit routes (no optional param syntax)
router.get('/user', getUserReviews);        // GET /api/reviews/user        -> list or current user
router.get('/user/:id', getUserReviews);   // GET /api/reviews/user/:id    -> reviews for given id

// Update/delete review
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

module.exports = router;
