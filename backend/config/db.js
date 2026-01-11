const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
  try {
    // Use either MONGO_URI or MONGODB_URI from environment variables
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/smart-agri-system";

    console.log(`Attempting to connect to MongoDB at ${uri.split('@').pop()}`);

    // Connect to MongoDB with improved options
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    // Log connection state
    const dbState = mongoose.connection.readyState;
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    console.log(`MongoDB Connection State: ${stateMap[dbState]}`);
    console.log("MongoDB Connected Successfully");

    // Log database name
    console.log(`Connected to database: ${mongoose.connection.name}`);

    // Enhanced error handling for connection
    mongoose.connection.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.error('MongoDB connection refused. Please check if:');
        console.error('1. MongoDB server is running');
        console.error('2. MongoDB server is accessible on the specified port');
        console.error('3. No firewall is blocking the connection');
        console.error(`4. The connection URL (${uri.split('@').pop()}) is correct`);
      } else {
        console.error('MongoDB connection error:', err);
      }
    });

    // Enhanced disconnection handler
    mongoose.connection.on('disconnected', async () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      try {
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          // Add reconnect options
          reconnectTries: Number.MAX_VALUE,
          reconnectInterval: 1000,
        });
      } catch (reconnectError) {
        console.error('Reconnection failed:', reconnectError);
      }
    });

    // Add connect event listener
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established successfully');
    });

    return mongoose.connection;
  } catch (error) {
    // Enhanced error handling for initial connection
    if (error.code === 'ECONNREFUSED') {
      console.error('\nConnection Error: Unable to connect to MongoDB server');
      console.error('Please ensure that:');
      console.error('1. MongoDB server is running and accessible');
      console.error(`2. The server is available at ${uri.split('@').pop()}`);
      console.error('3. Your network configuration allows the connection\n');
    }
    
    console.error("MongoDB Connection Failed:", error);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${delay/1000} seconds... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay);
    }
    
    // Don't exit the process, let the application handle the error
    throw error;
  }
};

module.exports = connectDB;
