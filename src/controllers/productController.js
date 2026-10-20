const Product = require('../models/Product');

class ProductController {
  static showHome(req, res, next) {
    try {
      const featuredProducts = Product.findFeatured(4);
      const categories = Product.getCategories();

      res.render('pages/home', {
        title: 'ApexStore | High Performance Tech & Lifestyle Goods',
        featuredProducts,
        categories
      });
    } catch (error) {
      next(error);
    }
  }

  static showShop(req, res, next) {
    try {
      const { category, search, sort } = req.query;

      const products = Product.findAll({
        category: category || 'all',
        search: search || '',
        sort: sort || 'featured',
        limit: 40
      });

      const categories = Product.getCategories();

      res.render('pages/shop', {
        title: 'Catalog | ApexStore',
        products,
        categories,
        currentCategory: category || 'all',
        currentSearch: search || '',
        currentSort: sort || 'featured'
      });
    } catch (error) {
      next(error);
    }
  }

  static showProductDetail(req, res, next) {
    try {
      const { slug } = req.params;
      const product = Product.findBySlug(slug);

      if (!product) {
        return res.status(404).render('pages/error', {
          title: 'Product Not Found',
          statusCode: 404,
          errorMessage: 'The requested product could not be located in our catalog.'
        });
      }

      // Fetch related items in same category
      const related = Product.findAll({
        category: product.category,
        limit: 3
      }).filter(p => p.id !== product.id);

      res.render('pages/product-detail', {
        title: `${product.name} | ApexStore`,
        product,
        related
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
