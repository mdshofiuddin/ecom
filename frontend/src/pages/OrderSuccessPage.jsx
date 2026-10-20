import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import { apiRequest } from '../api/client';
import { getWhatsAppUrl } from '../components/WhatsAppButton';

export function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await apiRequest(`/api/orders/${orderNumber}`);
        setOrder(data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return <div className="loading-spinner">Retrieving verified order invoice...</div>;
  }

  if (!order) {
    return (
      <div className="form-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>The specified order reference could not be located.</p>
        <Link to="/shop" className="btn btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const bdtTotal = Math.round(order.total_amount * 120);
  const whatsappReceiptMsg = `Hi ApexStore! I have confirmed my order:%0A- Order ID: ${order.order_number}%0A- Name: ${order.customer_name}%0A- Payment Method: ${order.payment_method.toUpperCase()}%0A${order.transaction_id ? `- TrxID: ${order.transaction_id}%0A` : ''}- Total: $${order.total_amount} (৳${bdtTotal} BDT)%0APlease notify me when it ships!`;

  return (
    <div className="order-success-page">
      <div className="form-card" style={{ maxWidth: 740, padding: '3rem 2.5rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-emerald)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <CheckCircle2 size={40} />
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Payment & Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Thank you, <strong>{order.customer_name}</strong>. A receipt has been dispatched to <strong>{order.customer_email}</strong>.
        </p>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Order Reference
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {order.order_number}
              </div>
            </div>
            <div>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            <div>
              <div><strong>Delivery Address:</strong> {order.shipping_address}, {order.city}, {order.postal_code}</div>
              <div><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</div>
            </div>

            <div>
              <div><strong>Payment Method:</strong> <span style={{ textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>{order.payment_method}</span></div>
              {order.payment_number && <div><strong>Wallet Number:</strong> {order.payment_number}</div>}
              {order.transaction_id && <div><strong>Verified TrxID:</strong> <code style={{ color: '#10b981' }}>{order.transaction_id}</code></div>}
            </div>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>Ordered Hardware:</h4>
          <div style={{ borderTop: '1px solid var(--border-color)' }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.product_name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> &times; {item.quantity}</span>
                </div>
                <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', fontSize: '1.25rem', fontWeight: 800 }}>
            <span>Total Paid / Payable:</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>${order.total_amount.toFixed(2)} USD</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ৳{bdtTotal.toLocaleString()} BDT
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Fast Notification & Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href={getWhatsAppUrl(whatsappReceiptMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <MessageCircle size={18} />
            <span>Send Invoice to WhatsApp Support</span>
          </a>

          <Link to="/shop" className="btn btn-primary" id="continue-shopping-btn">
            Continue Shopping
          </Link>

          <Link to="/orders/my-orders" className="btn btn-secondary" id="view-order-history-btn">
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
}
