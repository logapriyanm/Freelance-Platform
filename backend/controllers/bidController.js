/**
 * Bid Controller - Handles bid operations
 */
const Bid = require('../models/Bid');
const Project = require('../models/Project');

/**
 * Submit a bid (freelancer only)
 */
exports.submitBid = async (req, res) => {
  try {
    const { projectId, proposal, bidAmount, estimatedTime } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ message: 'Project is not accepting bids' });

    const existingBid = await Bid.findOne({ project: projectId, freelancer: req.user.id });
    if (existingBid) return res.status(400).json({ message: 'You have already submitted a bid for this project' });

    const bid = await Bid.create({
      project: projectId,
      freelancer: req.user.id,
      proposal,
      bidAmount,
      estimatedTime
    });

    project.bids.push(bid._id);
    await project.save();

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get bids for a project
 */
exports.getProjectBids = async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate('freelancer', 'name avatar rating skills')
      .sort({ submittedAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get single bid
 */
exports.getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('project')
      .populate('freelancer', 'name avatar');

    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update bid (freelancer only)
 */
exports.updateBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    if (bid.freelancer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid cannot be updated' });
    }

    const updatedBid = await Bid.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Accept bid (client only)
 */
exports.acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const project = await Project.findById(bid.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bid.status = 'accepted';
    bid.acceptedAt = new Date();
    await bid.save();

    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    project.selectedFreelancer = bid.freelancer;
    project.status = 'in-progress';
    await project.save();

    res.json({ message: 'Freelancer assigned', bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.hasApplied = async (req, res) => {
  try {
    const { projectId } = req.params;

    const bid = await Bid.findOne({
      project: projectId,
      freelancer: req.user.id,
    });

    res.json({ applied: !!bid });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
