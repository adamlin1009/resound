const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store user socket connections
const userSockets = new Map(); // userId -> Set of socket IDs
const socketUsers = new Map(); // socketId -> userId

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
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
      
      // In development, allow connections without full auth
      if (dev) {
        // For development, we expect the token to be a user ID
        socket.data.userId = token || `dev-user-${socket.id}`;
        socket.data.userName = 'Development User';
        socket.data.userImage = null;
        return next();
      }

      // In production, verify the token
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // TODO: Verify JWT token with NextAuth and get user info
      // For now, we'll expect the token to be the user ID from the database
      socket.data.userId = token;
      socket.data.userName = 'User'; // This should come from database lookup
      socket.data.userImage = null;
      
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Socket connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Track user's sockets
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socketUsers.set(socket.id, userId);

    // Notify others that user is online
    socket.broadcast.emit('userOnline', userId);

    // Join conversation room
    socket.on('joinConversation', (conversationId, callback) => {
      socket.join(`conversation:${conversationId}`);
      socket.data.currentConversation = conversationId;
      
      console.log(`User ${userId} joined conversation: ${conversationId}`);
      
      if (callback) callback(true);
    });

    // Leave conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      socket.data.currentConversation = null;
      
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    // Handle broadcasting new messages (called after API creates message)
    socket.on('broadcastMessage', (data) => {
      try {
        const { conversationId, message } = data;
        
        // Broadcast to all users in the conversation room except sender
        socket.to(`conversation:${conversationId}`).emit('newMessage', message);
      } catch (error) {
        console.error('Error broadcasting message:', error);
      }
    });

    // Handle typing indicators
    socket.on('startTyping', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('userTyping', {
        userId,
        userName: socket.data.userName,
        conversationId
      });
    });

    socket.on('stopTyping', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('userStoppedTyping', {
        userId,
        conversationId
      });
    });

    // Handle read receipts
    socket.on('markAsRead', (data) => {
      const { conversationId, messageId } = data;
      
      // Broadcast to other users in the conversation
      socket.to(`conversation:${conversationId}`).emit('messageRead', {
        messageId,
        userId,
        readAt: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (${socket.id})`);
      
      // Remove this socket from user's sockets
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        
        // If user has no more sockets, they're offline
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
          socket.broadcast.emit('userOffline', userId);
        }
      }
      
      socketUsers.delete(socket.id);
      
      // Stop typing in current conversation if any
      if (socket.data.currentConversation) {
        socket.to(`conversation:${socket.data.currentConversation}`).emit('userStoppedTyping', {
          userId,
          conversationId: socket.data.currentConversation
        });
      }
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server running with CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  });
});