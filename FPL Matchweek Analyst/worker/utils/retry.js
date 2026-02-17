/**
 * Retry utility with exponential backoff and jitter
 */

/**
 * Error classification
 */
export class RetryableError extends Error {
  constructor(message, statusCode = null, retryAfter = null) {
    super(message);
    this.name = "RetryableError";
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
    this.retryable = true;
  }
}

export class PermanentError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = "PermanentError";
    this.statusCode = statusCode;
    this.retryable = false;
  }
}

/**
 * Classifies HTTP errors as retryable or permanent
 */
export function classifyHttpError(status, message = "") {
  // Retryable: 5xx server errors, 429 rate limit, 408 timeout
  if (status >= 500 || status === 429 || status === 408) {
    return new RetryableError(message, status);
  }

  // Retryable: Network errors, DNS failures
  if (message.includes("ECONNREFUSED") || message.includes("ETIMEDOUT") || message.includes("DNS")) {
    return new RetryableError(message);
  }

  // Permanent: 4xx client errors (except 429)
  if (status >= 400 && status < 500) {
    return new PermanentError(message, status);
  }

  // Default to retryable for unknown errors
  return new RetryableError(message, status);
}

/**
 * Retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitterMs: 100,
  timeoutMs: 30000, // 30 seconds
};

/**
 * Sleep with jitter
 */
function sleep(ms, jitter = 0) {
  const actualDelay = ms + Math.random() * jitter;
  return new Promise((resolve) => setTimeout(resolve, actualDelay));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt, config) {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs,
  );
  return delay;
}

/**
 * Retries a function with exponential backoff
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} config - Retry configuration
 * @returns {Promise} Result of the function
 */
export async function withRetry(fn, config = {}) {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      // Execute with timeout
      const result = await withTimeout(fn(), cfg.timeoutMs);
      return result;
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const classified = error.retryable !== undefined
        ? error
        : classifyHttpError(error.statusCode || 0, error.message);

      // Don't retry permanent errors
      if (!classified.retryable) {
        throw classified;
      }

      // Don't retry if we've exhausted attempts
      if (attempt === cfg.maxRetries) {
        throw new PermanentError(
          `Failed after ${cfg.maxRetries + 1} attempts: ${classified.message}`,
          classified.statusCode,
        );
      }

      // Calculate backoff with jitter
      const backoffDelay = calculateBackoff(attempt, cfg);
      await sleep(backoffDelay, cfg.jitterMs);

      // Log retry attempt (in production, use proper logging)
      console.warn(`Retry attempt ${attempt + 1}/${cfg.maxRetries} after ${backoffDelay}ms: ${error.message}`);
    }
  }

  throw lastError;
}

/**
 * Adds timeout to a promise
 */
export async function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new RetryableError(`Operation timed out after ${timeoutMs}ms`, 408)),
        timeoutMs,
      )
    ),
  ]);
}

/**
 * Circuit breaker state
 */
class CircuitBreaker {
  constructor(config = {}) {
    this.failureThreshold = config.failureThreshold || 5;
    this.resetTimeoutMs = config.resetTimeoutMs || 60000; // 1 minute
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new PermanentError("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
    }
  }
}

// Global circuit breakers for external services
const circuitBreakers = {
  fpl: new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 60000 }),
  ai: new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 30000 }),
};

/**
 * Wraps a function with circuit breaker
 */
export async function withCircuitBreaker(fn, service = "default") {
  const breaker = circuitBreakers[service] || circuitBreakers.fpl;
  return breaker.execute(fn);
}
