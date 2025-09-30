const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

console.log('=== Auth routes module loaded ===');
console.log('Router type:', typeof router);
console.log('Router constructor:', router.constructor.name);

// Validation middleware
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  body('phoneNumbers')
    .optional()
    .isArray()
    .withMessage('Phone numbers must be an array'),
  body('phoneNumbers.*')
    .optional({ checkFalsy: true })
    .custom((value) => {
      // Allow any non-empty string that looks like a phone number
      if (value && typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
      throw new Error('Invalid phone number format');
    }),
  body('socialUsernames')
    .optional()
    .isObject()
    .withMessage('Social usernames must be an object')
];

// Routes
router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, authController.updateProfile);
router.patch('/profile', authenticate, updateProfileValidation, authController.updateProfile);

console.log('=== Auth routes registered ===');
console.log('POST /signup');
console.log('POST /login');
console.log('GET /profile');
console.log('PUT /profile');
console.log('PATCH /profile');

// Debug: Log all registered routes
console.log('\nRegistered route handlers:');
router.stack.forEach((layer, index) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
    console.log(`  ${index + 1}. ${methods} ${layer.route.path}`);
  }
});

module.exports = router;
