const apiBase = import.meta?.env?.VITE_API_BASE ?? window.API_BASE ?? "";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 6;

const managerInput = document.getElementById("managerId");
const gwInput = document.getElementById("gw");
const notesInput = document.getElementById("notes");
const analyzeBtn = document.getElementById("analyzeBtn");
const statusEl = document.getElementById("status");
const diaryIndicator = document.getElementById("diaryIndicator");
const gwReviewEl = document.getElementById("gwReview");
const takeawaysEl = document.getElementById("takeaways");
const transfersEl = document.getElementById("transfers");

function setLoading(isLoading, message = "") {
  analyzeBtn.disabled = isLoading;
  statusEl.textContent = message;
  statusEl.classList.toggle("error", false);
}

function showError(message) {
  statusEl.textContent = message;
  statusEl.classList.add("error");
  analyzeBtn.disabled = false;
}

function renderResults(payload) {
  if (!payload) return;
  const { gw_review, tactical_form_takeaways, transfer_recommendations } = payload;
  gwReviewEl.textContent = JSON.stringify(gw_review, null, 2);
  takeawaysEl.textContent = JSON.stringify(tactical_form_takeaways, null, 2);
  transfersEl.textContent = JSON.stringify(transfer_recommendations, null, 2);
}

async function pollForDiary(recordId, attempt = 0) {
  if (!recordId) return null;
  try {
    const res = await fetch(`${apiBase}/gw/${recordId}`);
    if (res.ok) {
      const data = await res.json();
      return data.result ?? null;
    }
  } catch (error) {
    console.warn("Polling failed", error);
  }

  if (attempt >= MAX_POLL_ATTEMPTS) return null;
  await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  return pollForDiary(recordId, attempt + 1);
}

async function analyze() {
  const managerId = managerInput.value.trim();
  const gameweek = Number(gwInput.value);
  const notes = notesInput.value.trim();

  if (!managerId || Number.isNaN(gameweek)) {
    showError("Manager ID and GW are required.");
    return;
  }

  setLoading(true, "Running workflow…");
  diaryIndicator.classList.remove("visible");

  try {
    const res = await fetch(`${apiBase}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerId, gameweek, notes }),
    });

    if (!res.ok) throw new Error("Worker did not accept the request");
    const data = await res.json();
    statusEl.textContent =
      data.message ?? "Analysis started. Fetching your diary entry shortly…";

    const recordId = `${managerId}-${gameweek}`;
    const diary = await pollForDiary(recordId);
    if (diary) {
      renderResults(diary);
      diaryIndicator.classList.add("visible");
      statusEl.textContent = "Analysis ready!";
    } else {
      statusEl.textContent = "Still processing. Check back in a moment.";
    }
  } catch (error) {
    console.error(error);
    showError("Something went wrong. Please retry.");
  } finally {
    analyzeBtn.disabled = false;
  }
}

analyzeBtn.addEventListener("click", analyze);

