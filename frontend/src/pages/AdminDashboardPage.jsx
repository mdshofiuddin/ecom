import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Audio',
    price: '',
    stock: 25,
    image_url: '',
    description: '',
    featured: 0
  });

  const loadAdminData = async () => {
    try {
      const [metricsData, productsData, ordersData, logsData] = await Promise.all([
        apiRequest('/api/admin/metrics'),
        apiRequest('/api/admin/products'),
        apiRequest('/api/admin/orders'),
        apiRequest('/api/admin/audit-logs')
      ]);
      setMetrics(metricsData.metrics);
      setProducts(productsData.products || []);
      setOrders(ordersData.orders || []);
      setLogs(logsData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login');
      return;
    }
    if (isAdmin) {
      loadAdminData();
    }
  }, [authLoading, isAdmin, navigate]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Audio',
      price: '',
      stock: 25,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      description: '',
      featured: 0
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      description: product.description,
      featured: product.featured ? 1 : 0
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await apiRequest(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productForm)
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? res.product : p))
        );
      } else {
        const res = await apiRequest('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productForm)
        });
        setProducts((prev) => [res.product, ...prev]);
      }
      setShowProductModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-spinner">Initializing Admin Command Center...</div>;
  }

  return (
    <div className="admin-dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <span className="badge-admin">Admin Command Center</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.35rem' }}>
            Store Intelligence & Operations
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={openNewProductModal} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="category-strip" style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`category-pill ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Overview & KPIs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`category-pill ${activeTab === 'products' ? 'active' : ''}`}
        >
          Products ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`category-pill ${activeTab === 'orders' ? 'active' : ''}`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`category-pill ${activeTab === 'logs' ? 'active' : ''}`}
        >
          Security Audit Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && metrics && (
        <div>
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Revenue</div>
              <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
                ${metrics.totalRevenue.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                ৳{Math.round(metrics.totalRevenue * 120).toLocaleString()} BDT
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Orders Placed</div>
              <div className="metric-value">{metrics.totalOrders}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Across all channels
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Active Orders</div>
              <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
                {metrics.pendingOrders}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Processing / In dispatch
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Registered Customers</div>
              <div className="metric-value">{metrics.totalCustomers}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Verified profiles
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Recent Orders */}
            <div className="cart-table-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Latest Orders
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id}>
                      <td><strong style={{ color: 'var(--accent-cyan)' }}>{ord.order_number}</strong></td>
                      <td>{ord.customer_name}</td>
                      <td>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                          {ord.payment_method}
                        </span>
                      </td>
                      <td><strong>${ord.total_amount.toFixed(2)}</strong></td>
                      <td><span className={`status-badge status-${ord.status}`}>{ord.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Security Highlights */}
            <div className="summary-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={18} />
                <span>Security Engine</span>
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                  <CheckCircle size={15} />
                  <span>Helmet & CSP Active</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                  <CheckCircle size={15} />
                  <span>Timing-Safe CSRF Enabled</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                  <CheckCircle size={15} />
                  <span>bKash & Rocket Fraud Block</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981' }}>
                  <CheckCircle size={15} />
                  <span>ACID Transaction Stock Locks</span>
                </li>
              </ul>
              <div style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setActiveTab('logs')} className="btn btn-secondary btn-sm btn-full">
                  Inspect Audit Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price (USD / BDT)</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td style={{ width: 50 }}>
                    <img src={prod.image_url} alt={prod.name} style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  </td>
                  <td>
                    <strong>{prod.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.slug}</div>
                  </td>
                  <td>{prod.category}</td>
                  <td>
                    <strong>${prod.price.toFixed(2)}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      ৳{Math.round(prod.price * 120).toLocaleString()} BDT
                    </div>
                  </td>
                  <td>
                    <span className={`product-stock-tag ${prod.stock <= 5 ? 'low' : ''}`} style={{ position: 'static' }}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td>{prod.featured ? 'Yes' : 'No'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => openEditProductModal(prod)} className="btn btn-secondary btn-sm">
                        <Edit size={13} />
                      </button>
                      <button type="button" onClick={() => handleDeleteProduct(prod.id)} className="btn btn-danger btn-sm">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Payment Channel</th>
                <th>Transaction / Wallet</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status Lifecycle</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{ord.order_number}</strong></td>
                  <td>
                    <div><strong>{ord.customer_name}</strong></div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ord.customer_email}</div>
                  </td>
                  <td>
                    <span style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.8rem' }}>
                      {ord.payment_method}
                    </span>
                  </td>
                  <td>
                    {ord.payment_number && <div>{ord.payment_number}</div>}
                    {ord.transaction_id && <code style={{ color: '#10b981', fontWeight: 700 }}>{ord.transaction_id}</code>}
                    {!ord.payment_number && !ord.transaction_id && <span style={{ color: 'var(--text-muted)' }}>COD / Card</span>}
                  </td>
                  <td>
                    <strong>${ord.total_amount.toFixed(2)}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ৳{Math.round(ord.total_amount * 120).toLocaleString()} BDT
                    </div>
                  </td>
                  <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className="form-select"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="pending">Pending Verification</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Classification</th>
                <th>User</th>
                <th>Client IP</th>
                <th>Details Payload</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        log.event_type.includes('BLOCKED') || log.event_type.includes('FAILED')
                          ? 'status-cancelled'
                          : log.event_type.includes('SUCCESS') || log.event_type.includes('REGISTERED')
                          ? 'status-delivered'
                          : 'status-processing'
                      }`}
                    >
                      {log.event_type}
                    </span>
                  </td>
                  <td>{log.user_id ? `User #${log.user_id}` : 'Guest'}</td>
                  <td><code>{log.ip_address}</code></td>
                  <td style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.details}
                  </td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="form-card modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {editingProduct ? 'Edit Product' : 'Add New Hardware'}
              </h2>
              <button type="button" onClick={() => setShowProductModal(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Displays">Displays</option>
                    <option value="Computers">Computers</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Stock Units *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Showcase Featured</label>
                  <select
                    className="form-select"
                    value={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: parseInt(e.target.value) })}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes (Homepage Hero)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  required
                  className="form-input"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technical Description *</label>
                <textarea
                  rows={4}
                  required
                  className="form-textarea"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary btn-full">
                  Save Product
                </button>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
