// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getUsers,
  verifyUser,
  suspendUser,
  getAdminProjects,
  resolveDispute,
  getAnalytics,
  getDisputes,
  getSettings,
  updateSettings,
  backupSettings,
  resetSettings,
  getRecentActivities,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Stats & analytics
router.get('/stats', getPlatformStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/suspend', suspendUser);

// Projects / disputes
router.get('/projects', getAdminProjects);
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/settings/backup', backupSettings);
router.post('/settings/reset', resetSettings);

// NEW: recent activities
router.get('/activities', getRecentActivities);

module.exports = router;
