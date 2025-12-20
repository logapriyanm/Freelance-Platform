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
    const bids = await Bid.find({ freelancer: req.user.id })
      .select('project');

    const projectIds = bids.map(b => b.project);

    const projects = await Project.find({ _id: { $in: projectIds } })
      .populate('client', 'name')
      .sort({ createdAt: -1 });

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
    const freelancerId = req.user.id;

    const transactions = await Transaction.find({ freelancer: freelancerId })
      .populate('project', 'title')
      .populate('client', 'name')
      .sort({ createdAt: -1 });

    let stats = {
      totalEarnings: 0,
      pendingBalance: 0,
      availableBalance: 0,
      thisMonth: 0,
      lastMonth: 0
    };

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    transactions.forEach(t => {
      stats.totalEarnings += t.netAmount;

      if (t.status === 'pending') {
        stats.pendingBalance += t.netAmount;
      }

      if (t.status === 'completed') {
        stats.availableBalance += t.netAmount;

        if (t.createdAt >= startOfThisMonth) {
          stats.thisMonth += t.netAmount;
        }

        if (t.createdAt >= startOfLastMonth && t.createdAt <= endOfLastMonth) {
          stats.lastMonth += t.netAmount;
        }
      }
    });

    res.json({
      stats,
      transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      stats: {
        totalEarnings: 0,
        pendingBalance: 0,
        availableBalance: 0,
        thisMonth: 0,
        lastMonth: 0
      },
      transactions: []
    });
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