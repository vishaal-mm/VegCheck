// =============================================================
// ui.js
// Responsibility: screen switching, result rendering,
// loading states, error display, and the uncertain
// heartbeat interaction. No API calls, no camera logic.
// =============================================================

/**
 * Shows one screen and hides all others.
 * Uses the .active CSS class to control visibility/opacity.
 * Smooth fade transition is handled entirely by CSS.
 *
 * @param {string} screenId - ID of the screen element to show
 * @returns {void}
 */
function showScreen(screenId) {
  document.querySelectorAll('.screen')
    .forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

/**
 * Shows or hides the loading overlay on the scan screen.
 * Also updates state.isLoading to block double-taps on
 * the capture button while an API call is in progress.
 *
 * @param {boolean} isLoading - true to show, false to hide
 * @returns {void}
 */
function setLoading(isLoading) {
  state.isLoading = isLoading;
  const overlay = document.getElementById('loading-overlay');
  isLoading
    ? overlay.classList.remove('hidden')
    : overlay.classList.add('hidden');
}

/**
 * Updates the result screen for the given verdict.
 * Removes any previously applied state class, applies the
 * correct one, and delegates to the appropriate render function.
 *
 * @param {string} verdict - one of the VERDICT constants
 * @returns {void}
 */
function showResult(verdict) {
  // Reset all state classes from previous scan
  const resultSection = document.getElementById('result-section');
  resultSection.classList.remove(
    'result--vegetarian',
    'result--not-vegetarian',
    'result--uncertain'
  );

  // Render the correct state
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
 *
 * @returns {void}
 */
function renderVegetarian() {
  const section = document.getElementById('result-section');
  section.classList.add('result--vegetarian');

  document.getElementById('result-icon-check').classList.remove('hidden');
  document.getElementById('result-icon-cross').classList.add('hidden');
  document.getElementById('result-icon-uncertain').classList.add('hidden');

  document.getElementById('result-label').textContent = 'Vegetarian';
  document.getElementById('result-card').classList.remove('hidden');
  document.getElementById('uncertain-section').classList.add('hidden');
}

/**
 * Renders the not vegetarian result state.
 * Shows red card with cross icon.
 *
 * @returns {void}
 */
function renderNotVegetarian() {
  const section = document.getElementById('result-section');
  section.classList.add('result--not-vegetarian');

  document.getElementById('result-icon-check').classList.add('hidden');
  document.getElementById('result-icon-cross').classList.remove('hidden');
  document.getElementById('result-icon-uncertain').classList.add('hidden');

  document.getElementById('result-label').textContent = 'Not vegetarian';
  document.getElementById('result-card').classList.remove('hidden');
  document.getElementById('uncertain-section').classList.add('hidden');
}

/**
 * Renders the uncertain result state.
 * Shows the pulsing V logo. The help card is hidden until
 * the user taps the logo — then it slides up.
 *
 * @returns {void}
 */
function renderUncertain() {
  const section = document.getElementById('result-section');
  section.classList.add('result--uncertain');

  // Hide the standard result card, show uncertain section
  document.getElementById('result-card').classList.add('hidden');
  document.getElementById('uncertain-section').classList.remove('hidden');

  // Hide the help card initially — revealed on tap
  const helpCard  = document.getElementById('uncertain-help-card');
  const pulseLogo = document.getElementById('pulse-logo');
  helpCard.classList.add('hidden');

  // Resume heartbeat animation
  pulseLogo.style.animationPlayState = 'running';

  // Wire the tap to reveal the help card (once only)
  pulseLogo.addEventListener('click', () => {
    helpCard.classList.remove('hidden');
    helpCard.classList.add('slide-up');
    // Pause the heartbeat once the user has tapped
    pulseLogo.style.animationPlayState = 'paused';
  }, { once: true });
}

/**
 * Displays an error message to the user.
 * Camera errors show an alert and return to home.
 * API errors show inline on the scan screen and auto-dismiss.
 * Always resets loading state so the user is never stuck.
 *
 * @param {string} context - 'camera' or 'api'
 * @param {Error}  error   - the caught error object
 * @returns {void}
 */
function handleError(context, error) {
  console.error(`[VegCheck] Error in ${context}:`, error.message);

  // Always reset loading state first
  setLoading(false);

  if (context === 'camera') {
    // Camera errors are blocking — return user to home
    alert(error.message);
    showScreen('screen-home');

  } else if (context === 'api') {
    // API errors show inline — user can retry without losing camera
    const errorEl = document.getElementById('scan-error');
    errorEl.textContent = error.message;
    errorEl.classList.remove('hidden');

    // Auto-dismiss after 4 seconds
    setTimeout(() => errorEl.classList.add('hidden'), 4000);
  }
}
