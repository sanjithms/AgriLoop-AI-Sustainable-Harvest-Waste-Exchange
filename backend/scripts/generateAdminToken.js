const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-agri-system')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Generate session token for admin
const generateAdminToken = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ email: 'admin@smartagri.com', role: 'admin' });
    
    if (!admin) {
      console.log('Admin user not found. Please run createAdmin.js first.');
      process.exit(1);
    }
    
    // Generate JWT token
    const sessionToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'smartagrisecret',
      { expiresIn: '30d' }
    );
    
    // Set session expiry date (30 days from now)
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 30);
    
    // Update admin with session token
    admin.sessionToken = sessionToken;
    admin.sessionExpiry = sessionExpiry;
    admin.isVerified = true;
    admin.otpVerified = true;
    
    await admin.save();
    
    console.log('Admin session token generated successfully');
    console.log('User ID:', admin._id);
    console.log('Session Token:', sessionToken);
    console.log('Session Expiry:', sessionExpiry);
    console.log('\nTo use this token in the frontend:');
    console.log('1. Open your browser console on the login page');
    console.log('2. Run the following commands:');
    console.log(`   localStorage.setItem("sessionToken", "${sessionToken}");`);
    console.log(`   localStorage.setItem("userId", "${admin._id}");`);
    console.log('   localStorage.setItem("role", "admin");');
    console.log('   localStorage.setItem("name", "Admin User");');
    console.log('   localStorage.setItem("email", "admin@smartagri.com");');
    console.log('3. Navigate to /admin or refresh the page');
    
  } catch (error) {
    console.error('Error generating admin token:', error);
  } finally {
    mongoose.disconnect();
  }
};

generateAdminToken();