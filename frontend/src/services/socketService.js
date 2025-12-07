import { io } from 'socket.io-client';
import store from '../redux/store';
import {
  addMessage,
  setOnlineUsers,
  incrementUnreadCount,
} from '../redux/slices/chatSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.isConnected) return;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Chat events
    this.socket.on('newMessage', (data) => {
      store.dispatch(addMessage(data));
      
      // If not viewing this conversation, increment unread count
      const currentConversation = store.getState().chat.currentConversation;
      if (!currentConversation || currentConversation._id !== data.conversationId) {
        store.dispatch(incrementUnreadCount());
      }
    });

    this.socket.on('messageRead', (conversationId) => {
      // Handle message read receipt if needed
    });

    this.socket.on('typing', (data) => {
      // Handle typing indicator
    });

    this.socket.on('stopTyping', (data) => {
      // Handle stop typing
    });

    // Online users
    this.socket.on('onlineUsers', (users) => {
      store.dispatch(setOnlineUsers(users));
    });

    // Notification events
    this.socket.on('newNotification', (notification) => {
      // Dispatch to notification slice
      console.log('New notification:', notification);
    });

    // Project events
    this.socket.on('projectUpdate', (data) => {
      console.log('Project update:', data);
    });

    this.socket.on('newBid', (data) => {
      console.log('New bid:', data);
    });

    this.socket.on('bidAccepted', (data) => {
      console.log('Bid accepted:', data);
    });
  }

  // Emit methods
  sendMessage(conversationId, message) {
    if (!this.isConnected) return;
    this.socket.emit('sendMessage', { conversationId, message });
  }

  joinConversation(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('joinConversation', conversationId);
  }

  leaveConversation(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('leaveConversation', conversationId);
  }

  typing(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('typing', conversationId);
  }

  stopTyping(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('stopTyping', conversationId);
  }

  markAsRead(conversationId) {
    if (!this.isConnected) return;
    this.socket.emit('markAsRead', conversationId);
  }

  joinProjectRoom(projectId) {
    if (!this.isConnected) return;
    this.socket.emit('joinProject', projectId);
  }

  leaveProjectRoom(projectId) {
    if (!this.isConnected) return;
    this.socket.emit('leaveProject', projectId);
  }

  // Utility methods
  isUserOnline(userId) {
    const onlineUsers = store.getState().chat.onlineUsers;
    return onlineUsers.includes(userId);
  }

  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;