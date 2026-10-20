import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getWhatsAppUrl } from '../components/WhatsAppButton';

export function CartPage() {
  const { cartItems, subtotal, shipping, tax, total, updateQuantity, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="form-card" style={{ textAlign: 'center', maxWidth: 500, padding: '3.5rem 1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <ShoppingBag size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your shopping bag is empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Explore our curated selection of flagship electronics and developer hardware.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg" id="empty-cart-shop-btn">
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const bdtTotal = Math.round(total * 120);

  return (
    <div className="cart-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Your Shopping Bag
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Instant reactive updates &bull; No page reloads &bull; bKash / Rocket payment ready.
        </p>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-table-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Bag Items ({cartItems.length})</h3>
            <button type="button" onClick={clearCart} className="btn btn-secondary btn-sm" id="clear-cart-btn">
              Clear All
            </button>
          </div>

          {cartItems.map((item) => (
            <div key={item.product.id} className="cart-item">
              <img src={item.product.image_url} alt={item.product.name} className="cart-item-img" />

              <div className="cart-item-info">
                <h4>
                  <Link to={`/products/${item.product.slug}`}>{item.product.name}</Link>
                </h4>
                <p>
                  ${item.product.price.toFixed(2)} (৳{Math.round(item.product.price * 120).toLocaleString()} BDT) &bull; Category: {item.product.category}
                </p>
              </div>

              <div className="cart-item-qty">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, 'decrement')}
                  className="qty-btn"
                  title="Decrease"
                >
                  <Minus size={14} />
                </button>

                <span style={{ fontWeight: 700, minWidth: '1.75rem', textAlign: 'center' }}>
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, 'increment')}
                  className="qty-btn"
                  title="Increase"
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 800, textAlign: 'right' }}>
                ${item.subtotal.toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => updateQuantity(item.product.id, 'remove')}
                className="btn btn-danger btn-sm"
                title="Remove Item"
                style={{ marginLeft: '0.5rem' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Calculation & Checkout Summary */}
        <div className="summary-card">
          <h3 className="summary-title">Order Calculation</h3>

          <div className="summary-row">
            <span>Bag Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Insured Express Shipping</span>
            {shipping === 0 ? (
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>FREE</span>
            ) : (
              <span>${shipping.toFixed(2)}</span>
            )}
          </div>

          <div className="summary-row">
            <span>Estimated Sales Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-row total">
            <span>Grand Total</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--accent-cyan)' }}>${total.toFixed(2)}</div>
              <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                ৳{bdtTotal.toLocaleString()} BDT
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/checkout" className="btn btn-primary btn-full btn-lg" id="proceed-checkout-btn">
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <a
              href={getWhatsAppUrl(`Hi ApexStore, I want to checkout my cart (${cartItems.length} items, Total: $${total} / ৳${bdtTotal}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-full"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <MessageCircle size={17} />
              <span>Checkout via WhatsApp</span>
            </a>
          </div>

          <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            <ShieldCheck size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#10b981' }} />
            <span>Encrypted transmission & anti-tamper ledger verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
