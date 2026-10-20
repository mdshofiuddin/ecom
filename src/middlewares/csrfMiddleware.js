const crypto = require('crypto');
const { logSecurityEvent } = require('../utils/logger');

function csrfProtection(req, res, next) {
  // Ensure session exists
  if (!req.session) {
    return next(new Error('Session not initialized before CSRF check.'));
  }

  // Ensure CSRF token exists in session
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Set CSRF token in header for API clients & SPA synchronization
  res.setHeader('X-CSRF-Token', req.session.csrfToken);

  // Make token available to views & helper function
  res.locals.csrfToken = req.session.csrfToken;
  req.csrfToken = () => req.session.csrfToken;

  // Safe HTTP methods do not require token verification
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Extract token from request body, query, or headers
  const submittedToken = 
    (req.body && req.body._csrf) ||
    (req.query && req.query._csrf) ||
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'];

  const isApi = req.originalUrl.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'));

  if (
    !submittedToken ||
    typeof submittedToken !== 'string' ||
    submittedToken.length !== req.session.csrfToken.length
  ) {
    logSecurityEvent('CSRF_VALIDATION_FAILED', req.session.user?.id || null, req.ip, `Method: ${req.method}, Path: ${req.originalUrl}`);
    if (isApi) {
      return res.status(403).json({ error: 'Invalid or missing CSRF security token.' });
    }
    return res.status(403).render('pages/error', {
      title: 'Security Alert: CSRF Token Mismatch',
      statusCode: 403,
      errorMessage: 'Invalid or missing CSRF security token. Your form submission was blocked to protect your account.'
    });
  }

  // Perform timing-safe comparison to prevent side-channel timing attacks
  const submittedBuf = Buffer.from(submittedToken);
  const sessionBuf = Buffer.from(req.session.csrfToken);

  if (!crypto.timingSafeEqual(submittedBuf, sessionBuf)) {
    logSecurityEvent('CSRF_TOKEN_MISMATCH', req.session.user?.id || null, req.ip, `Path: ${req.originalUrl}`);
    if (isApi) {
      return res.status(403).json({ error: 'Cross-Site Request Forgery token mismatch.' });
    }
    return res.status(403).render('pages/error', {
      title: 'Security Alert: CSRF Token Invalid',
      statusCode: 403,
      errorMessage: 'Cross-Site Request Forgery protection triggered. Request rejected.'
    });
  }

  next();
}

module.exports = csrfProtection;
