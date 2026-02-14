window.addEventListener('load', () => {
    const densitySlider = document.getElementById('densitySlider');
    const densityValue = document.getElementById('densityValue');
    const viscositySlider = document.getElementById('viscositySlider');
    const viscosityValue = document.getElementById('viscosityValue');
    const brushSlider = document.getElementById('brushSlider');
    const brushValue = document.getElementById('brushValue');
    const fadeSlider = document.getElementById('fadeSlider');
    const fadeValue = document.getElementById('fadeValue');
    const diffusionSlider = document.getElementById('diffusionSlider');
    const diffusionValue = document.getElementById('diffusionValue');
    const colorMode = document.getElementById('colorMode');
    const clearBtn = document.getElementById('clearBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const helpBtn = document.getElementById('helpBtn');
    const closeHelp = document.getElementById('closeHelp');
    const helpOverlay = document.getElementById('helpOverlay');
    const togglePanel = document.getElementById('togglePanel');
    const panelContent = document.getElementById('panelContent');
    const particlesToggle = document.getElementById('particlesToggle');
    const velocityToggle = document.getElementById('velocityToggle');
    const performanceToggle = document.getElementById('performanceToggle');
    const bloomToggle = document.getElementById('bloomToggle');
    const trailToggle = document.getElementById('trailToggle');
    const screenshotBtn = document.getElementById('screenshotBtn');
    const resetBtn = document.getElementById('resetBtn');
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    densitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        densityValue.textContent = value.toFixed(1);
        if (fluid) {
            fluid.setDensityMultiplier(value);
        }
    });
    
    viscositySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        viscosityValue.textContent = value.toFixed(2);
        if (fluid) {
            fluid.setViscosity(value);
        }
    });
    
    brushSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        brushValue.textContent = value;
        if (fluid) {
            fluid.setBrushSize(value);
        }
    });
    
    fadeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        fadeValue.textContent = value.toFixed(3);
        if (fluid) {
            fluid.setFadeSpeed(value);
        }
    });
    
    diffusionSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        diffusionValue.textContent = value.toFixed(4);
        if (fluid) {
            fluid.setDiffusion(value);
        }
    });
    
    colorMode.addEventListener('change', (e) => {
        if (fluid) {
            fluid.setColorMode(e.target.value);
        }
    });
    
    clearBtn.addEventListener('click', () => {
        if (fluid) {
            fluid.clear();
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        pauseBtn.style.background = isPaused 
            ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(255, 100, 0, 0.3))'
            : 'linear-gradient(135deg, rgba(131, 56, 236, 0.3), rgba(58, 134, 255, 0.3))';
    });
    
    helpBtn.addEventListener('click', () => {
        helpOverlay.classList.add('active');
    });
    
    closeHelp.addEventListener('click', () => {
        helpOverlay.classList.remove('active');
    });
    
    helpOverlay.addEventListener('click', (e) => {
        if (e.target === helpOverlay) {
            helpOverlay.classList.remove('active');
        }
    });
    
    togglePanel.addEventListener('click', () => {
        panelContent.classList.toggle('collapsed');
        togglePanel.textContent = panelContent.classList.contains('collapsed') ? '+' : '−';
    });
    
    particlesToggle.addEventListener('change', (e) => {
        if (fluid) {
            fluid.setShowParticles(e.target.checked);
        }
    });
    
    velocityToggle.addEventListener('change', (e) => {
        if (fluid) {
            fluid.setShowVelocity(e.target.checked);
        }
    });
    
    performanceToggle.addEventListener('change', (e) => {
        if (fluid) {
            fluid.setPerformanceMode(e.target.checked);
        }
    });
    
    bloomToggle.addEventListener('change', (e) => {
        if (fluid) {
            fluid.setBloomEnabled(e.target.checked);
        }
    });
    
    trailToggle.addEventListener('change', (e) => {
        if (fluid) {
            fluid.setTrailMode(e.target.checked);
        }
    });
    
    screenshotBtn.addEventListener('click', () => {
        takeScreenshot();
    });
    
    resetBtn.addEventListener('click', () => {
        if (confirm('Reset all settings to defaults?')) {
            resetToDefaults();
        }
    });
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            if (fluid) {
                fluid.applyPreset(preset);
                updateUIFromFluid();
            }
        });
    });
    
    function updateUIFromFluid() {
        densitySlider.value = fluid.densityMultiplier;
        densityValue.textContent = fluid.densityMultiplier.toFixed(1);
        viscositySlider.value = fluid.viscosity;
        viscosityValue.textContent = fluid.viscosity.toFixed(2);
        fadeSlider.value = fluid.fadeSpeed;
        fadeValue.textContent = fluid.fadeSpeed.toFixed(3);
        diffusionSlider.value = fluid.diffusionAmount;
        diffusionValue.textContent = fluid.diffusionAmount.toFixed(4);
        colorMode.value = fluid.colorMode;
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            pauseBtn.style.background = isPaused 
                ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(255, 100, 0, 0.3))'
                : 'linear-gradient(135deg, rgba(131, 56, 236, 0.3), rgba(58, 134, 255, 0.3))';
        }
        
        if (e.code === 'KeyC' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (fluid) {
                fluid.clear();
            }
        }
        
        if (e.code === 'KeyH') {
            e.preventDefault();
            helpOverlay.classList.toggle('active');
        }
        
        if (e.code === 'KeyP') {
            e.preventDefault();
            particlesToggle.checked = !particlesToggle.checked;
            if (fluid) {
                fluid.setShowParticles(particlesToggle.checked);
            }
        }
        
        if (e.code === 'Escape') {
            helpOverlay.classList.remove('active');
        }
        
        if (e.code === 'KeyS') {
            e.preventDefault();
            takeScreenshot();
        }
        
        if (e.code === 'KeyR') {
            e.preventDefault();
            resetToDefaults();
        }
        
        if (e.code === 'Digit1') {
            if (fluid) fluid.applyPreset('smoke');
            updateUIFromFluid();
        }
        
        if (e.code === 'Digit2') {
            if (fluid) fluid.applyPreset('water');
            updateUIFromFluid();
        }
        
        if (e.code === 'Digit3') {
            if (fluid) fluid.applyPreset('lava');
            updateUIFromFluid();
        }
        
        if (e.code === 'Digit4') {
            if (fluid) fluid.applyPreset('neon');
            updateUIFromFluid();
        }
    });
});
