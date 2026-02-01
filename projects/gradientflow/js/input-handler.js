// input-handler.js
// Handles user input and interaction for GradientFlow

(function() {
  let lastX = 0, lastY = 0, lastScroll = 0;
  let motionIntensity = 0;

  function onMove(e) {
    GradientEngine.handleUserActivity();
    let x, y;
    if (e.touches && e.touches.length) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    motionIntensity = Math.abs(x - lastX) + Math.abs(y - lastY);
    lastX = x;
    lastY = y;
    // Optionally: use motionIntensity to modulate gradient
  }

  function onScroll(e) {
    GradientEngine.handleUserActivity();
    let scroll = window.scrollY;
    motionIntensity = Math.abs(scroll - lastScroll);
    lastScroll = scroll;
    // Optionally: use motionIntensity to modulate gradient
  }

  function onKey(e) {
    GradientEngine.handleUserActivity();
    // Optionally: add keyboard shortcuts
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove);
  window.addEventListener('scroll', onScroll);
  window.addEventListener('keydown', onKey);

  // Idle detection
  let idleTimer = null;
  function resetIdle() {
    GradientEngine.handleUserActivity();
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      document.body.classList.add('idle');
    }, 12000);
  }
  ['mousemove','touchmove','scroll','keydown'].forEach(evt => {
    window.addEventListener(evt, resetIdle);
  });
})();
