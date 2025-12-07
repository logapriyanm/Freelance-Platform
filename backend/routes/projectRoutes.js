// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getClientProjects,
  getFreelancerProjects
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');

// Browse / list
router.get('/', getProjects);

// Client-specific projects
router.get('/client-projects', protect, getClientProjects);

// Create project (client)
router.post('/', protect, createProject);

// Freelancer-specific projects
router.get('/my-projects', protect, getFreelancerProjects);

// Single project
router.get('/:id', getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
