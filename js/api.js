// =============================================================
// api.js
// Responsibility: Anthropic Claude Vision API call,
// prompt construction, and verdict parsing.
// No camera logic, no UI updates.
// =============================================================

/**
 * Builds the vegetarian detection prompt.
 * Includes a list of commonly misidentified Indian vegetarian
 * dishes to improve accuracy for the target use case.
 * Isolated in its own function so the prompt can be iterated
 * on independently of the API call logic.
 *
 * @returns {string} the prompt text to send to Claude
 */
function buildPrompt() {
  return `You are a vegetarian food detector.
Carefully analyse this food image and determine if the dish is vegetarian.

Reply with ONLY one of these three words — nothing else:
- VEGETARIAN: no meat, poultry, or seafood visible or likely present
- NOT_VEGETARIAN: meat, poultry, or seafood is visible or clearly likely
- UNCERTAIN: you cannot determine from this image alone

IMPORTANT — the following dishes are always vegetarian even if they
sound like they may contain meat. Do not mark these as NOT_VEGETARIAN:
veg kofta, dal makhani, paneer tikka, chana masala, aloo gobi,
palak paneer, veg biryani, veg manchurian, rajma, chole, soya chaap,
veg kebab, mushroom masala, paneer butter masala, matar paneer.

Your single-word reply:`;
}

/**
 * Sends a food image to the Anthropic Claude Vision API
 * and returns the raw text response.
 *
 * Uses AbortController to enforce the TIMEOUT_MS limit.
 * Requires the anthropic-dangerous-direct-browser-access header
 * to allow direct browser-to-API calls (no backend needed).
 *
 * @param {string} base64 - JPEG image encoded as base64 string
 * @returns {Promise<string>} raw text response from Claude
 * @throws {Error} on network failure, API error, or timeout
 */
async function analyseImage(base64) {
  // AbortController enforces the timeout
  const controller = new AbortController();
  const timeoutId  = setTimeout(
    () => controller.abort(),
    CONFIG.TIMEOUT_MS
  );

  try {
    const response = await fetch(CONFIG.API_URL, {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         CONFIG.API_KEY,
        'anthropic-version': '2023-06-01',
        // Required for direct browser access — no backend needed
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      CONFIG.MODEL,
        max_tokens: CONFIG.MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: [
              // The text prompt
              {
                type: 'text',
                text: buildPrompt(),
              },
              // The food image as base64
              {
                type:   'image',
                source: {
                  type:       'base64',
                  media_type: 'image/jpeg',
                  data:       base64,
                },
              },
            ],
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the text reply from the response structure
    return data.content[0].text.trim();

  } catch (err) {
    clearTimeout(timeoutId);

    // AbortError means our timeout fired — give a friendly message
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection and try again.');
    }

    throw err;
  }
}

/**
 * Parses raw API text into a clean VERDICT constant.
 *
 * Checks for NOT_VEGETARIAN before VEGETARIAN — important because
 * NOT_VEGETARIAN contains the substring "VEGETARIAN" and would
 * match incorrectly if checked in the wrong order.
 *
 * Defaults to UNCERTAIN if the model returns something unexpected,
 * so one bad response never crashes the app.
 *
 * @param {string} rawText - raw text response from the API
 * @returns {string} one of the VERDICT constants
 */
function parseVerdict(rawText) {
  const upper = rawText.toUpperCase();

  // Check NOT_VEGETARIAN first — it contains "VEGETARIAN" as substring
  if (upper.includes(VERDICT.NOT_VEGETARIAN)) return VERDICT.NOT_VEGETARIAN;
  if (upper.includes(VERDICT.VEGETARIAN))     return VERDICT.VEGETARIAN;
  if (upper.includes(VERDICT.UNCERTAIN))      return VERDICT.UNCERTAIN;

  // Safe fallback — unexpected response defaults to UNCERTAIN
  console.warn('[VegCheck] Unexpected API response:', rawText);
  return VERDICT.UNCERTAIN;
}
