const crypto = require('crypto');
const db = require('../config/db');
const Order = require('../models/Order');
const { logSecurityEvent } = require('../utils/logger');

class ApiOrderController {
  static async processCheckout(req, res, next) {
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
  }
}

module.exports = ApiOrderController;
