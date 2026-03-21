// =============================================================
// camera.js
// Responsibility: camera permission, stream management,
// and still-frame capture. No UI logic, no API calls.
// =============================================================

/**
 * Starts the rear camera and attaches stream to the video element.
 * Requests the rear-facing camera on mobile (facingMode: environment).
 * Falls back to any available camera on desktop.
 *
 * @returns {Promise<void>} resolves when camera is streaming
 * @throws {Error} with user-friendly message if permission denied
 *                 or no camera is found on the device
 */
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    });

    // Store stream in state so stopCamera() can access it
    state.videoStream = stream;

    // Attach stream to the <video> element
    const video = document.getElementById('camera-feed');
    video.srcObject = stream;
    await video.play();

  } catch (err) {
    // Provide specific, actionable error messages
    if (err.name === 'NotAllowedError') {
      throw new Error('Camera access was denied. Please go to Settings → Safari → Camera and set it to Allow.');
    } else if (err.name === 'NotFoundError') {
      throw new Error('No camera found on this device.');
    } else {
      throw new Error('Could not start the camera. Please try again.');
    }
  }
}

/**
 * Stops all camera tracks and clears the video element source.
 * Always call this when leaving the scan screen to free the
 * camera resource — especially important on iOS.
 *
 * @returns {void}
 */
function stopCamera() {
  if (state.videoStream) {
    state.videoStream.getTracks().forEach(track => track.stop());
    state.videoStream = null;
  }
  const video = document.getElementById('camera-feed');
  video.srcObject = null;
}

/**
 * Captures a still frame from the live camera stream.
 * Draws the current video frame onto the hidden <canvas>,
 * then exports it as a base64-encoded JPEG string.
 * The data URI prefix is stripped — the API needs raw base64.
 *
 * @returns {string} base64-encoded JPEG image (no data URI prefix)
 */
function captureFrame() {
  const video  = document.getElementById('camera-feed');
  const canvas = document.getElementById('capture-canvas');

  // Match canvas dimensions to actual video dimensions
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw current video frame to canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Export as JPEG base64 — 0.85 quality balances size and clarity
  // Split removes "data:image/jpeg;base64," prefix
  return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
}
