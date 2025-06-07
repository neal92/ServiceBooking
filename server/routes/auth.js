const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register route
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], authController.register);

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Get current user (protected route)
router.get('/me', authenticate, authController.getCurrentUser);

// Update profile (protected route)
router.put('/profile', authenticate, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty if provided'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty if provided'),
  body('email').optional().isEmail().withMessage('Valid email is required if provided')
], authController.updateProfile);

// Change password (protected route)
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], authController.changePassword);

// Upload avatar (protected route)
router.post('/avatar', authenticate, authController.uploadAvatar);

module.exports = router;
