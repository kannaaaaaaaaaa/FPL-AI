# FPL Matchweek Analyst

Cloudflare Workers + Pages playground that orchestrates FPL data, Llama 3.3 reasoning, and diary-like outputs for each gameweek.

## What’s Inside

- **Frontend (`/frontend`)** – Minimal HTML/CSS/JS surface rendered via Cloudflare Pages. Lets managers paste notes, call the backend, and view the three required result blocks.
- **Worker (`/worker`)** – Handles API routes, kicks off the Cloudflare Workflow, and exposes helpers for prompt building, FPL data fetching, and storage.
- **Workflow (`/worker/workflows/analyze.js`)** – Stubbed multi-step pipeline that caches FPL data, merges user notes, calls Workers AI (Meta Llama 3.3), and persists the summarized output.
- **Storage (`/db/schema.sql`)** – D1 table definition for saving each analysis record.
- **Config (`wrangler.toml`)** – Declares the Worker, Workflow binding, D1 + KV resources, and Workers AI binding.

## Requirements

1. Node 18+ (for local tooling) and the latest `wrangler`.
2. Cloudflare account with Workers AI, D1 beta, Workflows beta, and Workers KV enabled.

## Getting Started

```bash
pnpm install # or npm install
wrangler d1 execute FPL_DIARY --file=./db/schema.sql
wrangler dev
```

During development, Cloudflare Pages can serve `/frontend`. Point local previews (or deployed Pages) to the Worker origin defined in `wrangler.toml`.

## Environment Bindings

| Binding | Type | Purpose |
| --- | --- | --- |
| `DB` | D1 | Stores each GW analysis row |
| `FPL_CACHE` | Workers KV | Caches bootstrap, fixtures, and per-player summaries |
| `AI` | Workers AI | Accesses Meta Llama 3.3 |
| `ANALYZE_WORKFLOW` | Workflow | Multi-step orchestration entrypoint |

## Next Steps

- Flesh out `worker/utils/fpl.js` to fetch and normalize real FPL API data.
- Implement schema-aware prompt construction plus validation for the AI output.
- Persist real workflow artifacts and expose meaningful statuses over `/gw/:id`.
# FPL Matchweek Analyst

Cloudflare Workers + Pages scaffold that pairs official Fantasy Premier League data with Meta Llama 3.3 via Workers AI. The goal is to orchestrate a repeatable four-step workflow that collects GW data, merges user diary notes, runs structured LLM reasoning, and saves a three-block analysis that fans can revisit later.

## Tech Stack
- Cloudflare Workers (backend API) and Workflows (multi-step orchestration)
- Cloudflare Workers AI (Meta Llama 3.3)
- Cloudflare D1 for persisting completed analyses
- Cloudflare KV for caching FPL API payloads
- Cloudflare Pages frontend (vanilla HTML/JS)

## Repository Layout
`
/frontend         → Cloudflare Pages UI (notes input + results)
/worker           → Worker entry point, workflow, utils
/db               → D1 schema definition
wrangler.toml     → Cloudflare environment configuration
package.json      → npm scripts and metadata
`

## Prerequisites
- Node 18+
- 
pm install -g wrangler (or run via npx)
- Cloudflare account with Workers, Workflows, D1, and KV enabled

## Getting Started
1. Install dependencies (just wrangler scripts today):
   `
   npm install
   `
2. Login to Cloudflare and create resources:
   `
   wrangler login
   wrangler kv namespace create FPL_CACHE
   wrangler d1 create fpl_analyses
   `
   Update the generated binding IDs inside wrangler.toml if they differ.
3. Apply the schema:
   `
   wrangler d1 execute fpl_analyses --file=./db/schema.sql
   `
4. Develop locally (Pages + Worker):
   `
   npm run dev
   `
   This runs wrangler dev for the worker and serves the frontend static assets via the built-in dev server.
5. Deploy:
   `
   npm run deploy
   `

## API Overview
- POST /analyze → kicks off the workflow. Body accepts { managerId, gw, notes }.
- GET /gw/:id → fetches the saved analysis JSON from D1.

## Workflow Steps
1. Fetch & cache bootstrap, fixtures, and any player element summaries.
2. Merge user notes with key stats per positional block.
3. Call Meta Llama 3.3 with the system prompt in worker/utils/prompt.js and the structured schema.
4. Persist the final object to D1 and expose the record ID.

All heavy lifting is stubbed with placeholder calls today, so you can focus on customizing prompts, data shaping, and UI polish next.

## Next Up
- Implement real FPL API calls + caching logic.
- Build the structured prompt and validation for Llama outputs.
- Expand the frontend visuals and add authentication if needed.
- Add tests/linting when the core features stabilize.
