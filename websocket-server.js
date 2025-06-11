const { createServer } = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3001;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Store user socket connections
const userSockets = new Map(); // userId -> Set of socket IDs
const socketUsers = new Map(); // socketId -> userId

// Create HTTP server
const server = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }
  
  // Socket.io will handle its own routes
  res.writeHead(404);
  res.end('Not Found');
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:3000"],
    credentials: true
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
});

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    // In production, validate the token properly
    if (process.env.NODE_ENV === 'production') {
      // For production, implement proper JWT validation
      // This is a simplified version - enhance based on your auth setup
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      // Set user data from token
      socket.data.userId = token; // In production, decode JWT to get actual user ID
      socket.data.userName = 'User'; // Get from token/database
      socket.data.userImage = null; // Get from token/database
    } else {
      // Development mode
      socket.data.userId = token || `dev-user-${socket.id}`;
      socket.data.userName = 'Development User';
      socket.data.userImage = null;
    }
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`User ${userId} connected with socket ${socket.id}`);
  
  // Track user's socket connections
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socket.id);
  socketUsers.set(socket.id, userId);
  
  // Join user to their personal room
  socket.join(`user:${userId}`);
  
  // Handle joining conversation rooms
  socket.on('join-conversation', (conversationId) => {
    if (!conversationId) return;
    
    console.log(`User ${userId} joining conversation ${conversationId}`);
    socket.join(`conversation:${conversationId}`);
    
    // Notify other users in the conversation
    socket.to(`conversation:${conversationId}`).emit('user-joined', {
      userId,
      conversationId
    });
  });
  
  // Handle leaving conversation rooms
  socket.on('leave-conversation', (conversationId) => {
    if (!conversationId) return;
    
    console.log(`User ${userId} leaving conversation ${conversationId}`);
    socket.leave(`conversation:${conversationId}`);
    
    // Notify other users in the conversation
    socket.to(`conversation:${conversationId}`).emit('user-left', {
      userId,
      conversationId
    });
  });
  
  // Handle new messages
  socket.on('send-message', (data) => {
    const { conversationId, message } = data;
    
    if (!conversationId || !message) return;
    
    console.log(`Message from ${userId} in conversation ${conversationId}`);
    
    // Emit to all users in the conversation (including sender)
    io.to(`conversation:${conversationId}`).emit('new-message', {
      conversationId,
      message: {
        ...message,
        senderId: userId,
        senderName: socket.data.userName,
        senderImage: socket.data.userImage,
      }
    });
  });
  
  // Handle typing indicators
  socket.on('typing-start', (conversationId) => {
    if (!conversationId) return;
    
    socket.to(`conversation:${conversationId}`).emit('user-typing', {
      userId,
      userName: socket.data.userName,
      conversationId
    });
  });
  
  socket.on('typing-stop', (conversationId) => {
    if (!conversationId) return;
    
    socket.to(`conversation:${conversationId}`).emit('user-stopped-typing', {
      userId,
      conversationId
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected socket ${socket.id}`);
    
    // Remove this socket from tracking
    const userSocketSet = userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        userSockets.delete(userId);
      }
    }
    socketUsers.delete(socket.id);
    
    // Notify all conversations the user was in
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('conversation:')) {
        socket.to(room).emit('user-disconnected', {
          userId,
          conversationId: room.replace('conversation:', '')
        });
      }
    });
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${userId}:`, error);
  });
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`WebSocket server running on http://${hostname}:${port}`);
  console.log('CORS origins:', process.env.CORS_ORIGIN || 'http://localhost:3000');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  
  // Close all connections
  io.close(() => {
    console.log('All connections closed');
    process.exit(0);
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});