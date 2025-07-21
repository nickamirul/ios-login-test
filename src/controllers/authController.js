const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');

// Helper function to create and send tokens
const createSendToken = async (user, statusCode, res, message) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  
  // Add refresh token to user's refresh tokens array
  await user.addRefreshToken(refreshToken);
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const userData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    },
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
      refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    }
  };

  sendSuccessResponse(res, message, userData, statusCode);
};

// @desc    Register user
// @route   POST /api/v1/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, 'User with this email already exists', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    createSendToken(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/signin
// @access  Public
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendErrorResponse(res, 'Invalid email or password', 401);
    }

    // Check if user account is active
    if (!user.isActive) {
      return sendErrorResponse(res, 'Account is deactivated. Please contact support.', 401);
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return sendErrorResponse(res, 'Invalid email or password', 401);
    }

    createSendToken(user, 200, res, 'User signed in successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Sign out user
// @route   POST /api/v1/auth/signout
// @access  Private
const signout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      // Remove specific refresh token
      await user.removeRefreshToken(refreshToken);
    } else {
      // Remove all refresh tokens (sign out from all devices)
      await user.removeAllRefreshTokens();
    }

    sendSuccessResponse(res, 'User signed out successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Sign out from all devices
// @route   POST /api/v1/auth/signout-all
// @access  Private
const signoutAll = async (req, res, next) => {
  try {
    const user = req.user;
    await user.removeAllRefreshTokens();

    sendSuccessResponse(res, 'User signed out from all devices successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendErrorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendErrorResponse(res, 'Invalid refresh token', 401);
    }

    if (!user.isActive) {
      return sendErrorResponse(res, 'Account is deactivated', 401);
    }

    // Check if refresh token exists in user's refresh tokens
    const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
    if (!tokenExists) {
      return sendErrorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new access token
    const newAccessToken = user.generateAccessToken();

    const tokenData = {
      accessToken: newAccessToken,
      accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRE || '15m'
    };

    sendSuccessResponse(res, 'Access token refreshed successfully', tokenData);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 'Invalid refresh token', 401);
    }
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    sendSuccessResponse(res, 'User data retrieved successfully', userData);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendErrorResponse(res, 'Email already exists', 400);
      }
      user.email = email;
      user.isEmailVerified = false; // Reset email verification if email is changed
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    sendSuccessResponse(res, 'Profile updated successfully', userData);
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return sendErrorResponse(res, 'Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Remove all refresh tokens to force re-login on all devices
    await user.removeAllRefreshTokens();

    sendSuccessResponse(res, 'Password changed successfully. Please sign in again.');
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate account
// @route   PUT /api/v1/auth/deactivate
// @access  Private
const deactivateAccount = async (req, res, next) => {
  try {
    const user = req.user;
    
    user.isActive = false;
    await user.save();

    // Remove all refresh tokens
    await user.removeAllRefreshTokens();

    sendSuccessResponse(res, 'Account deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  signout,
  signoutAll,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount
}; 