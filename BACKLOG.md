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

## Ideas / Someday

- Timeline with vertical line (explored, decided too invasive)
- Migrate from Netlify to Cloudflare Pages (more generous free tier - could impact analytics architecture decisions)

## Tech Debt

- None currently tracked

---

# Analytics Implementation Plan

## Overview

Self-hosted analytics solution as a separate microfrontend in the monorepo with WebAuthn/Passkey authentication (via Proton Pass), Turso database (SQLite), and a dashboard UI.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Netlify                                   │
│  ┌─────────────────────┐      ┌─────────────────────────────┐  │
│  │ marco.wrthwhl.cloud │      │ analytics.wrthwhl.cloud     │  │
│  │                     │      │                             │  │
│  │  Resume Site        │      │  Analytics App              │  │
│  │  (apps/wrthwhl)     │      │  (apps/analytics)           │  │
│  │                     │      │                             │  │
│  │  /api/track ────────┼──────┼▶ /api/track (proxy)        │  │
│  │                     │      │                             │  │
│  │                     │      │  /api/stats (protected)     │  │
│  │                     │      │  /dashboard (protected)     │  │
│  │                     │      │  /login (WebAuthn)          │  │
│  └─────────────────────┘      └──────────────┬──────────────┘  │
└──────────────────────────────────────────────┼──────────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │    Turso     │
                                        │   (SQLite)   │
                                        └──────────────┘
```

## Decisions

- **Data points:** All (incrementally - core first, then enhanced)
- **Dashboard:** Start with tables, add charts later
- **Date range:** Last 7 days default
- **Subdomain:** `analytics.wrthwhl.cloud`
- **Database:** Turso (SQLite)
- **Auth:** WebAuthn/Passkey via Proton Pass
- **Session duration:** 30 days
- **Registration:** One-time setup token

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

- [ ] Set up Turso account/database
- [ ] Create `apps/analytics` Next.js app
- [ ] Implement database schema
- [ ] Implement `POST /api/track` (pageviews)
- [ ] Add tracking script to resume site
- [ ] Configure Netlify proxy (`/api/track` → analytics app)

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

## Turso Setup Steps

```bash
# 1. Install Turso CLI
brew install tursodatabase/tap/turso

# 2. Sign up / login
turso auth signup   # or: turso auth login

# 3. Create database
turso db create wrthwhl-analytics

# 4. Get connection URL
turso db show wrthwhl-analytics --url

# 5. Create auth token
turso db tokens create wrthwhl-analytics

# 6. Add to environment variables (Netlify + local .env)
# TURSO_DATABASE_URL=libsql://wrthwhl-analytics-<username>.turso.io
# TURSO_AUTH_TOKEN=<token>
```

## File Structure

```
apps/
  analytics/
    pages/
      api/
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
      login.tsx
      dashboard/
        index.tsx
        referrers.tsx
        events.tsx
    lib/
      db.ts
      auth.ts
      session.ts
    components/
      ...

  wrthwhl/
    lib/
      analytics.ts
    netlify.toml  # Add proxy rule
```
