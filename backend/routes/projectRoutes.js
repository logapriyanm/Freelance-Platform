/**
 * Project Routes
 */
const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getClientProjects
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected routes
router.use(protect);

// Client-only routes
router.post('/', authorize('client'), createProject);
router.get('/client/my-projects', authorize('client'), getClientProjects);
router.put('/:id', authorize('client'), updateProject);
router.delete('/:id', authorize('client'), deleteProject);

module.exports = router;