

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

dotenv.config();

const connectDB = require('./config/database');
const createDefaultAdmin = require('./config/createDefaultAdmin'); // ensure file exists

// Connect DB (log any error but continue)
connectDB().catch(err => {
  console.error('DB connection failed at startup:', err && err.stack ? err.stack : err);
});

// Try create default admin (won't crash if it fails)
createDefaultAdmin().catch(err => {
  console.error('createDefaultAdmin failed:', err && err.stack ? err.stack : err);
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const bidRoutes = require('./routes/bidRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === clientUrl) res.setHeader('Access-Control-Allow-Origin', origin);

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 JSON
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  const status = err?.status || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Server error' : (err?.message || 'Server error')
  });
});

// Socket.io setup
const io = socketio(server, { cors: { origin: clientUrl, credentials: true } });

const onlineUsers = new Map(); // socketId => userId
const userSockets = new Map(); // userId => [socketId...]

io.on('connection', (socket) => {
  console.log('🔌 New WebSocket connection:', socket.id);

  socket.on('authenticate', (userId) => {
    if (!userId) return;
    socket.join(`user_${userId}`);
    socket.userId = userId;
    onlineUsers.set(socket.id, userId);

    if (!userSockets.has(userId)) userSockets.set(userId, []);
    userSockets.get(userId).push(socket.id);

    socket.broadcast.emit('user-online', userId);
    const onlineUserIds = Array.from(new Set(onlineUsers.values()));
    socket.emit('online-users', onlineUserIds);
  });

  // Example private message event
  socket.on('private-message', (payload) => {
    if (!payload || !payload.toUserId) return;
    io.to(`user_${payload.toUserId}`).emit('private-message', payload);
  });

  socket.on('disconnect', () => {
    const uid = socket.userId;
    if (uid && userSockets.has(uid)) {
      const arr = userSockets.get(uid).filter(id => id !== socket.id);
      if (arr.length) userSockets.set(uid, arr);
      else userSockets.delete(uid);
    }
    onlineUsers.delete(socket.id);
    socket.broadcast.emit('user-offline', socket.userId || null);
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${clientUrl}`);
  console.log(`🔌 WebSocket ready at ws://localhost:${PORT}`);
});
