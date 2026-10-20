import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CreditCard, DollarSign, MessageCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BkashPaymentGuide, RocketPaymentGuide } from '../components/PaymentGuides';
import { getWhatsAppUrl } from '../components/WhatsAppButton';

export function CheckoutPage() {
  const { cartItems, subtotal, shipping, tax, total, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    shipping_address: '',
    city: 'Dhaka',
    postal_code: '1212'
  });

  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [bKashNumber, setBkashNumber] = useState('');
  const [bKashTrxId, setBkashTrxId] = useState('');
  const [rocketNumber, setRocketNumber] = useState('');
  const [rocketTrxId, setRocketTrxId] = useState('');
  const [cardNumber, setCardNumber] = useState('4532000012345678');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('987');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="form-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h2>Your bag is empty</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Add items before proceeding to checkout.</p>
          <Link to="/shop" className="btn btn-primary">Go to Catalog</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        payment_method: paymentMethod,
        payment_number:
          paymentMethod === 'bkash'
            ? bKashNumber
            : paymentMethod === 'rocket'
            ? rocketNumber
            : null,
        transaction_id:
          paymentMethod === 'bkash'
            ? bKashTrxId
            : paymentMethod === 'rocket'
            ? rocketTrxId
            : null
      };

      const res = await apiRequest('/api/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      await refreshCart();
      navigate(`/order-confirmation/${res.orderNumber}`);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const bdtTotal = Math.round(total * 120);

  return (
    <div className="checkout-page">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Instant Encrypted Checkout
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Direct bKash, Rocket, or Card transaction. Inventory is locked atomically upon submission.
        </p>
      </div>

      {errorMessage && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="cart-layout">
        {/* Checkout Form */}
        <div className="cart-table-card">
          <form onSubmit={handleSubmit} id="checkout-form">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="step-badge">1</span>
              <span>Recipient & Delivery Address</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="customer_name">Full Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  id="customer_name"
                  className="form-input"
                  required
                  placeholder="e.g. Rafiqul Islam"
                  value={formData.customer_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="customer_email">Email Confirmation *</label>
                <input
                  type="email"
                  name="customer_email"
                  id="customer_email"
                  className="form-input"
                  required
                  placeholder="name@example.com"
                  value={formData.customer_email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="shipping_address">Delivery Street Address *</label>
              <input
                type="text"
                name="shipping_address"
                id="shipping_address"
                className="form-input"
                required
                placeholder="House #, Road #, Area / Thana"
                value={formData.shipping_address}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="city">City / District *</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  className="form-input"
                  required
                  placeholder="e.g. Dhaka, Chittagong, Sylhet"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postal_code">Postal Code *</label>
                <input
                  type="text"
                  name="postal_code"
                  id="postal_code"
                  className="form-input"
                  required
                  placeholder="1212"
                  value={formData.postal_code}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '2.5rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="step-badge" style={{ background: 'var(--accent-cyan)', color: '#000' }}>2</span>
              <span>Select Payment Channel</span>
            </h3>

            <div className="payment-method-selector">
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`payment-tab-btn ${paymentMethod === 'bkash' ? 'active bkash' : ''}`}
              >
                <span className="radio-dot"></span>
                <strong>bKash Mobile Payment</strong>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('rocket')}
                className={`payment-tab-btn ${paymentMethod === 'rocket' ? 'active rocket' : ''}`}
              >
                <span className="radio-dot"></span>
                <strong>Rocket (DBBL)</strong>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`payment-tab-btn ${paymentMethod === 'cash_on_delivery' ? 'active cod' : ''}`}
              >
                <span className="radio-dot"></span>
                <strong>Cash on Delivery (COD)</strong>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`payment-tab-btn ${paymentMethod === 'card' ? 'active card' : ''}`}
              >
                <span className="radio-dot"></span>
                <strong>Credit / Debit Card</strong>
              </button>
            </div>

            {/* Active Payment Details Panel */}
            <div style={{ marginTop: '1.5rem' }}>
              {paymentMethod === 'bkash' && (
                <BkashPaymentGuide
                  amount={total}
                  bKashNumber={bKashNumber}
                  setBkashNumber={setBkashNumber}
                  trxId={bKashTrxId}
                  setTrxId={setBkashTrxId}
                />
              )}

              {paymentMethod === 'rocket' && (
                <RocketPaymentGuide
                  amount={total}
                  rocketNumber={rocketNumber}
                  setRocketNumber={setRocketNumber}
                  trxId={rocketTrxId}
                  setTrxId={setRocketTrxId}
                />
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <div className="payment-guide-box cod-theme">
                  <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>Cash on Delivery</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Pay <strong>৳{bdtTotal.toLocaleString()} BDT</strong> (${total.toFixed(2)} USD) in cash directly to our logistics partner upon unboxing and parcel inspection.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="payment-guide-box card-theme">
                  <div className="form-group">
                    <label className="form-label" htmlFor="card_number">Card Number *</label>
                    <input
                      type="text"
                      id="card_number"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="card_expiry">Expiry (MM/YY) *</label>
                      <input
                        type="text"
                        id="card_expiry"
                        className="form-input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="card_cvv">CVV *</label>
                      <input
                        type="password"
                        id="card_cvv"
                        className="form-input"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg btn-full"
                id="submit-order-btn"
                style={{ fontSize: '1.1rem', padding: '1rem' }}
              >
                {submitting
                  ? 'Verifying & Securing Order...'
                  : `Confirm Order & Pay ৳${bdtTotal.toLocaleString()} BDT ($${total.toFixed(2)})`}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className="summary-card">
          <h3 className="summary-title">Summary Review</h3>

          <div style={{ marginBottom: '1.5rem', maxHeight: 260, overflowY: 'auto' }}>
            {cartItems.map((item) => (
              <div key={item.product.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Qty: {item.quantity} &times; ${item.product.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>${item.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Insured Shipping</span>
            {shipping === 0 ? (
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>FREE</span>
            ) : (
              <span>${shipping.toFixed(2)}</span>
            )}
          </div>

          <div className="summary-row">
            <span>Sales Tax (5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-row total">
            <span>Payable Amount</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--accent-cyan)' }}>${total.toFixed(2)}</div>
              <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 700 }}>
                ৳{bdtTotal.toLocaleString()} BDT
              </div>
            </div>
          </div>

          {/* WhatsApp Checkout Help Widget */}
          <div style={{ marginTop: '1.75rem', background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#25D366', fontSize: '0.9rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <MessageCircle size={16} />
              <span>Need help paying with bKash / Rocket?</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              Chat live with our WhatsApp support agent for instant assistance.
            </p>
            <a
              href={getWhatsAppUrl(`Hi ApexStore, I need help completing my checkout for $${total} USD (৳${bdtTotal} BDT).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm btn-full"
            >
              Open WhatsApp Help
            </a>
          </div>

          <div style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#10b981' }} />
            <span>Encrypted anti-tamper ledger verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
