const express = require("express");
const {
  registerUser,
  verifyPassword,
  requestLoginOTP,
  verifyLoginOTP,
  resendOTP,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword
} = require("../controllers/otpAuthController");
const { protectWithSession, adminOnly } = require("../middlewares/otpMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login/verify-password", verifyPassword);
router.post("/login/request-otp", requestLoginOTP);
router.post("/login/verify-otp", verifyLoginOTP);
router.post("/resend-otp", resendOTP);

// Protected routes
router.post("/logout", protectWithSession, logoutUser);
router.get("/profile", protectWithSession, getUserProfile);
router.put("/profile", protectWithSession, updateUserProfile);
router.put("/change-password", protectWithSession, changePassword);

// Test route to verify authentication
router.get("/test-auth", protectWithSession, (req, res) => {
  res.json({
    success: true,
    message: "Authentication successful",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin test route
router.get("/admin-test", protectWithSession, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Admin authentication successful"
  });
});

module.exports = router;