const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get or create chat
// @route   POST /api/chat
// @access  Private
const getOrCreateChat = async (req, res) => {
  try {
    const { participantId, projectId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Validate participant ID
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: 'Invalid participant ID' });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      ...(projectId && { project: projectId })
    })
    .populate('participants', 'name avatar email')
    .populate('project', 'title')
    .populate('messages.sender', 'name avatar')
    .lean();

    if (!chat) {
      // Create new chat
      const newChat = await Chat.create({
        participants: [req.user.id, participantId],
        project: projectId || null,
        messages: []
      });

      chat = await Chat.findById(newChat._id)
        .populate('participants', 'name avatar email')
        .populate('project', 'title')
        .lean();
    }

    // Calculate unread count
    const unreadCount = await Chat.aggregate([
      { $match: { _id: chat._id } },
      { $unwind: '$messages' },
      { $match: { 
        'messages.sender': { $ne: mongoose.Types.ObjectId(req.user.id) },
        'messages.read': false
      }},
      { $count: 'count' }
    ]);

    res.json({
      ...chat,
      unreadCount: unreadCount[0]?.count || 0
    });
  } catch (error) {
    console.error('Error in getOrCreateChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'name avatar email')
    .populate('project', 'title')
    .sort({ lastMessage: -1, updatedAt: -1 })
    .lean();

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        // Get unread message count
        const unreadCount = await Chat.aggregate([
          { $match: { _id: conversation._id } },
          { $unwind: '$messages' },
          { $match: { 
            'messages.sender': { $ne: mongoose.Types.ObjectId(req.user.id) },
            'messages.read': false
          }},
          { $count: 'count' }
        ]);

        // Get last message content
        const lastMessage = conversation.messages && conversation.messages.length > 0 
          ? conversation.messages[conversation.messages.length - 1]
          : null;

        return {
          ...conversation,
          unreadCount: unreadCount[0]?.count || 0,
          lastMessageContent: lastMessage?.content || 'No messages yet'
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'name avatar')
      .lean();

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this chat' });
    }

    // Mark messages as read (only for messages sent by others)
    await Chat.updateOne(
      { _id: chatId },
      { 
        $set: { 
          'messages.$[elem].read': true 
        } 
      },
      {
        arrayFilters: [
          { 
            'elem.sender': { $ne: mongoose.Types.ObjectId(req.user.id) },
            'elem.read': false
          }
        ],
        multi: true
      }
    );

    res.json(chat.messages || []);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chat: chatId, content, attachments } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    // Validate content length
    if (content && content.length > 5000) {
      return res.status(400).json({ message: 'Message too long (max 5000 characters)' });
    }

    // Validate attachments count
    if (attachments && attachments.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 attachments allowed' });
    }

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const message = {
      _id: new mongoose.Types.ObjectId(),
      sender: req.user.id,
      content: content || '',
      attachments: attachments || [],
      read: false,
      delivered: false,
      timestamp: new Date()
    };

    // Add message to chat
    chat.messages.push(message);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate sender info for response
    const populatedMessage = await Chat.aggregate([
      { $match: { _id: chat._id } },
      { $unwind: '$messages' },
      { $match: { 'messages._id': message._id } },
      { $lookup: {
          from: 'users',
          localField: 'messages.sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      { $unwind: '$sender' },
      { $project: {
          _id: '$messages._id',
          content: '$messages.content',
          attachments: '$messages.attachments',
          read: '$messages.read',
          delivered: '$messages.delivered',
          timestamp: '$messages.timestamp',
          chat: '$_id',
          sender: {
            _id: '$sender._id',
            name: '$sender.name',
            avatar: '$sender.avatar'
          }
        }
      }
    ]);

    res.status(201).json(populatedMessage[0] || message);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/chat/messages/:messageId/read
// @access  Private
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { chatId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Valid chat ID is required' });
    }

    const result = await Chat.updateOne(
      {
        _id: chatId,
        'messages._id': messageId,
        'messages.sender': { $ne: req.user.id }
      },
      {
        $set: { 'messages.$.read': true }
      }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Message not found or already read' });
    }

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { chatId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Valid chat ID is required' });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      'messages._id': messageId,
      'messages.sender': req.user.id
    });

    if (!chat) {
      return res.status(404).json({ 
        message: 'Message not found or not authorized to delete' 
      });
    }

    // Remove the message
    chat.messages = chat.messages.filter(msg => 
      msg._id.toString() !== messageId
    );
    
    // Update lastMessage if needed
    if (chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      chat.lastMessage = lastMsg.timestamp;
    } else {
      chat.lastMessage = chat.createdAt;
    }
    
    await chat.save();

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search messages
// @route   GET /api/chat/search
// @access  Private
const searchMessages = async (req, res) => {
  try {
    const { query, chatId } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    let matchStage = {
      participants: req.user.id,
      'messages.content': { $regex: query, $options: 'i' }
    };

    if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
      matchStage._id = mongoose.Types.ObjectId(chatId);
    }

    const results = await Chat.aggregate([
      { $match: matchStage },
      { $unwind: '$messages' },
      { $match: { 'messages.content': { $regex: query, $options: 'i' } } },
      { $lookup: {
          from: 'users',
          localField: 'messages.sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      { $unwind: '$sender' },
      { $project: {
          _id: '$messages._id',
          content: '$messages.content',
          timestamp: '$messages.timestamp',
          chatId: '$_id',
          sender: {
            _id: '$sender._id',
            name: '$sender.name',
            avatar: '$sender.avatar'
          }
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: 50 }
    ]);

    res.json(results);
  } catch (error) {
    console.error('Error in searchMessages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOrCreateChat,
  getConversations,
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  searchMessages
};