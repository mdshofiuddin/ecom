const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middlewares/authMiddleware');
const { productValidationRules, handleValidationErrors } = require('../middlewares/validationMiddleware');

// Enforce admin authorization on all routes in this router
router.use(ensureAdmin);

// Dashboard
router.get('/dashboard', ensureAdmin, AdminController.showDashboard);

// Product Management
router.get('/products', ensureAdmin, AdminController.showProducts);
router.get('/products/new', ensureAdmin, AdminController.showNewProduct);
router.post(
  '/products/new',
  ensureAdmin,
  productValidationRules,
  handleValidationErrors('pages/admin/product-form', 'Add Product | ApexStore Admin'),
  AdminController.processNewProduct
);

router.get('/products/edit/:id', ensureAdmin, AdminController.showEditProduct);
router.post(
  '/products/edit/:id',
  ensureAdmin,
  productValidationRules,
  handleValidationErrors('pages/admin/product-form', 'Edit Product | ApexStore Admin'),
  AdminController.processEditProduct
);

router.post('/products/delete/:id', ensureAdmin, AdminController.processDeleteProduct);

// Order Management
router.get('/orders', ensureAdmin, AdminController.showOrders);
router.post('/orders/status/:id', ensureAdmin, AdminController.updateOrderStatus);

// Security Audit Logs
router.get('/audit-logs', ensureAdmin, AdminController.showAuditLogs);

module.exports = router;
