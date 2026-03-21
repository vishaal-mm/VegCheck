// =============================================================
// app.js
// Responsibility: main orchestrator — initialises app state,
// wires all event listeners, and calls module functions
// in the correct sequence. No direct DOM manipulation here —
// that belongs in ui.js. No API or camera logic here either.
// =============================================================

// ─── APP STATE ────────────────────────────────────────────────
// Single state object — no scattered global variables.
// Every module that needs state reads/writes here.
const state = {
  videoStream: null,    // Active MediaStream from camera
  isLoading:   false,   // Prevents double-taps on capture button
};

// ─── STARTUP ──────────────────────────────────────────────────
// Validate API key is set before anything else.
// Warn in console if key is still the placeholder.
(function validateConfig() {
  if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_ANTHROPIC_API_KEY_HERE') {
    console.error('[VegCheck] ⚠️  API key not set. Open js/config.js and add your Anthropic key.');
  } else {
    console.log('[VegCheck] ✓ Config loaded. Model:', CONFIG.MODEL);
  }
})();

// ─── EVENT LISTENERS ──────────────────────────────────────────
// All wired at the bottom after all module files have loaded.
// Each listener is clearly labelled by its button.

// HOME → SCAN
// Starts camera then navigates to scan screen.
// If camera fails, handleError shows alert and stays on home.
document.getElementById('btn-scan')
  .addEventListener('click', async () => {
    try {
      await startCamera();
      showScreen('screen-scan');
    } catch (err) {
      handleError('camera', err);
    }
  });

// SCAN → HOME (back button)
// Stops camera before navigating — always free the camera resource.
document.getElementById('btn-back')
  .addEventListener('click', () => {
    stopCamera();
    showScreen('screen-home');
  });

// CAPTURE → API → RESULT
// Core flow: capture frame → call Claude → parse verdict → show result.
// state.isLoading guard prevents double-taps during the API call.
document.getElementById('btn-capture')
  .addEventListener('click', async () => {

    // Guard: ignore tap if already processing
    if (state.isLoading) return;

    // Clear any previous inline error
    document.getElementById('scan-error').classList.add('hidden');

    try {
      setLoading(true);

      // 1. Capture still frame from live video
      const base64 = captureFrame();

      // 2. Send to Claude Vision API
      const rawText = await analyseImage(base64);

      // 3. Parse raw response into a clean verdict constant
      const verdict = parseVerdict(rawText);

      // 4. Update result screen UI
      showResult(verdict);

      // 5. Free camera before navigating away
      stopCamera();
      setLoading(false);

      // 6. Show result screen
      showScreen('screen-result');

    } catch (err) {
      handleError('api', err);
    }
  });

// RESULT → SCAN (scan again)
// Restarts camera and returns to scan screen.
document.getElementById('btn-scan-again')
  .addEventListener('click', async () => {
    try {
      await startCamera();
      showScreen('screen-scan');
    } catch (err) {
      handleError('camera', err);
    }
  });
