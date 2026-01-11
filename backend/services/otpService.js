const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { sendSMS, otpSMSTemplate } = require('../utils/smsService');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create OTP email template
const otpEmailTemplate = (name, otp) => ({
  subject: 'Your Smart Agri System Verification Code',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Verification Code</h2>
      <p>Dear ${name},</p>
      <p>Your verification code for Smart Agri System is:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
      <p>Thank you for using Smart Agri System!</p>
    </div>
  `
});

// Send OTP to user's email and phone (both required)
const sendOTP = async (user) => {
  try {
    // Generate new OTP
    const otp = generateOTP();

    // Set OTP expiry (10 minutes from now)
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpVerified = false;
    user.otpAttempts = 0;
    user.otpLastSent = new Date();
    await user.save();

    // Track success of each delivery method
    const results = {
      email: false,
      sms: false
    };

    // Send OTP via email
    try {
      const { subject, html } = otpEmailTemplate(user.name, otp);

      const emailResult = await sendEmail(
        user.email,
        'custom',
        [subject, html]
      );

      results.email = emailResult.success;
    } catch (emailError) {
      console.error('Error sending OTP via email:', emailError);
      results.email = false;
    }

    // Send OTP via SMS (now required)
    if (!user.phone) {
      console.error('Phone number is required but not provided for user:', user._id);
      return false;
    }

    try {
      const smsMessage = otpSMSTemplate(otp);
      const smsResult = await sendSMS(user.phone, smsMessage);
      results.sms = smsResult.success;
    } catch (smsError) {
      console.error('Error sending OTP via SMS:', smsError);
      results.sms = false;
    }

    // In development mode, we'll consider the OTP sent successfully if at least one channel works
    // In production, you might want to require both channels for enhanced security
    const atLeastOneChannelSuccessful = results.email || results.sms;

    // Log the results for debugging
    console.log('OTP delivery results:', results);

    if (!atLeastOneChannelSuccessful) {
      console.error('Failed to send OTP through both channels:', results);

      if (!results.email) {
        console.error('Email delivery failed. Check EMAIL_USER and EMAIL_PASSWORD in .env file.');
        console.error('For Gmail, you need to use an App Password: https://support.google.com/accounts/answer/185833');
      }

      if (!results.sms) {
        console.error('SMS delivery failed. Check SMS_API_KEY in .env file.');
      }

      return false;
    }

    // For development purposes, we'll print the OTP to the console
    console.log('\n========== DEVELOPMENT OTP ==========');
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`OTP: ${otp}`);
    console.log('======================================\n');

    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Verify OTP
const verifyOTP = async (userId, otp) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return { success: false, message: 'OTP not found or expired' };
    }
    
    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return { success: false, message: 'OTP has expired' };
    }
    
    // Increment attempt counter
    user.otpAttempts += 1;
    
    // Check if max attempts reached (5 attempts)
    if (user.otpAttempts >= 5) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return { success: false, message: 'Maximum OTP attempts reached' };
    }
    
    // Check if OTP matches
    if (user.otp !== otp) {
      await user.save(); // Save the incremented attempts
      return { success: false, message: 'Invalid OTP' };
    }
    
    // OTP is valid, mark as verified
    user.otpVerified = true;
    
    // Generate a session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 30); // 30 days session
    
    user.sessionToken = sessionToken;
    user.sessionExpiry = sessionExpiry;
    
    // If this is the first successful verification, mark user as verified
    if (!user.isVerified) {
      user.isVerified = true;
    }
    
    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    
    await user.save();
    
    return { 
      success: true, 
      message: 'OTP verified successfully',
      sessionToken,
      sessionExpiry
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Server error' };
  }
};

// Validate session token
const validateSession = async (sessionToken) => {
  try {
    if (!sessionToken) {
      return { success: false, message: 'No session token provided' };
    }
    
    const user = await User.findOne({ 
      sessionToken,
      sessionExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return { success: false, message: 'Invalid or expired session' };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Error validating session:', error);
    return { success: false, message: 'Server error' };
  }
};

// Invalidate session (logout)
const invalidateSession = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      sessionToken: null,
      sessionExpiry: null
    });
    
    return { success: true, message: 'Session invalidated successfully' };
  } catch (error) {
    console.error('Error invalidating session:', error);
    return { success: false, message: 'Server error' };
  }
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  validateSession,
  invalidateSession
};