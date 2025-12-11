import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import api from '../../services/api';
import {
  FaPaperPlane,
  FaPaperclip,
  FaSearch,
  FaCircle,
  FaUser,
  FaArrowLeft,
  FaImage,
  FaFile,
  FaTimes,
  FaVideo,
  FaPhone,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaClock
} from 'react-icons/fa';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  // Get socket URL - FIXED for Vite
 const getSocketUrl = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_URL ||
        'http://localhost:5000'
      );
    }
    return 'http://localhost:5000';
  };

  // Socket.io connection
  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.log('Connecting to socket:', socketUrl);

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Connected to socket server');
      if (user?._id) {
        socketInstance.emit('authenticate', user._id);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      toast.error('Connection error. Trying to reconnect...');
    });

    socketInstance.on('receive-message', (message) => {
      console.log('📨 Received message:', message);
      if (message.chat === activeChat) {
        setMessages((prev) => [...prev, message]);
        socketInstance.emit('mark-read', {
          chatId: activeChat,
          messageId: message._id,
          userId: user?._id
        });
      }
      updateConversationLastMessage(message);
    });

    socketInstance.on('user-typing', (data) => {
      if (data.chatId === activeChat && data.userId !== user?._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.chatId]: data.userName
        }));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newTyping = { ...prev };
            delete newTyping[data.chatId];
            return newTyping;
          });
        }, 3000);
      }
    });

    socketInstance.on('user-online', (userId) => {
      setOnlineUsers((prev) => {
        if (!prev.includes(userId)) return [...prev, userId];
        return prev;
      });
    });

    socketInstance.on('user-offline', (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socketInstance.on('online-users', (userIds) => {
      setOnlineUsers(userIds);
    });

    socketInstance.on('message-read', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, read: true } : msg
        )
      );
    });

    socketInstance.on('message-delivered', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === data.tempId
            ? { ...msg, delivered: true, _id: data.messageId }
            : msg
        )
      );
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Socket error occurred');
    });

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [user, activeChat]);

  // Fetch conversations
  useEffect(() => {
    if (user?._id) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat && user?._id) {
      fetchMessages(activeChat);
      joinChatRoom(activeChat);
    }
  }, [activeChat, user, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      // ✅ FIXED: add /api prefix
      const response = await api.get('/chat/conversations');
      if (response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setIsLoading(true);
      // ✅ FIXED: add /api prefix
      const response = await api.get(`/api/chat/${chatId}/messages`);
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const joinChatRoom = (chatId) => {
    if (socket && chatId) {
      socket.emit('join-chat', chatId);
    }
  };

  const handleTyping = () => {
    if (!activeChat || !socket || !user?._id) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing', {
      chatId: activeChat,
      userId: user._id,
      userName: user.name
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', {
        chatId: activeChat,
        userId: user._id
      });
    }, 2000);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (
      (!newMessage.trim() && attachments.length === 0) ||
      !activeChat ||
      !user?._id
    ) {
      if (!activeChat) toast.error('Please select a conversation');
      return;
    }

    try {
      setIsSending(true);

      const tempId = Date.now().toString();
      const messageData = {
        chat: activeChat,
        content: newMessage.trim(),
        attachments,
        sender: user._id,
        tempId
      };

      const tempMessage = {
        ...messageData,
        _id: tempId,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        timestamp: new Date(),
        read: false,
        delivered: false
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage('');
      setAttachments([]);
      scrollToBottom();

      socket.emit('send-message', messageData);

      // ✅ FIXED: add /api prefix
      const response = await api.post('/api/chat/messages', messageData);

      if (response.data) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? response.data : msg))
        );
        updateConversationLastMessage(response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((msg) => !msg.tempId));
    } finally {
      setIsSending(false);
    }
  };

  const updateConversationLastMessage = (message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === message.chat
          ? {
              ...conv,
              lastMessage: new Date(),
              lastMessageContent: message.content
            }
          : conv
      )
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024;
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain'
      ];

      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }

      return true;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            url: reader.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMessageStatus = (message) => {
    if (!message.sender || message.sender._id !== user?._id) return null;

    if (message.read) {
      return <FaCheckDouble className="text-blue-500 ml-1" />;
    } else if (message.delivered) {
      return <FaCheckDouble className="text-gray-400 ml-1" />;
    } else {
      return <FaCheck className="text-gray-400 ml-1" />;
    }
  };

  const startVideoCall = () => {
    toast.success('Video call feature coming soon!');
  };

  const startVoiceCall = () => {
    toast.success('Voice call feature coming soon!');
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = conversation.participants?.find(
      (p) => p._id !== user?._id
    );
    return (
      otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.project?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const activeConversation = conversations.find((c) => c._id === activeChat);
  const otherUser = activeConversation?.participants?.find(
    (p) => p._id !== user?._id
  );
  const isOtherUserOnline =
    otherUser && onlineUsers.includes(otherUser._id);

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate();


  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-120px)] flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`${activeChat ? 'hidden md:flex' : 'flex'} md:w-1/3 lg:w-1/4 border-r flex-col`}>
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                {activeChat && (
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden text-gray-600 hover:text-gray-900 p-1"
                  >
                    <FaArrowLeft size={20} />
                  </button>
                )}
              </div>
              
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 text-sm">No conversations yet</p>
                  <p className="text-gray-500 text-xs mt-1">Start a conversation from a project</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants?.find(p => p._id !== user?._id);
                  const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id);
                  const lastMessage = conversation.lastMessageContent || 'No messages yet';
                  const unreadCount = conversation.unreadCount || 0;
                  
                  return (
                    <button
                      key={conversation._id}
                      onClick={() => setActiveChat(conversation._id)}
                      className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors duration-200 ${
                        activeChat === conversation._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {otherParticipant?.avatar ? (
                              <img
                                src={otherParticipant.avatar}
                                alt={otherParticipant.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm">
                                {otherParticipant?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {otherParticipant?.name || 'Unknown User'}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage && formatTime(conversation.lastMessage)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {lastMessage}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            {conversation.project && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {conversation.project.title}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-blue-600 text-white rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-white">
                  <div className="flex items-center">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="md:hidden text-gray-600 hover:text-gray-900 mr-3 p-1"
                    >
                      <FaArrowLeft size={20} />
                    </button>
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {otherUser?.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm">
                              {otherUser?.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {isOtherUserOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-semibold text-gray-900">{otherUser?.name}</h3>
                        <p className="text-xs text-gray-600 flex items-center">
                          {isOtherUserOnline ? (
                            <>
                              <FaCircle className="w-2 h-2 text-green-500 mr-1" />
                              Online
                            </>
                          ) : (
                            'Offline'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={startVoiceCall}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Voice Call"
                    >
                      <FaPhone size={18} />
                    </button>
                    <button
                      onClick={startVideoCall}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Video Call"
                    >
                      <FaVideo size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                      <FaEllipsisV size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600 text-sm">Loading messages...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <FaUser className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-600">Send a message to start the conversation</p>
                      </div>
                    </div>
                  ) : (
                    Object.keys(groupedMessages).map((date) => (
                      <div key={date}>
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {groupedMessages[date].map((message, index) => {
                          const isOwn = message.sender?._id === user?._id;
                          const showAvatar = index === 0 || 
                            groupedMessages[date][index - 1]?.sender?._id !== message.sender?._id;
                          
                          return (
                            <div
                              key={message._id || index}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
                            >
                              <div className={`max-w-[80%] sm:max-w-[70%] flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                                {!isOwn && showAvatar && (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-2 flex-shrink-0">
                                    {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                )}
                                <div
                                  className={`rounded-lg p-3 ${
                                    isOwn
                                      ? 'bg-blue-600 text-white rounded-br-none'
                                      : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                                  }`}
                                >
                                  {!isOwn && showAvatar && (
                                    <p className="text-xs font-medium text-gray-700 mb-1">
                                      {message.sender?.name || 'Unknown'}
                                    </p>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                  
                                  {/* Attachments */}
                                  {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                      {message.attachments.map((attachment, idx) => (
                                        <div key={idx} className="border rounded-lg p-2 bg-white/10">
                                          {attachment.type?.startsWith('image/') ? (
                                            <img
                                              src={attachment.url}
                                              alt={attachment.name}
                                              className="max-w-full h-auto rounded max-h-48"
                                            />
                                          ) : (
                                            <div className="flex items-center">
                                              <FaFile className="mr-2 text-gray-400" />
                                              <span className="text-sm truncate">{attachment.name}</span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className={`flex items-center justify-end mt-1 ${
                                    isOwn ? 'text-blue-200' : 'text-gray-500'
                                  }`}>
                                    <span className="text-xs">
                                      {formatTime(message.timestamp)}
                                    </span>
                                    {isOwn && getMessageStatus(message)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  
                  {/* Typing indicator */}
                  {typingUsers[activeChat] && (
                    <div className="flex justify-start mb-2">
                      <div className="max-w-[80%] sm:max-w-[70%] flex items-end">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold mr-2 flex-shrink-0">
                          {typingUsers[activeChat]?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="bg-white rounded-lg rounded-bl-none shadow-sm p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="p-3 border-t bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="relative border rounded-lg p-2 bg-white shadow-sm">
                          {attachment.type?.startsWith('image/') ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="flex items-center p-2">
                              <FaFile className="mr-2 text-gray-400" />
                              <div className="max-w-[100px]">
                                <p className="text-xs truncate">{attachment.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(attachment.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => removeAttachment(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <form onSubmit={sendMessage}>
                    <div className="flex items-end gap-2">
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Attach file"
                        >
                          <FaPaperclip size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Attach image"
                        >
                          <FaImage size={18} />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage(e);
                            }
                          }}
                          placeholder="Type your message..."
                          rows="1"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                          disabled={isSending}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
                        className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center"
                      >
                        {isSending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaPaperPlane size={18} />
                        )}
                      </button>
                    </div>
                  </form>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    className="hidden"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                    <FaUser className="text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a conversation</h3>
                  <p className="text-gray-600 mb-6">
                    Choose a conversation from the list to start messaging, or start a new conversation from a project.
                  </p>
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-500">
                    <div className="flex items-center justify-center">
                      <FaVideo className="mr-2" />
                      <span>Video calls</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <FaPhone className="mr-2" />
                      <span>Voice calls</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <FaFile className="mr-2" />
                      <span>File sharing</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;