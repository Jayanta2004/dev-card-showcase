// gradient-engine.js
// Core animation and gradient logic for GradientFlow

const GradientEngine = (() => {
  const bg = document.getElementById('gradient-bg');
  let running = true;
  let lastTime = 0;
  let idle = false;
  let idleTimeout = null;
  let colorCount = 5;
  let freq = 0.18 + Math.random() * 0.07;
  let gradientColors = [];
  let gradientAngle = 0;
  let theme = 'dark';
  let speed = 1;
  let lockedColors = [];

  function setTheme(newTheme) {
    theme = newTheme;
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add('theme-' + theme);
  }

  function randomize() {
    freq = 0.15 + Math.random() * 0.12;
    colorCount = 4 + Math.floor(Math.random() * 3);
    lockedColors = Array(colorCount).fill(false);
  }

  function setIdle(state) {
    idle = state;
    document.body.classList.toggle('idle', idle);
  }

  function setPaused(paused) {
    running = !paused;
    document.body.classList.toggle('paused', paused);
  }

  function updateGradient(t) {
    let tAdj = t * speed;
    let baseColors = ColorMath.generateGradientColors(tAdj, colorCount, freq);
    // Apply color locks
    gradientColors = baseColors.map((c, i) => lockedColors[i] && gradientColors[i] ? gradientColors[i] : c);
    // Audio reactivity
    if (window.AudioReact && AudioReact.isEnabled()) {
      let level = AudioReact.update();
      gradientAngle = ((tAdj * 8) + level * 120) % 360;
    } else {
      gradientAngle = (tAdj * 8) % 360;
    }
    // Compose CSS gradient string
    const stops = gradientColors.map((c, i) => {
      const pos = Math.round((i / (gradientColors.length - 1)) * 100);
      return `${ColorMath.rgbToCss(c)} ${pos}%`;
    }).join(', ');
    const css = `linear-gradient(${gradientAngle}deg, ${stops})`;
    bg.style.background = css;
  }

  function animate(now) {
    if (!running) return;
    const t = now * 0.0005;
    updateGradient(t);
    lastTime = now;
    requestAnimationFrame(animate);
  }
  // Preset system
  function getCurrentSettings() {
    return {
      colorCount,
      freq,
      speed,
      lockedColors: [...lockedColors],
      theme
    };
  }
  function applyPreset(preset) {
    if (!preset) return;
    colorCount = preset.colorCount || 5;
    freq = preset.freq || 0.18;
    speed = preset.speed || 1;
    lockedColors = preset.lockedColors ? [...preset.lockedColors] : Array(colorCount).fill(false);
    setTheme(preset.theme || 'dark');
  }
  function getCurrentColors() {
    return gradientColors;
  }
  function setColorLock(idx, locked) {
    lockedColors[idx] = locked;
  }
  function setSpeed(val) {
    speed = val;
  }

  function start() {
    running = true;
    setPaused(false);
    requestAnimationFrame(animate);
  }

  function pause() {
    setPaused(true);
  }

  function resume() {
    if (!running) {
      setPaused(false);
      requestAnimationFrame(animate);
    }
  }

  function handleUserActivity() {
    setIdle(false);
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => setIdle(true), 12000);
  }

  // Expose API
  return {
    start,
    pause,
    resume,
    setTheme,
    randomize,
    handleUserActivity,
    setPaused,
    getCurrentSettings,
    applyPreset,
    getCurrentColors,
    setColorLock,
    setSpeed
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  GradientEngine.start();
});
