require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 ApexStore Production-Grade E-Commerce Server`);
  console.log(`🔒 Security: Helmet, CSRF, Rate-Limiting, HPP, Strict DB`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`👤 Admin Demo: admin@apexstore.com / Admin@123456`);
  console.log(`🛒 Customer Demo: customer@apexstore.com / Customer@123456`);
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
