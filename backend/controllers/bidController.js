const Bid = require('../models/Bid');
const Project = require('../models/Project');

// @desc    Submit a bid
// @route   POST /api/bids
// @access  Private (Freelancer only)
const submitBid = async (req, res) => {
  try {
    const { projectId, proposal, bidAmount, estimatedTime } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Project is not accepting bids' });
    }

    const existingBid = await Bid.findOne({
      project: projectId,
      freelancer: req.user.id
    });

    if (existingBid) {
      return res.status(400).json({
        message: 'You have already submitted a bid for this project'
      });
    }

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
    console.error('submitBid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get bids for a project
// @route   GET /api/bids/project/:projectId
// @access  Private
const getProjectBids = async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate('freelancer', 'name avatar rating skills')
      .sort({ submittedAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('getProjectBids error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get freelancer's bids
// @route   GET /api/bids/my-bids
// @access  Private (Freelancer only)
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user.id })
      .populate({
        path: 'project',
        select: 'title description budget status client',
        populate: {
          path: 'client',
          select: 'name avatar'
        }
      })
      .sort({ submittedAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error('getMyBids error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single bid
// @route   GET /api/bids/:id
// @access  Private
const getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('project')
      .populate('freelancer', 'name avatar');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    res.json(bid);
  } catch (error) {
    console.error('getBidById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update bid
// @route   PUT /api/bids/:id
// @access  Private (Freelancer only)
const updateBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.freelancer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid cannot be updated' });
    }

    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedBid);
  } catch (error) {
    console.error('updateBid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Withdraw bid
// @route   PUT /api/bids/:id/withdraw
// @access  Private (Freelancer only)
const withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.freelancer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    bid.status = 'withdrawn';
    await bid.save();

    res.json(bid);
  } catch (error) {
    console.error('withdrawBid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept bid (client selects a freelancer)
// @route   PUT /api/bids/:id/accept
// @access  Private (Client only)
const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const project = await Project.findById(bid.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure the logged-in user owns the project
    if (project.client.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized to accept bids for this project' });
    }

    // Mark this bid as accepted
    bid.status = 'accepted';
    bid.acceptedAt = new Date();
    await bid.save();

    // Optionally mark other bids as rejected
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    );

    // Update project
    project.selectedFreelancer = bid.freelancer;
    project.status = 'in-progress';
    await project.save();

    // Return accepted bid (frontend uses this as acceptedBid)
    res.json(bid);
  } catch (error) {
    console.error('acceptBid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitBid,
  getProjectBids,
  getMyBids,
  getBidById,
  updateBid,
  withdrawBid,
  acceptBid
};
