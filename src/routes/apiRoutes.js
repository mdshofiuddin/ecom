const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { logSecurityEvent } = require('../utils/logger');
const { authLimiter, checkoutLimiter } = require('../middlewares/rateLimiter');

// Middleware to require logged-in user for API
function requireApiAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

// Middleware to require admin for API
function requireApiAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    logSecurityEvent('UNAUTHORIZED_ADMIN_API_ATTEMPT', req.session?.user?.id || null, req.ip, `Path: ${req.originalUrl}`);
    return res.status(403).json({ error: 'Access forbidden. Administrator credentials required.' });
  }
  next();
}

// Helper to compute cart totals securely
function calculateCart(sessionCart) {
  const rawCart = sessionCart || [];
  const cartItems = [];
  let subtotal = 0;

  for (const item of rawCart) {
    const product = Product.findById(item.productId);
    if (product) {
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      cartItems.push({
        product,
        quantity: item.quantity,
        subtotal: Math.round(itemTotal * 100) / 100
      });
    }
  }

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return {
    cartItems,
    subtotal: Math.round(subtotal * 100) / 100,
    shipping,
    tax,
    total,
    itemCount: cartItems.reduce((acc, curr) => acc + curr.quantity, 0)
  };
}

// ==========================================
// 1. SYSTEM & CSRF
// ==========================================
router.get('/csrf-token', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  res.json({ csrfToken: req.session.csrfToken });
});

// ==========================================
// 2. PRODUCTS
// ==========================================
router.get('/products', (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const products = Product.findAll({
      category: category || 'all',
      search: search || '',
      sort: sort || 'featured',
      limit: 100
    });
    const categories = Product.getCategories();
    res.json({ products, categories });
  } catch (err) {
    next(err);
  }
});

