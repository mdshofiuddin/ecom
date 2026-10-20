import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageCircle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useCart } from '../context/CartContext';
import { getWhatsAppUrl } from '../components/WhatsAppButton';

export function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await apiRequest(`/api/products/${slug}`);
        setProduct(data.product);
        setRelated(data.related || []);
        setQuantity(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [slug]);

  if (loading) {
    return <div className="loading-spinner">Loading product specifications...</div>;
  }

  if (!product) {
    return (
      <div className="form-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>The item you requested does not exist.</p>
        <Link to="/shop" className="btn btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  const bdtPrice = Math.round(product.price * 120);
  const whatsappOrderMsg = `Hello ApexStore! I want to order this product directly:%0A- Product: ${product.name}%0A- Price: $${product.price} (৳${bdtPrice.toLocaleString()} BDT)%0A- Quantity: ${quantity}%0APlease confirm delivery details!`;

  return (
    <div className="product-detail-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/shop" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="detail-layout">
        <div className="detail-gallery">
          <img src={product.image_url} alt={product.name} className="detail-img" />
        </div>

        <div className="detail-info">
          <span className="product-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-price-box">
            <div>
              <div className="detail-price">${product.price.toFixed(2)}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                ৳{bdtPrice.toLocaleString()} BDT
              </div>
            </div>

            {product.stock > 0 ? (
              <span className="product-stock-tag" style={{ position: 'static' }}>
                Available: {product.stock} units
              </span>
            ) : (
              <span className="product-stock-tag low" style={{ position: 'static', background: 'rgba(244,63,94,0.2)', color: '#fb7185' }}>
                Out of Stock
              </span>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          {product.stock > 0 ? (
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label">Select Quantity:</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="qty-input"
                  id="detail-qty-input"
                />

                <button
                  type="button"
                  onClick={() => addToCart(product.id, quantity)}
                  className="btn btn-primary btn-lg"
                  id="detail-add-to-cart-btn"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <ShoppingBag size={20} />
                  <span>Add to Shopping Bag</span>
                </button>
              </div>

              {/* WhatsApp Direct Order Button */}
              <a
                href={`https://wa.me/8801712345678?text=${whatsappOrderMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg btn-full"
                id="detail-whatsapp-btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <MessageCircle size={20} />
                <span>Order via WhatsApp Direct</span>
              </a>
            </div>
          ) : (
            <div className="alert alert-error">
              <span>This product is currently out of stock. Contact us on WhatsApp for restock updates.</span>
            </div>
          )}

          {/* Payment and Assurance Perks */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span>Official bKash / Rocket instant TrxID payment validation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Truck size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Free express insured nationwide shipping on orders over $150</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>7-Day Replacement Guarantee & 2-Year Manufacturer Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section style={{ marginTop: '3.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
            Recommended in {product.category}
          </h2>
          <div className="product-grid">
            {related.map((rel) => (
              <div key={rel.id} className="product-card">
                <div className="product-img-wrap">
                  <Link to={`/products/${rel.slug}`}>
                    <img src={rel.image_url} alt={rel.name} className="product-img" loading="lazy" />
                  </Link>
                </div>
                <div className="product-body">
                  <h3 className="product-name">
                    <Link to={`/products/${rel.slug}`}>{rel.name}</Link>
                  </h3>
                  <div className="product-footer">
                    <div className="product-price">${rel.price.toFixed(2)}</div>
                    <Link to={`/products/${rel.slug}`} className="btn btn-secondary btn-sm">
                      View Item
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
