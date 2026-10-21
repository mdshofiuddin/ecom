const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const ApiOrderController = require('../controllers/apiOrderController');
const { checkoutLimiter } = require('../middlewares/rateLimiter');

// Middleware to enforce authentication
function requireApiAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

// POST /api/orders/checkout - Atomic checkout transaction
router.post('/checkout', checkoutLimiter, ApiOrderController.processCheckout);

// GET /api/orders/my-orders - User's own orders (strictly filtered by session user ID)
router.get('/my-orders', requireApiAuth, (req, res) => {
  const userId = req.session.user.id;
  const orders = Order.findByUserId(userId);
  res.json({ orders });
});

// GET /api/orders/:orderNumber - Order tracking with strict ownership verification
router.get('/:orderNumber', (req, res) => {
  const order = Order.findByOrderNumber(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  // Enforce ownership: only the order owner or an admin may view order details
  if (order.user_id && order.user_id !== req.session.user?.id && req.session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: You do not have permission to view this order.' });
  }

  res.json({ order });
});

module.exports = router;
