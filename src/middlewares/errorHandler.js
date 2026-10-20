const { logSecurityEvent } = require('../utils/logger');

function notFoundHandler(req, res, next) {
  const isApi = req.originalUrl.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'));
  if (isApi) {
    return res.status(404).json({ error: 'The requested API endpoint was not found.' });
  }

  res.status(404).render('pages/error', {
    title: '404 - Page Not Found',
    statusCode: 404,
    errorMessage: 'The page or resource you are looking for does not exist.'
  });
}

function globalErrorHandler(err, req, res, next) {
  // Log event
  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  logSecurityEvent('SERVER_ERROR', req.session?.user?.id || null, req.ip, `${err.message} (${req.originalUrl})`);

  const statusCode = err.status || err.statusCode || 500;
  
  // Safe messaging in production to avoid leaking database schemas or system paths
  const isDev = process.env.NODE_ENV !== 'production';
  const displayMessage = isDev
    ? err.message || 'An unexpected error occurred.'
    : 'A server error occurred. Our team has been notified. Please try again later.';

  const isApi = req.originalUrl.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'));
  if (isApi) {
    return res.status(statusCode).json({ error: displayMessage });
  }

  res.status(statusCode).render('pages/error', {
    title: `${statusCode} - Server Error`,
    statusCode,
    errorMessage: displayMessage,
    errorStack: isDev ? err.stack : null
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
