const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { checkoutLimiter } = require('../middlewares/rateLimiter');
const { checkoutValidationRules, handleValidationErrors } = require('../middlewares/validationMiddleware');

router.get('/checkout', OrderController.showCheckout);
router.post(
  '/checkout',
  checkoutLimiter,
  checkoutValidationRules,
  OrderController.processCheckout
);

router.get('/orders/confirmation/:orderNumber', OrderController.showOrderSuccess);
router.get('/orders/my-orders', ensureAuthenticated, OrderController.showMyOrders);

module.exports = router;
