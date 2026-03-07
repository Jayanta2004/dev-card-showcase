// Content script for Focus Bubble Overlay
// Listens for messages to start/stop overlay and manages overlay DOM

let overlay = null;
let animationType = 'bubbles';
let opacity = 0.7;
let focusTimeout = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_FOCUS') {
    showOverlay(message.settings);
  } else if (message.type === 'STOP_FOCUS') {
    removeOverlay();
  }
});

function showOverlay(settings) {
  if (overlay) removeOverlay();
  animationType = settings.animation;
  opacity = settings.opacity;
  overlay = document.createElement('div');
  overlay.id = 'focus-bubble-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = '999999';
  overlay.style.background = 'rgba(0,0,0,' + opacity + ')';
  overlay.style.pointerEvents = 'auto';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.innerHTML = `<canvas id="focus-bubble-canvas" width="1920" height="1080"></canvas>`;
  document.body.appendChild(overlay);
  startAnimation(animationType);
  if (settings.duration) {
    focusTimeout = setTimeout(removeOverlay, settings.duration * 60 * 1000);
  }
}

function removeOverlay() {
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  if (focusTimeout) {
    clearTimeout(focusTimeout);
    focusTimeout = null;
  }
}

function startAnimation(type) {
  const canvas = document.getElementById('focus-bubble-canvas');
  if (!canvas) return;
  if (type === 'bubbles') {
    startBubblesAnimation(canvas);
  } else if (type === 'gradient') {
    startGradientAnimation(canvas);
  } else if (type === 'waves') {
    startWavesAnimation(canvas);
  }
}

// ... Animations will be implemented below ...
