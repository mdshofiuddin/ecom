require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const morgan = require('morgan');

const fs = require('fs');
const cors = require('cors');

const securityHeaders = require('./middlewares/securityHeaders');
const csrfProtection = require('./middlewares/csrfMiddleware');
const { populateViewLocals } = require('./middlewares/authMiddleware');
const { globalLimiter } = require('./middlewares/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');

// Route modules
const apiRoutes = require('./routes/apiRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Enable CORS with credentials for local React dev server
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['X-CSRF-Token']
}));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Trust proxy if deployed behind reverse proxy like Nginx or Cloudflare
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 1. HTTP Security Headers via Helmet
app.use(securityHeaders);

// 2. Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 3. Static assets with cache control
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// 4. Request Body Parsers with strict size limits to prevent payload-based DoS
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 5. HTTP Parameter Pollution protection
app.use(hpp());

// 6. Cookie Parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'apex_default_cookie_secret_998877'));

// 7. Secure Session Configuration
const sessionConfig = {
  name: '__ApexSession', // Avoid generic connect.sid
  secret: process.env.SESSION_SECRET || 'apex_default_session_secret_1234567890abcdef',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Thwarts XSS cookie theft
    secure: process.env.NODE_ENV === 'production', // Transmitted only via HTTPS in production
    sameSite: 'lax', // Mitigates CSRF
    maxAge: 1000 * 60 * 60 * 4 // 4 Hours
  }
};
app.use(session(sessionConfig));

// 8. Global Rate Limiter
app.use(globalLimiter);

// 9. Populate template locals (currentUser, cartCount, csrfToken, etc.)
app.use(populateViewLocals);

// 10. CSRF Protection for state mutations
app.use(csrfProtection);

// 11. REST API Route Registration
app.use('/api', apiRoutes);

// 12. React Single Page Application (SPA) Serving
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

// 13. Route Registration
app.use('/', productRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/', orderRoutes);
app.use('/admin', adminRoutes);

// 12. 404 & Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
