const socketIO = require('socket.io');
let io;

// Initialize Socket.io
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // Allow all origins for development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    transports: ['websocket', 'polling'] // Enable all transports
  });

  console.log('Socket.io initialized with CORS settings');

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Join user to their own room for private notifications
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their private room`);
      }
    });
    
    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  
  console.log('Socket.io initialized');
  return io;
};

// Get Socket.io instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Send notification to specific user
const sendNotificationToUser = (userId, notification) => {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit('notification', notification);
  console.log(`Notification sent to user ${userId}`);
};

// Send notification to all users
const sendNotificationToAll = (notification) => {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }
  
  io.emit('notification', notification);
  console.log('Notification sent to all users');
};

// Send notification to users with specific role
const sendNotificationToRole = (role, notification) => {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }
  
  io.to(`role:${role}`).emit('notification', notification);
  console.log(`Notification sent to users with role ${role}`);
};

module.exports = {
  initializeSocket,
  getIO,
  sendNotificationToUser,
  sendNotificationToAll,
  sendNotificationToRole
};