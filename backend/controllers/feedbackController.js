const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Product = require('../models/Product');
const { createNotification } = require('./notificationController');
const { sendEmail } = require('../utils/emailService');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { type, subject, message, rating, relatedTo, onModel, name, email } = req.body;

    // Create feedback data object
    const feedbackData = {
      type,
      subject,
      message,
      rating,
      relatedTo,
      onModel,
      guestName: name,
      guestEmail: email
    };

    // Add user if authenticated
    if (req.user) {
      feedbackData.user = req.user.id;
    }

    // Create feedback
    const feedback = await Feedback.create(feedbackData);
    
    // Find admin users to notify
    const admins = await User.find({ role: 'admin' });
    
    // Create notifications for admins
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        type: 'feedback',
        title: 'New Feedback',
        message: `New ${type} feedback: "${subject}"`,
        relatedId: feedback._id,
        onModel: 'Feedback',
        actionUrl: `/admin/feedback/${feedback._id}`
      });
      
      // Send email to admin
      try {
        await sendEmail(
          admin.email,
          'feedbackReceived',
          [feedback, admin]
        );
      } catch (emailError) {
        console.error('Error sending feedback email:', emailError);
        // Continue even if email fails
      }
    }
    
    res.status(201).json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all feedback (admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filter = {};
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Get feedback with pagination
    const feedback = await Feedback.find(filter)
      .populate('user', 'name email')
      .populate('response.respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Feedback.countDocuments(filter);
    
    res.json({
      feedback,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user's feedback
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email')
      .populate('response.respondedBy', 'name');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user is authorized to view this feedback
    if (feedback.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this feedback' });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Respond to feedback (admin only)
exports.respondToFeedback = async (req, res) => {
  try {
    const { message, status } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Update feedback
    feedback.response = {
      message,
      respondedBy: req.user.id,
      respondedAt: new Date()
    };
    
    if (status) {
      feedback.status = status;
    }
    
    await feedback.save();
    
    // Create notification for user
    await createNotification({
      recipient: feedback.user,
      type: 'feedback',
      title: 'Feedback Response',
      message: `We've responded to your feedback: "${feedback.subject}"`,
      relatedId: feedback._id,
      onModel: 'Feedback',
      actionUrl: `/feedback/${feedback._id}`
    });
    
    // Get user details
    const user = await User.findById(feedback.user);
    
    // Send email to user
    if (user && user.email) {
      try {
        await sendEmail(
          user.email,
          'feedbackResponse',
          [feedback, user]
        );
      } catch (emailError) {
        console.error('Error sending feedback response email:', emailError);
        // Continue even if email fails
      }
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update feedback status (admin only)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user is authorized to delete this feedback
    if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }
    
    await Feedback.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Legacy functions

// Add feedback for a product
exports.addFeedback = async (req, res) => {
  const { productId, rating, comment } = req.body;

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create feedback using the new model
    const feedback = await Feedback.create({
      user: req.user.id,
      type: 'product',
      subject: `Feedback for ${product.name}`,
      message: comment,
      rating: rating,
      relatedTo: productId,
      onModel: 'Product'
    });

    // Get user information
    const user = await User.findById(req.user.id);

    // Create notification for product seller
    await createNotification({
      recipient: product.seller,
      type: 'feedback',
      title: 'New Product Feedback',
      message: `${user.name} left feedback for your product "${product.name}"`,
      relatedId: feedback._id,
      onModel: 'Feedback',
      actionUrl: `/product/${productId}`
    });

    // Find admin users to notify
    const admins = await User.find({ role: 'admin' });

    // Create notifications for admins
    for (const admin of admins) {
      // Send email to admin
      try {
        await sendEmail(
          admin.email,
          'feedbackReceived',
          [feedback, admin]
        );
      } catch (emailError) {
        console.error('Error sending feedback email:', emailError);
        // Continue even if email fails
      }
    }

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

// Get feedback for a product
exports.getProductFeedback = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get feedback for the product
    const feedback = await Feedback.find({
      relatedTo: productId,
      onModel: 'Product'
    })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Error getting product feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
