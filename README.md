# FPL Matchweek Analyst

A Cloudflare Workers + Pages application that analyzes Fantasy Premier League performance by combining official FPL data with AI-powered insights from Meta Llama 3.3.

## Overview

This application orchestrates a multi-step workflow that:
1. Fetches FPL manager data and gameweek statistics
2. Merges official stats with user notes
3. Generates structured AI analysis
4. Persists results for historical review

## Tech Stack

- **Cloudflare Workers** – Backend API and request handling
- **Cloudflare Workflows** – Multi-step orchestration
- **Cloudflare Workers AI** – Meta Llama 3.3 for analysis
- **Cloudflare D1** – SQLite database for persisted analyses
- **Cloudflare KV** – Caching layer for FPL API responses
- **Cloudflare Pages** – Frontend hosting (vanilla HTML/CSS/JS)

## Repository Structure

```
FPL Matchweek Analyst/
├── frontend/              # Static HTML/CSS/JS frontend
│   ├── index.html
│   └── app.js
├── worker/
│   ├── src/
│   │   └── index.js      # Worker entry point and API routes
│   ├── workflows/
│   │   └── analyze.js    # Workflow orchestration
│   └── utils/
│       ├── fpl.js        # FPL API integration
│       ├── prompt.js     # AI prompt and schema definitions
│       └── storage.js    # D1 database operations
├── db/
│   └── schema.sql        # D1 database schema
├── wrangler.toml         # Cloudflare configuration
└── package.json
```

## Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with access to:
  - Workers & Workers AI
  - Workflows (beta)
  - D1 Database (beta)
  - Workers KV

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare Resources

Login to Cloudflare:
```bash
wrangler login
```

Create KV namespace and D1 database:
```bash
wrangler kv namespace create FPL_CACHE
wrangler d1 create fpl_analyses
```

Update `wrangler.toml` with the generated binding IDs.

### 3. Initialize Database

```bash
wrangler d1 execute fpl_analyses --file=./FPL\ Matchweek\ Analyst/db/schema.sql
```

### 4. Develop Locally

```bash
npm run dev
```

This starts the Worker with local bindings and serves the frontend at `http://localhost:8787`.

### 5. Deploy to Production

```bash
npm run deploy
```

## API Reference

### POST /analyze

Initiates analysis workflow for a manager's gameweek.

**Request:**
```json
{
  "managerId": "string",
  "gameweek": number,
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Workflow accepted",
  "executionId": "string"
}
```

### GET /gameweek/:id

Retrieves stored analysis by composite ID (`{managerId}-{gameweek}`).

**Response:**
```json
{
  "id": "string",
  "managerId": "string",
  "gameweek": number,
  "executionId": "string",
  "status": "pending|running|completed|failed",
  "result": {...},
  "createdAt": "timestamp",
  "completedAt": "timestamp"
}
```

### GET /execution/:id

Retrieves workflow execution status by execution ID.

**Response:**
```json
{
  "id": "string",
  "managerId": "string",
  "gameweek": number,
  "result": {
    "gameweek_review": {...},
    "tactical_form_takeaways": [...],
    "transfer_recommendations": [...]
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Environment Bindings

| Binding | Type | Purpose |
|---------|------|---------|
| `DB` | D1 Database | Stores analysis records |
| `FPL_CACHE` | KV Namespace | Caches FPL API responses |
| `AI` | Workers AI | Meta Llama 3.3 inference |
| `ANALYZE_WORKFLOW` | Workflow | Orchestration binding |

## Current Status

**Phase 1 Complete** - Core contract and data foundation stabilized.

### Implemented Features
- ✅ Workflow orchestration with execution tracking
- ✅ Comprehensive FPL API integration:
  - Manager data (team, history, picks)
  - Player statistics and summaries
  - Fixtures and gameweek data
  - Enriched picks with player details
- ✅ AI-powered analysis with Llama 3.3
- ✅ Schema validation and auto-repair
- ✅ D1 persistence with execution metadata
- ✅ Status tracking (pending → running → completed/failed)
- ✅ Performance metrics (tokens, latency)
- ✅ Consistent naming (gameweek everywhere)
- ✅ Frontend polling interface

### Metadata Captured
Each analysis now tracks:
- Execution ID and status
- Start/completion timestamps
- AI model and token usage
- Latency metrics
- Input snapshots for debugging
- Raw AI output before validation
- Error messages on failure

## Roadmap

**Phase 2 - Workflow Reliability** ✅ Complete
- ✅ Add retries with exponential backoff for FPL/AI calls
- ✅ Implement request timeouts
- ✅ Add workflow status endpoint (GET /execution/:id)
- ✅ Improve error classification and handling
- ✅ Circuit breaker pattern for external APIs

**Phase 3 - Frontend Productization** ✅ Complete
- ✅ Status-aware polling with execution ID
- ✅ Structured rendering for analysis blocks
- ✅ Loading states and retry UX
- ✅ Professional styling and responsive design
- ✅ Input validation and error recovery

**Phase 4 - Quality & Operations** (Next)

- [ ] Unit tests for validation and FPL parsing
- [ ] Integration tests for workflow
- [ ] CI/CD pipeline
- [ ] Observability (logging, error monitoring)
- [ ] Deployment automation
