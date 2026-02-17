const apiBase = import.meta?.env?.VITE_API_BASE ?? window.API_BASE ?? "";
const POLL_INTERVAL_MS = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 30; // 1 minute total
const BACKOFF_MULTIPLIER = 1.2;

const managerInput = document.getElementById("managerId");
const gameweekInput = document.getElementById("gameweek");
const notesInput = document.getElementById("notes");
const analyzeBtn = document.getElementById("analyzeBtn");
const statusEl = document.getElementById("status");
const diaryIndicator = document.getElementById("diaryIndicator");
const gameweekReviewEl = document.getElementById("gameweekReview");
const takeawaysEl = document.getElementById("takeaways");
const transfersEl = document.getElementById("transfers");

function setLoading(isLoading, message = "", showSpinner = true) {
  analyzeBtn.disabled = isLoading;
  statusEl.textContent = showSpinner && isLoading ? `⏳ ${message}` : message;
  statusEl.classList.toggle("error", false);
  statusEl.classList.toggle("loading", isLoading);
}

function showError(message, canRetry = false) {
  statusEl.textContent = `❌ ${message}`;
  statusEl.classList.add("error");
  statusEl.classList.remove("loading");
  analyzeBtn.disabled = false;
  analyzeBtn.textContent = canRetry ? "Retry Analysis" : "Analyze Gameweek";
}

function showSuccess(message) {
  statusEl.textContent = `✅ ${message}`;
  statusEl.classList.remove("error", "loading");
  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze Gameweek";
}

/**
 * Render gameweek review block
 */
