const db = require('../config/db');

class Order {
  static createOrderTransaction({
    orderNumber,
    userId = null,
    customerName,
    customerEmail,
    shippingAddress,
    city,
    postalCode,
    paymentMethod = 'card',
    paymentNumber = null,
    transactionId = null,
    cartItems
  }) {
    // Wrap entire order & inventory decrement in an atomic SQLite transaction
    const placeOrderTx = db.transaction(() => {
      let calculatedTotal = 0;
      const verifiedItems = [];

      // Verify each product and its actual database price and current stock
      for (const item of cartItems) {
        const product = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} was not found.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
        }

        const lineTotal = product.price * item.quantity;
        calculatedTotal += lineTotal;

        verifiedItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity
        });
      }

      // Add standard flat rate tax or shipping if needed, let's keep clean total
      const finalAmount = Math.round(calculatedTotal * 100) / 100;

      // Insert Order record
      const insertOrder = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, customer_name, customer_email,
          shipping_address, city, postal_code, total_amount, payment_method,
          payment_number, transaction_id, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')
      `);

      const orderResult = insertOrder.run(
        orderNumber,
        userId,
        customerName,
        customerEmail,
        shippingAddress,
        city,
        postalCode,
        finalAmount,
        paymentMethod,
        paymentNumber,
        transactionId
      );

      const orderId = Number(orderResult.lastInsertRowid);

      // Insert order items and decrement product inventory safely
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare(`
        UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);

      for (const vi of verifiedItems) {
        insertItem.run(orderId, vi.productId, vi.productName, vi.price, vi.quantity);
        updateStock.run(vi.quantity, vi.productId);
      }

      return {
        orderId,
        orderNumber,
        totalAmount: finalAmount,
        itemsCount: verifiedItems.length
      };
    });

    return placeOrderTx();
  }

  static findById(id) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return null;

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  }

  static findByOrderNumber(orderNumber) {
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
    if (!order) return null;

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  }

  static findByUserId(userId) {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(userId);
    return orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });
  }

  static findAll(limit = 100) {
    return db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?').all(limit);
  }

  static updateStatus(id, status) {
    const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    stmt.run(status, id);
    return this.findById(id);
  }

  static getMetrics() {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders WHERE status != "cancelled"').get().sum;
    const pendingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "processing"').get().count;
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "customer"').get().count;

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingOrders,
      totalCustomers
    };
  }
}

module.exports = Order;
