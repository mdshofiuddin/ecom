import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, User, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="container navbar">
        <Link to="/" className="brand-logo" id="brand-logo-link">
          <ShieldCheck size={28} style={{ color: '#06b6d4' }} />
          <span>ApexStore</span>
          <span className="brand-badge">SPA</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} id="nav-home">
              Home
            </Link>
          </li>
          <li>
            <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`} id="nav-shop">
              Catalog
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/orders/my-orders" className={`nav-link ${isActive('/orders/my-orders') ? 'active' : ''}`} id="nav-orders">
                My Orders
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link
                to="/admin"
                className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                id="nav-admin"
                style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <LayoutDashboard size={15} />
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn" id="header-cart-btn" title="View Shopping Bag">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="cart-badge" id="cart-item-count">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="user-menu">
              <div className="user-tag">
                <User size={14} />
                <span>{user.name}</span>
                {isAdmin && <span className="badge-admin">ADMIN</span>}
              </div>
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary btn-sm"
                id="logout-btn"
                title="Sign Out"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" id="header-login-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="header-register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
