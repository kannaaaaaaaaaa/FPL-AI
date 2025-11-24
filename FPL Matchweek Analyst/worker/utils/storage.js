export async function createAnalysisRecord(db, payload) {
  const { managerId, gameweek, result } = payload;
  const id = `${managerId}-${gameweek}`;

  await db
    .prepare(
      `INSERT INTO gw_analysis (id, manager_id, gameweek, payload, created_at)
       VALUES (?1, ?2, ?3, ?4, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = datetime('now')`,
    )
    .bind(id, managerId, gameweek, JSON.stringify(result ?? {}))
    .run();

  return id;
}

export async function getAnalysisRecord(db, id) {
  const row = await db.prepare(`SELECT * FROM gw_analysis WHERE id = ?1`).bind(id).first();
  if (!row) return null;
  return {
    id: row.id,
    managerId: row.manager_id,
    gameweek: row.gameweek,
    result: JSON.parse(row.payload ?? "{}"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

