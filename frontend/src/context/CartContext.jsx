import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    cartItems: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    itemCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  const fetchCart = async () => {
    try {
      const data = await apiRequest('/api/cart');
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      setCart(res.cart);
      showAlert(res.message || 'Item added to bag.', 'success');
      return res;
    } catch (err) {
      showAlert(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, action) => {
    try {
      const res = await apiRequest('/api/cart/update', {
        method: 'POST',
        body: JSON.stringify({ productId, action })
      });
      setCart(res.cart);
      return res;
    } catch (err) {
      showAlert(err.message, 'error');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const res = await apiRequest('/api/cart/clear', { method: 'POST' });
      setCart(res.cart);
      showAlert('Shopping bag emptied.', 'info');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...cart,
        loading,
        alert,
        showAlert,
        addToCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
