import { WorkflowEntrypoint } from "cloudflare:workers";
import { getBootstrap, getFixtures } from "../utils/fpl.js";
import { createAnalysisRecord } from "../utils/storage.js";
import { SYSTEM_PROMPT } from "../utils/prompt.js";

export class AnalyzeWorkflow extends WorkflowEntrypoint {
  /**
   * @param {{ managerId: string; gameweek: number; notes?: string }} event
   */
  async run(event, step, { env }) {
    const { managerId, gameweek, notes = "" } = event;

    const bootstrap = await step.run("fetch-bootstrap", () => getBootstrap(env));
    const fixtures = await step.run("fetch-fixtures", () => getFixtures(env));

    const mergedContext = await step.run("merge-inputs", async () => {
      return {
        managerId,
        gameweek,
        notes,
        latestFixtures: fixtures,
        squadSnapshot: bootstrap?.elements?.slice(0, 5) ?? [],
      };
    });

    const aiResult = await step.run("call-llm", async () => {
      const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze the following data:\n${JSON.stringify(mergedContext, null, 2)}`,
          },
        ],
        max_output_tokens: 800,
      });

      return response;
    });

    const parsed = await step.run("normalize-output", async () => {
      // Placeholder: convert response to schema. Expecting response.result to already match.
      try {
        return JSON.parse(aiResult?.result ?? "{}");
      } catch {
        return { error: "LLM returned invalid JSON" };
      }
    });

    const recordId = await step.run("persist", () =>
      createAnalysisRecord(env.DB, { managerId, gameweek, result: parsed }),
    );

    return { recordId, payload: parsed };
  }
}

