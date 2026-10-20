# ApexStore — Complete Setup & Deployment Guide

Welcome to the **ApexStore** production setup documentation. This guide details how to install, configure, customize, and deploy ApexStore across multiple production environments.

---

## 📋 System Requirements
- **Node.js**: v20.x or v22.x LTS (Recommended: Node 22+ with native `node:sqlite`)
- **NPM**: v10.x+
- **Memory**: Minimum 512 MB RAM (1 GB recommended for high traffic)
- **Disk**: 500 MB free disk space

---

## 🚀 Target 1: Production Linux VPS (Ubuntu / Debian)

This target demonstrates setting up ApexStore directly on a Linux VPS (e.g., DigitalOcean, Linode, AWS EC2, or Hetzner) behind an Nginx reverse proxy with SSL.

### 1. System Preparation
```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx certbot python3-certbot-nginx

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### 2. Clone and Configure
```bash
# Clone the repository
git clone https://github.com/mdshofiuddin/ecom.git /var/www/apexstore
cd /var/www/apexstore

# Copy environment template
cp .env.example .env

# Generate secure session secret and update .env
nano .env
```
Ensure your `.env` contains:
```env
PORT=3000
NODE_ENV=production
SESSION_SECRET=your_super_secret_64_char_random_key_here
COOKIE_SECURE=true
RATE_LIMIT_MAX=300
```

### 3. Install Dependencies & Build Frontend
```bash
# Install root server dependencies
npm install --omit=dev

# Install and build frontend React SPA
cd frontend
npm install
npm run build
cd ..
```

### 4. Initialize Database
```bash
# The application automatically runs initDb() on start.
# Alternatively, seed manually via sqlite3:
sqlite3 data/store.db < database/schema.sql
sqlite3 data/store.db < database/seed.sql
```

### 5. Start with PM2
```bash
pm2 start server.js --name "apexstore"
pm2 save
pm2 startup
```

### 6. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/apexstore`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/apexstore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtain free Let's Encrypt SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🐳 Target 2: Docker & Docker Compose

Deploy the complete application inside a production container with one command.

### 1. Launch with Docker Compose
```bash
# Clone the repository
git clone https://github.com/mdshofiuddin/ecom.git
cd ecom

# Start containerized application
docker compose up --build -d
```

### 2. Verify Container Health
```bash
docker compose ps
docker compose logs -f
```
The application will be live at `http://localhost:3000`.

---

## 🗄️ Database Setup & Migrations

ApexStore uses an embedded zero-configuration SQLite architecture with WAL (Write-Ahead Logging) and high-concurrency connection pooling.

- **Automated Initialization**: Upon starting `node server.js`, the app checks `data/store.db`. If tables or seed data are missing, `initDb()` automatically applies the schema and seeds baseline products.
- **Manual Schema Deployment**:
  ```bash
  sqlite3 data/store.db < database/schema.sql
  sqlite3 data/store.db < database/seed.sql
  ```
- **Backup & Snapshot**:
  ```bash
  # Create a clean hot backup
  sqlite3 data/store.db ".backup data/store_backup_$(date +%Y%m%d).db"
  ```

---

## 🔑 First Admin Login

ApexStore comes pre-configured with a hardened administrator account:

1. Navigate to: `http://your-domain/login`
2. **Email**: `admin@apexstore.com`
3. **Password**: `Admin@123456`
4. Click **Sign In**.
5. Once authenticated, click the **Admin** link in the navigation header to enter the **Admin Command Center** (`/admin/dashboard`).

### Changing the Default Admin Password:
Inside the admin dashboard, create a new administrator account and delete or update the default demo account, or update it directly via SQL:
```bash
# Generate bcrypt hash:
node -e "const b = require('bcryptjs'); console.log(b.hashSync('YourNewPassword', 12));"

# Update in database:
sqlite3 data/store.db "UPDATE users SET password = 'NEW_HASH_HERE' WHERE email = 'admin@apexstore.com';"
```

---

## 🎨 Branding & Payment Customization

### 1. Change Brand Name & Title
- **Frontend App Title**: Edit `frontend/index.html` (`<title>` and `<meta name="description">`).
- **Navbar Brand & Footer**: Edit `frontend/src/components/Navbar.jsx` and `frontend/src/components/Footer.jsx`.

### 2. Configure bKash, Rocket, and WhatsApp Numbers
- **bKash & Rocket Merchant Wallets**: Open `frontend/src/components/PaymentGuides.jsx`:
  ```javascript
  export const BKASH_MERCHANT_NUMBER = '01712345678';   // Replace with your 11-digit merchant number
  export const ROCKET_MERCHANT_NUMBER = '017123456789'; // Replace with your 12-digit merchant number
  ```
- **WhatsApp Support & Direct Order**: Open `frontend/src/components/WhatsAppButton.jsx`:
  ```javascript
  const WHATSAPP_NUMBER = '8801712345678'; // Replace with your international number without '+'
  ```
- Rebuild the frontend after editing configuration values:
  ```bash
  cd frontend && npm run build
  ```

---

## 🛡️ Production Security Checklist
- [x] Set strong `SESSION_SECRET` in `.env`.
- [x] Enforce `COOKIE_SECURE=true` when running on HTTPS.
- [x] Configure strict CORS headers in `src/app.js` if hosting API and frontend on different domains.
- [x] Enable automated database backups (`cron` job with `sqlite3 .backup`).
- [x] Regularly inspect real-time security events in `/admin/dashboard` (Audit Logs tab).
