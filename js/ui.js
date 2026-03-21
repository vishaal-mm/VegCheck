// =============================================================
// ui.js
// Responsibility: screen switching, result rendering,
// loading states, error display, and the uncertain
// heartbeat interaction. No API calls, no camera logic.
// =============================================================

/**
 * Shows one screen and hides all others.
 * @param {string} screenId - ID of the screen element to show
 * @returns {void}
 */
function showScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

/**
 * Shows or hides the loading overlay on the scan screen.
 * @param {boolean} isLoading - true to show, false to hide
 * @returns {void}
 */
function setLoading(isLoading) {
  state.isLoading = isLoading;
  const overlay = document.getElementById("loading-overlay");
  isLoading
    ? overlay.classList.remove("hidden")
    : overlay.classList.add("hidden");
}

/**
 * Updates the result screen for the given verdict.
 * @param {string} verdict - one of the VERDICT constants
 * @returns {void}
 */
function showResult(verdict) {
  const resultSection = document.getElementById("result-section");
  resultSection.classList.remove(
    "result--vegetarian",
    "result--not-vegetarian",
    "result--uncertain"
  );

  if (verdict === VERDICT.VEGETARIAN) {
    renderVegetarian();
  } else if (verdict === VERDICT.NOT_VEGETARIAN) {
    renderNotVegetarian();
  } else {
    renderUncertain();
  }
}

/**
 * Renders the vegetarian result state.
 * Shows green card with check icon.
 * @returns {void}
 */
function renderVegetarian() {
  document.getElementById("result-section").classList.add("result--vegetarian");

  // Show result card, hide uncertain section
  document.getElementById("result-card").classList.remove("hidden");
  document.getElementById("uncertain-section").classList.add("hidden");

  // Show check icon, hide cross icon
  document.getElementById("result-icon-check").classList.remove("hidden");
  document.getElementById("result-icon-cross").classList.add("hidden");

  document.getElementById("result-label").textContent = "Vegetarian";
}

/**
 * Renders the not vegetarian result state.
 * Shows red card with cross icon.
 * @returns {void}
 */
function renderNotVegetarian() {
  document
    .getElementById("result-section")
    .classList.add("result--not-vegetarian");

  // Show result card, hide uncertain section
  document.getElementById("result-card").classList.remove("hidden");
  document.getElementById("uncertain-section").classList.add("hidden");

  // Show cross icon, hide check icon
  document.getElementById("result-icon-check").classList.add("hidden");
  document.getElementById("result-icon-cross").classList.remove("hidden");

  document.getElementById("result-label").textContent = "Not vegetarian";
}

/**
 * Renders the uncertain result state.
 * Shows pulsing V logo. Help card hidden until user taps.
 * @returns {void}
 */
function renderUncertain() {
  document.getElementById("result-section").classList.add("result--uncertain");

  // Hide result card, show uncertain section
  document.getElementById("result-card").classList.add("hidden");
  document.getElementById("uncertain-section").classList.remove("hidden");

  // Hide help card initially
  const helpCard = document.getElementById("uncertain-help-card");
  const pulseLogo = document.getElementById("pulse-logo");
  helpCard.classList.add("hidden");

  // Resume heartbeat animation
  pulseLogo.style.animationPlayState = "running";

  // Reveal help card on tap (only fires once)
  pulseLogo.addEventListener(
    "click",
    () => {
      helpCard.classList.remove("hidden");
      helpCard.classList.add("slide-up");
      pulseLogo.style.animationPlayState = "paused";
    },
    { once: true }
  );
}

/**
 * Displays a user-friendly error message.
 * Camera errors: alert + return to home.
 * API errors: inline message on scan screen, auto-dismisses.
 * @param {string} context - 'camera' or 'api'
 * @param {Error}  error   - the caught error object
 * @returns {void}
 */
function handleError(context, error) {
  console.error(`[VegCheck] Error in ${context}:`, error.message);

  setLoading(false);

  if (context === "camera") {
    alert(error.message);
    showScreen("screen-home");
  } else if (context === "api") {
    const errorEl = document.getElementById("scan-error");
    errorEl.textContent = error.message;
    errorEl.classList.remove("hidden");
    setTimeout(() => errorEl.classList.add("hidden"), 4000);
  }
}
