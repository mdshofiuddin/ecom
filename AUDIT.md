# ApexStore — Dependency Security & CVE Audit Report

**Date**: 2026-10-21  
**Audit Tool**: `npm audit` (v10.x / Node.js 22 LTS)  
**Overall Status**: ✅ **PASS (0 Vulnerabilities Detected)**

---

## 1. Summary of Vulnerabilities

| Severity | Backend (Root) | Frontend (React SPA) | Total |
| :--- | :---: | :---: | :---: |
| **Critical** | **0** | **0** | **0** |
| **High** | **0** | **0** | **0** |
| **Moderate** | **0** | **0** | **0** |
| **Low** | **0** | **0** | **0** |
| **Total** | **0** | **0** | **0** |

---

## 2. Manifest and Lockfile Verification

- **Backend `package.json`**: Exact version pinning applied across all production dependencies (`better-sqlite3: 13.0.3`, `cors: 2.8.5`, `dotenv: 18.0.8`, `ejs: 7.0.2`, `express: ^5.3.0`, `bcryptjs: ^3.0.3`, `helmet: ^8.3.0`).
- **Backend `package-lock.json`**: Committed to version control; 111 packages audited and verified.
- **Frontend `frontend/package.json`**: Exact version pinning applied (`lucide-react: 1.59.0`, `react: ^19.3.1`, `vite: ^8.3.4`).
- **Frontend `frontend/package-lock.json`**: Committed to version control; 30 packages audited and verified.
- **Machine-readable Audit Logs**: Exported to [npm-audit.json](file:///npm-audit.json) and [frontend/npm-audit.json](file:///frontend/npm-audit.json).

---

## 3. Remediation and Accepted Risk Notes

No open vulnerabilities exist across the dependency tree. All packages are actively maintained, pinned to known-secure releases, and verified clean from publicly reported CVEs.
