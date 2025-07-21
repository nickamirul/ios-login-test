const express = require('express');
const authRoutes = require('./auth');

const router = express.Router();

// API version 1 routes
router.use('/auth', authRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend iOS API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      authentication: {
        signup: 'POST /api/v1/auth/signup',
        signin: 'POST /api/v1/auth/signin',
        signout: 'POST /api/v1/auth/signout',
        signoutAll: 'POST /api/v1/auth/signout-all',
        refreshToken: 'POST /api/v1/auth/refresh-token',
        getMe: 'GET /api/v1/auth/me',
        updateProfile: 'PUT /api/v1/auth/profile',
        changePassword: 'PUT /api/v1/auth/change-password',
        deactivateAccount: 'PUT /api/v1/auth/deactivate'
      }
    }
  });
});

module.exports = router; 