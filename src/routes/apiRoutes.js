const express = require('express');
const router = express.Router();
const { refreshCsrfToken } = require('../utils/csrfHelper');

// Sub-routers
const apiProductRoutes = require('./apiProductRoutes');
const apiCartRoutes = require('./apiCartRoutes');
const apiAuthRoutes = require('./apiAuthRoutes');
const apiOrderRoutes = require('./apiOrderRoutes');
const apiAdminRoutes = require('./apiAdminRoutes');

// Root API CSRF Token Endpoint
router.get('/csrf-token', (req, res) => {
  if (!req.session.csrfToken) {
    refreshCsrfToken(req);
  }
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  res.json({ csrfToken: req.session.csrfToken });
});

// Mount Sub-Routers
router.use('/products', apiProductRoutes);
router.use('/cart', apiCartRoutes);
router.use('/auth', apiAuthRoutes);
router.use('/orders', apiOrderRoutes);
router.use('/admin', apiAdminRoutes);

// Direct root aliases for convenience and backward compatibility
router.use('/', apiOrderRoutes);

module.exports = router;
