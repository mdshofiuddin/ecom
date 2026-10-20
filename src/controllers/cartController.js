const Product = require('../models/Product');
const { calculateCart } = require('../utils/cartCalculator');

class CartController {
  static showCart(req, res, next) {
    try {
      const { cartItems, subtotal, shipping, tax, total } = calculateCart(req.session.cart);

      res.render('pages/cart', {
        title: 'Shopping Bag | ApexStore',
        cartItems,
        subtotal,
        shipping,
        tax,
        total
      });
    } catch (error) {
      next(error);
    }
  }

  static addToCart(req, res, next) {
    try {
      const productId = parseInt(req.body.productId, 10);
      const quantity = Math.max(1, Math.min(99, parseInt(req.body.quantity, 10) || 1));

      if (!productId || isNaN(productId)) {
        return res.redirect('/shop?error=Invalid product selected.');
      }

      const product = Product.findById(productId);
      if (!product) {
        return res.redirect('/shop?error=Product no longer available.');
      }

      if (product.stock < 1) {
        return res.redirect(`/products/${product.slug}?error=This product is currently out of stock.`);
      }

      if (!req.session.cart) {
        req.session.cart = [];
      }

      const existingIndex = req.session.cart.findIndex(i => i.productId === productId);
      if (existingIndex > -1) {
        const newQty = req.session.cart[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          req.session.cart[existingIndex].quantity = product.stock;
          return res.redirect(`/cart?error=Maximum available stock reached for ${product.name}.`);
        }
        req.session.cart[existingIndex].quantity = newQty;
      } else {
        const initialQty = Math.min(quantity, product.stock);
        req.session.cart.push({
          productId,
          quantity: initialQty
        });
      }

      res.redirect('/cart?success=Item added to your shopping bag.');
    } catch (error) {
      next(error);
    }
  }

  static updateQuantity(req, res, next) {
    try {
      const productId = parseInt(req.body.productId, 10);
      const action = req.body.action; // 'increment', 'decrement', 'remove'

      if (!req.session.cart) {
        return res.redirect('/cart');
      }

      const index = req.session.cart.findIndex(i => i.productId === productId);
      if (index > -1) {
        const product = Product.findById(productId);
        if (action === 'increment') {
          if (product && req.session.cart[index].quantity < product.stock) {
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

      res.redirect('/cart');
    } catch (error) {
      next(error);
    }
  }

  static clearCart(req, res) {
    req.session.cart = [];
    res.redirect('/cart?success=Bag emptied.');
  }
}

module.exports = CartController;
