const rateLimit = require('express-rate-limit');
const { logSecurityEvent } = require('../utils/logger');
const {
  GLOBAL_LIMIT_MAX,
  GLOBAL_LIMIT_WINDOW_MS,
  AUTH_LIMIT_ATTEMPTS,
  AUTH_LIMIT_WINDOW_MS,
  CHECKOUT_LIMIT_MAX,
  CHECKOUT_LIMIT_WINDOW_MS
} = require('../config/rateLimitConfig');

const globalLimiter = rateLimit({
  windowMs: GLOBAL_LIMIT_WINDOW_MS,
  max: GLOBAL_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again in 15 minutes.'
  },
  handler: (req, res, next, options) => {
    logSecurityEvent('RATE_LIMIT_EXCEEDED_GLOBAL', req.session?.user?.id || null, req.ip, `Path: ${req.originalUrl}`);
    res.status(429).render('pages/error', {
      title: 'Too Many Requests',
      statusCode: 429,
      errorMessage: options.message.message || 'Too many requests. Please slow down.'
    });
  }
});

const authLimiter = rateLimit({
  windowMs: AUTH_LIMIT_WINDOW_MS,
  max: AUTH_LIMIT_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  handler: (req, res, next, options) => {
    logSecurityEvent('BRUTE_FORCE_BLOCKED', null, req.ip, `Auth endpoint blocked: ${req.originalUrl}`);
    res.status(429).render('pages/error', {
      title: 'Authentication Blocked',
      statusCode: 429,
      errorMessage: 'Too many failed or rapid attempts. Access temporarily locked for 15 minutes for your protection.'
    });
  }
});

const checkoutLimiter = rateLimit({
  windowMs: CHECKOUT_LIMIT_WINDOW_MS,
  max: CHECKOUT_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many order requests. Please wait a few moments.',
  handler: (req, res, next, options) => {
    logSecurityEvent('CHECKOUT_SPAM_BLOCKED', req.session?.user?.id || null, req.ip, 'Rapid order attempts');
    res.status(429).render('pages/error', {
      title: 'Slow Down',
      statusCode: 429,
      errorMessage: 'You have submitted too many requests recently. Please wait a few minutes before trying again.'
    });
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  checkoutLimiter
};
