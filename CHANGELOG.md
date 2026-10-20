# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-20

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
- **Documentation**: Comprehensive `HowToSetup.md` deployment manual, `CLAUDE.md`/`AGENTS.md` AI guidelines, and `CHANGELOG.md`.
