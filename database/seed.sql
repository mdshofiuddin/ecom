-- ============================================================================
-- ApexStore E-Commerce Seed Data
-- ============================================================================

-- 1. SEED USERS
-- Admin Password:  Admin@123456
-- Customer Password: Customer@123456
INSERT OR IGNORE INTO users (id, name, email, password, role)
VALUES 
(1, 'Apex Administrator', 'admin@apexstore.com', '$2a$12$6t6jFjN52o4h6tqN8jO4k.KqmEvwPq3N0ZJ/E0mR3Yl3aYtK0xX6y', 'admin'),
(2, 'Rafiqul Islam', 'customer@apexstore.com', '$2a$12$wK7nF6jN52o4h6tqN8jO4k.KqmEvwPq3N0ZJ/E0mR3Yl3aYtK0xX6y', 'customer');

-- 2. SEED PRODUCT CATALOG
INSERT OR IGNORE INTO products (id, name, slug, description, price, stock, category, image_url, featured)
VALUES
(1, 'AeroPulse Wireless ANC Headphones', 'aeropulse-wireless-anc-headphones', 'Engineered with studio-grade 45mm neodymium drivers, active hybrid noise cancellation, and up to 48 hours battery life on a single charge.', 249.99, 45, 'Audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Vortex Pro Mechanical Keyboard', 'vortex-pro-mechanical-keyboard', 'Anodized aluminum chassis with hot-swappable lubed switches, per-key RGB backlighting, gasket mount design, and braided USB-C connectivity.', 159.00, 30, 'Accessories', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 1),
(3, 'Chronos Sapphire Smartwatch Ultra', 'chronos-sapphire-smartwatch-ultra', 'Aerospace-grade titanium housing, sapphire crystal display, continuous ECG/SpO2 health tracking, and 100m water resistance.', 399.50, 22, 'Wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 1),
(4, 'Zenith 4K HDR Creator Monitor 27"', 'zenith-4k-hdr-creator-monitor-27', '99% DCI-P3 color accuracy, 144Hz ultra-smooth refresh rate, factory color-calibrated delta-E < 1, and 90W USB-C Power Delivery hub.', 599.00, 15, 'Displays', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 1),
(5, 'Lumina Ergonomic Optical Mouse', 'lumina-ergonomic-optical-mouse', 'Precision 26,000 DPI optical sensor, optical micro-switches rated for 90M clicks, and ultra-lightweight 58g honeycomb shell.', 79.99, 60, 'Accessories', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 0),
(6, 'EchoSonic Studio Hi-Fi Soundbar', 'echosonic-studio-hi-fi-soundbar', 'Dolby Atmos 3.1.2 spatial sound architecture with dedicated wireless subwoofer and eARC HDMI pass-through.', 329.00, 18, 'Audio', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80', 0),
(7, 'Titanium Swift Laptop 15" M-Tier', 'titanium-swift-laptop-15-m-tier', '32GB DDR5 RAM, 1TB NVMe Gen4 SSD, 16-core ultra-fast processor, 120Hz OLED touch panel, and all-day 18-hour battery endurance.', 1399.00, 10, 'Computers', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 1),
(8, 'HyperCharge 140W GaN Desktop Station', 'hypercharge-140w-gan-desktop-station', 'Gallium Nitride fast charging technology with 3x USB-C PD 3.1 ports and 1x USB-A QC 4.0 port in an ultra-compact footprint.', 89.95, 50, 'Accessories', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80', 0);

-- 3. SEED INITIAL VERIFIED ORDERS
INSERT OR IGNORE INTO orders (id, order_number, user_id, customer_name, customer_email, shipping_address, city, postal_code, total_amount, payment_method, payment_number, transaction_id, status)
VALUES
(1, 'APX-DEMO-001', 2, 'Rafiqul Islam', 'customer@apexstore.com', 'House 42, Road 11, Banani', 'Dhaka', '1213', 249.99, 'bkash', '01711223344', 'BK9A4K89Z1', 'delivered'),
(2, 'APX-DEMO-002', 2, 'Rafiqul Islam', 'customer@apexstore.com', 'House 42, Road 11, Banani', 'Dhaka', '1213', 159.00, 'rocket', '017112233445', 'RK88291041', 'shipped');

-- 4. SEED ORDER ITEMS
INSERT OR IGNORE INTO order_items (id, order_id, product_id, product_name, price, quantity)
VALUES
(1, 1, 1, 'AeroPulse Wireless ANC Headphones', 249.99, 1),
(2, 2, 2, 'Vortex Pro Mechanical Keyboard', 159.00, 1);

-- 5. SEED SECURITY AUDIT LOGS
INSERT OR IGNORE INTO audit_logs (id, event_type, user_id, ip_address, details)
VALUES
(1, 'SYSTEM_INITIALIZED', 1, '127.0.0.1', 'Database tables and enterprise security rules loaded successfully.'),
(2, 'ADMIN_LOGIN_SUCCESS', 1, '127.0.0.1', 'Role: admin. Session elevated with fresh CSRF token.');
