const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.get('/', ProductController.showHome);
router.get('/shop', ProductController.showShop);
router.get('/products/:slug', ProductController.showProductDetail);

module.exports = router;
