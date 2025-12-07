import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FaStar,
  FaThumbsUp,
  FaReply,
  FaEllipsisV,
  FaTrash,
  FaFlag,
  FaUser,
  FaPaperPlane
} from 'react-icons/fa';

const Reviews = ({ userId, showSubmitForm = true }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([
    {
      id: 1,
      reviewerName: 'Sarah Johnson',
      reviewerAvatar: 'S',
      rating: 5,
      comment: 'Excellent work! Delivered ahead of schedule and exceeded expectations.',
      date: '2024-01-15',
      helpful: 12,
      replies: [],
    },
    {
      id: 2,
      reviewerName: 'Mike Chen',
      reviewerAvatar: 'M',
      rating: 4,
      comment: 'Good communication and quality work. Would hire again.',
      date: '2024-01-10',
      helpful: 8,
      replies: [
        {
          id: 1,
          replierName: 'Freelancer',
          comment: 'Thank you for your feedback! It was a pleasure working with you.',
          date: '2024-01-11',
        },
      ],
    },
    {
      id: 3,
      reviewerName: 'Alex Rodriguez',
      reviewerAvatar: 'A',
      rating: 5,
      comment: 'Professional and talented. Highly recommended!',
      date: '2024-01-05',
      helpful: 5,
      replies: [],
    },
  ]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { user } = useSelector((state) => state.auth);

  const handleSubmitReview = () => {
    if (rating === 0 || !review.trim()) {
      alert('Please provide both rating and review');
      return;
    }

    const newReview = {
      id: Date.now(),
      reviewerName: user?.name || 'Anonymous',
      reviewerAvatar: user?.name?.charAt(0) || 'A',
      rating,
      comment: review,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      replies: [],
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setReview('');
  };

  const handleHelpful = (reviewId) => {
    setReviews(reviews.map(rev =>
      rev.id === reviewId ? { ...rev, helpful: rev.helpful + 1 } : rev
    ));
  };

  const handleMenuClick = (reviewId) => {
    setMenuOpen(menuOpen === reviewId ? null : reviewId);
    setEditingReviewId(reviewId);
  };

  const handleDeleteReview = () => {
    setReviews(reviews.filter(rev => rev.id !== editingReviewId));
    setMenuOpen(null);
    setEditingReviewId(null);
  };

  const handleReply = (reviewId) => {
    setReplyTo(replyTo === reviewId ? null : reviewId);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      replierName: user?.name || 'You',
      comment: replyText,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews(reviews.map(rev =>
      rev.id === replyTo
        ? { ...rev, replies: [...rev.replies, newReply] }
        : rev
    ));

    setReplyText('');
    setReplyTo(null);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(rev => {
      distribution[rev.rating]++;
    });
    return distribution;
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {calculateAverageRating()}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-xl ${
                    i < Math.floor(parseFloat(calculateAverageRating()))
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Based on {reviews.length} reviews
            </div>
          </div>

          <div className="md:col-span-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = getRatingDistribution()[star] || 0;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center mb-2">
                  <div className="w-12 text-sm text-gray-600">
                    {star} stars
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 text-right text-sm text-gray-600">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Review Form */}
      {showSubmitForm && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className="text-2xl focus:outline-none"
                >
                  <FaStar
                    className={
                      value <= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSubmitReview}
            disabled={rating === 0 || !review.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reviews ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FaStar className="text-gray-400 text-2xl" />
            </div>
            <h4 className="text-gray-900 font-medium mb-2">No reviews yet</h4>
            <p className="text-gray-600">Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((reviewItem) => (
              <div key={reviewItem.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                {/* Review Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-medium">
                        {reviewItem.reviewerAvatar}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {reviewItem.reviewerName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${
                                i < reviewItem.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {reviewItem.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => handleMenuClick(reviewItem.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FaEllipsisV className="text-gray-400" />
                    </button>
                    
                    {menuOpen === reviewItem.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
                        {user?.name === reviewItem.reviewerName && (
                          <button
                            onClick={handleDeleteReview}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <FaTrash className="mr-3" />
                            Delete Review
                          </button>
                        )}
                        <button
                          onClick={() => setMenuOpen(null)}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaFlag className="mr-3" />
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <p className="mt-4 text-gray-700">{reviewItem.comment}</p>

                {/* Review Actions */}
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={() => handleHelpful(reviewItem.id)}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <FaThumbsUp className="mr-1" />
                    Helpful ({reviewItem.helpful})
                  </button>
                  <button
                    onClick={() => handleReply(reviewItem.id)}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <FaReply className="mr-1" />
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {replyTo === reviewItem.id && (
                  <div className="mt-4 pl-10 border-l-2 border-gray-200">
                    <div className="mt-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows="2"
                        placeholder="Write a reply..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setReplyTo(null)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitReply}
                          disabled={!replyText.trim()}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaPaperPlane className="inline mr-1" />
                          Post Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {reviewItem.replies.length > 0 && (
                  <div className="mt-4 pl-10 border-l-2 border-gray-200">
                    {reviewItem.replies.map((reply) => (
                      <div key={reply.id} className="mt-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-gray-400 text-xs" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {reply.replierName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {reply.date}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {reply.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;