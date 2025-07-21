const express = require('express');
const {
  signup,
  signin,
  signout,
  signoutAll,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount
} = require('../../controllers/authController');

const { authenticateToken } = require('../../middleware/auth');
const { authLimiter, signupLimiter } = require('../../middleware/rateLimiter');
const {
  signupValidation,
  signinValidation,
  refreshTokenValidation,
  changePasswordValidation,
  updateProfileValidation
} = require('../../utils/validation');

const router = express.Router();

// Public routes
router.post('/signup', signupLimiter, signupValidation, signup);
router.post('/signin', authLimiter, signinValidation, signin);
router.post('/refresh-token', refreshTokenValidation, refreshToken);

// Protected routes
router.post('/signout', authenticateToken, signout);
router.post('/signout-all', authenticateToken, signoutAll);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);
router.put('/deactivate', authenticateToken, deactivateAccount);

module.exports = router; 