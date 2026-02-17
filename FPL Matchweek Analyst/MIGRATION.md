# Migration Guide

## Database Schema Update (Phase 1)

The database schema has been significantly extended to support execution metadata, AI model tracking, and intermediate artifacts.

### Changes

**Table renamed:** `gw_analysis` → `gameweek_analysis`

**New columns added:**
- `execution_id` - Cloudflare Workflow execution ID
- `status` - Execution status: pending, running, completed, failed
- `error_message` - Error details if execution failed
- `started_at` - Execution start timestamp
- `completed_at` - Execution completion timestamp
- `model_name` - AI model identifier
- `tokens_input` - Input tokens consumed
- `tokens_output` - Output tokens generated
- `latency_ms` - AI inference latency
- `input_snapshot` - Original request data
- `raw_ai_output` - Unparsed AI response

**Indices added:**
- `idx_manager_gameweek` on (manager_id, gameweek)
- `idx_execution_id` on execution_id
- `idx_status` on status
- `idx_created_at` on created_at

### Migration Steps

1. **Backup existing data** (if any):
   ```bash
   wrangler d1 export fpl_analyses --output=backup.sql
   ```

2. **Drop and recreate table**:
   ```bash
   wrangler d1 execute fpl_analyses --command="DROP TABLE IF EXISTS gw_analysis"
   wrangler d1 execute fpl_analyses --file=./FPL\ Matchweek\ Analyst/db/schema.sql
   ```

3. **Restore data** (if needed):
   - Manually map old columns to new schema
   - Set default values for new metadata columns

### API Changes

**Naming standardization:**
- All instances of `gw` changed to `gameweek`
- URL path: `/gw/:id` → `/gameweek/:id`
- Schema field: `gw_review` → `gameweek_review`

**Response format updates:**
- Added execution metadata to GET responses
- Response now includes `status`, `executionId`, timing data

### Code Changes

**FPL Data Fetching:**
- New function: `getManagerData(env, managerId)`
- New function: `getManagerHistory(env, managerId)`
- New function: `getManagerPicks(env, managerId, gameweek)`
- New function: `getEnrichedPicks(env, managerId, gameweek)`
- New function: `getAnalysisContext(env, managerId, gameweek)` - comprehensive context builder

**Schema Validation:**
- New function: `validateOutput(output)` - validates AI response
- New function: `repairOutput(output)` - attempts to fix common issues
- Schema version field added: `schema_version: "1.0.0"`

**Workflow Updates:**
- Execution status tracking throughout pipeline
- Error handling and failure persistence
- AI metadata capture (tokens, latency)
- Validation and repair steps

### Breaking Changes

1. **Database table name** changed - requires schema migration
2. **API endpoint** changed - update frontend calls from `/gw/` to `/gameweek/`
3. **Response schema** changed - `gw_review` → `gameweek_review`
4. **Frontend element IDs** changed - update any external scripts

### Recommended Actions

- Test with a fresh database first
- Update any external tools or scripts
- Monitor validation errors in the first few runs
- Check execution metadata for performance insights
