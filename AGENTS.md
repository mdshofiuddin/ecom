# ApexStore — Developer & AI Agent Guide (`AGENTS.md`)

This guide provides architectural reference, repository map, coding standards, and operational guidelines for human engineers and autonomous AI coding agents working on ApexStore.

---

## 🏛️ Architecture Overview

ApexStore is an enterprise-grade e-commerce application composed of:
1. **Backend**: Express.js 5 headless REST API with defense-in-depth security, strict session management, and embedded SQLite (dual engine: native `node:sqlite` in Node 22+ with `better-sqlite3` fallback).
2. **Frontend**: Vite + React 18 Single Page Application (SPA) with zero-reload client-side routing (`react-router-dom`), context-driven state management (`AuthContext`, `CartContext`), and localized payment gateways (bKash, Rocket, WhatsApp).
3. **Static Distribution**: In production, the Express backend serves `frontend/dist/` with an SPA fallback middleware for non-API routes.

---

## 📂 Repository Directory Map

```text
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for node_modules, temp files, and database binaries
├── .node-version             # Node LTS pin (22.14.0)
├── .nvmrc                    # NVM version pin (22.14.0)
├── CHANGELOG.md              # Semantic release version history
├── CLAUDE.md                 # AI agent and developer architectural guide
├── AGENTS.md                 # This AI agent reference guide
├── Dockerfile                # Production multi-arch container definition
├── docker-compose.yml        # Turnkey container orchestrator
├── HowToSetup.md             # Deployment and setup guide for VPS, Docker, and Cloud
├── package.json              # Root dependencies and operational scripts
├── README.md                 # Project introduction and overview
├── render.yaml               # Render.com cloud infrastructure as code
├── server.js                 # Server entrypoint and graceful shutdown handler
├── database/
│   ├── schema.sql            # Full DDL database schema definitions
│   └── seed.sql              # Initial seed data for users, catalog, and orders
├── data/                     # Local runtime SQLite database directory (ephemeral/mounted)
├── frontend/                 # React SPA source tree
│   ├── index.html            # SPA root HTML template
│   ├── package.json          # Frontend dependencies (React, Vite, Lucide)
│   ├── vite.config.js        # Vite configuration with /api proxy
│   └── src/
│       ├── main.jsx          # React DOM entrypoint
│       ├── App.jsx           # Root route definitions
│       ├── index.css         # Luxury dark theme design tokens & styles
│       ├── api/
│           └── client.js     # Unified API client with self-healing CSRF auto-retry
│       ├── components/
│           ├── Navbar.jsx    # Client-side header with live cart count
│           ├── Footer.jsx    # Global footer with trust badges
│           ├── PaymentGuides.jsx # bKash & Rocket dynamic step-by-step guides
│           └── WhatsAppButton.jsx # Floating pulsing WhatsApp live chat button
│       ├── context/
│           ├── AuthContext.jsx # User authentication & token synchronization
│           └── CartContext.jsx # In-memory cart with client-side reactive recalculation
│       └── pages/            # View components (Home, Shop, Detail, Cart, Checkout, Admin, Auth)
└── src/                      # Express.js REST API source tree
    ├── app.js                # Express app initialization, middleware pipeline & static serving
    ├── config/
    │   └── db.js             # Dual-engine SQLite connection and auto-seeding
    ├── controllers/          # Business logic handlers
    ├── middlewares/
    │   ├── authMiddleware.js # Route guard middleware (requireAuth, requireAdmin)
    │   ├── csrfMiddleware.js # Timing-safe CSRF validation and header synchronization
    │   ├── errorHandler.js   # Global error handling and JSON API error formatting
    │   ├── rateLimiter.js    # IP-based sliding window rate limiters
    │   ├── securityHeaders.js # Helmet Content-Security-Policy & HSTS configuration
    │   └── validationMiddleware.js # Request payload sanitation
    ├── models/
    │   ├── Order.js          # Order creation with ACID atomic SQLite transactions
    │   ├── Product.js        # Catalog querying, slug generation, stock mutations
    │   └── User.js           # Password hashing (bcrypt) and authentication
    ├── routes/
    │   ├── apiRoutes.js      # Headless JSON API endpoints (/api/*)
    │   └── ...               # Server-rendered fallback routes
    └── utils/
        └── logger.js         # Security audit logging to database
```

---

## 🛠️ Operational Commands

```bash
# Install root dependencies
npm install

# Start production server
npm start

# Start local server with live code reload
npm run dev

# Run frontend Vite dev server (independent)
npm run dev:frontend

# Build frontend production bundle into frontend/dist/
npm run build:local

# Run test suite
node scratch/test_flow.js
```