router.get('/products/featured', (req, res, next) => {
  try {
    const products = Product.findFeatured(6);
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:slug', (req, res, next) => {
  try {
    const product = Product.findBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const related = Product.findAll({
      category: product.category,
      limit: 4
    }).filter(p => p.id !== product.id);

    res.json({ product, related });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. CART OPERATIONS
// ==========================================
router.get('/cart', (req, res) => {
  const cartData = calculateCart(req.session.cart);
  res.json(cartData);
});

router.post('/cart/add', (req, res) => {
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

router.post('/cart/update', (req, res) => {
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

router.post('/cart/clear', (req, res) => {
  req.session.cart = [];
  const cartData = calculateCart(req.session.cart);
  res.json({ message: 'Cart cleared.', cart: cartData });
});

// ==========================================
// 4. CHECKOUT & PAYMENTS (bKash, Rocket, Card, COD)
// ==========================================
router.post('/checkout', checkoutLimiter, async (req, res, next) => {
  try {
    const rawCart = req.session.cart || [];
    if (rawCart.length === 0) {
      return res.status(400).json({ error: 'Your shopping bag is empty.' });
    }

    const {
      customer_name,
      customer_email,
      shipping_address,
      city,
      postal_code,
      payment_method,
      payment_number,
      transaction_id
    } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !city || !postal_code) {
      return res.status(400).json({ error: 'All shipping and contact details are required.' });
    }

    const allowedPaymentMethods = ['bkash', 'rocket', 'card', 'cash_on_delivery'];
    const chosenMethod = allowedPaymentMethods.includes(payment_method) ? payment_method : 'bkash';

    // bKash & Rocket Verification Validations
    if (chosenMethod === 'bkash') {
      const cleanNum = (payment_number || '').replace(/\s+/g, '');
      if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(cleanNum)) {
        return res.status(400).json({
          error: 'Please provide a valid 11-digit mobile wallet number for bKash (e.g. 01712345678).'
        });
      }
    } else if (chosenMethod === 'rocket') {
      const cleanNum = (payment_number || '').replace(/\s+/g, '');
      // Rocket (Dutch-Bangla Bank) accounts have 12 digits (11-digit mobile + 1 check digit) or 11 digits
      if (!/^(?:\+88|88)?(01[3-9]\d{8,9})$/.test(cleanNum)) {
        return res.status(400).json({
          error: 'Please provide a valid 11 or 12-digit mobile account number for Rocket (e.g. 017123456789).'
        });
      }
    }

    if (chosenMethod === 'bkash' || chosenMethod === 'rocket') {
      if (!transaction_id || transaction_id.trim().length < 4) {
        return res.status(400).json({
          error: `A valid Transaction ID (TrxID) is required for ${chosenMethod.toUpperCase()} payment verification.`
        });
      }

      // Check for duplicate Transaction ID in existing orders to prevent fraud
      const cleanTrx = transaction_id.trim().toUpperCase();
      const duplicate = db.prepare('SELECT id FROM orders WHERE transaction_id = ?').get(cleanTrx);
      if (duplicate) {
        logSecurityEvent('DUPLICATE_TRX_ID_ATTEMPT', req.session?.user?.id || null, req.ip, `Trx: ${cleanTrx}`);
        return res.status(400).json({
          error: `Transaction ID "${cleanTrx}" has already been claimed on another order. Please check your SMS or enter a unique TrxID.`
        });
      }
    }

    const orderNumber = `APX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const userId = req.session.user?.id || null;

    const result = Order.createOrderTransaction({
      orderNumber,
      userId,
      customerName: customer_name.trim(),
      customerEmail: customer_email.toLowerCase().trim(),
      shippingAddress: shipping_address.trim(),
      city: city.trim(),
      postalCode: postal_code.trim(),
      paymentMethod: chosenMethod,
      paymentNumber: payment_number ? payment_number.trim() : null,
      transactionId: transaction_id ? transaction_id.trim().toUpperCase() : null,
      cartItems: rawCart
    });

    // Clear cart after verified atomic commit
    req.session.cart = [];

    logSecurityEvent(
      'ORDER_COMPLETED_API',
      userId,
      req.ip,
      `Order: ${orderNumber}, Method: ${chosenMethod}, Amount: $${result.totalAmount}`
    );

    res.json({
      success: true,
      orderNumber,
      orderId: result.orderId,
      totalAmount: result.totalAmount,
      message: 'Order placed successfully!'
    });
  } catch (err) {
    logSecurityEvent('ORDER_API_FAILED', req.session?.user?.id || null, req.ip, err.message);
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. ORDERS INQUIRY & TRACKING
// ==========================================
router.get('/orders/:orderNumber', (req, res) => {
  const order = Order.findByOrderNumber(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json({ order });
});

router.get('/my-orders', requireApiAuth, (req, res) => {
  const orders = Order.findByUserId(req.session.user.id);
  res.json({ orders });
});

// ==========================================
// 6. AUTHENTICATION API
// ==========================================
router.get('/auth/me', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.setHeader('X-CSRF-Token', req.session.csrfToken);
  res.json({
    user: req.session.user || null,
    isAdmin: !!(req.session.user && req.session.user.role === 'admin'),
    csrfToken: req.session.csrfToken
  });
});

router.post('/auth/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = User.findByEmail(email);
    if (!user) {
      logSecurityEvent('API_LOGIN_UNKNOWN_EMAIL', null, req.ip, `Email: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logSecurityEvent('API_LOGIN_BAD_PASSWORD', user.id, req.ip, `User: ${user.email}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Preserve existing guest cart items across session regeneration
    const existingCart = req.session.cart || [];

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      req.session.cart = existingCart;
      // CRITICAL: Generate a fresh CSRF token for the newly regenerated session
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');

      logSecurityEvent('API_LOGIN_SUCCESS', user.id, req.ip, `Role: ${user.role}`);
      res.setHeader('X-CSRF-Token', req.session.csrfToken);
      res.json({
        success: true,
        user: req.session.user,
        csrfToken: req.session.csrfToken,
        message: 'Successfully signed in.'
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer'
    });

    const existingCart = req.session.cart || [];

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      };
      req.session.cart = existingCart;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');

      logSecurityEvent('API_USER_REGISTERED', newUser.id, req.ip, `New account: ${newUser.email}`);
      res.setHeader('X-CSRF-Token', req.session.csrfToken);
      res.json({
        success: true,
        user: req.session.user,
        csrfToken: req.session.csrfToken,
        message: 'Account created successfully.'
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/logout', (req, res) => {
  const userId = req.session?.user?.id;
  if (userId) {
    logSecurityEvent('API_USER_LOGOUT', userId, req.ip, 'User logged out');
  }

  req.session.destroy(() => {
    res.clearCookie('__ApexSession');
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

// ==========================================
// 7. ADMIN MANAGEMENT API
// ==========================================
router.get('/admin/metrics', requireApiAdmin, (req, res) => {
  const metrics = Order.getMetrics();
  const recentOrders = Order.findAll(5);
  const lowStock = db.prepare('SELECT * FROM products WHERE stock <= 15 ORDER BY stock ASC LIMIT 6').all();
  const recentLogs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10').all();

  res.json({
    metrics,
    recentOrders,
    lowStock,
    recentLogs
  });
});

router.get('/admin/products', requireApiAdmin, (req, res) => {
  const products = Product.findAll({ limit: 200 });
  res.json({ products });
});

router.post('/admin/products', requireApiAdmin, (req, res) => {
  const { name, category, price, stock, image_url, description, featured } = req.body;
  if (!name || !price || !category || !image_url) {
    return res.status(400).json({ error: 'Required product fields missing.' });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + `-${Date.now().toString(36)}`;

  const created = Product.create({
    name,
    slug,
    category,
    price: parseFloat(price),
    stock: parseInt(stock, 10) || 0,
    image_url,
    description: description || '',
    featured: featured ? 1 : 0
  });

  logSecurityEvent('API_ADMIN_PRODUCT_CREATED', req.session.user.id, req.ip, `Product: ${name}`);
  res.json({ success: true, product: created });
});

router.put('/admin/products/:id', requireApiAdmin, (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, image_url, description, featured } = req.body;
  const current = Product.findById(id);

  if (!current) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const updated = Product.update(id, {
    name,
    slug: current.slug,
    category,
    price: parseFloat(price),
    stock: parseInt(stock, 10),
    image_url,
    description,
    featured: featured ? 1 : 0
  });

  logSecurityEvent('API_ADMIN_PRODUCT_UPDATED', req.session.user.id, req.ip, `Product ID: ${id}`);
  res.json({ success: true, product: updated });
});

router.delete('/admin/products/:id', requireApiAdmin, (req, res) => {
  const { id } = req.params;
  Product.delete(id);
  logSecurityEvent('API_ADMIN_PRODUCT_DELETED', req.session.user.id, req.ip, `Product ID: ${id}`);
  res.json({ success: true, message: 'Product removed.' });
});

router.get('/admin/orders', requireApiAdmin, (req, res) => {
  const orders = Order.findAll(100);
  res.json({ orders });
});

router.patch('/admin/orders/:id/status', requireApiAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status.' });
  }

  const updated = Order.updateStatus(id, status);
  logSecurityEvent('API_ADMIN_STATUS_CHANGED', req.session.user.id, req.ip, `Order #${id} -> ${status}`);
  res.json({ success: true, order: updated });
});

router.get('/admin/audit-logs', requireApiAdmin, (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 150').all();
  res.json({ logs });
});

module.exports = router;
