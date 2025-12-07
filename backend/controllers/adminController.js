const User = require('../models/User');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalBids,
      totalTransactions,
      pendingVerifications,
      activeProjects,
      completedProjects,
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Bid.countDocuments(),
      Transaction.countDocuments(),
      User.countDocuments({ isVerified: false }),
      Project.countDocuments({ status: 'in-progress' }),
      Project.countDocuments({ status: 'completed' }),
    ]);

    const revenue = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalBids,
      totalTransactions,
      pendingVerifications,
      activeProjects,
      completedProjects,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { role, verified, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (role) query.role = role;
    if (verified) query.isVerified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDisputes = async (req, res) => {
  try {
    const disputes = await Transaction.find({ status: 'disputed' })
      .populate('project', 'title')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update user verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: 'User verified successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Suspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = true;
    user.suspensionReason = req.body.reason;
    await user.save();

    res.json({ message: 'User suspended successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all projects with filters
// @route   GET /api/admin/projects
// @access  Private (Admin only)
const getAdminProjects = async (req, res) => {
  try {
    const { status, category, startDate, endDate } = req.query;

    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const projects = await Project.find(query)
      .populate('client', 'name email')
      .populate('selectedFreelancer', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Resolve dispute
// @route   PUT /api/admin/disputes/:id/resolve
// @access  Private (Admin only)
const resolveDispute = async (req, res) => {
  try {
    const { resolution, refundPercentage } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (resolution === 'refund') {
      transaction.status = 'refunded';
      transaction.refundAmount =
        transaction.amount * (Number(refundPercentage) / 100);
    } else if (resolution === 'release') {
      transaction.status = 'completed';
    }

    transaction.resolvedBy = req.user.id;
    transaction.resolution = resolution;
    transaction.resolvedAt = new Date();

    await transaction.save();

    if (transaction.project) {
      await Project.findByIdAndUpdate(transaction.project, {
        status: resolution === 'refund' ? 'cancelled' : 'completed',
      });
    }

    res.json({ message: 'Dispute resolved successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const categoryDistribution = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      monthlyRevenue,
      userGrowth,
      categoryDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        platformName: 'FreelancePro',
        platformEmail: 'admin@freelancepro.com',
        supportEmail: 'support@freelancepro.com',
        contactPhone: '+1 (555) 123-4567',
        defaultCurrency: 'USD',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        platformCommission: 10,
        freelancerCommission: 5,
        clientFeePercentage: 2.5,
        transactionFee: 2,
        withdrawalFee: 1,
        minimumWithdrawal: 50,
        maximumWithdrawal: 10000,
        maxLoginAttempts: 5,
        sessionTimeout: 60,
        twoFactorEnabled: true,
        passwordMinLength: 8,
        requireStrongPassword: true,
        ipWhitelist: [],
        emailVerificationRequired: true,
        identityVerificationRequired: true,
        portfolioVerificationRequired: true,
        bankVerificationRequired: true,
        projectAutoApprove: false,
        maxProjectDuration: 180,
        minProjectBudget: 10,
        maxProjectBudget: 50000,
        escrowEnabled: true,
        escrowPercentage: 50,
        disputeResolutionDays: 7,
        emailNotifications: true,
        pushNotifications: true,
        projectAlerts: true,
        paymentAlerts: true,
        securityAlerts: true,
        cacheEnabled: true,
        cacheDuration: 300,
        maxUploadSize: 10,
        allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
        termsUrl: '/terms',
        privacyUrl: '/privacy',
        refundPolicyUrl: '/refund-policy',
        cookiePolicyUrl: '/cookie-policy',
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Backup settings
// @route   GET /api/admin/settings/backup
// @access  Private (Admin only)
const backupSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=settings-backup-${timestamp}.json`
    );
    res.send(JSON.stringify(settings, null, 2));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset to default settings
// @route   POST /api/admin/settings/reset
// @access  Private (Admin only)
// @access  Private (Admin only)
const resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});

    const defaultSettings = {
      platformName: 'FreelancePro',
      platformEmail: 'admin@freelancepro.com',
      supportEmail: 'support@freelancepro.com',
      contactPhone: '+1 (555) 123-4567',
      defaultCurrency: 'USD',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      platformCommission: 10,
      freelancerCommission: 5,
      clientFeePercentage: 2.5,
      transactionFee: 2,
      withdrawalFee: 1,
      minimumWithdrawal: 50,
      maximumWithdrawal: 10000,
      maxLoginAttempts: 5,
      sessionTimeout: 60,
      twoFactorEnabled: true,
      passwordMinLength: 8,
      requireStrongPassword: true,
      ipWhitelist: [],
      emailVerificationRequired: true,
      identityVerificationRequired: true,
      portfolioVerificationRequired: true,
      bankVerificationRequired: true,
      projectAutoApprove: false,
      maxProjectDuration: 180,
      minProjectBudget: 10,
      maxProjectBudget: 50000,
      escrowEnabled: true,
      escrowPercentage: 50,
      disputeResolutionDays: 7,
      emailNotifications: true,
      pushNotifications: true,
      projectAlerts: true,
      paymentAlerts: true,
      securityAlerts: true,
      cacheEnabled: true,
      cacheDuration: 300,
      maxUploadSize: 10,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
      termsUrl: '/terms',
      privacyUrl: '/privacy',
      refundPolicyUrl: '/refund-policy',
      cookiePolicyUrl: '/cookie-policy',
    };

    const settings = await Settings.create(defaultSettings);

    res.json({
      success: true,
      message: 'Settings reset to default values',
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentActivities = async (req, res) => {
  try {
    const [recentUsers, recentProjects, recentTransactions] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name role createdAt'),
      Project.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status createdAt'),
      Transaction.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount status createdAt'),
    ]);

    const activities = [];

    recentUsers.forEach((u) => {
      activities.push({
        type: 'user',
        title: 'New user registered',
        description: `${u.name} joined as ${u.role}`,
        createdAt: u.createdAt,
      });
    });

    recentProjects.forEach((p) => {
      activities.push({
        type: 'project',
        title: 'Project activity',
        description: `${p.title} (${p.status})`,
        createdAt: p.createdAt,
      });
    });

    recentTransactions.forEach((t) => {
      activities.push({
        type: 'transaction',
        title: 'Transaction update',
        description: `Transaction of $${t.amount} is ${t.status}`,
        createdAt: t.createdAt,
      });
    });

    activities.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error('getRecentActivities error:', error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
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
  getRecentActivities
};