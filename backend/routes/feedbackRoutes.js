const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAllFeedback,
  getUserFeedback,
  getFeedbackById,
  respondToFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  addFeedback,
  getProductFeedback
} = require('../controllers/feedbackController');
const { protect, admin } = require('../middlewares/authmiddleware');

// Submit feedback (no authentication required)
router.post('/', submitFeedback);

// Get all feedback (admin only)
router.get('/all', protect, admin, getAllFeedback);

// Get user's feedback
router.get('/my-feedback', protect, getUserFeedback);

// Get feedback by ID
router.get('/:id', protect, getFeedbackById);

// Respond to feedback (admin only)
router.post('/:id/respond', protect, admin, respondToFeedback);

// Update feedback status (admin only)
router.put('/:id/status', protect, admin, updateFeedbackStatus);

// Delete feedback
router.delete('/:id', protect, deleteFeedback);

// Legacy routes
router.post("/add-feedback", protect, addFeedback);
router.get("/product/:productId", getProductFeedback);

module.exports = router;
