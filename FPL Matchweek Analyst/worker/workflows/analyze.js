import { WorkflowEntrypoint } from "cloudflare:workers";
import { getAnalysisContext } from "../utils/fpl.js";
import { createAnalysisRecord, updateAnalysisStatus } from "../utils/storage.js";
import { SYSTEM_PROMPT, validateOutput, repairOutput } from "../utils/prompt.js";

export class AnalyzeWorkflow extends WorkflowEntrypoint {
  /**
   * @param {{ managerId: string; gameweek: number; notes?: string }} event
   */
  async run(event, step) {
    const { managerId, gameweek, notes = "" } = event;
    const recordId = `${managerId}-${gameweek}`;
    const executionId = this.env.ANALYZE_WORKFLOW?.id || crypto.randomUUID();
    const startTime = Date.now();

    // Initialize record with pending status
    await step.run("init-record", () =>
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
      await step.run("mark-running", () =>
        updateAnalysisStatus(this.env.DB, recordId, "running"),
      );

      // Fetch comprehensive FPL data for this manager and gameweek
      const analysisContext = await step.run("fetch-fpl-data", () =>
        getAnalysisContext(this.env, managerId, gameweek),
      );

      const mergedContext = await step.run("merge-inputs", async () => {
        return {
          ...analysisContext,
          user_notes: notes,
        };
      });

      const aiStartTime = Date.now();
      const aiResult = await step.run("call-llm", async () => {
        const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
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
      const aiLatency = Date.now() - aiStartTime;

      const parsed = await step.run("parse-ai-output", async () => {
        try {
          // Try multiple response formats
          let result;
          if (typeof aiResult?.response === "string") {
            result = JSON.parse(aiResult.response);
          } else if (aiResult?.response && typeof aiResult.response === "object") {
            result = aiResult.response;
          } else if (typeof aiResult?.result === "string") {
            result = JSON.parse(aiResult.result);
          } else {
            throw new Error("No valid response field found in AI result");
          }
          return result;
        } catch (error) {
          throw new Error(`Failed to parse AI output: ${error.message}`);
        }
      });

      const validated = await step.run("validate-and-repair", async () => {
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
      await step.run("persist-success", () =>
        createAnalysisRecord(this.env.DB, {
          managerId,
          gameweek,
          executionId,
          status: "completed",
          completedAt: new Date().toISOString(),
          modelName: "@cf/meta/llama-3.3-70b-instruct",
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
      await step.run("persist-failure", () =>
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

