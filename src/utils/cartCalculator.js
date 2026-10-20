const Product = require('../models/Product');
const { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, TAX_RATE } = require('../config/cartConfig');

function calculateCart(sessionCart) {
  const rawCart = sessionCart || [];
  const cartItems = [];
  let subtotal = 0;

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

  const shipping = subtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return {
    cartItems,
    subtotal: Math.round(subtotal * 100) / 100,
    shipping,
    tax,
    total,
    itemCount: cartItems.reduce((acc, curr) => acc + curr.quantity, 0)
  };
}

module.exports = { calculateCart };
