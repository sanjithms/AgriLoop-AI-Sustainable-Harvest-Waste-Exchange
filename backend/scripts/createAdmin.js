const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-agri-system')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Admin user details
const adminUser = {
  name: 'Admin User',
  email: 'admin@smartagri.com',
  password: 'Admin@123',
  role: 'admin',
  phone: '9876543210',
  address: {
    street: 'Admin Street',
    city: 'Admin City',
    state: 'Admin State',
    postalCode: '123456',
    country: 'India'
  },
  isVerified: true,
  otpVerified: true
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // Create new admin user
    const newAdmin = new User({
      ...adminUser,
      password: hashedPassword
    });
    
    await newAdmin.save();
    
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    console.log('User ID:', newAdmin._id);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();