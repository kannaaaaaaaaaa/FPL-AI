CREATE TABLE IF NOT EXISTS gw_analysis (
  id TEXT PRIMARY KEY,
  manager_id TEXT NOT NULL,
  gameweek INTEGER NOT NULL,
  payload TEXT DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

