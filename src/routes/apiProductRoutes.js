const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Catalog query with filtering, sorting, pagination
router.get('/', (req, res, next) => {
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

// GET /api/products/featured - Featured products showcase
router.get('/featured', (req, res, next) => {
  try {
    const products = Product.findFeatured(6);
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug - Product details by slug
router.get('/:slug', (req, res, next) => {
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

module.exports = router;
