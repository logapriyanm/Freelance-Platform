const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/database');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create default admin user from .env (if not exists)
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn(
        'ADMIN_EMAIL or ADMIN_PASSWORD not set in .env, skipping default admin creation'
      );
      return;
    }

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('✅ Default admin user created');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log('ℹ️ Existing user with admin email updated to admin role');
    }
  } catch (err) {
    console.error('Error creating default admin user:', err);
  }
};

// Ensure default admin user exists
createDefaultAdmin();

// Route files
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const bidRoutes = require('./routes/bidRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Get the client URL
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure Socket.io
const io = socketio(server, {
  cors: {
    origin: clientUrl,
    credentials: true
  }
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow requests from the client URL
  if (origin === clientUrl) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/bids', bidRoutes);
app.use('/chat', chatRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint (put this BEFORE 404 handlers)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    // we will set onlineUsers later; guard if undefined
    onlineUsers: typeof onlineUsers === 'undefined' ? 0 : onlineUsers.size
  });
});

/**
 * ✅ 404 for unknown API routes
 * No wildcards in the path string → avoid path-to-regexp crash.
 * We just check the prefix manually.
 */
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API route not found'
    });
  }
  next();
});

// Catch-all 404 handler for non-API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.io connection handling
const onlineUsers = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New WebSocket connection:', socket.id);

  // Handle authentication
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      socket.userId = userId;

      // Track online users
      onlineUsers.set(socket.id, userId);
      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId).push(socket.id);

      // Notify others that user is online
      socket.broadcast.emit('user-online', userId);

      console.log(`✅ User ${userId} authenticated on socket ${socket.id}`);

      // Send current online users to the connected user
      const onlineUserIds = Array.from(new Set(onlineUsers.values()));
      socket.emit('online-users', onlineUserIds);
    }
  });

  // Join specific chat room
  socket.on('join-chat', (chatId) => {
    if (chatId) {
      socket.join(`chat_${chatId}`);
      console.log(`💬 Socket ${socket.id} joined chat ${chatId}`);
    }
  });

  // Leave chat room
  socket.on('leave-chat', (chatId) => {
    if (chatId) {
      socket.leave(`chat_${chatId}`);
      console.log(`🚪 Socket ${socket.id} left chat ${chatId}`);
    }
  });

  // Send message
  socket.on('send-message', async (messageData) => {
    try {
      const { chat, sender } = messageData;

      if (!chat || !sender) {
        console.error('Invalid message data:', messageData);
        return;
      }

      // Create message object with timestamp
      const message = {
        ...messageData,
        _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
        delivered: true
      };

      // Broadcast to chat room except sender
      socket.to(`chat_${chat}`).emit('receive-message', message);

      // Send delivery confirmation to sender
      socket.emit('message-delivered', {
        tempId: messageData.tempId,
        messageId: message._id,
        chatId: chat
      });

      console.log(`📨 Message sent to chat ${chat} from user ${sender}`);
    } catch (error) {
      console.error('❌ Socket send-message error:', error);
      socket.emit('error', {
        event: 'send-message',
        message: 'Failed to send message',
        error: error.message
      });
    }
  });

  // User typing indicator
  socket.on('typing', (data) => {
    try {
      const { chatId, userId, userName } = data;

      if (!chatId || !userId) {
        console.error('Invalid typing data:', data);
        return;
      }

      // Broadcast to everyone in the chat except the sender
      socket.to(`chat_${chatId}`).emit('user-typing', {
        chatId,
        userId,
        userName
      });

      console.log(`⌨️ User ${userName || userId} is typing in chat ${chatId}`);
    } catch (error) {
      console.error('Typing event error:', error);
    }
  });

  // User stopped typing
  socket.on('stop-typing', (data) => {
    try {
      const { chatId, userId } = data;

      if (!chatId || !userId) {
        console.error('Invalid stop-typing data:', data);
        return;
      }

      socket.to(`chat_${chatId}`).emit('user-stopped-typing', {
        chatId,
        userId
      });
    } catch (error) {
      console.error('Stop-typing event error:', error);
    }
  });

  // Mark message as read
  socket.on('mark-read', (data) => {
    try {
      const { chatId, messageId, userId } = data;

      if (!chatId || !messageId || !userId) {
        console.error('Invalid mark-read data:', data);
        return;
      }

      // Notify other participants in the chat
      socket.to(`chat_${chatId}`).emit('message-read', {
        chatId,
        messageId,
        userId
      });

      console.log(`👁️ Message ${messageId} marked as read by user ${userId}`);
    } catch (error) {
      console.error('Mark-read event error:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);

    const userId = onlineUsers.get(socket.id);
    if (userId) {
      // Remove socket from user's socket list
      if (userSockets.has(userId)) {
        const sockets = userSockets.get(userId);
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          userSockets.delete(userId);
          // Notify others that user is offline
          socket.broadcast.emit('user-offline', userId);
          console.log(`🔴 User ${userId} is now offline`);
        }
      }

      onlineUsers.delete(socket.id);
    }
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${clientUrl}`);
  console.log(`🔌 WebSocket ready at ws://localhost:${PORT}`);
});
