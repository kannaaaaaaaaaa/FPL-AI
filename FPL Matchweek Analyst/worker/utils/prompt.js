/**
 * Canonical output schema for AI analysis
 * Schema version: 1.0.0
 */
export const OUTPUT_SCHEMA = {
  schema_version: "1.0.0",
  gameweek_review: {
    top_performers: [
      {
        player_name: "string",
        points: "number",
        rationale: "string",
      },
    ],
    honorable_mentions: [
      {
        player_name: "string",
        points: "number",
        note: "string",
      },
    ],
    underperformers: [
      {
        player_name: "string",
        points: "number",
        issue: "string",
      },
    ],
    captain_verdict: "string",
  },
  tactical_form_takeaways: [
    {
      category: "string", // e.g., "Team Form", "Positional Trends", "Fixture Difficulty"
      insight: "string",
      actionable: "boolean",
    },
  ],
  transfer_recommendations: {
    transfers_in: [
      {
        player_name: "string",
        position: "string",
        price: "number",
        rationale: "string",
        priority: "string", // "high", "medium", "low"
      },
    ],
    transfers_out: [
      {
        player_name: "string",
        position: "string",
        reason: "string",
        urgency: "string", // "immediate", "soon", "consider"
      },
    ],
    holds: [
      {
        player_name: "string",
        position: "string",
        justification: "string",
      },
    ],
  },
};

/**
 * Schema validation rules
 */
const VALIDATION_RULES = {
  schema_version: (val) => typeof val === "string" && val.match(/^\d+\.\d+\.\d+$/),
  gameweek_review: {
    top_performers: (arr) => Array.isArray(arr) && arr.every((item) =>
      item.player_name && item.points != null && item.rationale
    ),
    honorable_mentions: (arr) => Array.isArray(arr),
    underperformers: (arr) => Array.isArray(arr),
    captain_verdict: (val) => typeof val === "string" && val.length > 0,
  },
  tactical_form_takeaways: (arr) => Array.isArray(arr) && arr.every((item) =>
    item.category && item.insight
  ),
  transfer_recommendations: (obj) =>
    obj &&
    Array.isArray(obj.transfers_in) &&
    Array.isArray(obj.transfers_out) &&
    Array.isArray(obj.holds),
};

/**
 * Validates AI output against the canonical schema
 */
export function validateOutput(output) {
  const errors = [];

  if (!output || typeof output !== "object") {
    return { valid: false, errors: ["Output must be an object"] };
  }

  // Check schema version
  if (!output.schema_version || !VALIDATION_RULES.schema_version(output.schema_version)) {
    errors.push("Missing or invalid schema_version");
  }

  // Validate gameweek_review
  if (!output.gameweek_review) {
    errors.push("Missing gameweek_review");
  } else {
    const gr = output.gameweek_review;
    if (!VALIDATION_RULES.gameweek_review.top_performers(gr.top_performers || [])) {
      errors.push("Invalid top_performers format");
    }
    if (!VALIDATION_RULES.gameweek_review.captain_verdict(gr.captain_verdict || "")) {
      errors.push("Missing or empty captain_verdict");
    }
  }

  // Validate tactical_form_takeaways
  if (!VALIDATION_RULES.tactical_form_takeaways(output.tactical_form_takeaways || [])) {
    errors.push("Invalid tactical_form_takeaways format");
  }

  // Validate transfer_recommendations
  if (!VALIDATION_RULES.transfer_recommendations(output.transfer_recommendations || {})) {
    errors.push("Invalid transfer_recommendations format");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Repairs common issues in AI output
 */
export function repairOutput(output) {
  const repaired = {
    schema_version: "1.0.0",
    gameweek_review: {
      top_performers: [],
      honorable_mentions: [],
      underperformers: [],
      captain_verdict: "No analysis available",
    },
    tactical_form_takeaways: [],
    transfer_recommendations: {
      transfers_in: [],
      transfers_out: [],
      holds: [],
    },
  };

  if (!output || typeof output !== "object") return repaired;

  // Merge valid parts
  if (output.gameweek_review) {
    repaired.gameweek_review = { ...repaired.gameweek_review, ...output.gameweek_review };
  }
  if (Array.isArray(output.tactical_form_takeaways)) {
    repaired.tactical_form_takeaways = output.tactical_form_takeaways;
  }
  if (output.transfer_recommendations) {
    repaired.transfer_recommendations = {
      ...repaired.transfer_recommendations,
      ...output.transfer_recommendations,
    };
  }

  return repaired;
}

export const SYSTEM_PROMPT = `You are FPL Matchweek Analyst, an AI assistant specializing in Fantasy Premier League analysis.

You will receive:
- Manager's team picks and squad details
- Gameweek performance data
- Historical trends
- Upcoming fixtures
- User's personal notes

Your task is to generate a structured JSON analysis following this EXACT schema:

${JSON.stringify(OUTPUT_SCHEMA, null, 2)}

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations outside the JSON
2. Include schema_version: "1.0.0" as the first field
3. All player names must match the provided data exactly
4. Points and prices must be numbers, not strings
5. Captain verdict must summarize the captain choice and outcome
6. Tactical takeaways should identify 2-4 key trends or patterns
7. Transfer recommendations should be specific and actionable
8. Priority levels: "high", "medium", "low"
9. Urgency levels: "immediate", "soon", "consider"

Keep analysis:
- Concise (1-2 sentences per point)
- Data-driven (reference specific stats)
- Actionable (clear next steps)
- Professional tone

Return the JSON object directly without any wrapper or formatting.`;


