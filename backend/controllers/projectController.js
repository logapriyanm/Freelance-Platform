// controllers/projectController.js
const Project = require('../models/Project');

// @desc    Get all projects (with filters for browse page)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { category, status, minBudget, maxBudget, search } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    if (minBudget || maxBudget) {
      query['budget.fixed'] = {};
      if (minBudget) query['budget.fixed'].$gte = Number(minBudget);
      if (maxBudget) query['budget.fixed'].$lte = Number(maxBudget);
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('client', 'name');

    res.json({
      projects,
      total: projects.length,
    });
  } catch (err) {
    console.error('getProjects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name')
      .populate('bids.freelancer', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error('getProjectById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create project (client)
// @route   POST /api/projects
// @access  Private (client)
const createProject = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }

    const {
      title,
      description,
      category,
      budgetType,
      budget,
      duration,
      skills,
      deadline,
    } = req.body;

    const project = await Project.create({
      title,
      description,
      category,
      budgetType,
      budget,
      duration,
      skills,
      deadline,
      client: req.user._id,
      status: 'open',
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('createProject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (client owns the project)
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(project);
  } catch (err) {
    console.error('updateProject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (client owns the project)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await project.deleteOne();

    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error('deleteProject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get projects posted by logged-in client
// @route   GET /api/projects/client-projects
// @access  Private
const getClientProjects = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }

    const query = { client: req.user._id };

    const timeRange = req.query.timeRange;
    if (timeRange) {
      const now = new Date();
      let start;

      if (timeRange === 'week')
        start = new Date(now - 7 * 24 * 60 * 60 * 1000);
      else if (timeRange === 'month')
        start = new Date(now.setMonth(now.getMonth() - 1));
      else if (timeRange === 'quarter')
        start = new Date(now.setMonth(now.getMonth() - 3));
      else if (timeRange === 'year')
        start = new Date(now.setFullYear(now.getFullYear() - 1));

      if (start) query.createdAt = { $gte: start };
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error('getClientProjects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFreelancerProjects = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }

    const { status, search } = req.query;

    // Projects where this freelancer has placed a bid
    const query = {
      'bids.freelancer': req.user._id,
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('client', 'name')
      .populate('bids.freelancer', 'name');

    return res.json(projects);
  } catch (err) {
    console.error('getFreelancerProjects error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getClientProjects,
  getFreelancerProjects,
};
