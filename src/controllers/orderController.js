const crypto = require('crypto');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { logSecurityEvent } = require('../utils/logger');

class OrderController {
  static showCheckout(req, res, next) {
    try {
      const rawCart = req.session.cart || [];
      if (rawCart.length === 0) {
        return res.redirect('/cart?error=Your cart is empty. Please add items before proceeding to checkout.');
      }

      let subtotal = 0;
      const cartItems = [];

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

      const shipping = subtotal > 150 ? 0 : 15.00;
      const tax = Math.round(subtotal * 0.05 * 100) / 100;
      const total = Math.round((subtotal + shipping + tax) * 100) / 100;

      res.render('pages/checkout', {
        title: 'Secure Checkout | ApexStore',
        cartItems,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping,
        tax,
        total,
        formData: {
          customer_name: req.session.user?.name || '',
          customer_email: req.session.user?.email || '',
          shipping_address: '',
          city: '',
          postal_code: ''
        },
        validationErrors: []
      });
    } catch (error) {
      next(error);
    }
  }

  static async processCheckout(req, res, next) {
    try {
      const rawCart = req.session.cart || [];
      if (rawCart.length === 0) {
        return res.redirect('/cart?error=Your shopping bag is empty.');
      }

      const {
        customer_name,
        customer_email,
        shipping_address,
        city,
        postal_code,
        payment_method
      } = req.body;

      // Unique human-readable and tamper-proof order number
      const orderNumber = `APX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const userId = req.session.user?.id || null;

      // Perform atomic database transaction with stock decrement
      const result = Order.createOrderTransaction({
        orderNumber,
        userId,
        customerName: customer_name,
        customerEmail: customer_email,
        shippingAddress: shipping_address,
        city,
        postalCode: postal_code,
        paymentMethod: payment_method || 'card',
        cartItems: rawCart
      });

      // Clear the session shopping cart upon success
      req.session.cart = [];

      logSecurityEvent('ORDER_PLACED', userId, req.ip, `Order: ${orderNumber}, Amount: $${result.totalAmount}`);

      res.redirect(`/orders/confirmation/${orderNumber}`);
    } catch (error) {
      // If stock check fails or error occurs
      logSecurityEvent('ORDER_CREATION_FAILED', req.session.user?.id || null, req.ip, error.message);
      
      const rawCart = req.session.cart || [];
      let subtotal = 0;
      const cartItems = [];
      for (const item of rawCart) {
        const p = Product.findById(item.productId);
        if (p) {
          subtotal += p.price * item.quantity;
          cartItems.push({ product: p, quantity: item.quantity, subtotal: p.price * item.quantity });
        }
      }

      return res.status(400).render('pages/checkout', {
        title: 'Secure Checkout | ApexStore',
        cartItems,
        subtotal,
        shipping: subtotal > 150 ? 0 : 15.00,
        tax: Math.round(subtotal * 0.05 * 100) / 100,
        total: Math.round((subtotal + (subtotal > 150 ? 0 : 15.00) + subtotal * 0.05) * 100) / 100,
        formData: req.body,
        validationErrors: [error.message]
      });
    }
  }

  static showOrderSuccess(req, res, next) {
    try {
      const { orderNumber } = req.params;
      const order = Order.findByOrderNumber(orderNumber);

      if (!order) {
        return res.status(404).render('pages/error', {
          title: 'Order Not Found',
          statusCode: 404,
          errorMessage: 'The requested order reference could not be located.'
        });
      }

      res.render('pages/order-confirmation', {
        title: `Order Confirmed: ${order.order_number} | ApexStore`,
        order
      });
    } catch (error) {
      next(error);
    }
  }

  static showMyOrders(req, res, next) {
    try {
      const userId = req.session.user.id;
      const orders = Order.findByUserId(userId);

      res.render('pages/orders', {
        title: 'Order History | ApexStore',
        orders
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
