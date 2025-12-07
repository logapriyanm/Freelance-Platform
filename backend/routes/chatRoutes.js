const express = require('express');
const router = express.Router();
const {
  getOrCreateChat,
  getConversations,
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  searchMessages
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Chat management
router.post('/', getOrCreateChat);
router.get('/conversations', getConversations);
router.get('/search', searchMessages);

// Message management
router.get('/:chatId/messages', getMessages);
router.post('/messages', sendMessage);
router.put('/messages/:messageId/read', markMessageAsRead);
router.delete('/messages/:messageId', deleteMessage);

module.exports = router;