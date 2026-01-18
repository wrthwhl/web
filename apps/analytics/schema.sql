-- Analytics schema for D1

-- Pageviews table
CREATE TABLE IF NOT EXISTS pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT DEFAULT (datetime('now')),
  session_id TEXT,
  path TEXT NOT NULL,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT
);

-- Events table (scroll depth, print clicks, theme toggles, etc.)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT DEFAULT (datetime('now')),
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data TEXT  -- JSON for flexible payload
);

-- WebAuthn credentials (Phase 2)
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_type TEXT,       -- 'singleDevice' or 'multiDevice'
  backed_up INTEGER,      -- 0 or 1 (boolean)
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sessions for auth (Phase 2)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  credential_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (credential_id) REFERENCES credentials(id)
);

-- WebAuthn challenges (temporary, expire after 5 minutes)
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  challenge TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON pageviews(timestamp);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON pageviews(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_session ON pageviews(session_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_challenges_expires ON challenges(expires_at);
