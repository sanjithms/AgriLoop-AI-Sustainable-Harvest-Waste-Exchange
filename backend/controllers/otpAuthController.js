const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendOTP, verifyOTP, invalidateSession } = require("../services/otpService");

// Register User
exports.registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    businessName,
    businessType,
    businessDescription
  } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Validate phone number (now required)
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for OTP verification"
      });
    }

    if (!phone.match(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{4,6}$/)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number"
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "buyer",
      phone,
      businessName,
      businessType,
      businessDescription,
      isVerified: false
    });

    // Send OTP for verification
    const otpSent = await sendOTP(user);

    if (!otpSent) {
      // OTP sending failed, but user was created
      // We'll still return success but with a warning
      return res.status(201).json({
        success: true,
        warning: true,
        message: "Registration successful, but we couldn't send the verification code. Please use the 'Resend Code' option.",
        userId: user._id
      });
    }

    // Determine which channels were used
    const channels = [];
    if (user.email) channels.push('email');
    if (user.phone) channels.push('phone');
    const channelText = channels.length > 1
      ? `your email and phone (${phone})`
      : channels[0] === 'email' ? 'your email' : 'your phone';

    res.status(201).json({
      success: true,
      message: `Registration successful. Please verify with the OTP sent to ${channelText}.`,
      userId: user._id
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

// Login User - Step 1: Verify Password
exports.verifyPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Check if user has a phone number (required for dual-channel verification)
    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message: "Your account doesn't have a phone number. Please contact support to update your profile."
      });
    }

    // Password is correct, return success without sending OTP yet
    res.json({
      success: true,
      message: "Password verified successfully. Proceed to OTP verification.",
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    console.error("Password verification error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Login User - Step 2: Request OTP
exports.requestLoginOTP = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has a phone number (required for dual-channel verification)
    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message: "Your account doesn't have a phone number. Please contact support to update your profile."
      });
    }

    // Send OTP to both email and phone
    const otpSent = await sendOTP(user);

    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again later."
      });
    }

    // Success message for dual-channel verification
    res.json({
      success: true,
      message: `Verification code sent to your email (${user.email}) and phone (${user.phone})`,
      userId: user._id
    });
  } catch (err) {
    console.error("Login OTP request error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Login User - Step 2: Verify OTP
exports.verifyLoginOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    // Verify OTP
    const result = await verifyOTP(userId, otp);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }

    // Get user details
    const user = await User.findById(userId).select("-password -otp -otpExpiry");

    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        businessName: user.businessName,
        isVerified: user.isVerified
      },
      sessionToken: result.sessionToken,
      expiresAt: result.sessionExpiry
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has a phone number (required for dual-channel verification)
    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message: "Your account doesn't have a phone number. Please contact support to update your profile."
      });
    }

    // Check if OTP was sent recently (within last 1 minute)
    if (user.otpLastSent) {
      const lastSent = new Date(user.otpLastSent).getTime();
      const now = new Date().getTime();
      const diffInSeconds = Math.floor((now - lastSent) / 1000);

      if (diffInSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${60 - diffInSeconds} seconds before requesting a new code`,
          retryAfter: 60 - diffInSeconds
        });
      }
    }

    // Send new OTP to both email and phone
    const otpSent = await sendOTP(user);

    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please check your contact information and try again."
      });
    }

    // Success message for dual-channel verification
    res.json({
      success: true,
      message: `New verification code sent to your email (${user.email}) and phone (${user.phone})`
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Logout User
exports.logoutUser = async (req, res) => {
  try {
    // Invalidate session
    const result = await invalidateSession(req.user._id);

    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to logout" 
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    // User is already available from middleware
    const user = req.user;

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        businessName: user.businessName,
        businessType: user.businessType,
        businessDescription: user.businessDescription,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address, businessName, businessType, businessDescription } = req.body;

    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (businessName) user.businessName = businessName;
    if (businessType) user.businessType = businessType;
    if (businessDescription) user.businessDescription = businessDescription;

    // Save user
    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        businessName: user.businessName,
        businessType: user.businessType,
        businessDescription: user.businessDescription
      }
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide current and new password" 
      });
    }

    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook

    // Save user
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};