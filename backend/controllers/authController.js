// This file is deprecated. Use otpAuthController.js instead.
// All JWT authentication has been replaced with OTP-based authentication.

module.exports = {
  // Empty exports for backward compatibility
  registerUser: (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "JWT authentication has been deprecated. Please use OTP authentication instead." 
    });
  },
  
  loginUser: (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "JWT authentication has been deprecated. Please use OTP authentication instead." 
    });
  },
  
  getUserProfile: (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "JWT authentication has been deprecated. Please use OTP authentication instead." 
    });
  },
  
  updateUserProfile: (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "JWT authentication has been deprecated. Please use OTP authentication instead." 
    });
  },
  
  changePassword: (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "JWT authentication has been deprecated. Please use OTP authentication instead." 
    });
  }
};const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

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
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({
            name,
            email,
            password,
            role: role || "buyer",
            phone,
            businessName,
            businessType,
            businessDescription
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            businessName: user.businessName,
            token: generateToken(user.id),
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Convert legacy 'user' role to 'buyer' if needed
        const role = user.role === 'user' ? 'buyer' : user.role;

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: role,
            businessName: user.businessName,
            phone: user.phone,
            token: generateToken(user.id),
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        // Find user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        // Save user
        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(req.user.id).select("-password");
        res.json(updatedUser);
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide current and new password" });
        }

        // Find user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Save user
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

