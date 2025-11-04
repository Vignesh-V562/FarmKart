const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['farmer', 'business', 'customer', 'admin'])
      .withMessage('Role must be farmer | business | customer | admin')
  ],
  asyncHandler(authController.register)
);

// GET /api/auth/verify/:token → for email verification
router.get('/verify/:token', asyncHandler(authController.verifyEmail));

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  asyncHandler(authController.login)
);

// GET /api/auth/me
router.get('/me', protect, asyncHandler(authController.me));

// POST /api/auth/logout
router.post('/logout', protect, authController.logout);

module.exports = router;
