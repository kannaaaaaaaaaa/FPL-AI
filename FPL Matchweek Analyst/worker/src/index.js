import { getAnalysisRecord } from "../utils/storage.js";
import { SYSTEM_PROMPT } from "../utils/prompt.js";

const json = (data, init = {}) =>
  new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

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

    if (request.method === "GET" && url.pathname.startsWith("/gw/")) {
      const [, , gwId] = url.pathname.split("/");
      if (!gwId) return json({ error: "Missing GW identifier" }, { status: 400 });

      const record = await getAnalysisRecord(env.DB, gwId);
      if (!record) return json({ error: "Not found" }, { status: 404 });

      return json(record);
    }

    return json({ ok: true, routes: ["/analyze (POST)", "/gw/:id (GET)"] });
  },
};

