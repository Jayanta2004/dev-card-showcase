// ui-controls.js
// Handles UI controls for GradientFlow

(function() {
  const pauseBtn = document.getElementById('pause-btn');
  const randomizeBtn = document.getElementById('randomize-btn');
  const themeBtn = document.getElementById('theme-btn');
  const exportBtn = document.getElementById('export-btn');
  const audioBtn = document.getElementById('audio-btn');
  const presetPrevBtn = document.getElementById('preset-prev-btn');
  const presetNextBtn = document.getElementById('preset-next-btn');
  const savePresetBtn = document.getElementById('save-preset-btn');
  const speedSlider = document.getElementById('speed-slider');
  const colorLocks = document.getElementById('color-locks');
  // Advanced feature buttons
  const layersBtn = document.getElementById('layers-btn');
  const maskBtn = document.getElementById('mask-btn');
  const editorBtn = document.getElementById('editor-btn');
  const timelineBtn = document.getElementById('timeline-btn');
  const particlesBtn = document.getElementById('particles-btn');
  const galleryBtn = document.getElementById('gallery-btn');
  const voiceBtn = document.getElementById('voice-btn');
  const easterEggBtn = document.getElementById('easter-egg-btn');
  // Advanced panels
  const advancedPanels = document.getElementById('advanced-panels');
  const panelLayers = document.getElementById('panel-layers');
  const panelMask = document.getElementById('panel-mask');
  const panelEditor = document.getElementById('panel-editor');
  const panelTimeline = document.getElementById('panel-timeline');
  const panelGallery = document.getElementById('panel-gallery');
  const panelVoice = document.getElementById('panel-voice');
  const panelExport = document.getElementById('panel-export');
  const panelEasterEgg = document.getElementById('panel-easter-egg');
  const panelToggle = advancedPanels ? advancedPanels.querySelector('.panel-toggle') : null;
    // Advanced feature button handlers
    if (layersBtn) layersBtn.addEventListener('click', () => {
      if (advancedPanels) {
        advancedPanels.classList.remove('collapsed');
        showPanel(panelLayers);
      }
    });
    if (maskBtn) maskBtn.addEventListener('click', () => {
      if (advancedPanels) {
        advancedPanels.classList.remove('collapsed');
        showPanel(panelMask);
      }
    });
    if (editorBtn) editorBtn.addEventListener('click', () => {
      if (advancedPanels) {
        advancedPanels.classList.remove('collapsed');
        showPanel(panelEditor);
      }
    });
    if (timelineBtn) timelineBtn.addEventListener('click', () => {
      if (advancedPanels) {
        advancedPanels.classList.remove('collapsed');
        showPanel(panelTimeline);
      }
    });
    if (particlesBtn) particlesBtn.addEventListener('click', () => {
      const canvas = document.getElementById('particle-canvas');
      if (canvas && window.ParticleSystem) {
        if (!canvas._particleSystem) {
          canvas._particleSystem = new ParticleSystem(canvas);
          canvas._particleSystem.start();
        } else if (canvas._particleSystem.running) {
          canvas._particleSystem.stop();
        } else {
          canvas._particleSystem.start();
        }
      }
    });
    if (galleryBtn) galleryBtn.addEventListener('click', () => {
      if (advancedPanels) {
        advancedPanels.classList.remove('collapsed');
        showPanel(panelGallery);
      }
    });
    if (voiceBtn) voiceBtn.addEventListener('click', () => {
      if (window.VoiceController) {
        if (!window._voiceController) {
          window._voiceController = new VoiceController(cmd => {
            // Handle voice commands (e.g., 'pause', 'randomize', etc.)
          });
        }
        if (window._voiceController.active) {
          window._voiceController.stop();
        } else {
          window._voiceController.start();
        }
      }
      if (advancedPanels) {
        advancedPanels.classList.remove('collapsed');
        showPanel(panelVoice);
      }
    });
    if (easterEggBtn) easterEggBtn.addEventListener('click', () => {
      if (advancedPanels) {
        advancedPanels.classList.remove('collapsed');
        showPanel(panelEasterEgg);
      }
    });
    if (panelToggle) panelToggle.addEventListener('click', () => {
      advancedPanels.classList.toggle('collapsed');
    });

    function showPanel(panel) {
      [panelLayers, panelMask, panelEditor, panelTimeline, panelGallery, panelVoice, panelExport, panelEasterEgg].forEach(p => {
        if (p) p.style.display = 'none';
      });
      if (panel) panel.style.display = 'block';
    }
  let paused = false;
  let theme = 'dark';
  let lockedColors = [];

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
      GradientEngine.pause();
      pauseBtn.textContent = '▶️';
    } else {
      GradientEngine.resume();
      pauseBtn.textContent = '⏸';
    }
  });

  randomizeBtn.addEventListener('click', () => {
    GradientEngine.randomize();
    updateColorLocks();
  });

  themeBtn.addEventListener('click', () => {
    theme = (theme === 'dark') ? 'light' : 'dark';
    GradientEngine.setTheme(theme);
    themeBtn.textContent = (theme === 'dark') ? '🌗' : '🌞';
  });

  exportBtn.addEventListener('click', () => {
    // Export gradient as image (screenshot)
    html2canvas(document.getElementById('gradient-bg')).then(canvas => {
      const link = document.createElement('a');
      link.download = 'gradientflow.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  });

  audioBtn.addEventListener('click', () => {
    AudioReact.toggle();
    audioBtn.classList.toggle('active', AudioReact.isEnabled());
  });

  presetPrevBtn.addEventListener('click', () => {
    const preset = GradientPresets.prev();
    if (preset) GradientEngine.applyPreset(preset);
    updateColorLocks();
  });
  presetNextBtn.addEventListener('click', () => {
    const preset = GradientPresets.next();
    if (preset) GradientEngine.applyPreset(preset);
    updateColorLocks();
  });
  savePresetBtn.addEventListener('click', () => {
    const settings = GradientEngine.getCurrentSettings();
    GradientPresets.savePreset(settings);
  });

  speedSlider.addEventListener('input', () => {
    GradientEngine.setSpeed(parseFloat(speedSlider.value));
  });

  function updateColorLocks() {
    // Render color lock buttons for each color
    colorLocks.innerHTML = '';
    const colors = GradientEngine.getCurrentColors();
    lockedColors = lockedColors.slice(0, colors.length);
    for (let i = 0; i < colors.length; i++) {
      const btn = document.createElement('button');
      btn.className = 'color-lock-btn';
      btn.style.background = ColorMath.rgbToCss(colors[i]);
      btn.title = lockedColors[i] ? 'Unlock Color' : 'Lock Color';
      btn.textContent = lockedColors[i] ? '🔒' : '🔓';
      btn.onclick = () => {
        lockedColors[i] = !lockedColors[i];
        GradientEngine.setColorLock(i, lockedColors[i]);
        updateColorLocks();
      };
      colorLocks.appendChild(btn);
    }
  }

  // Keyboard shortcuts
  window.addEventListener('keydown', e => {
    if (e.key === ' ') pauseBtn.click();
    if (e.key === 'r') randomizeBtn.click();
    if (e.key === 't') themeBtn.click();
    if (e.key === 'e') exportBtn.click();
    if (e.key === 'a') audioBtn.click();
    if (e.key === 'ArrowLeft') presetPrevBtn.click();
    if (e.key === 'ArrowRight') presetNextBtn.click();
    if (e.key === 's') savePresetBtn.click();
  });

  // Set initial theme
  GradientEngine.setTheme(theme);
  // Initial color locks
  setTimeout(updateColorLocks, 500);
})();
