const BASE = "https://fantasy.premierleague.com/api";

const TTL = {
  bootstrap: 60 * 5,
  fixtures: 60 * 30,
  player: 60 * 15,
};

async function cachedFetch(env, key, url, ttlSeconds) {
  const cached = await env.FPL_CACHE.get(key, "json");
  if (cached) return cached;

  const res = await fetch(url, { cf: { cacheTtl: ttlSeconds } });
  if (!res.ok) throw new Error(`FPL API failed for ${url}`);
  const data = await res.json();
  await env.FPL_CACHE.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
  return data;
}

export async function getBootstrap(env) {
  return cachedFetch(env, "bootstrap-static", `${BASE}/bootstrap-static/`, TTL.bootstrap);
}

export async function getFixtures(env, limit = 5) {
  const data = await cachedFetch(env, "fixtures", `${BASE}/fixtures/?future=1`, TTL.fixtures);
  return data.slice(0, limit);
}

export async function getPlayerSummary(env, id) {
  if (!id) throw new Error("Player id required");
  return cachedFetch(env, `player-${id}`, `${BASE}/element-summary/${id}/`, TTL.player);
}

