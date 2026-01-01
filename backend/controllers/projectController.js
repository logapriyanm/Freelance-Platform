/**
 * Project Controller - Handles project operations
 */
const Project = require('../models/Project');

/**
 * Get all projects (browse)
 */
exports.getProjects = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'open' };

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('client', 'name');

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * Get single project
 */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name')
      .populate('bids.freelancer', 'name');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create project (client only)
 */
exports.createProject = async (req, res) => {
  try {
    const { title, description, category, budgetType, budget, duration, skills, deadline } = req.body;

    const project = await Project.create({
      title,
      description,
      category,
      budgetType,
      budget,
      duration,
      skills,
      deadline,
      client: req.user.id,
      status: 'open',
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update project (client only)
 */
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete project (client only)
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get client's projects
 */
exports.getClientProjects = async (req, res) => {
  try {
    const query = { client: req.user.id };
    const timeRange = req.query.timeRange;

    if (timeRange) {
      const now = new Date();
      let start;

      if (timeRange === 'week') start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (timeRange === 'month') {
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
      }
      else if (timeRange === 'quarter') {
        start = new Date(now);
        start.setMonth(now.getMonth() - 3);
      }
      else if (timeRange === 'year') {
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
      }

      if (start) query.createdAt = { $gte: start };
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};