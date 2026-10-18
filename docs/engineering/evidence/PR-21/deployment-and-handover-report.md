# PR-21 Evidence: Frontend Deployment Pipelines & Operational Handover (T068 - T070)

**PR ID:** `PR-21`  
**Tickets Covered:** `T068`, `T069`, `T070`  
**Scope:** Netlify Pipeline, SPA Routing, Environment Separation, Operational Smoke Drill UI, Emergency Kill Switch Controls, CI Workflow  
**Status:** COMPLETE & VERIFIED

---

## 1. Deliverables Summary

1. **Netlify Deployment Configuration (`netlify.toml`):**
   - Single-Page Application (SPA) client rewrite: `/* -> /index.html` with status `200`.
   - Production security headers:
     - `X-Frame-Options: DENY` (Clickjacking defense)
     - `X-Content-Type-Options: nosniff` (MIME-sniffing prevention)
     - `X-XSS-Protection: 1; mode=block`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
2. **Environment Variables Template (`.env.example`):**
   - Configures `VITE_API_BASE_URL` with fallback to local `/api` proxy.
   - Configures `VITE_APP_ENV=production`.
3. **Continuous Integration Workflow (`.github/workflows/ci.yml`):**
   - Runs on push and pull requests targeting `develop` and `main`.
   - Steps: Checkout, Setup Node.js 20.x, `npm ci`, `npm test` (all 27 tests), and `npm run build` (Typecheck and Vite build).
4. **Operational Smoke Drill & Emergency Kill Switch UI (`App.tsx` & `api.ts`):**
   - Interactive Settings tab "Outreach safety & kill switch".
   - Emergency Kill Switch banner with sub-second halt action and live indicator.
   - Interactive Operational Smoke Drill runner verifying Database, Source Registry, Reliability Engine, and Sandbox Sink status with visual audit feedback.
5. **Automated Test Suite (`tests/deployment-and-smoke.test.mjs`):**
   - 5 new automated tests verifying Netlify config, environment separation, smoke drill schema, and kill switch isolation.

---

## 2. Verification & Test Output

```
> node --test tests/*.test.mjs
ℹ tests 27
ℹ suites 0
ℹ pass 27
ℹ fail 0
ℹ duration_ms 174.6551
```

```
> tsc && vite build
✓ 1592 modules transformed.
dist/index.html                   0.59 kB
dist/assets/index-BsfWttXG.css   50.34 kB
dist/assets/index-CDZUkjmI.js   293.30 kB
✓ built in 2.24s
```

All acceptance criteria for PR-21 in Frontend are satisfied.
