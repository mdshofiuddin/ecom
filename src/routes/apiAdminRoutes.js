const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { logSecurityEvent } = require('../utils/logger');

// Middleware to enforce administrator credentials
function requireApiAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    logSecurityEvent('UNAUTHORIZED_ADMIN_API_ATTEMPT', req.session?.user?.id || null, req.ip, `Path: ${req.originalUrl}`);
    return res.status(403).json({ error: 'Access forbidden. Administrator credentials required.' });
  }
  next();
}

// Router-level protection for all admin routes
router.use(requireApiAdmin);

// 1. DASHBOARD & METRICS
router.get('/dashboard', requireApiAdmin, (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.get('/metrics', requireApiAdmin, (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

// 2. PRODUCT CRUD
router.get('/products', requireApiAdmin, (req, res, next) => {
  try {
    const products = Product.findAll({ limit: 200 });
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

router.post('/products', requireApiAdmin, async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', requireApiAdmin, async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', requireApiAdmin, (req, res, next) => {
  try {
    const { id } = req.params;
    Product.delete(id);
    logSecurityEvent('API_ADMIN_PRODUCT_DELETED', req.session.user.id, req.ip, `Product ID: ${id}`);
    res.json({ success: true, message: 'Product removed.' });
  } catch (err) {
    next(err);
  }
});

// 3. ORDER MANAGEMENT
router.get('/orders', requireApiAdmin, (req, res, next) => {
  try {
    const orders = Order.findAll(100);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

const handleOrderStatusUpdate = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const updated = Order.updateStatus(id, status);
    logSecurityEvent('API_ADMIN_STATUS_CHANGED', req.session.user.id, req.ip, `Order #${id} -> ${status}`);
    res.json({ success: true, order: updated });
  } catch (err) {
    next(err);
  }
};

router.put('/orders/:id/status', requireApiAdmin, handleOrderStatusUpdate);
router.patch('/orders/:id/status', requireApiAdmin, handleOrderStatusUpdate);

// 4. SECURITY AUDIT LOGS
router.get('/audit-logs', requireApiAdmin, (req, res, next) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 150').all();
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.requireApiAdmin = requireApiAdmin;
