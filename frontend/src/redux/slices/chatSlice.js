import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      return { conversationId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, { message });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const startConversation = createAsyncThunk(
  'chat/startConversation',
  async ({ recipientId, projectId, initialMessage }, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat/conversations', {
        recipientId,
        projectId,
        message: initialMessage,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: [],
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      if (state.currentConversation && 
          state.currentConversation._id === action.payload.conversationId) {
        state.messages.push(action.payload.message);
      }
      
      // Update conversation last message and unread count
      const conversationIndex = state.conversations.findIndex(
        c => c._id === action.payload.conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = action.payload.message;
        state.conversations[conversationIndex].updatedAt = new Date().toISOString();
        
        if (state.currentConversation?._id !== action.payload.conversationId) {
          state.conversations[conversationIndex].unreadCount += 1;
          state.unreadCount += 1;
        }
      } else {
        // If it's a new conversation
        state.conversations.unshift({
          _id: action.payload.conversationId,
          participants: action.payload.message.sender ? [action.payload.message.sender] : [],
          lastMessage: action.payload.message,
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
        });
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearChatError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    resetUnreadCount: (state, action) => {
      const conversationId = action.payload;
      const conversationIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (conversationIndex !== -1) {
        state.unreadCount -= state.conversations[conversationIndex].unreadCount;
        state.conversations[conversationIndex].unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.unreadCount = action.payload.reduce(
          (total, conv) => total + conv.unreadCount,
          0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch conversations';
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
        
        // Update conversation last message
        const conversationIndex = state.conversations.findIndex(
          c => c._id === action.payload.conversationId
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = action.payload;
          state.conversations[conversationIndex].updatedAt = new Date().toISOString();
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send message';
      })
      
      // Start Conversation
      .addCase(startConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload.conversation);
        state.currentConversation = action.payload.conversation;
        state.messages = [action.payload.message];
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to start conversation';
      })
      
      // Mark as Read
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const conversationIndex = state.conversations.findIndex(c => c._id === action.payload);
        if (conversationIndex !== -1) {
          state.unreadCount -= state.conversations[conversationIndex].unreadCount;
          state.conversations[conversationIndex].unreadCount = 0;
        }
      })
      .addCase(markAsRead.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  setOnlineUsers,
  clearChatError,
  clearMessages,
  incrementUnreadCount,
  resetUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;