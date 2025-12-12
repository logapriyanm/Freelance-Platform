/**
 * User Controller - Handles operations for both clients and freelancers
 */
const User = require('../models/User');
const Review = require('../models/Review');

/**
 * Get public user profile by ID
 */
exports.getUserProfile = async (req, res) => {
  try {
    const id = req.params.id;
    // Validate ObjectId to avoid Mongoose cast errors
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reviews = await Review.find({ reviewee: id })
      .populate('reviewer', 'name avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json({ user, reviews });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
/**
 * Update portfolio
 */
exports.updatePortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.portfolio = Array.isArray(req.body.portfolio) ? req.body.portfolio : [];
    await user.save();

    res.json(user.portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Add portfolio item
 */
exports.addPortfolioItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.portfolio.push(req.body);
    await user.save();

    res.json(user.portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Update skills
 */
exports.updateSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.skills = Array.isArray(req.body.skills) ? req.body.skills : [];
    await user.save();

    res.json(user.skills);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Search freelancers
 */
exports.searchFreelancers = async (req, res) => {
  try {
    const { skills, minRating, location, search } = req.query;
    const query = { role: 'freelancer', isVerified: true };

    if (skills) query.skills = { $in: skills.split(',').map((s) => s.trim()) };
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (location) query.location = { $regex: location, $options: 'i' };
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
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get current user profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};