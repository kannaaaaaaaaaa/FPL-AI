export async function createAnalysisRecord(db, payload) {
  const {
    managerId,
    gameweek,
    executionId,
    status = "pending",
    errorMessage,
    startedAt,
    completedAt,
    modelName,
    tokensInput,
    tokensOutput,
    latencyMs,
    inputSnapshot,
    rawAiOutput,
    result,
  } = payload;

  const id = `${managerId}-${gameweek}`;
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO gameweek_analysis (
        id, manager_id, gameweek, execution_id, status, error_message,
        started_at, completed_at, created_at, updated_at,
        model_name, tokens_input, tokens_output, latency_ms,
        input_snapshot, raw_ai_output, payload
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)
      ON CONFLICT(id) DO UPDATE SET
        execution_id = excluded.execution_id,
        status = excluded.status,
        error_message = excluded.error_message,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at,
        model_name = excluded.model_name,
        tokens_input = excluded.tokens_input,
        tokens_output = excluded.tokens_output,
        latency_ms = excluded.latency_ms,
        raw_ai_output = excluded.raw_ai_output,
        payload = excluded.payload`,
    )
    .bind(
      id,
      managerId,
      gameweek,
      executionId ?? null,
      status,
      errorMessage ?? null,
      startedAt ?? now,
      completedAt ?? null,
      now,
      now,
      modelName ?? "@cf/meta/llama-3.3-70b-instruct",
      tokensInput ?? null,
      tokensOutput ?? null,
      latencyMs ?? null,
      inputSnapshot ? JSON.stringify(inputSnapshot) : "{}",
      rawAiOutput ?? null,
      result ? JSON.stringify(result) : "{}",
    )
    .run();

  return id;
}

export async function getAnalysisRecord(db, id) {
  const row = await db.prepare(`SELECT * FROM gameweek_analysis WHERE id = ?1`).bind(id).first();
  if (!row) return null;

  return {
    id: row.id,
    managerId: row.manager_id,
    gameweek: row.gameweek,
    executionId: row.execution_id,
    status: row.status,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    modelName: row.model_name,
    tokensInput: row.tokens_input,
    tokensOutput: row.tokens_output,
    latencyMs: row.latency_ms,
    inputSnapshot: JSON.parse(row.input_snapshot ?? "{}"),
    rawAiOutput: row.raw_ai_output,
    result: JSON.parse(row.payload ?? "{}"),
  };
}

export async function updateAnalysisStatus(db, id, status, errorMessage = null) {
  const completedAt = status === "completed" || status === "failed" ? new Date().toISOString() : null;

  await db
    .prepare(
      `UPDATE gameweek_analysis
       SET status = ?1, error_message = ?2, completed_at = ?3, updated_at = datetime('now')
       WHERE id = ?4`,
    )
    .bind(status, errorMessage, completedAt, id)
    .run();
}

