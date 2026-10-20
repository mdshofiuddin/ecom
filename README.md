# 🛡️ ApexStore - Hardened Enterprise E-Commerce Platform

ApexStore is a production-grade, highly secure, full-stack E-Commerce web application built using **Express.js**, **EJS**, and **SQLite (better-sqlite3)**. It is engineered with defense-in-depth security principles to protect against modern web vulnerabilities while delivering a sleek, luxury tech aesthetic.

---

## 🔒 Security Architecture (Defense-in-Depth)

The application has been hardened across all layers to ensure zero vulnerabilities:

| Attack Vector / Security Requirement | Implementation in ApexStore |
|---|---|
| **SQL Injection (SQLi)** | 100% Parameterized queries via `better-sqlite3`. Zero dynamic SQL string concatenation. |
| **Cross-Site Request Forgery (CSRF)** | Native cryptographically secure token validation (`crypto.randomBytes(32)`). Timing-safe comparisons (`crypto.timingSafeEqual`) prevent timing side-channel attacks on all state-changing verbs (`POST`, `PUT`, `DELETE`). |
| **Cross-Site Scripting (XSS)** | Strict Content Security Policy (CSP) headers via `helmet`, auto-escaping template engines (`<%= %>`), and HTML entity sanitation via `xss` and `express-validator`. |
| **Brute Force & DoS / DDoS** | Tiered rate limiting with `express-rate-limit`: Global limiter, Auth limiter (max 10 attempts / 15 min), and Checkout limiter. |
| **Session Fixation & Hijacking** | `req.session.regenerate()` executed upon login/privilege elevation. Cookies marked with `HttpOnly`, `SameSite=Lax`, and `Secure` (production). |
| **Password Security** | Passwords hashed using `bcryptjs` with **12 salt rounds** and strict complexity rules (upper, lower, digits, special characters). |
| **HTTP Parameter Pollution (HPP)** | `hpp` middleware enabled to prevent parameter pollution exploits (e.g. `?id=1&id=2`). |
| **Clickjacking & MIME-Sniffing** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and custom `Permissions-Policy`. |
| **Payload DoS** | Strict body parser limits (`express.json({ limit: '50kb' })`, `express.urlencoded({ limit: '50kb' })`). |
| **Cart Price Tampering** | Client prices are **never trusted**. All product amounts and inventory are re-queried directly from the database during calculation. |
| **Race Conditions & Stock Overselling** | Order creation & inventory decrement occur inside an atomic ACID database transaction (`db.transaction()`). |
| **Role-Based Access Control (RBAC)** | Strict `ensureAdmin` middleware guarding all admin paths (`/admin/*`). Unauthorized attempts log security audit events. |
| **Security Audit Logs** | Dedicated `audit_logs` table tracking authentication attempts, blocked brute-force tries, CSRF alerts, and administrative changes. |
| **Information Disclosure** | Centralized error handler masks stack traces and internal database schemas in production. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher; tested on Node.js v24)
- npm

### Installation
Clone or navigate to the project directory:
```bash
cd expressjs
```

Install dependencies:
```bash
npm install
```

### Running the Application

For production mode:
```bash
npm start
```

For development mode (with auto-reload):
```bash
npm run dev
```

The application will start at:
👉 **`http://localhost:3000`**

---

## 👤 Pre-configured Demo Accounts

