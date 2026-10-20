const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const db = require('../config/db');
const { logSecurityEvent } = require('../utils/logger');

class AdminController {
  static showDashboard(req, res, next) {
    try {
      const metrics = Order.getMetrics();
      const recentOrders = Order.findAll(5);
      const lowStockProducts = db.prepare('SELECT * FROM products WHERE stock <= 15 ORDER BY stock ASC LIMIT 5').all();
      const recentLogs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 8').all();

      res.render('pages/admin/dashboard', {
        title: 'Admin Command Center | ApexStore',
        metrics,
        recentOrders,
        lowStockProducts,
        recentLogs
      });
    } catch (error) {
      next(error);
    }
  }

  static showProducts(req, res, next) {
    try {
      const products = Product.findAll({ limit: 100 });
      res.render('pages/admin/products', {
        title: 'Inventory & Products | ApexStore Admin',
        products
      });
    } catch (error) {
      next(error);
    }
  }

  static showNewProduct(req, res) {
    res.render('pages/admin/product-form', {
      title: 'Add New Product | ApexStore Admin',
      product: {},
      isEdit: false,
      validationErrors: [],
      categories: ['Audio', 'Accessories', 'Wearables', 'Displays', 'Computers', 'Smart Home']
    });
  }

  static processNewProduct(req, res, next) {
    try {
      const { name, category, price, stock, image_url, description, featured } = req.body;
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + `-${Date.now().toString(36)}`;

      Product.create({
        name,
        slug,
        category,
        price,
        stock,
        image_url,
        description,
        featured: featured ? 1 : 0
      });

      logSecurityEvent('ADMIN_PRODUCT_CREATED', req.session.user.id, req.ip, `Product: ${name}`);
      res.redirect('/admin/products?success=Product added successfully.');
    } catch (error) {
      next(error);
    }
  }

  static showEditProduct(req, res, next) {
    try {
      const product = Product.findById(req.params.id);
      if (!product) {
        return res.redirect('/admin/products?error=Product not found.');
      }

      res.render('pages/admin/product-form', {
        title: `Edit ${product.name} | ApexStore Admin`,
        product,
        isEdit: true,
        validationErrors: [],
        categories: ['Audio', 'Accessories', 'Wearables', 'Displays', 'Computers', 'Smart Home']
      });
    } catch (error) {
      next(error);
    }
  }

  static processEditProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { name, category, price, stock, image_url, description, featured } = req.body;
      const current = Product.findById(id);

      if (!current) {
        return res.redirect('/admin/products?error=Product not found.');
      }

      Product.update(id, {
        name,
        slug: current.slug,
        category,
        price,
        stock,
        image_url,
        description,
        featured: featured ? 1 : 0
      });

      logSecurityEvent('ADMIN_PRODUCT_UPDATED', req.session.user.id, req.ip, `Product ID: ${id}`);
      res.redirect('/admin/products?success=Product updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static processDeleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      Product.delete(id);
      logSecurityEvent('ADMIN_PRODUCT_DELETED', req.session.user.id, req.ip, `Product ID: ${id}`);
      res.redirect('/admin/products?success=Product removed.');
    } catch (error) {
      next(error);
    }
  }

  static showOrders(req, res, next) {
    try {
      const orders = Order.findAll(100);
      res.render('pages/admin/orders', {
        title: 'Manage Orders | ApexStore Admin',
        orders
      });
    } catch (error) {
      next(error);
    }
  }

  static updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!allowed.includes(status)) {
        return res.redirect('/admin/orders?error=Invalid status.');
      }

      Order.updateStatus(id, status);
      logSecurityEvent('ADMIN_ORDER_STATUS_CHANGED', req.session.user.id, req.ip, `Order ID: ${id} -> ${status}`);
      res.redirect('/admin/orders?success=Order status updated.');
    } catch (error) {
      next(error);
    }
  }

  static showAuditLogs(req, res, next) {
    try {
      const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all();
      res.render('pages/admin/audit-logs', {
        title: 'Security Audit Logs | ApexStore Admin',
        logs
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
