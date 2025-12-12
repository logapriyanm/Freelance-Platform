/**
 * Payment Controller
 * Handles all payment-related operations: transactions, withdrawals, and escrow
 */

const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const User = require('../models/User');
const { generateTransactionId, calculateFees } = require('../utils/helpers');

/**
 * Create a payment for a project (Client initiates payment)
 */
exports.createPayment = async (req, res) => {
  try {
    const { projectId, amount, paymentMethod } = req.body;
    
    // Validate project
    const project = await Project.findById(projectId)
      .populate('client', 'name email balance')
      .populate('selectedFreelancer', 'name email balance');
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Check if user is the project client
    if (project.client._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to make payment for this project' 
      });
    }
    
    // Check project status
    if (project.status !== 'in-progress') {
      return res.status(400).json({ 
        success: false, 
        message: 'Project is not in progress' 
      });
    }
    
    // Calculate fees
    const fees = calculateFees(amount, 'client');
    
    // Create transaction
    const transaction = await Transaction.create({
      project: projectId,
      client: req.user.id,
      freelancer: project.selectedFreelancer._id,
      amount: fees.originalAmount,
      platformFee: fees.platformFee,
      netAmount: fees.netAmount,
      status: 'pending',
      paymentMethod,
      transactionId: generateTransactionId()
    });
    
    // Update client balance (deduct amount)
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { balance: -fees.netAmount }
    });
    
    // Update project status
    project.status = 'payment-pending';
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      transaction,
      fees
    });
    
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Payment processing failed' 
    });
  }
};

/**
 * Complete a payment (Simulate payment gateway callback)
 */
exports.completePayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    const transaction = await Transaction.findOne({ transactionId })
      .populate('client', 'name email')
      .populate('freelancer', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    // Verify transaction belongs to user or is admin
    if (transaction.client._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    // Update transaction status
    transaction.status = 'completed';
    await transaction.save();
    
    // Release funds to freelancer (minus platform fee)
    const freelancerAmount = transaction.amount - transaction.platformFee;
    await User.findByIdAndUpdate(transaction.freelancer._id, {
      $inc: { balance: freelancerAmount }
    });
    
    // Update project status
    await Project.findByIdAndUpdate(transaction.project, {
      status: 'payment-released'
    });
    
    res.json({
      success: true,
      message: 'Payment completed successfully',
      transaction
    });
    
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Payment completion failed' 
    });
  }
};

/**
 * Get user's transaction history
 */
exports.getTransactionHistory = async (req, res) => {
  try {
    const { type, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'client') {
      query.client = userId;
    } else if (req.user.role === 'freelancer') {
      query.freelancer = userId;
    } else if (req.user.role === 'admin') {
      // Admin can see all transactions
    } else {
      query.$or = [{ client: userId }, { freelancer: userId }];
    }
    
    // Apply filters
    if (type) {
      if (type === 'sent') query.client = userId;
      if (type === 'received') query.freelancer = userId;
    }
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Get transactions
    const transactions = await Transaction.find(query)
      .populate('project', 'title')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Transaction.countDocuments(query);
    
    // Calculate totals
    const totals = await Transaction.aggregate([
      { $match: query },
      { $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$platformFee' },
          totalNet: { $sum: '$netAmount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      totals: totals[0] || {
        totalAmount: 0,
        totalFees: 0,
        totalNet: 0
      }
    });
    
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch transaction history' 
    });
  }
};

/**
 * Initiate withdrawal request (Freelancer)
 */
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, withdrawalMethod, accountDetails } = req.body;
    
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only freelancers can request withdrawals' 
      });
    }
    
    // Check user balance
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance' 
      });
    }
    
    // Check minimum withdrawal amount
    const minWithdrawal = 50; // Should come from settings
    if (amount < minWithdrawal) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum withdrawal amount is $${minWithdrawal}` 
      });
    }
    
    // Calculate withdrawal fee (2%)
    const withdrawalFee = amount * 0.02;
    const netWithdrawal = amount - withdrawalFee;
    
    // Create withdrawal transaction
    const withdrawal = await Transaction.create({
      client: req.user.id, // Freelancer is the client for withdrawals
      freelancer: req.user.id,
      amount: -amount, // Negative for withdrawals
      platformFee: withdrawalFee,
      netAmount: -netWithdrawal,
      status: 'pending',
      paymentMethod: 'withdrawal',
      transactionId: `WD-${generateTransactionId()}`,
      withdrawalDetails: {
        method: withdrawalMethod,
        accountDetails,
        requestedAt: new Date()
      }
    });
    
    // Hold the amount in balance
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { balance: -amount }
    });
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted',
      withdrawal,
      fees: {
        withdrawalFee,
        netWithdrawal
      }
    });
    
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Withdrawal request failed' 
    });
  }
};

/**
 * Get user wallet/balance
 */
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('balance');
    
    // Get pending withdrawals
    const pendingWithdrawals = await Transaction.find({
      $or: [{ client: req.user.id }, { freelancer: req.user.id }],
      paymentMethod: 'withdrawal',
      status: 'pending'
    });
    
    const totalPending = pendingWithdrawals.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({
      $or: [{ client: req.user.id }, { freelancer: req.user.id }]
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('project', 'title');
    
    res.json({
      success: true,
      balance: user.balance,
      availableBalance: user.balance - totalPending,
      pendingWithdrawals: totalPending,
      recentTransactions
    });
    
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch wallet balance' 
    });
  }
};

/**
 * Create dispute for a transaction (Client or Freelancer)
 */
exports.createDispute = async (req, res) => {
  try {
    const { transactionId, reason, evidence } = req.body;
    
    const transaction = await Transaction.findOne({ transactionId })
      .populate('project', 'title status')
      .populate('client', 'name')
      .populate('freelancer', 'name');
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    // Check if user is involved in transaction
    const isClient = transaction.client._id.toString() === req.user.id;
    const isFreelancer = transaction.freelancer._id.toString() === req.user.id;
    
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to dispute this transaction' 
      });
    }
    
    // Check if dispute can be created
    if (transaction.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only completed transactions can be disputed' 
      });
    }
    
    if (transaction.status === 'disputed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction is already disputed' 
      });
    }
    
    // Update transaction status
    transaction.status = 'disputed';
    transaction.disputeReason = reason;
    transaction.disputeEvidence = evidence;
    transaction.disputeRaisedBy = req.user.id;
    transaction.disputeRaisedAt = new Date();
    await transaction.save();
    
    // Update project status
    await Project.findByIdAndUpdate(transaction.project._id, {
      status: 'disputed'
    });
    
    res.json({
      success: true,
      message: 'Dispute created successfully',
      transaction
    });
    
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create dispute' 
    });
  }
};