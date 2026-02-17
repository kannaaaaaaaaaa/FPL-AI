CREATE TABLE IF NOT EXISTS gameweek_analysis (
  id TEXT PRIMARY KEY,
  manager_id TEXT NOT NULL,
  gameweek INTEGER NOT NULL,

  -- Execution metadata
  execution_id TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,

  -- Timing metadata
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,

  -- AI model metadata
  model_name TEXT DEFAULT '@cf/meta/llama-3.3-70b-instruct',
  tokens_input INTEGER,
  tokens_output INTEGER,
  latency_ms INTEGER,

  -- Input/Output artifacts
  input_snapshot TEXT DEFAULT '{}',  -- Original request data
  raw_ai_output TEXT,                -- Unparsed AI response
  payload TEXT DEFAULT '{}'          -- Final validated output
);

-- Indices for query performance
CREATE INDEX IF NOT EXISTS idx_manager_gameweek ON gameweek_analysis(manager_id, gameweek);
CREATE INDEX IF NOT EXISTS idx_execution_id ON gameweek_analysis(execution_id);
CREATE INDEX IF NOT EXISTS idx_status ON gameweek_analysis(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON gameweek_analysis(created_at);

