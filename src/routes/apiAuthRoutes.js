const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { refreshCsrfToken } = require('../utils/csrfHelper');
const { logSecurityEvent } = require('../utils/logger');
const { authLimiter } = require('../middlewares/rateLimiter');

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// GET /api/auth/me - Current user session and CSRF token
router.get('/me', (req, res) => {
  if (!req.session.csrfToken) {
    refreshCsrfToken(req);
  }
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  res.json({
    user: req.session.user || null,
    isAdmin: !!(req.session.user && req.session.user.role === 'admin'),
    csrfToken: req.session.csrfToken
  });
});

// POST /api/auth/login - User authentication with rate limiting and session regeneration
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = User.findByEmail(email);
    if (!user) {
      logSecurityEvent('API_LOGIN_UNKNOWN_EMAIL', null, req.ip, `Email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logSecurityEvent('API_LOGIN_BAD_PASSWORD', user.id, req.ip, `User: ${user.email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const existingCart = req.session.cart || [];

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      req.session.cart = existingCart;
      refreshCsrfToken(req);

      logSecurityEvent('API_LOGIN_SUCCESS', user.id, req.ip, `Role: ${user.role}`);
      res.setHeader('X-CSRF-Token', req.session.csrfToken);
      res.json({
        success: true,
        user: req.session.user,
        csrfToken: req.session.csrfToken,
        message: 'Successfully signed in.'
      });
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register - User creation with strict password validation
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer'
    });

    const existingCart = req.session.cart || [];

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
      req.session.cart = existingCart;
      refreshCsrfToken(req);

      logSecurityEvent('API_USER_REGISTERED', newUser.id, req.ip, `New account: ${newUser.email}`);
      res.setHeader('X-CSRF-Token', req.session.csrfToken);
      res.json({
        success: true,
        user: req.session.user,
        csrfToken: req.session.csrfToken,
        message: 'Account created successfully.'
      });
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout - Session destruction
router.post('/logout', (req, res) => {
  const userId = req.session?.user?.id;
  if (userId) {
    logSecurityEvent('API_USER_LOGOUT', userId, req.ip, 'User logged out');
  }

  req.session.destroy(() => {
    res.clearCookie('__ApexSession');
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

module.exports = router;
