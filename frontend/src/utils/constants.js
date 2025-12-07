// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/upload-avatar',
    SEARCH: '/users/search',
  },
  PROJECTS: {
    BASE: '/projects',
    MY_PROJECTS: '/projects/my-projects',
    BIDS: '/projects/:id/bids',
    ACCEPT_BID: '/projects/:id/bids/:bidId/accept',
  },
  BIDS: {
    BASE: '/bids',
    MY_BIDS: '/bids/my-bids',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    MESSAGES: '/chat/conversations/:id/messages',
    MARK_READ: '/chat/conversations/:id/read',
  },
  ADMIN: {
    USERS: '/admin/users',
    PROJECTS: '/admin/projects',
    STATS: '/admin/stats',
    REPORTS: '/admin/reports',
  },
};

// User Roles
export const USER_ROLES = {
  FREELANCER: 'freelancer',
  CLIENT: 'client',
  ADMIN: 'admin',
};

// Project Status
export const PROJECT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Bid Status
export const BID_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  PROJECT_INVITE: 'project_invite',
  BID_SUBMITTED: 'bid_submitted',
  BID_ACCEPTED: 'bid_accepted',
  BID_REJECTED: 'bid_rejected',
  MESSAGE: 'message',
  PAYMENT: 'payment',
  SYSTEM: 'system',
};

// Chat Events
export const CHAT_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_READ: 'messageRead',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
  ONLINE_USERS: 'onlineUsers',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-]{10,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  API: 'yyyy-MM-dd',
  TIME: 'hh:mm a',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

// Currency
export const CURRENCY = {
  SYMBOL: '$',
  CODE: 'USD',
  LOCALE: 'en-US',
};

// Categories
export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'SEO',
  'Data Entry',
  'Video Editing',
  'Audio Production',
  'Translation',
  'Customer Service',
  'Accounting',
  'Legal',
  'Consulting',
];

// Skills
export const COMMON_SKILLS = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Django',
  'PHP',
  'Laravel',
  'HTML/CSS',
  'Vue.js',
  'Angular',
  'TypeScript',
  'MySQL',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Git',
  'Figma',
  'Adobe Photoshop',
  'Adobe Illustrator',
  'WordPress',
  'Shopify',
  'SEO',
  'Social Media Marketing',
  'Content Writing',
  'Copywriting',
  'Video Editing',
  'Motion Graphics',
  '3D Modeling',
  'Data Analysis',
  'Machine Learning',
  'Excel',
  'PowerPoint',
  'Customer Service',
  'Project Management',
];

// Status Colors
export const STATUS_COLORS = {
  [PROJECT_STATUS.OPEN]: 'success',
  [PROJECT_STATUS.IN_PROGRESS]: 'info',
  [PROJECT_STATUS.COMPLETED]: 'primary',
  [PROJECT_STATUS.CANCELLED]: 'error',
  
  [BID_STATUS.PENDING]: 'warning',
  [BID_STATUS.ACCEPTED]: 'success',
  [BID_STATUS.REJECTED]: 'error',
  [BID_STATUS.WITHDRAWN]: 'default',
  
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.PROCESSING]: 'info',
  [PAYMENT_STATUS.COMPLETED]: 'success',
  [PAYMENT_STATUS.FAILED]: 'error',
  [PAYMENT_STATUS.REFUNDED]: 'default',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'freelance_pro_token',
  USER: 'freelance_pro_user',
  THEME: 'freelance_pro_theme',
  LANGUAGE: 'freelance_pro_language',
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  PROJECT_STATUS,
  BID_STATUS,
  PAYMENT_STATUS,
  NOTIFICATION_TYPES,
  CHAT_EVENTS,
  VALIDATION_RULES,
  FILE_CONSTRAINTS,
  DATE_FORMATS,
  PAGINATION,
  CURRENCY,
  PROJECT_CATEGORIES,
  COMMON_SKILLS,
  STATUS_COLORS,
  STORAGE_KEYS,
};