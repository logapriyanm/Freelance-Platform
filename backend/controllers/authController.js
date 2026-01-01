const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        title: user.title,
        hourlyRate: user.hourlyRate,
        skills: user.skills,
        portfolio: user.portfolio,
        experience: user.experience,
        education: user.education,
        languages: user.languages,
        yearsExperience: user.yearsExperience,
        rating: user.rating,
        totalReviews: user.totalReviews,
        location: user.location,
        phone: user.phone,
        balance: user.balance,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        title: user.title,
        hourlyRate: user.hourlyRate,
        skills: user.skills,
        portfolio: user.portfolio,
        experience: user.experience,
        education: user.education,
        languages: user.languages,
        yearsExperience: user.yearsExperience,
        rating: user.rating,
        totalReviews: user.totalReviews,
        location: user.location,
        phone: user.phone,
        balance: user.balance,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔧 Fix legacy bad shapes from old schema
    if (!Array.isArray(user.experience)) user.experience = [];
    if (!Array.isArray(user.education)) user.education = [];
    if (!Array.isArray(user.portfolio)) user.portfolio = [];
    if (!Array.isArray(user.skills)) user.skills = [];
    if (!Array.isArray(user.languages)) user.languages = [];

    const {
      name,
      bio,
      title,
      hourlyRate,
      skills,
      portfolio,
      experience,
      education,
      languages,
      location,
      phone,
      yearsExperience,
    } = req.body;

    // Basic fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (title !== undefined) user.title = title;
    if (location !== undefined) user.location = location;
    if (phone !== undefined) user.phone = phone;

    if (hourlyRate !== undefined) {
      user.hourlyRate = Number(hourlyRate) || 0;
    }

    if (yearsExperience !== undefined) {
      user.yearsExperience = Number(yearsExperience) || 0;
    }

    // Arrays – ALWAYS ensure they are arrays of objects/strings
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : [];
    }

    if (languages !== undefined) {
      user.languages = Array.isArray(languages) ? languages : [];
    }

    if (portfolio !== undefined) {
      user.portfolio = Array.isArray(portfolio) ? portfolio : [];
    }

    if (experience !== undefined) {
      user.experience = Array.isArray(experience) ? experience : [];
    }

    if (education !== undefined) {
      user.education = Array.isArray(education) ? education : [];
    }

    // Avatar upload (if you’re using Multer + uploadMiddleware)
    if (req.file) {
      // e.g. save relative path or full URL
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile };