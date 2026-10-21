const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { calculateCart } = require('../utils/cartCalculator');

// GET /api/cart - Retrieve current cart state and totals
router.get('/', (req, res) => {
  const cartData = calculateCart(req.session.cart);
  res.json(cartData);
});

// POST /api/cart/add - Add item to cart with stock validation
router.post('/add', (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const quantity = Math.max(1, Math.min(99, parseInt(req.body.quantity, 10) || 1));

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ error: 'Valid Product ID is required.' });
  }

  const product = Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product does not exist.' });
  }

  if (product.stock < 1) {
    return res.status(400).json({ error: 'Product is currently out of stock.' });
  }

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const existingIndex = req.session.cart.findIndex(i => i.productId === productId);
  if (existingIndex > -1) {
    const newQty = req.session.cart[existingIndex].quantity + quantity;
    if (newQty > product.stock) {
      req.session.cart[existingIndex].quantity = product.stock;
    } else {
      req.session.cart[existingIndex].quantity = newQty;
    }
  } else {
    req.session.cart.push({
      productId,
      quantity: Math.min(quantity, product.stock)
    });
  }

  const cartData = calculateCart(req.session.cart);
  res.json({ message: 'Item added to bag.', cart: cartData });
});

// POST /api/cart/update - Update quantity or remove item
router.post('/update', (req, res) => {
  const productId = parseInt(req.body.productId, 10);
  const action = req.body.action;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const index = req.session.cart.findIndex(i => i.productId === productId);
  if (index > -1) {
    const product = Product.findById(productId);
    if (action === 'increment' && product) {
      if (req.session.cart[index].quantity < product.stock) {
        req.session.cart[index].quantity += 1;
      }
    } else if (action === 'decrement') {
      req.session.cart[index].quantity -= 1;
      if (req.session.cart[index].quantity <= 0) {
        req.session.cart.splice(index, 1);
      }
    } else if (action === 'remove') {
      req.session.cart.splice(index, 1);
    }
  }

  const cartData = calculateCart(req.session.cart);
  res.json({ message: 'Cart updated.', cart: cartData });
});

// POST /api/cart/clear - Clear all items from session cart
router.post('/clear', (req, res) => {
  req.session.cart = [];
  const cartData = calculateCart(req.session.cart);
  res.json({ message: 'Cart cleared.', cart: cartData });
});

module.exports = router;
