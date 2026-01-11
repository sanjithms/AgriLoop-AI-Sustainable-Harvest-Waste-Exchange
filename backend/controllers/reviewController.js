const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { createNotification } = require('./notificationController');
const { sendEmail } = require('../utils/emailService');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, qualityRating, deliveryRating, serviceRating, name, email } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let userId = null;
    let isVerifiedPurchase = false;

    // If user is authenticated
    if (req.user) {
      userId = req.user.id;

      // Check if user has purchased the product (for verified purchase badge)
      const hasOrdered = await Order.findOne({
        buyer: req.user.id,
        'products.product': productId,
        status: 'Delivered'
      });

      isVerifiedPurchase = !!hasOrdered;
    }

    // Create the review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
      qualityRating: qualityRating || rating,
      deliveryRating: deliveryRating || rating,
      serviceRating: serviceRating || rating,
      isVerifiedPurchase,
      guestName: name,
      guestEmail: email
    });
    
    // Update product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length
    });
    
    // Get seller information
    const seller = await User.findById(product.seller);
    
    // Create notification for seller
    await createNotification({
      recipient: product.seller,
      type: 'review',
      title: 'New Review',
      message: `Someone left a ${rating}-star review on your product "${product.name}"`,
      relatedId: review._id,
      onModel: 'Review',
      actionUrl: `/product/${productId}`
    });
    
    // Send email notification to seller
    if (seller && seller.email) {
      try {
        const emailResult = await sendEmail(
          seller.email,
          'newReview',
          [product, review, seller]
        );
        console.log('Email notification result:', emailResult);
      } catch (emailError) {
        console.error('Error sending review email:', emailError);
        // Continue even if email fails
      }
    }
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get review statistics for a product
exports.getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId });
    
    // Calculate statistics
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    // Count reviews by rating
    const ratingCounts = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    reviews.forEach(review => {
      ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    });
    
    // Calculate average for each category
    const avgQualityRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review.qualityRating || 0), 0) / totalReviews
      : 0;
      
    const avgDeliveryRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review.deliveryRating || 0), 0) / totalReviews
      : 0;
      
    const avgServiceRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + (review.serviceRating || 0), 0) / totalReviews
      : 0;
    
    res.json({
      totalReviews,
      avgRating,
      ratingCounts,
      categoryRatings: {
        quality: avgQualityRating,
        delivery: avgDeliveryRating,
        service: avgServiceRating
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a reply to a review
exports.addReviewReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the seller of the product
    const product = await Product.findById(review.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Only allow seller or admin to reply
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reply to this review' });
    }
    
    // Add reply
    review.replies.push({
      user: req.user.id,
      comment
    });
    
    await review.save();
    
    // Create notification for review author
    await createNotification({
      recipient: review.user,
      type: 'review',
      title: 'Reply to Your Review',
      message: `The seller has responded to your review on "${product.name}"`,
      relatedId: review._id,
      onModel: 'Review',
      actionUrl: `/product/${product._id}`
    });
    
    res.json(review);
  } catch (error) {
    console.error('Error adding review reply:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Like a review
exports.likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user already liked the review
    const alreadyLiked = review.likes.includes(req.user.id);
    
    if (alreadyLiked) {
      // Unlike
      review.likes = review.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like
      review.likes.push(req.user.id);
    }
    
    await review.save();
    
    res.json({
      likes: review.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the author of the review or an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await Review.findByIdAndDelete(reviewId);
    
    // Update product rating
    const productId = review.product;
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
      
      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        numReviews: reviews.length
      });
    } else {
      // No reviews left
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};