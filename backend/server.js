const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Load environment variables
dotenv.config();

// Check for critical environment variables
const criticalEnvVars = [
  'MONGO_URI',
  'MONGODB_URI',
  'JWT_SECRET',
  'HUGGING_FACE_API_TOKEN'
];

criticalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`Warning: ${varName} environment variable is not set`);
  } else {
    console.log(`${varName} is configured`);
  }
});

// Import routes
const aiRoutes = require('./routes/aiRoutes');
const awarenessRoutes = require('./routes/awarenessRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const otpAuthRoutes = require('./routes/otpAuthRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wasteProductRoutes = require('./routes/wasteProductRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const wasteInfoRoutes = require('./routes/wasteInfoRoutes');
const wasteClassificationRoutes = require('./routes/wasteClassificationRoutes');
const aiAdvisorRoutes = require('./routes/aiAdvisorRoutes');
const debugRoutes = require('./routes/debugRoutes');
const connectDB = require('./config/db');
const { ensureUploadsDirectory } = require('./utils/ensureDirectories');
const { initializeSocket } = require('./utils/socketService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Ensure uploads directory exists
ensureUploadsDirectory();
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory at:", uploadsDir);
} else {
  console.log("Uploads directory exists at:", uploadsDir);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure and serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Set appropriate content type headers
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
    // Enable caching and CORS
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Handle absolute path redirects
app.get('/uploads/C:*', (req, res) => {
  const filename = req.url.split(/[/\\]/).pop();
  res.redirect(`/uploads/${filename}`);
});

// Add a health-check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running correctly'
  });
});

// Middleware for next request
app.use((req, res, next) => {
  next();
});

// Connect to MongoDB with retry mechanism
connectDB()
  .then(() => {
    console.log("Database connection established successfully");
    
    // Set up a periodic health check for the database
    setInterval(async () => {
      try {
        // Simple ping to check if the connection is still alive
        await mongoose.connection.db.admin().ping();
        console.log("Database connection is healthy");
      } catch (err) {
        console.error("Database connection health check failed:", err);
        // Attempt to reconnect
        try {
          await connectDB();
          console.log("Database reconnection successful");
        } catch (reconnectErr) {
          console.error("Database reconnection failed:", reconnectErr);
        }
      }
    }, 60000); // Check every minute
  })
  .catch(err => {
    console.error("Failed to establish database connection:", err);
    // Continue running the server even if the database connection fails
    console.log("Server will continue running without database connection. Some features may not work.");
  });

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/awareness', awarenessRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth/otp', otpAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/waste-products', wasteProductRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/waste-info', wasteInfoRoutes);
app.use('/api/waste-classification', wasteClassificationRoutes);
app.use('/api/ai-advisor', aiAdvisorRoutes);
app.use('/api/debug', debugRoutes);

app.get('/', (req, res) => {
  res.send('Smart Agri System API is running');
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running correctly',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug route to check uploads directory
app.get("/debug/uploads", (req, res) => {
  try {
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    res.json({
      uploadsDir,
      exists: fs.existsSync(uploadsDir),
      files,
      count: files.length
    });
  } catch (error) {
    res.status(500).json({ uploadsDir, error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Handle 404 errors
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// Initialize Socket.io
try {
  initializeSocket(server);
  console.log('Socket.io initialization successful');
} catch (error) {
  console.error('Error initializing Socket.io:', error);
}

// Start Server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});