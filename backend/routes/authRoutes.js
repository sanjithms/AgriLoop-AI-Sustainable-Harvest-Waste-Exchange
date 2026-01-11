const express = require("express");
const router = express.Router();

// This file is deprecated. Use otpAuthRoutes.js instead.
// All JWT authentication has been replaced with OTP-based authentication.

// Return deprecation message for all routes
router.all("*", (req, res) => {
  res.status(410).json({
    success: false,
    message: "JWT authentication has been deprecated. Please use OTP authentication instead."
  });
});

module.exports = router;const express = require("express");
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
} = require("../controllers/authController");
const { protect } = require("../middlewares/authmiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
