const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { ensureGuest, ensureAuthenticated } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  loginValidationRules,
  registerValidationRules,
  handleValidationErrors
} = require('../middlewares/validationMiddleware');

router.get('/login', ensureGuest, AuthController.showLogin);
router.post(
  '/login',
  authLimiter,
  loginValidationRules,
  handleValidationErrors('pages/login', 'Sign In | ApexStore'),
  AuthController.processLogin
);

router.get('/register', ensureGuest, AuthController.showRegister);
router.post(
  '/register',
  authLimiter,
  registerValidationRules,
  handleValidationErrors('pages/register', 'Create Account | ApexStore'),
  AuthController.processRegister
);

router.post('/logout', AuthController.logout);

module.exports = router;
