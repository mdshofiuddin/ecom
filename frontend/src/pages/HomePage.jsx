import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Truck, MessageCircle, Smartphone } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useCart } from '../context/CartContext';
import { getWhatsAppUrl } from '../components/WhatsAppButton';

export function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, allRes] = await Promise.all([
          apiRequest('/api/products/featured'),
          apiRequest('/api/products')
        ]);
        setFeatured(prodRes.products || []);
        setCategories(allRes.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-tag">
            <Zap size={15} />
            <span>Single-Page React &bull; Zero Reloads</span>
          </div>

          <h1 className="hero-title">
            Enterprise Hardware. <span>Local Payments.</span>
          </h1>

          <p className="hero-desc">
            Discover studio acoustics, precision keyboards, and computing powerhouses. Seamless checkout via <strong>bKash</strong>, <strong>Rocket</strong>, and <strong>WhatsApp Direct Order</strong>.
          </p>

          <div className="hero-btns">
            <Link to="/shop" className="btn btn-primary btn-lg" id="hero-shop-cta">
              <span>Explore Catalog</span>
              <ArrowRight size={18} />
            </Link>

            <a
              href={getWhatsAppUrl('Hi ApexStore! I want to explore products and place an order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg"
              id="hero-whatsapp-cta"
            >
              <MessageCircle size={18} />
              <span>Order via WhatsApp</span>
            </a>
          </div>

          {/* Payment Badges Strip */}
          <div className="payment-support-strip">
            <span className="strip-title">Direct Payment Integration:</span>
            <div className="badges-list">
              <span className="badge-payment bkash-badge">bKash (Instant TrxID)</span>
              <span className="badge-payment rocket-badge">Rocket DBBL</span>
              <span className="badge-payment whatsapp-badge">WhatsApp Support</span>
              <span className="badge-payment cod-badge">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <div className="category-strip">
        <Link to="/shop" className="category-pill active">
          All Products
        </Link>
        {categories.map((cat) => (
          <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="category-pill">
            {cat}
          </Link>
        ))}
      </div>

      {/* Featured Products */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Flagship Innovations</h2>
            <p className="section-subtitle">Real-time inventory & verified stock levels</p>
          </div>
          <Link to="/shop" className="btn btn-secondary btn-sm" id="view-all-featured-btn">
            View All Catalog &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading showcase gear...</div>
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-img-wrap">
                  <Link to={`/products/${product.slug}`}>
                    <img src={product.image_url} alt={product.name} className="product-img" loading="lazy" />
                  </Link>
                  <span className="product-featured-tag">FEATURED</span>
                  {product.stock <= 5 ? (
                    <span className="product-stock-tag low">Only {product.stock} left</span>
                  ) : (
                    <span className="product-stock-tag">In Stock ({product.stock})</span>
                  )}
                </div>

                <div className="product-body">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p className="product-desc">{product.description}</p>

                  <div className="product-footer">
                    <div>
                      <div className="product-price">${product.price.toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                        ৳{Math.round(product.price * 120).toLocaleString()} BDT
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id, 1)}
                      className="btn btn-primary btn-sm"
                      id={`add-to-cart-${product.id}`}
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
