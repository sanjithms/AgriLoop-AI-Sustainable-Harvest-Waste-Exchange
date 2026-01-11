const express = require('express');
const router = express.Router();
const { 
  createReview, 
  getProductReviews, 
  getReviewStats, 
  addReviewReply, 
  likeReview, 
  deleteReview 
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authmiddleware');

// Create a new review (no authentication required)
router.post('/', createReview);

// Get reviews for a product
router.get('/product/:productId', getProductReviews);

// Get review statistics for a product
router.get('/product/:productId/stats', getReviewStats);

// Add a reply to a review
router.post('/:reviewId/reply', protect, addReviewReply);

// Like a review
router.post('/:reviewId/like', protect, likeReview);

// Delete a review
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;