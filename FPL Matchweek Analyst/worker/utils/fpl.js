const BASE = "https://fantasy.premierleague.com/api";

const TTL = {
  bootstrap: 60 * 5,      // 5 minutes
  fixtures: 60 * 30,      // 30 minutes
  player: 60 * 15,        // 15 minutes
  manager: 60 * 5,        // 5 minutes
  picks: 60 * 60 * 24,    // 24 hours (picks don't change after deadline)
};

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

async function cachedFetch(env, key, url, ttlSeconds) {
  // Check cache first
  const cached = await env.FPL_CACHE.get(key, "json");
  if (cached) return cached;

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        cf: { cacheTtl: ttlSeconds },
        signal: AbortSignal.timeout(10000),
      });

      if (res.status === 503) {
        throw new Error(`FPL API is currently unavailable (503). The Fantasy Premier League servers may be down for maintenance.`);
      }

      if (!res.ok) {
        throw new Error(`FPL API error for ${url}: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Cache the result
      await env.FPL_CACHE.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Get bootstrap-static data (teams, players, gameweeks)
 */
export async function getBootstrap(env) {
  return cachedFetch(env, "bootstrap-static", `${BASE}/bootstrap-static/`, TTL.bootstrap);
}

/**
 * Get upcoming fixtures
 */
export async function getFixtures(env, limit = 5) {
  const data = await cachedFetch(env, "fixtures", `${BASE}/fixtures/?future=1`, TTL.fixtures);
  return data.slice(0, limit);
}

/**
 * Get player-specific details and history
 */
export async function getPlayerSummary(env, id) {
  if (!id) throw new Error("Player id required");
  return cachedFetch(env, `player-${id}`, `${BASE}/element-summary/${id}/`, TTL.player);
}

/**
 * Get manager's overall data (entry info, history, chips)
 */
export async function getManagerData(env, managerId) {
  if (!managerId) throw new Error("Manager ID required");
  return cachedFetch(
    env,
    `manager-${managerId}`,
    `${BASE}/entry/${managerId}/`,
    TTL.manager,
  );
}

/**
 * Get manager's history across all gameweeks
 */
export async function getManagerHistory(env, managerId) {
  if (!managerId) throw new Error("Manager ID required");
  return cachedFetch(
    env,
    `manager-history-${managerId}`,
    `${BASE}/entry/${managerId}/history/`,
    TTL.manager,
  );
}

/**
 * Get manager's picks for a specific gameweek
 */
export async function getManagerPicks(env, managerId, gameweek) {
  if (!managerId) throw new Error("Manager ID required");
  if (!gameweek) throw new Error("Gameweek required");
  return cachedFetch(
    env,
    `manager-picks-${managerId}-${gameweek}`,
    `${BASE}/entry/${managerId}/event/${gameweek}/picks/`,
    TTL.picks,
  );
}

/**
 * Get manager's transfers for the season
 */
export async function getManagerTransfers(env, managerId) {
  if (!managerId) throw new Error("Manager ID required");
  return cachedFetch(
    env,
    `manager-transfers-${managerId}`,
    `${BASE}/entry/${managerId}/transfers/`,
    TTL.manager,
  );
}

/**
 * Enriches manager picks with player details from bootstrap
 */
export async function getEnrichedPicks(env, managerId, gameweek) {
  const [picks, bootstrap] = await Promise.all([
    getManagerPicks(env, managerId, gameweek),
    getBootstrap(env),
  ]);

  const playerMap = new Map(bootstrap.elements.map((p) => [p.id, p]));
  const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t]));

  return {
    ...picks,
    picks: picks.picks.map((pick) => {
      const player = playerMap.get(pick.element);
      const team = player ? teamMap.get(player.team) : null;
      return {
        ...pick,
        player_name: player ? player.web_name : "Unknown",
        team_name: team ? team.short_name : "Unknown",
        position: pick.position,
        is_captain: pick.is_captain,
        is_vice_captain: pick.is_vice_captain,
        multiplier: pick.multiplier,
      };
    }),
  };
}

/**
 * Build comprehensive analysis context for a manager and gameweek
 */
export async function getAnalysisContext(env, managerId, gameweek) {
  const [managerData, history, picks, bootstrap, fixtures] = await Promise.all([
    getManagerData(env, managerId),
    getManagerHistory(env, managerId),
    getEnrichedPicks(env, managerId, gameweek),
    getBootstrap(env),
    getFixtures(env, 5),
  ]);

  // Get current gameweek from history or bootstrap
  const currentGameweek =
    history.current?.find((gw) => gw.event === gameweek) ||
    bootstrap.events.find((e) => e.id === gameweek);

  return {
    manager: {
      id: managerData.id,
      name: managerData.name,
      team_name: managerData.name,
      overall_points: managerData.summary_overall_points,
      overall_rank: managerData.summary_overall_rank,
      gameweek_points: currentGameweek?.points || 0,
      gameweek_rank: currentGameweek?.rank || 0,
      bank: managerData.last_deadline_bank / 10, // Convert to pounds
      value: managerData.last_deadline_value / 10,
    },
    picks: picks.picks,
    gameweek: {
      id: gameweek,
      deadline: currentGameweek?.deadline_time,
      finished: currentGameweek?.finished || false,
      highest_score: currentGameweek?.highest_score,
      average_score: currentGameweek?.average_entry_score,
    },
    recent_history: history.current?.slice(-5) || [],
    upcoming_fixtures: fixtures,
  };
}