The database is automatically seeded on first launch with sample products and pre-configured accounts:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@apexstore.com` | `Admin@123456` |
| **Customer** | `customer@apexstore.com` | `Customer@123456` |

*(Tip: On the Sign In page, you can click "Use" to auto-fill these credentials).*

---

## 📂 Project Structure

```
├── src/
│   ├── app.js                         # Express app setup & middleware pipeline
│   ├── config/
│   │   └── db.js                      # SQLite database initialization & seeding
│   ├── controllers/
│   │   ├── adminController.js         # Admin dashboard, products & order handling
│   │   ├── authController.js          # Authentication & session management
│   │   ├── cartController.js          # Shopping bag operations & stock checks
│   │   ├── orderController.js         # Transactional checkout & order history
│   │   └── productController.js       # Product browsing & catalog
│   ├── middlewares/
│   │   ├── authMiddleware.js          # RBAC & view locals
│   │   ├── csrfMiddleware.js          # Timing-safe CSRF protection
│   │   ├── errorHandler.js            # Centralized safe error handler
│   │   ├── rateLimiter.js             # Brute-force & DDoS rate limiters
│   │   ├── securityHeaders.js         # Helmet & Content Security Policy (CSP)
│   │   └── validationMiddleware.js    # express-validator rules
│   ├── models/
│   │   ├── Order.js                   # Atomic order placement & analytics
│   │   ├── Product.js                 # Catalog querying & stock updates
│   │   └── User.js                    # User queries & creation
│   ├── routes/
│   │   ├── adminRoutes.js             # Protected admin endpoints
│   │   ├── authRoutes.js              # Login, register, logout
│   │   ├── cartRoutes.js              # Cart mutation endpoints
│   │   ├── orderRoutes.js             # Checkout & order confirmation
│   │   └── productRoutes.js           # Home & product catalog
│   └── utils/
│       └── logger.js                  # Security event audit logging
├── public/
│   ├── css/
│   │   └── main.css                   # Modern dark luxury responsive styling
│   └── js/
│       └── main.js                    # Client-side micro-interactions
├── views/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── audit-logs.ejs         # Security audit log viewer
│   │   │   ├── dashboard.ejs          # Admin KPI dashboard
│   │   │   ├── orders.ejs             # Store orders manager
│   │   │   ├── product-form.ejs       # Add/Edit product form
│   │   │   └── products.ejs           # Product inventory table
│   │   ├── cart.ejs                   # Shopping bag view
│   │   ├── checkout.ejs               # Encrypted checkout form
│   │   ├── error.ejs                  # Safe error template (404, 403, 500)
│   │   ├── home.ejs                   # Landing page
│   │   ├── login.ejs                  # Secure login with demo buttons
│   │   ├── order-confirmation.ejs     # Order receipt & confirmation
│   │   ├── orders.ejs                 # Customer order history
│   │   ├── product-detail.ejs         # Single product showcase
│   │   ├── register.ejs               # User registration
│   │   └── shop.ejs                   # Filterable product catalog
│   └── partials/
│       ├── footer.ejs                 # Global footer & security credentials
│       └── header.ejs                 # Navigation & cart badge
├── data/
│   └── store.db                       # SQLite database file (auto-generated)
├── .env                               # Environment configurations
├── .env.example                       # Environment template
├── package.json                       # Dependencies & scripts
├── server.js                          # Server entry point & graceful shutdown
└── README.md
```

---

## 🧪 Testing the Application

1. **Browsing:**
   - Go to `http://localhost:3000` to view the homepage and featured products.
   - Go to `/shop` to test searching, category filtering, and price sorting.
2. **Shopping Bag & Checkout:**
   - Add items to your bag.
   - Adjust quantities in `/cart`.
   - Proceed to `/checkout`, enter shipping details, and click "Confirm & Pay".
   - Notice the generated order reference (e.g. `APX-L...-XYZ`) and inventory reduction.
3. **Authentication:**
   - Sign in as `customer@apexstore.com` to view order history.
   - Sign in as `admin@apexstore.com` to access `/admin/dashboard`.
4. **Admin Management & Security Logs:**
   - View store KPIs (Total Revenue, Total Orders, Active Orders, Customers).
   - Add, edit, or delete products in `/admin/products`.
   - Update order status (Processing &rarr; Shipped &rarr; Delivered) in `/admin/orders`.
   - Review `/admin/audit-logs` to see real-time security events captured by the system.
