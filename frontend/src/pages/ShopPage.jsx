import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MessageCircle, ShoppingBag } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useCart } from '../context/CartContext';
import { getWhatsAppUrl } from '../components/WhatsAppButton';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'featured';

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (currentCategory !== 'all') query.set('category', currentCategory);
        if (currentSearch) query.set('search', currentSearch);
        if (currentSort) query.set('sort', currentSort);

        const data = await apiRequest(`/api/products?${query.toString()}`);
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) next.set('search', val);
    else next.delete('search');
    setSearchParams(next);
  };

  const handleCategorySelect = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'all') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next);
  };

  const handleSortChange = (e) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', e.target.value);
    setSearchParams(next);
  };

  return (
    <div className="shop-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Hardware Catalog
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Real-time reactive search, category filtering, and direct bKash / Rocket ordering.
        </p>
      </div>

      {/* Reactive Search & Filter Card */}
      <div className="summary-card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: 240, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Instant search by product title or keywords..."
              value={currentSearch}
              onChange={handleSearchChange}
              id="shop-search-input"
            />
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="form-select"
              id="shop-sort-select"
            >
              <option value="featured">Featured Items</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Categories Strip inside filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={`category-pill ${currentCategory === 'all' ? 'active' : ''}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`category-pill ${currentCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="loading-spinner">Filtering products instantly...</div>
      ) : products.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', maxWidth: 480, padding: '3rem 1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No products match</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Try adjusting your search query or reset category filter.
          </p>
          <button type="button" onClick={() => setSearchParams({})} className="btn btn-primary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-img-wrap">
                <Link to={`/products/${product.slug}`}>
                  <img src={product.image_url} alt={product.name} className="product-img" loading="lazy" />
                </Link>
                {product.featured ? <span className="product-featured-tag">FEATURED</span> : null}
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

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <a
                      href={getWhatsAppUrl(`Hi ApexStore! I am interested in: ${product.name} ($${product.price})`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      title="Quick Inquiry on WhatsApp"
                    >
                      <MessageCircle size={15} />
                    </a>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id, 1)}
                      className="btn btn-primary btn-sm"
                      id={`shop-add-btn-${product.id}`}
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
