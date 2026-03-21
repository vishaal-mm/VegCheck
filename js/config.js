// =============================================================
// config.js
// Responsibility: API settings and all app-wide constants.
// This is the ONLY file that needs to change when swapping
// API keys, models, or adjusting timeouts.
// =============================================================

// ⚠️  DEMO ONLY — revoke this key in Anthropic console
//     immediately after the demo at console.anthropic.com
const CONFIG = {
  API_KEY: "your_API_key",
  API_URL: "https://api.anthropic.com/v1/messages",
  MODEL: "claude-opus-4-6",
  MAX_TOKENS: 10, // We only need one word back
  TIMEOUT_MS: 15000, // 15 second timeout on API calls
};

// Verdict constants — used consistently across api.js and ui.js.
// NOT_VEGETARIAN is listed first — important for parseVerdict()
// because it contains the substring "VEGETARIAN".
const VERDICT = {
  VEGETARIAN: "VEGETARIAN",
  NOT_VEGETARIAN: "NOT_VEGETARIAN",
  UNCERTAIN: "UNCERTAIN",
};
