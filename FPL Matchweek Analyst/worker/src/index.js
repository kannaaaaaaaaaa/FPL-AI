import { getAnalysisRecord } from "../utils/storage.js";
import { SYSTEM_PROMPT } from "../utils/prompt.js";
import { AnalyzeWorkflow } from "../workflows/analyze.js";

const json = (data, init = {}) =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

// Export the workflow
export { AnalyzeWorkflow };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/analyze") {
      const body = await request.json().catch(() => ({}));
      const { managerId, gameweek, notes } = body;

      if (!managerId || typeof gameweek !== "number") {
        return json({ error: "managerId and gameweek are required." }, { status: 400 });
      }

      const payload = { managerId, gameweek, notes: notes ?? "", prompt: SYSTEM_PROMPT };
      const execution = await env.ANALYZE_WORKFLOW.createExecution({
        input: payload,
      });

      return json(
        {
          message: "Workflow accepted",
          executionId: execution.id,
        },
        { status: 202 },
      );
    }

    if (request.method === "GET" && url.pathname.startsWith("/gameweek/")) {
      const [, , gameweekId] = url.pathname.split("/");
      if (!gameweekId) return json({ error: "Missing gameweek identifier" }, { status: 400 });

      const record = await getAnalysisRecord(env.DB, gameweekId);
      if (!record) return json({ error: "Not found" }, { status: 404 });

      return json(record);
    }

    if (request.method === "GET" && url.pathname.startsWith("/execution/")) {
      const [, , executionId] = url.pathname.split("/");
      if (!executionId) return json({ error: "Missing execution identifier" }, { status: 400 });

      try {
        // Get execution status from Workflow
        const execution = await env.ANALYZE_WORKFLOW.get(executionId);

        if (!execution) {
          return json({ error: "Execution not found" }, { status: 404 });
        }

        // Also fetch the analysis record if available
        const records = await env.DB.prepare(
          `SELECT * FROM gameweek_analysis WHERE execution_id = ?1 LIMIT 1`
        ).bind(executionId).all();

        const record = records.results?.[0];

        return json({
          executionId: execution.id,
          status: execution.status,
          createdAt: execution.createdAt,
          analysis: record ? {
            id: record.id,
            managerId: record.manager_id,
            gameweek: record.gameweek,
            status: record.status,
            startedAt: record.started_at,
            completedAt: record.completed_at,
            errorMessage: record.error_message,
          } : null,
        });
      } catch (error) {
        return json({ error: "Failed to fetch execution status", details: error.message }, { status: 500 });
      }
    }

    return json({
      ok: true,
      routes: [
        "POST /analyze - Start analysis workflow",
        "GET /gameweek/:id - Get analysis by composite ID (managerId-gameweek)",
        "GET /execution/:id - Get workflow execution status",
      ],
    });
  },
};

