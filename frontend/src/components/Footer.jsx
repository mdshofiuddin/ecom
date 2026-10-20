import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Zap, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from './WhatsAppButton';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="brand-logo" style={{ marginBottom: '1rem' }}>
              <ShieldCheck size={26} style={{ color: '#06b6d4' }} />
              <span>ApexStore</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 320 }}>
              Engineered with bulletproof security, instant Single Page React architecture, and multi-channel payment integration.
            </p>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>🛡️ 256-Bit TLS</span>
              <span>📱 bKash Verified</span>
              <span>🚀 Rocket DBBL</span>
              <span>💬 WhatsApp 24/7</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Direct Channels</h4>
            <ul className="footer-links">
              <li>
                <a
                  href={getWhatsAppUrl('Hi ApexStore! I want to order via WhatsApp.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#25D366', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Live Order</span>
                </a>
              </li>
              <li><Link to="/shop">Browse Tech Catalog</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/checkout">bKash & Rocket Checkout</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account & Orders</h4>
            <ul className="footer-links">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/orders/my-orders">Order Tracking</Link></li>
              <li><Link to="/admin">Admin Command</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Payment Ecosystem</h4>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <span className="badge-payment bkash-badge">bKash Personal / Merchant</span>
              <span className="badge-payment rocket-badge">Rocket DBBL</span>
              <span className="badge-payment cod-badge">Cash on Delivery</span>
              <span className="badge-payment card-badge">Credit / Debit Card</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', lineHeight: 1.5 }}>
              All transactions are cryptographically validated to eliminate fraud, duplicate payments, and race conditions.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} ApexStore. Built with React.js & Express. Zero Page Reloads.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Single Page Architecture</span>
            <span style={{ color: 'var(--accent-emerald)' }}>● System Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
