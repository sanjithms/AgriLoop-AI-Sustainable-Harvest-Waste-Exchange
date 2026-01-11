/**
 * COMPATIBILITY LAYER - DO NOT MODIFY
 *
 * This file exists only for backward compatibility with existing routes.
 * All JWT authentication has been removed from the system.
 *
 * The system now exclusively uses OTP-based authentication with session tokens.
 * This file simply re-exports the OTP middleware functions with the old names
 * to avoid having to update all route files.
 */

const { protectWithSession, adminOnly, farmerOnly, industryOnly, sellerOnly } = require('./otpMiddleware');

// Re-export the middleware functions for backward compatibility
exports.protect = protectWithSession;
exports.admin = adminOnly;
exports.farmer = farmerOnly;
exports.industry = industryOnly;
exports.sellerOnly = sellerOnly;
