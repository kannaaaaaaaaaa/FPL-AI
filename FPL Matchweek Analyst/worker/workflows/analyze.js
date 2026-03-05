import { WorkflowEntrypoint } from "cloudflare:workers";
import { getAnalysisContext } from "../utils/fpl.js";
import { createAnalysisRecord, updateAnalysisStatus } from "../utils/storage.js";
import { SYSTEM_PROMPT, validateOutput, repairOutput } from "../utils/prompt.js";

const STEP_CONFIG = {
  db: {
    retries: { limit: 2, delay: "2 seconds", backoff: "constant" },
    timeout: "30 seconds",
  },
  fplFetch: {
    retries: { limit: 1, delay: "5 seconds", backoff: "linear" },
    timeout: "2 minutes",
  },
  llm: {
    retries: { limit: 2, delay: "5 seconds", backoff: "linear" },
    timeout: "3 minutes",
  },
  parse: {
    retries: { limit: 1, delay: "1 second", backoff: "constant" },
    timeout: "30 seconds",
  },
};

export class AnalyzeWorkflow extends WorkflowEntrypoint {
  /**
   * @param {WorkflowEvent<{ managerId: string; gameweek: number; notes?: string }>} event
   */
  async run(event, step) {
    const { managerId, gameweek, notes = "" } = event.payload;
    const recordId = `${managerId}-${gameweek}`;
    const executionId = event.id;
    const startTime = Date.now();

    // Initialize record with pending status
    await step.do("init-record", STEP_CONFIG.db, async () =>
      createAnalysisRecord(this.env.DB, {
        managerId,
        gameweek,
        executionId,
        status: "pending",
        inputSnapshot: { managerId, gameweek, notes },
        startedAt: new Date(startTime).toISOString(),
      }),
    );

    try {
      // Update to running status
      await step.do("mark-running", STEP_CONFIG.db, async () =>
        updateAnalysisStatus(this.env.DB, recordId, "running"),
      );

      // Fetch comprehensive FPL data for this manager and gameweek
      const analysisContext = await step.do("fetch-fpl-data", STEP_CONFIG.fplFetch, async () =>
        getAnalysisContext(this.env, managerId, gameweek),
      );

      const mergedContext = {
        ...analysisContext,
        user_notes: notes,
      };

      const aiStartTime = Date.now();
      const aiResult = await step.do("call-llm", STEP_CONFIG.llm, async () => {
        const response = await this.env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze the following data:\n${JSON.stringify(mergedContext, null, 2)}`,
            },
          ],
          max_tokens: 2048,
        });

        return response;
      });
      const aiLatency = Date.now() - aiStartTime;

      const parsed = await step.do("parse-ai-output", STEP_CONFIG.parse, async () => {
        let raw = aiResult?.response ?? aiResult?.result;

        if (!raw) {
          throw new Error("No valid response field found in AI result");
        }

        if (typeof raw === "string") {
          // Strip markdown code fences if present
          raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
          return JSON.parse(raw);
        }

        if (typeof raw === "object") {
          return raw;
        }

        throw new Error("Unexpected AI response format");
      });

      const validated = await step.do("validate-and-repair", STEP_CONFIG.parse, async () => {
        const validation = validateOutput(parsed);

        if (validation.valid) {
          return { output: parsed, repaired: false, errors: [] };
        }

        // Attempt repair
        const repaired = repairOutput(parsed);
        const revalidation = validateOutput(repaired);

        if (revalidation.valid) {
          return {
            output: repaired,
            repaired: true,
            errors: validation.errors,
          };
        }

        // If repair failed, throw with details
        throw new Error(
          `AI output validation failed: ${validation.errors.join(", ")}. Repair also failed: ${revalidation.errors.join(", ")}`,
        );
      });

      // Persist successful result
      await step.do("persist-success", STEP_CONFIG.db, async () =>
        createAnalysisRecord(this.env.DB, {
          managerId,
          gameweek,
          executionId,
          status: "completed",
          completedAt: new Date().toISOString(),
          modelName: "@cf/meta/llama-3.1-70b-instruct",
          tokensInput: aiResult?.meta?.tokens_input,
          tokensOutput: aiResult?.meta?.tokens_output,
          latencyMs: aiLatency,
          rawAiOutput: JSON.stringify(aiResult),
          result: validated.output,
          inputSnapshot: {
            managerId,
            gameweek,
            notes,
            validation: {
              repaired: validated.repaired,
              original_errors: validated.errors,
            },
          },
        }),
      );

      return {
        recordId,
        status: "completed",
        payload: validated.output,
        metadata: {
          repaired: validated.repaired,
          validation_errors: validated.errors,
        },
      };
    } catch (error) {
      // Persist failure
      await step.do("persist-failure", STEP_CONFIG.db, async () =>
        createAnalysisRecord(this.env.DB, {
          managerId,
          gameweek,
          executionId,
          status: "failed",
          errorMessage: error.message,
          completedAt: new Date().toISOString(),
        }),
      );

      return { recordId, status: "failed", error: error.message };
    }
  }
}
