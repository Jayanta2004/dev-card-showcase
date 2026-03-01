// presets.js
// Gradient preset system for GradientFlow

const GradientPresets = (() => {
  let presets = JSON.parse(localStorage.getItem('gradientflow-presets') || '[]');
  let current = 0;

  function savePreset(settings) {
    presets.push(settings);
    localStorage.setItem('gradientflow-presets', JSON.stringify(presets));
    current = presets.length - 1;
  }

  function getCurrent() {
    return presets[current] || null;
  }

  function next() {
    if (presets.length === 0) return null;
    current = (current + 1) % presets.length;
    return getCurrent();
  }

  function prev() {
    if (presets.length === 0) return null;
    current = (current - 1 + presets.length) % presets.length;
    return getCurrent();
  }

  function getAll() {
    return presets;
  }

  return {
    savePreset,
    getCurrent,
    next,
    prev,
    getAll
  };
})();
