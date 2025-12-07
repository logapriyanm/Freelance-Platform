const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: function() {
      return !this.attachments || this.attachments.length === 0;
    },
    maxlength: 5000,
    trim: true
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  delivered: {
    type: Boolean,
    default: false
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

messageSchema.index({ read: 1, timestamp: 1 });

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: function(participants) {
        return participants.length >= 2;
      },
      message: 'Chat must have at least 2 participants'
    }
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deletedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ participants: 1, lastMessage: -1 });
chatSchema.index({ project: 1, lastMessage: -1 });
chatSchema.index({ 'messages.timestamp': -1 });
chatSchema.index({ updatedAt: -1 });

// Middleware to update updatedAt
chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get chat by participants
chatSchema.statics.findByParticipants = function(participantIds, projectId = null) {
  return this.findOne({
    participants: { $all: participantIds, $size: participantIds.length },
    ...(projectId && { project: projectId })
  });
};

// Method to get unread message count for a user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(
    message => !message.read && message.sender.toString() !== userId
  ).length;
};

// Method to get last message preview
chatSchema.methods.getLastMessagePreview = function() {
  if (this.messages.length === 0) {
    return 'No messages yet';
  }
  
  const lastMessage = this.messages[this.messages.length - 1];
  if (lastMessage.attachments && lastMessage.attachments.length > 0) {
    if (lastMessage.attachments[0].type.startsWith('image/')) {
      return '📷 Photo';
    } else if (lastMessage.attachments[0].type.startsWith('video/')) {
      return '🎬 Video';
    } else {
      return '📎 File';
    }
  }
  
  return lastMessage.content.length > 50 
    ? lastMessage.content.substring(0, 50) + '...'
    : lastMessage.content;
};

// Virtual for participants count
chatSchema.virtual('participantsCount').get(function() {
  return this.participants.length;
});

module.exports = mongoose.model('Chat', chatSchema);