/**
 * Freelancer Controller - Handles freelancer-specific operations
 */
const Bid = require('../models/Bid');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');

/**
 * Get freelancer's active projects
 */
exports.getFreelancerProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { 'bids.freelancer': req.user.id };

    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('client', 'name')
      .populate('bids.freelancer', 'name');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get freelancer's earnings
 */
exports.getEarnings = async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      freelancer: req.user.id,
      status: 'completed'
    }).sort({ createdAt: -1 });

    const totalEarnings = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    
    res.json({ transactions, totalEarnings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get freelancer's bids
 */
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user.id })
      .populate({
        path: 'project',
        select: 'title description budget status client',
        populate: { path: 'client', select: 'name avatar' }
      })
      .sort({ submittedAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Withdraw a bid
 */
exports.withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    if (bid.freelancer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    bid.status = 'withdrawn';
    await bid.save();

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};