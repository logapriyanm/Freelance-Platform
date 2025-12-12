/**
 * Review Controller
 * Handles project reviews and ratings
 */

const Review = require('../models/Review');
const Project = require('../models/Project');
const User = require('../models/User');

/**
 * Submit a review for a completed project
 */
exports.submitReview = async (req, res) => {
  try {
    const { projectId, rating, comment, strengths } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Get project
    const project = await Project.findById(projectId)
      .populate('client', 'id name')
      .populate('selectedFreelancer', 'id name');
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    // Check if project is completed
    if (project.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only completed projects can be reviewed' 
      });
    }
    
    // Determine reviewer and reviewee
    let reviewerId, revieweeId;
    const isClient = req.user.id === project.client._id.toString();
    const isFreelancer = req.user.id === project.selectedFreelancer?._id.toString();
    
    if (isClient) {
      reviewerId = project.client._id;
      revieweeId = project.selectedFreelancer._id;
    } else if (isFreelancer) {
      reviewerId = project.selectedFreelancer._id;
      revieweeId = project.client._id;
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to review this project' 
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: reviewerId,
      reviewee: revieweeId
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this project' 
      });
    }
    
    // Create review
    const review = await Review.create({
      project: projectId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
      strengths: strengths || []
    });
    
    // Update user's average rating
    await updateUserRating(revieweeId);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
    
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to submit review' 
    });
  }
};

/**
 * Get reviews for a user
 */
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { type = 'received', page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (type === 'received') {
      query.reviewee = userId;
    } else if (type === 'given') {
      query.reviewer = userId;
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Get reviews
    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar title rating')
      .populate('reviewee', 'name avatar title rating')
      .populate('project', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Review.countDocuments(query);
    
    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { reviewee: require('mongoose').Types.ObjectId(userId) } },
      { $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0 && ratingStats[0].ratingDistribution) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });
    }
    
    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      stats: ratingStats[0] ? {
        averageRating: parseFloat(ratingStats[0].averageRating.toFixed(1)),
        totalReviews: ratingStats[0].totalReviews,
        distribution
      } : {
        averageRating: 0,
        totalReviews: 0,
        distribution
      }
    });
    
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch reviews' 
    });
  }
};

/**
 * Get reviews for a project
 */
exports.getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const reviews = await Review.find({ project: projectId })
      .populate('reviewer', 'name avatar role')
      .populate('reviewee', 'name avatar role')
      .sort({ createdAt: -1 });
    
    // Separate client and freelancer reviews
    const clientReview = reviews.find(r => r.reviewer.role === 'client');
    const freelancerReview = reviews.find(r => r.reviewer.role === 'freelancer');
    
    res.json({
      success: true,
      reviews,
      clientReview,
      freelancerReview,
      hasBothReviews: clientReview && freelancerReview
    });
    
  } catch (error) {
    console.error('Get project reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch project reviews' 
    });
  }
};

/**
 * Update a review
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, strengths } = req.body;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }
    
    // Check if review can be edited (within 7 days)
    const daysSinceReview = (Date.now() - review.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceReview > 7) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reviews can only be edited within 7 days of submission' 
      });
    }
    
    // Update review
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (strengths !== undefined) review.strengths = strengths;
    
    await review.save();
    
    // Update user's average rating
    await updateUserRating(review.reviewee);
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
    
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update review' 
    });
  }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    // Check if user is the reviewer or admin
    const isReviewer = review.reviewer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isReviewer && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }
    
    // Delete review
    await review.deleteOne();
    
    // Update user's average rating
    await updateUserRating(review.reviewee);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete review' 
    });
  }
};

/**
 * Get recent reviews
 */
exports.getRecentReviews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const reviews = await Review.find()
      .populate('reviewer', 'name avatar title')
      .populate('reviewee', 'name avatar title')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));
    
    res.json({
      success: true,
      reviews
    });
    
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch recent reviews' 
    });
  }
};

/**
 * Helper function to update user's average rating
 */
const updateUserRating = async (userId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { reviewee: require('mongoose').Types.ObjectId(userId) } },
      { $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await User.findByIdAndUpdate(userId, {
        rating: parseFloat(stats[0].averageRating.toFixed(1)),
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Update user rating error:', error);
  }
};