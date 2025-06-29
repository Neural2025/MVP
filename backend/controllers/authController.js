const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const emailValidationService = require('../services/emailValidationService');

// Register new user
const Team = require('../models/Team');
const crypto = require('crypto');

const signup = async (req, res) => {
  try {
    // Debug: log incoming signup request (do NOT log password)
    logger.info('[Signup] Request body:', { name: req.body.name, email: req.body.email, teamName: req.body.teamName });

    const { name, email, password, teamName } = req.body;
    // Restrict to admin only
    const role = 'admin';

    // Validate input
    if (!name || !email || !password || !teamName) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password, and role are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Only allow admin role here
    if (role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Only admin signup is allowed.'
      });
    }

    // Validate email format first
    if (!emailValidationService.isValidFormat(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate email existence (async)
    const emailValidation = await emailValidationService.validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: emailValidation.reason || 'Invalid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    logger.info('[Signup] Existing user:', existingUser);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new admin user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      emailVerified: emailValidation.isValid
    });
    await user.save();

    // Generate unique team code
    let teamCode;
    let teamExists = true;
    while (teamExists) {
      teamCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char code
      teamExists = await Team.findOne({ code: teamCode });
    }
    logger.info('[Signup] Generated team code:', teamCode);

    // Create new team
    const team = new Team({
      name: teamName,
      code: teamCode,
      owner: user._id,
      members: [user._id]
    });
    await team.save();
    logger.info('[Signup] New team created:', team.name);

    // Generate token
    const token = generateToken(user._id);
    await user.updateLastLogin();
    logger.info(`New admin registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin and team created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      team: {
        id: team._id,
        name: team.name,
        code: team.code
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Migrate old role if needed
    if (user.role === 'user') {
      user.role = 'developer';
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        analysisCount: user.analysisCount,
        testGenerationCount: user.testGenerationCount,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        analysisCount: user.analysisCount,
        testGenerationCount: user.testGenerationCount,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (name) {
      user.name = name.trim();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        analysisCount: user.analysisCount,
        testGenerationCount: user.testGenerationCount
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  logout
};
