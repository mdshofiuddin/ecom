import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ExternalLink, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function MyOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchOrders() {
      try {
        const data = await apiRequest('/api/my-orders');
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user, navigate]);

  return (
    <div className="orders-page">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          My Order History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track delivery lifecycle, bKash/Rocket transaction records, and warranty documentation.
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading your order history...</div>
      ) : orders.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', maxWidth: 480, padding: '3rem 1.5rem' }}>
          <Package size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You haven't completed any purchases yet.
          </p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Items Purchased</th>
                <th>Payment Channel</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{ord.order_number}</strong>
                  </td>
                  <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                  <td style={{ maxWidth: 260 }}>
                    {ord.items.map((i) => `${i.product_name} (${i.quantity})`).join(', ')}
                  </td>
                  <td>
                    <span style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.8rem' }}>
                      {ord.payment_method}
                    </span>
                    {ord.transaction_id && (
                      <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Trx: {ord.transaction_id}</div>
                    )}
                  </td>
                  <td>
                    <strong>${ord.total_amount.toFixed(2)}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ৳{Math.round(ord.total_amount * 120).toLocaleString()} BDT
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${ord.status}`}>{ord.status}</span>
                  </td>
                  <td>
                    <Link to={`/order-confirmation/${ord.order_number}`} className="btn btn-secondary btn-sm">
                      <ExternalLink size={13} style={{ marginRight: 4 }} />
                      <span>Receipt</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
