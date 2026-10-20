const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middlewares/authMiddleware');
const { productValidationRules, handleValidationErrors } = require('../middlewares/validationMiddleware');

// Enforce admin authorization on all routes in this router
router.use(ensureAdmin);

// Dashboard
router.get('/dashboard', AdminController.showDashboard);

// Product Management
router.get('/products', AdminController.showProducts);
router.get('/products/new', AdminController.showNewProduct);
router.post(
  '/products/new',
  productValidationRules,
  handleValidationErrors('pages/admin/product-form', 'Add Product | ApexStore Admin'),
  AdminController.processNewProduct
);

router.get('/products/edit/:id', AdminController.showEditProduct);
router.post(
  '/products/edit/:id',
  productValidationRules,
  handleValidationErrors('pages/admin/product-form', 'Edit Product | ApexStore Admin'),
  AdminController.processEditProduct
);

router.post('/products/delete/:id', AdminController.processDeleteProduct);

// Order Management
router.get('/orders', AdminController.showOrders);
router.post('/orders/status/:id', AdminController.updateOrderStatus);

// Security Audit Logs
router.get('/audit-logs', AdminController.showAuditLogs);

module.exports = router;
