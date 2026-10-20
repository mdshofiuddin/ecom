# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-20

### Security & Dependency CVE Audit
- **NPM Security Audit**: Executed clean vulnerability scan via `npm audit` across all dependencies.
  - **Audit Status**: **0 vulnerabilities found** (0 critical, 0 high, 0 moderate, 0 low).
  - Both root backend dependencies and `frontend/` React dependencies passed with clean CVE reports.
- **Dependency Pinning & Verification**:
  - `express@^5.3.0`: Verified latest major release with modern route handling and parameter security.
  - `bcryptjs@^3.0.3`: Pure JavaScript bcrypt implementation, avoiding native C++ memory management and compilation vulnerabilities.
  - `helmet@^8.3.0`: Hardened HTTP response headers (CSP, HSTS, X-Frame-Options DENY, XSS filtering).
  - `better-sqlite3@^13.0.3` & `node:sqlite`: Dual SQLite engine ensuring zero-dependency execution on Node 22+ LTS environments.
  - `react@^18.3.1` & `vite@^8.3.4`: Modern client runtime pinned with zero reported advisory flags.
- **Credential Hygiene**:
  - Sanitized local development `.env` with explicit placeholder values (`your_super_secret_session_key_here_min_32_chars`) matching `.env.example`.
  - Confirmed `.env` exclusion in `.gitignore`.

### Added
- **Single Page Application (SPA)**: Modern React 18 + Vite frontend with zero page reloads via client-side routing (`react-router-dom`).
- **bKash Payment Gateway Integration**: Manual merchant checkout with 11-digit wallet validation, one-click number copying, live BDT rate conversion, and duplicate TrxID replay prevention.
- **Rocket (DBBL) Payment Gateway Integration**: Support for 11 and 12-digit Dutch-Bangla Rocket accounts, interactive USSD `*322#` guide, and transaction verification.
- **WhatsApp Integration**: Floating pulse live support widget and direct "Order via WhatsApp" product pre-filling.
- **Headless REST API**: Secure JSON endpoints under `/api/*` for catalog search, reactive cart mutations, checkout, order inquiry, and admin management.
- **Dual SQLite Database Engine**: High-performance native `node:sqlite` for Node 22+ with automated fallback to `better-sqlite3`, completely eliminating Linux C++ compilation crashes.
- **Self-Healing CSRF Architecture**: Timing-safe CSRF validation with automatic token synchronization across session regenerations and silent client-side retry.
- **Admin Command Center**: Real-time KPI analytics, inventory adjustments, product catalog CRUD, order lifecycle management, and security audit trail review.
- **Enterprise Security**: Helmet CSP with strict frame-ancestors, HTTP Parameter Pollution protection, sliding-window IP rate limiters, and session fixation guards.
- **Multi-Target Deployment**: Turnkey deployment configurations for Docker, Docker Compose, Linux VPS with Nginx, and Render.com cloud hosting.
- **Database Assets**: Standalone SQL schema definitions (`database/schema.sql`) and comprehensive seed dataset (`database/seed.sql`).
- **Documentation Suite**: Comprehensive `HowToSetup.md` deployment manual, `CLAUDE.md`/`AGENTS.md` AI guidelines, and `CHANGELOG.md`.
