/**
 * Admin Routes
 */
const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getUsers,
  verifyUser,
  suspendUser,
  getAdminProjects,
  getDisputes,
  resolveDispute,
  getAnalytics,
  getSettings,
  updateSettings,
  getRecentActivities
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

// Stats & Analytics
router.get('/stats', getPlatformStats);
router.get('/analytics', getAnalytics);
router.get('/activities', getRecentActivities);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/suspend', suspendUser);

// Project Management
router.get('/projects', getAdminProjects);
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;