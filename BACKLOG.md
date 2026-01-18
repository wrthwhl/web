# Backlog

## In Progress

- [ ] Analytics microfrontend (see detailed plan below)

## Features

### Interactive Polish

- [x] Animate sections into view on scroll (fade-in, slide-up) - 2026-01-18
- [x] Dark/light theme toggle - done
- [ ] Keyboard navigation (j/k to jump between sections)

### Practical Features

- [x] QR code linking to live version for printed copies - 2026-01-18
- [ ] Generate a PDF version automatically
- [ ] Export to JSON for LinkedIn/ATS import
- [ ] i18n - multi-language resume support

### Fun/Creative

- [ ] Terminal mode - render resume as CLI output
- [ ] Subtle parallax effects on background
- [ ] Easter egg: Konami code reveals something fun
- [ ] "Time machine" slider showing career progression
- [ ] Interactive skill visualization (radar chart, skill tree)

### Tech Improvements

- [ ] OpenGraph/social cards for nice link previews
- [ ] RSS feed for resume updates
- [ ] "Last updated" indicator

## Completed

- [x] Sticky header with scroll-based animations - 2026-01-18
- [x] Refactored Skills components (Section columns, SkillCategory) - 2026-01-18
- [x] Scroll-triggered fade-in animations - 2026-01-18
- [x] Serve individual resume slugs only in development - 2026-01-18
- [x] QR code for print version - 2026-01-18
- [x] Refactored theme system to use Radix Colors - 2026-01-18
- [x] Migrated from Netlify to Cloudflare Pages - 2026-01-18

## Ideas / Someday

- Timeline with vertical line (explored, decided too invasive)

## Tech Debt

- None currently tracked

---

# Analytics Implementation Plan

## Overview

Self-hosted analytics solution as a separate microfrontend in the monorepo with WebAuthn/Passkey authentication (via Proton Pass), Cloudflare D1 database (SQLite at the edge), and a dashboard UI.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare                                  │
│  ┌─────────────────────┐      ┌─────────────────────────────┐  │
│  │ marco.wrthwhl.cloud │      │ analytics.wrthwhl.cloud     │  │
│  │                     │      │                             │  │
│  │  Resume Site        │      │  Analytics App              │  │
│  │  (Cloudflare Pages) │      │  (Cloudflare Workers)       │  │
│  │                     │      │                             │  │
│  │  Static HTML/JS ────┼──────┼▶ /api/track                 │  │
│  │                     │      │                             │  │
│  │                     │      │  /api/stats (protected)     │  │
│  │                     │      │  /dashboard (protected)     │  │
│  │                     │      │  /login (WebAuthn)          │  │
│  └─────────────────────┘      └──────────────┬──────────────┘  │
└──────────────────────────────────────────────┼──────────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │      D1      │
                                        │   (SQLite)   │
                                        └──────────────┘
```

## Decisions

- **Data points:** All (incrementally - core first, then enhanced)
- **Dashboard:** Start with tables, add charts later
- **Date range:** Last 7 days default
- **Subdomain:** `analytics.wrthwhl.cloud`
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Auth:** WebAuthn/Passkey via Proton Pass
- **Session duration:** 30 days
- **Registration:** One-time setup token
- **Resume hosting:** Cloudflare Pages (static export)

## Data Points

**Core (Phase 1):**

- Timestamp
- Page path
- Referrer URL (company/ATS tracking)
- UTM parameters (source, medium, campaign)
- Session ID

**Enhanced (Phase 4):**

- Device type (mobile/desktop)
- Browser
- Country (from request headers)
- Scroll depth (25%, 50%, 75%, 100%)
- Print button clicks
- Theme toggle

## Database Schema

```sql
-- Pageviews
CREATE TABLE pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_id TEXT,
  path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT
);

-- Events (scroll, print, etc.)
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_id TEXT,
  event_type TEXT,
  event_data TEXT  -- JSON for flexible payload
);

-- WebAuthn credentials
CREATE TABLE credentials (
  id TEXT PRIMARY KEY,
  public_key TEXT,
  counter INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  credential_id TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Phases

### Phase 1: Foundation

- [x] Create `apps/analytics` Cloudflare Worker with Hono - 2026-01-18
- [x] Create D1 database (`wrangler d1 create wrthwhl-analytics`) - 2026-01-18
- [x] Implement database schema - 2026-01-18
- [x] Implement `POST /api/track` (pageviews + events) - 2026-01-18
- [x] Add tracking script to resume site - 2026-01-18
- [x] Deploy analytics worker to `analytics.wrthwhl.cloud` - 2026-01-18

### Phase 2: Auth

- [ ] Install WebAuthn dependencies (`@simplewebauthn/*`)
- [ ] Implement passkey registration (one-time setup token)
- [ ] Implement passkey login
- [ ] Session management (cookies)
- [ ] Protect dashboard routes with middleware

### Phase 3: Dashboard (Tables)

- [ ] Stats API endpoints (overview, referrers, UTM)
- [ ] Dashboard pages with date range picker
- [ ] Referrer detail view
- [ ] UTM breakdown (QR code tracking)

### Phase 4: Enhanced Tracking

- [ ] Add device/browser/country detection
- [ ] Implement `POST /api/event` for custom events
- [ ] Add scroll depth tracking to resume
- [ ] Add print button tracking
- [ ] Events dashboard view

### Phase 5: Charts

- [ ] Add charting library (recharts or chart.js)
- [ ] Views over time chart
- [ ] Referrer breakdown chart
- [ ] Device/browser breakdown chart

## D1 Setup Steps

```bash
# 1. Create D1 database
pnpm exec wrangler d1 create wrthwhl-analytics

# 2. Copy database_id to wrangler.jsonc in apps/analytics

# 3. Apply schema
pnpm exec wrangler d1 execute wrthwhl-analytics --file=schema.sql

# 4. Deploy analytics worker
cd apps/analytics && pnpm exec wrangler deploy
```

## Resume Site Deployment (Cloudflare Pages)

```bash
# Build static export
pnpm build

# Deploy to production
pnpm exec wrangler pages deploy dist/apps/wrthwhl/.next --project-name wrthwhl --branch main
```

## File Structure

```
apps/
  analytics/
    src/
      index.ts          # Worker entry point
      routes/
        track.ts
        event.ts
        auth/
          register.ts
          login.ts
          verify.ts
          logout.ts
        stats/
          overview.ts
          referrers.ts
          utm.ts
          events.ts
      lib/
        db.ts
        auth.ts
        session.ts
    wrangler.jsonc
    schema.sql

  wrthwhl/
    lib/
      analytics.ts      # Client-side tracking
    next.config.js      # output: 'export' for static
```