function renderGameweekReview(review) {
  if (!review) {
    gameweekReviewEl.innerHTML = "<p>No review data available.</p>";
    return;
  }

  const html = `
    <div class="review-section">
      ${review.captain_verdict ? `
        <div class="captain-verdict">
          <h3>⚡ Captain Verdict</h3>
          <p>${escapeHtml(review.captain_verdict)}</p>
        </div>
      ` : ''}

      ${review.top_performers?.length ? `
        <div class="performers top">
          <h3>🌟 Top Performers</h3>
          <ul>
            ${review.top_performers.map(p => `
              <li>
                <strong>${escapeHtml(p.player_name)}</strong> (${p.points} pts)
                <p>${escapeHtml(p.rationale)}</p>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${review.honorable_mentions?.length ? `
        <div class="performers honorable">
          <h3>👏 Honorable Mentions</h3>
          <ul>
            ${review.honorable_mentions.map(p => `
              <li>
                <strong>${escapeHtml(p.player_name)}</strong> (${p.points} pts)
                ${p.note ? `<p>${escapeHtml(p.note)}</p>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${review.underperformers?.length ? `
        <div class="performers under">
          <h3>📉 Underperformers</h3>
          <ul>
            ${review.underperformers.map(p => `
              <li>
                <strong>${escapeHtml(p.player_name)}</strong> (${p.points} pts)
                <p>${escapeHtml(p.issue)}</p>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  gameweekReviewEl.innerHTML = html;
}

/**
 * Render tactical takeaways block
 */
function renderTakeaways(takeaways) {
  if (!takeaways || !takeaways.length) {
    takeawaysEl.innerHTML = "<p>No tactical insights available.</p>";
    return;
  }

  const html = `
    <div class="takeaways-list">
      ${takeaways.map(t => `
        <div class="takeaway-item ${t.actionable ? 'actionable' : ''}">
          <h4>${t.actionable ? '🎯' : '💡'} ${escapeHtml(t.category)}</h4>
          <p>${escapeHtml(t.insight)}</p>
        </div>
      `).join('')}
    </div>
  `;

  takeawaysEl.innerHTML = html;
}

/**
 * Render transfer recommendations block
 */
function renderTransfers(recommendations) {
  if (!recommendations) {
    transfersEl.innerHTML = "<p>No transfer recommendations available.</p>";
    return;
  }

  const { transfers_in = [], transfers_out = [], holds = [] } = recommendations;

  const html = `
    <div class="transfers-container">
      ${transfers_in.length ? `
        <div class="transfer-section in">
          <h3>⬆️ Transfers In</h3>
          <ul>
            ${transfers_in.map(p => `
              <li class="priority-${p.priority || 'medium'}">
                <div class="player-info">
                  <strong>${escapeHtml(p.player_name)}</strong>
                  <span class="position">${escapeHtml(p.position)}</span>
                  <span class="price">£${p.price}m</span>
                  ${p.priority ? `<span class="badge priority">${escapeHtml(p.priority)}</span>` : ''}
                </div>
                <p>${escapeHtml(p.rationale)}</p>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${transfers_out.length ? `
        <div class="transfer-section out">
          <h3>⬇️ Transfers Out</h3>
          <ul>
            ${transfers_out.map(p => `
              <li class="urgency-${p.urgency || 'consider'}">
                <div class="player-info">
                  <strong>${escapeHtml(p.player_name)}</strong>
                  <span class="position">${escapeHtml(p.position)}</span>
                  ${p.urgency ? `<span class="badge urgency">${escapeHtml(p.urgency)}</span>` : ''}
                </div>
                <p>${escapeHtml(p.reason)}</p>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${holds.length ? `
        <div class="transfer-section hold">
          <h3>🔒 Keep (Hold)</h3>
          <ul>
            ${holds.map(p => `
              <li>
                <div class="player-info">
                  <strong>${escapeHtml(p.player_name)}</strong>
                  <span class="position">${escapeHtml(p.position)}</span>
                </div>
                <p>${escapeHtml(p.justification)}</p>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  transfersEl.innerHTML = html;
}

/**
 * Render all results
 */
function renderResults(payload) {
  if (!payload) {
    clearResults();
    return;
  }

  const { gameweek_review, tactical_form_takeaways, transfer_recommendations } = payload;

  renderGameweekReview(gameweek_review);
  renderTakeaways(tactical_form_takeaways);
  renderTransfers(transfer_recommendations);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Poll execution status with exponential backoff
 */
async function pollExecution(executionId, attempt = 0) {
  if (!executionId) throw new Error("Missing execution ID");

  try {
    const res = await fetch(`${apiBase}/execution/${executionId}`);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Execution not found");
      }
      throw new Error(`Status check failed: ${res.status}`);
    }

    const data = await res.json();

    // Check execution status
    if (data.status === "completed" && data.analysis?.status === "completed") {
      // Fetch full analysis
      const analysisRes = await fetch(`${apiBase}/gameweek/${data.analysis.id}`);
      if (analysisRes.ok) {
        return await analysisRes.json();
      }
    }

    if (data.status === "failed" || data.analysis?.status === "failed") {
      throw new Error(data.analysis?.errorMessage || "Analysis failed");
    }

    // Still running - update status and retry
    const statusMessages = {
      pending: "Queued...",
      running: data.analysis?.status === "running" ? "Analyzing..." : "Starting...",
    };

    setLoading(true, statusMessages[data.status] || "Processing...");

    if (attempt >= MAX_POLL_ATTEMPTS) {
      throw new Error("Analysis timed out. Please try again.");
    }

    // Exponential backoff
    const delay = Math.min(
      POLL_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, Math.floor(attempt / 5)),
      10000
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return pollExecution(executionId, attempt + 1);
  } catch (error) {
    if (attempt < 3 && error.message.includes("Status check failed")) {
      // Retry transient errors
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      return pollExecution(executionId, attempt + 1);
    }
    throw error;
  }
}

async function analyze() {
  const managerId = managerInput.value.trim();
  const gameweek = Number(gameweekInput.value);
  const notes = notesInput.value.trim();

  if (!managerId || Number.isNaN(gameweek)) {
    showError("Manager ID and Gameweek are required.", false);
    return;
  }

  if (gameweek < 1 || gameweek > 38) {
    showError("Gameweek must be between 1 and 38.", false);
    return;
  }

  setLoading(true, "Submitting request...");
  diaryIndicator.classList.remove("visible");
  clearResults();

  try {
    // Start workflow
    const res = await fetch(`${apiBase}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerId, gameweek, notes }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${res.status}`);
    }

    const { executionId } = await res.json();

    if (!executionId) {
      throw new Error("No execution ID returned");
    }

    setLoading(true, "Analysis started...");

    // Poll for completion
    const analysis = await pollExecution(executionId);

    // Render results
    if (analysis && analysis.result) {
      renderResults(analysis.result);
      diaryIndicator.classList.add("visible");
      showSuccess("Analysis complete!");
    } else {
      throw new Error("No analysis data received");
    }
  } catch (error) {
    console.error("Analysis error:", error);

    // Classify error for better UX
    const isRetryable = !error.message.includes("required") &&
      !error.message.includes("must be between") &&
      !error.message.includes("not found");

    showError(error.message || "Analysis failed", isRetryable);
  }
}

function clearResults() {
  gameweekReviewEl.textContent = "Waiting for analysis...";
  takeawaysEl.textContent = "Waiting for analysis...";
  transfersEl.textContent = "Waiting for analysis...";
}

analyzeBtn.addEventListener("click", analyze);

