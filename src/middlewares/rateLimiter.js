const rateLimit = require('express-rate-limit');
const { logSecurityEvent } = require('../utils/logger');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts
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
  windowMs: 15 * 60 * 1000,
  max: 15,
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
