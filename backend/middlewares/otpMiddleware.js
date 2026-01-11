const { validateSession } = require('../services/otpService');
const User = require('../models/User');

// Protect routes with session token authentication
exports.protectWithSession = async (req, res, next) => {
  try {
    // Get token from header
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no session token' 
      });
    }
    
    // Validate session
    const { success, user, message } = await validateSession(sessionToken);
    
    if (!success) {
      return res.status(401).json({ 
        success: false, 
        message: message || 'Invalid session token' 
      });
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in session authentication:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, session validation failed' 
    });
  }
};

// Admin-Only Access
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied, admin only' 
    });
  }
  next();
};

// Farmer-Only Access
exports.farmerOnly = (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied, farmers only' 
    });
  }
  next();
};

// Industry-Only Access
exports.industryOnly = (req, res, next) => {
  if (req.user.role !== "industry") {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied, industry users only' 
    });
  }
  next();
};

// Seller Access (Farmer or Industry)
exports.sellerOnly = (req, res, next) => {
  if (req.user.role !== "farmer" && req.user.role !== "industry") {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied, sellers only' 
    });
  }
  next();
};