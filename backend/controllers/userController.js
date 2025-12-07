// backend/controllers/userController.js
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get user profile (public by ID)
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user reviews
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json({
      user,
      reviews,
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update portfolio (replace entire array)
// @route   PUT /api/users/portfolio
// @access  Private
const updatePortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.portfolio = Array.isArray(req.body.portfolio)
      ? req.body.portfolio
      : [];

    await user.save();

    res.json(user.portfolio);
  } catch (error) {
    console.error('updatePortfolio error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Add single portfolio item
// @route   POST /api/users/portfolio
// @access  Private
const addPortfolioItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.portfolio.push(req.body);
    await user.save();

    res.json(user.portfolio);
  } catch (error) {
    console.error('addPortfolioItem error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update skills
// @route   PUT /api/users/skills
// @access  Private
const updateSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.skills = Array.isArray(req.body.skills)
      ? req.body.skills
      : [];

    await user.save();

    res.json(user.skills);
  } catch (error) {
    console.error('updateSkills error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Search freelancers
// @route   GET /api/users/freelancers
// @access  Public
const searchFreelancers = async (req, res) => {
  try {
    const { skills, minRating, location, search } = req.query;

    const query = { role: 'freelancer', isVerified: true };

    if (skills) {
      query.skills = {
        $in: skills.split(',').map((s) => s.trim()),
      };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const freelancers = await User.find(query)
      .select('-password')
      .sort({ rating: -1, yearsExperience: -1 });

    res.json(freelancers);
  } catch (error) {
    console.error('searchFreelancers error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updatePortfolio,
  addPortfolioItem,
  updateSkills,
  searchFreelancers,
};
