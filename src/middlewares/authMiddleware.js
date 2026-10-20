const { logSecurityEvent } = require('../utils/logger');

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/auth/login?error=Please log in to continue.');
}

function ensureAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login?error=Admin authorization required.');
  }

  if (req.session.user.role !== 'admin') {
    logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT', req.session.user.id, req.ip, `Path: ${req.originalUrl}`);
    return res.status(403).render('pages/error', {
      title: 'Access Forbidden',
      statusCode: 403,
      errorMessage: 'Access denied. You do not possess administrator privileges.'
    });
  }

  next();
}

function ensureGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  next();
}

function populateViewLocals(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAdmin = req.session.user && req.session.user.role === 'admin';
  
  // Calculate cart count
  const cart = req.session.cart || [];
  res.locals.cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  
  // Flash messages support from query or session
  res.locals.successMsg = req.query.success || null;
  res.locals.errorMsg = req.query.error || null;
  
  res.locals.currentPath = req.path;
  next();
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  ensureGuest,
  populateViewLocals
};
