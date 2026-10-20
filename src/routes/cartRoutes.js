const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

router.get('/', CartController.showCart);
router.post('/add', CartController.addToCart);
router.post('/update', CartController.updateQuantity);
router.post('/clear', CartController.clearCart);

module.exports = router;
