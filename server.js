require('dotenv').config();

// 1. Runtime Node version check
const [major] = process.versions.node.split('.').map(Number);
if (major < 22) {
  console.warn(`[SYSTEM WARNING] Running on Node.js ${process.version}. Node.js >=22.0.0 is recommended.`);
} else {
  console.log(`[SYSTEM] Node.js ${process.version} runtime verified.`);
}

const { connect, initSchema, seed } = require('./src/config/db');
const db = connect();
initSchema();
seed();

// 2. Database initialization verification
const verifiedTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log(`[DATABASE] Verified ${verifiedTables.length} tables initialized successfully: ${verifiedTables.map(t => t.name).join(', ')}`);

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 ApexStore Production-Grade E-Commerce Server`);
  console.log(`🔒 Security: Helmet, CSRF, Rate-Limiting, HPP, Strict DB`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`👤 Admin Demo: admin@apexstore.com (Demo environment active)`);
    console.log(`🛒 Customer Demo: customer@apexstore.com (Demo environment active)`);
  }
  console.log(`====================================================`);
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    try {
      db.close();
      console.log('Database connections closed.');
    } catch (e) {
      console.error('Error closing database:', e.message);
    }
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});
