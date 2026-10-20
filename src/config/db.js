const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/store.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for high concurrency & performance, and enforce foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      featured INTEGER DEFAULT 0 CHECK(featured IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      total_amount REAL NOT NULL CHECK(total_amount >= 0),
      payment_method TEXT NOT NULL DEFAULT 'card',
      status TEXT NOT NULL DEFAULT 'processing' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
      payment_number TEXT,
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  try {
    db.exec(`ALTER TABLE orders ADD COLUMN payment_number TEXT;`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN transaction_id TEXT;`);
  } catch (e) {}

  // Order Items Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  // Audit Logs Table for Security Tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      user_id INTEGER,
      ip_address TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  if (userCount === 0) {
    const saltRounds = 12;
    const adminHash = bcrypt.hashSync('Admin@123456', saltRounds);
    const customerHash = bcrypt.hashSync('Customer@123456', saltRounds);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `);

    insertUser.run('Apex Administrator', 'admin@apexstore.com', adminHash, 'admin');
    insertUser.run('John Doe', 'customer@apexstore.com', customerHash, 'customer');
  }

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

  if (productCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, slug, description, price, stock, category, image_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      {
        name: 'AeroPulse Wireless ANC Headphones',
        slug: 'aeropulse-wireless-anc-headphones',
        description: 'Engineered with studio-grade 45mm neodymium drivers, active hybrid noise cancellation, and up to 48 hours battery life on a single charge.',
        price: 249.99,
        stock: 45,
        category: 'Audio',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        featured: 1
      },
      {
        name: 'Vortex Pro Mechanical Keyboard',
        slug: 'vortex-pro-mechanical-keyboard',
        description: 'Anodized aluminum chassis with hot-swappable lubed switches, per-key RGB backlighting, gasket mount design, and braided USB-C connectivity.',
        price: 159.00,
        stock: 30,
        category: 'Accessories',
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        featured: 1
      },
      {
        name: 'Chronos Sapphire Smartwatch Ultra',
        slug: 'chronos-sapphire-smartwatch-ultra',
        description: 'Aerospace-grade titanium housing, sapphire crystal display, continuous ECG/SpO2 health tracking, and 100m water resistance.',
        price: 399.50,
        stock: 22,
        category: 'Wearables',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        featured: 1
      },
      {
        name: 'Zenith 4K HDR Creator Monitor 27"',
        slug: 'zenith-4k-hdr-creator-monitor-27',
        description: '99% DCI-P3 color accuracy, 144Hz ultra-smooth refresh rate, factory color-calibrated delta-E < 1, and 90W USB-C Power Delivery hub.',
        price: 599.00,
        stock: 15,
        category: 'Displays',
        image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
        featured: 1
      },
      {
        name: 'Lumina Ergonomic Optical Mouse',
        slug: 'lumina-ergonomic-optical-mouse',
        description: 'Precision 26,000 DPI optical sensor, optical micro-switches rated for 90M clicks, and ultra-lightweight 58g honeycomb shell.',
        price: 79.99,
        stock: 60,
        category: 'Accessories',
        image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        featured: 0
      },
      {
        name: 'EchoSonic Studio Hi-Fi Soundbar',
        slug: 'echosonic-studio-hi-fi-soundbar',
        description: 'Dolby Atmos 3.1.2 spatial sound architecture with dedicated wireless subwoofer and eARC HDMI pass-through.',
        price: 329.00,
        stock: 18,
        category: 'Audio',
        image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
        featured: 0
      },
      {
        name: 'Titanium Swift Laptop 15" M-Tier',
        slug: 'titanium-swift-laptop-15-m-tier',
        description: '32GB DDR5 RAM, 1TB NVMe Gen4 SSD, 16-core ultra-fast processor, 120Hz OLED touch panel, and all-day 18-hour battery endurance.',
        price: 1399.00,
        stock: 10,
        category: 'Computers',
        image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
        featured: 1
      },
      {
        name: 'HyperCharge 140W GaN Desktop Station',
        slug: 'hypercharge-140w-gan-desktop-station',
        description: 'Gallium Nitride fast charging technology with 3x USB-C PD 3.1 ports and 1x USB-A QC 4.0 port in an ultra-compact footprint.',
        price: 89.95,
        stock: 50,
        category: 'Accessories',
        image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
        featured: 0
      }
    ];

    for (const p of products) {
      insertProduct.run(p.name, p.slug, p.description, p.price, p.stock, p.category, p.image_url, p.featured);
    }
  }
}

initDb();

module.exports = db;
