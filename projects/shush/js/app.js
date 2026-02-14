/**
 * SHUSH - Main Application
 * Coordinates all modules and handles app initialization
 * 
 * Features:
 * - Application initialization
 * - Module coordination
 * - Event handling
 * - Settings management
 * - Permission flow management
 */

// Application state
const app = {
    audio: null,
    ui: null,
    settings: {
        sensitivity: 50,
        fadeSpeed: 500,
        effect: 'fade',
        showVisualizer: true
    },
    initialized: false
};

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('🎧 Initializing Shush...');
    
    // Initialize UI manager
    app.ui = new UIManager();
    const uiInitialized = app.ui.initialize();
    
    if (!uiInitialized) {
        console.error('Failed to initialize UI manager');
        showErrorModal('Failed to initialize the application. Please refresh the page.');
        return;
    }
    
    // Initialize audio processor
    app.audio = new AudioProcessor();
    
    // Load saved settings
    loadSettings();
    
    // Setup UI event listeners
    setupEventListeners();
    
    // Enable scroll progress
    app.ui.enableScrollProgress();
    
    // Show permission modal
    showPermissionModal();
    
    app.initialized = true;
    console.log('✅ Shush initialized successfully');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Permission modal buttons
    const grantPermissionBtn = getElement('grant-permission');
    const denyPermissionBtn = getElement('deny-permission');
    const retryPermissionBtn = getElement('retry-permission');
    const closeErrorBtn = getElement('close-error');
    
    if (grantPermissionBtn) {
        grantPermissionBtn.addEventListener('click', handlePermissionGrant);
    }
    
    if (denyPermissionBtn) {
        denyPermissionBtn.addEventListener('click', handlePermissionDeny);
    }
    
    if (retryPermissionBtn) {
        retryPermissionBtn.addEventListener('click', handlePermissionRetry);
    }
    
    if (closeErrorBtn) {
        closeErrorBtn.addEventListener('click', hideErrorModal);
    }
    
    // Sensitivity slider
    const sensitivitySlider = getElement('sensitivity-slider');
    const sensitivityValue = getElement('sensitivity-value');
    
    if (sensitivitySlider) {
        sensitivitySlider.addEventListener('input', debounce((e) => {
            const value = validateSensitivity(e.target.value);
            app.settings.sensitivity = value;
            
            if (sensitivityValue) {
                sensitivityValue.textContent = value;
            }
            
            if (app.audio) {
                app.audio.setSensitivity(value);
            }
            
            saveSettings();
        }, 100));
    }
    
    // Fade speed slider
    const fadeSpeedSlider = getElement('fade-speed-slider');
    const fadeSpeedValue = getElement('fade-speed-value');
    
    if (fadeSpeedSlider) {
        fadeSpeedSlider.addEventListener('input', debounce((e) => {
            const value = validateTransitionSpeed(e.target.value);
            app.settings.fadeSpeed = value;
            
            if (fadeSpeedValue) {
                fadeSpeedValue.textContent = `${value}ms`;
            }
            
            if (app.ui) {
                app.ui.setTransitionSpeed(value);
            }
            
            saveSettings();
        }, 100));
    }
    
    // Effect type radio buttons
    const effectRadios = document.querySelectorAll('input[name="effect"]');
    effectRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                app.settings.effect = e.target.value;
                
                if (app.ui) {
                    app.ui.setEffect(e.target.value);
                }
                
                saveSettings();
            }
        });
    });
    
    // Audio toggle button
    const audioToggleBtn = getElement('toggle-audio');
    const audioToggleText = getElement('audio-toggle-text');
    
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            if (!app.audio || !app.audio.isActive) {
                app.ui.showNotification('Microphone not active', 'warning');
                return;
            }
            
            if (app.audio.isMonitoring) {
                app.audio.pause();
                if (audioToggleText) {
                    audioToggleText.textContent = 'Resume Monitoring';
                }
                app.ui.updateStatus('warning', 'Monitoring Paused');
            } else {
                app.audio.resume();
                if (audioToggleText) {
                    audioToggleText.textContent = 'Pause Monitoring';
                }
                app.ui.updateStatus('active', 'Listening...');
            }
        });
    }
    
    // Visualizer toggle
    const showVisualizerCheckbox = getElement('show-visualizer');
    
    if (showVisualizerCheckbox) {
        showVisualizerCheckbox.addEventListener('change', (e) => {
            app.settings.showVisualizer = e.target.checked;
            
            if (app.ui) {
                app.ui.setVisualizerVisibility(e.target.checked);
            }
            
            saveSettings();
        });
    }
    
    // Control panel toggle
    const toggleControlsBtn = getElement('toggle-controls');
    const controlPanel = getElement('control-panel');
    
    if (toggleControlsBtn && controlPanel) {
        toggleControlsBtn.addEventListener('click', () => {
            const isCollapsed = hasClass(controlPanel, 'collapsed');
            app.ui.setControlPanelCollapsed(!isCollapsed);
        });
    }
    
    // Handle window beforeunload
    window.addEventListener('beforeunload', () => {
        if (app.audio) {
            app.audio.destroy();
        }
    });
}

/**
 * Handle permission grant
 */
async function handlePermissionGrant() {
    hidePermissionModal();
    
    app.ui.updateStatus('warning', 'Requesting microphone access...');
    
    // Initialize audio
    const audioInitialized = await app.audio.initialize();
    
    if (!audioInitialized) {
        showErrorModal('Failed to initialize audio system. Please check your browser compatibility.');
        return;
    }
    
    // Request microphone access
    const accessGranted = await app.audio.requestMicrophoneAccess();
    
    if (!accessGranted) {
        showErrorModal('Microphone access denied. Please check your browser permissions and try again.');
        return;
    }
    
    // Setup audio callbacks
    setupAudioCallbacks();
    
    // Start monitoring
    app.audio.startMonitoring();
    
    app.ui.updateStatus('active', 'Listening...');
    app.ui.showNotification('Microphone active. Enjoy your reading!', 'success');
}

/**
 * Handle permission deny
 */
function handlePermissionDeny() {
    hidePermissionModal();
    app.ui.updateStatus('warning', 'Microphone Disabled');
    app.ui.showNotification('Shush will work without noise detection', 'info');
}

/**
 * Handle permission retry
 */
async function handlePermissionRetry() {
    hideErrorModal();
    await handlePermissionGrant();
}

/**
 * Setup audio processor callbacks
 */
function setupAudioCallbacks() {
    if (!app.audio) return;
    
    // Noise level change callback
    app.audio.onNoiseLevelChange = (level, frequencyData) => {
        if (!app.ui) return;
        
        const threshold = app.audio.getThreshold();
        const timeDomainData = app.audio.getTimeDomainData();
        
        // Update all visualizations
        app.ui.updateVisualizations(level, threshold, frequencyData, timeDomainData);
    };
    
    // Noise detected callback
    app.audio.onNoiseDetected = (level) => {
        if (!app.ui) return;
        
        console.log('🔊 Noise detected:', level);
        app.ui.setContentVisibility(false);
        app.ui.updateStatus('warning', 'Too Noisy!');
    };
    
    // Silence restored callback
    app.audio.onSilenceRestored = () => {
        if (!app.ui) return;
        
        console.log('🤫 Silence restored');
        app.ui.setContentVisibility(true);
        app.ui.updateStatus('active', 'Listening...');
    };
    
    // Error callback
    app.audio.onError = (type, message) => {
        console.error(`Audio error (${type}):`, message);
        app.ui.showNotification(`Audio error: ${message}`, 'error');
    };
}

/**
 * Show permission modal
 */
function showPermissionModal() {
    const modal = getElement('permission-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Hide permission modal
 */
function hidePermissionModal() {
    const modal = getElement('permission-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Show error modal
 */
function showErrorModal(message) {
    const modal = getElement('error-modal');
    const errorMessage = getElement('error-message');
    
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    if (errorMessage && message) {
        errorMessage.textContent = message;
    }
}

/**
 * Hide error modal
 */
function hideErrorModal() {
    const modal = getElement('error-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
    const savedSettings = storage.get('shush-settings');
    
    if (savedSettings) {
        app.settings = { ...app.settings, ...savedSettings };
    }
    
    // Apply loaded settings to UI
    applySettings();
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    storage.set('shush-settings', app.settings);
}

/**
 * Apply settings to UI elements
 */
function applySettings() {
    // Sensitivity
    const sensitivitySlider = getElement('sensitivity-slider');
    const sensitivityValue = getElement('sensitivity-value');
    
    if (sensitivitySlider) {
        sensitivitySlider.value = app.settings.sensitivity;
    }
    
    if (sensitivityValue) {
        sensitivityValue.textContent = app.settings.sensitivity;
    }
    
    // Fade speed
    const fadeSpeedSlider = getElement('fade-speed-slider');
    const fadeSpeedValue = getElement('fade-speed-value');
    
    if (fadeSpeedSlider) {
        fadeSpeedSlider.value = app.settings.fadeSpeed;
    }
    
    if (fadeSpeedValue) {
        fadeSpeedValue.textContent = `${app.settings.fadeSpeed}ms`;
    }
    
    // Effect type
    const effectRadio = document.querySelector(`input[name="effect"][value="${app.settings.effect}"]`);
    if (effectRadio) {
        effectRadio.checked = true;
    }
    
    // Visualizer visibility
    const showVisualizerCheckbox = getElement('show-visualizer');
    if (showVisualizerCheckbox) {
        showVisualizerCheckbox.checked = app.settings.showVisualizer;
    }
    
    // Apply to managers
    if (app.ui) {
        app.ui.setTransitionSpeed(app.settings.fadeSpeed);
        app.ui.setEffect(app.settings.effect);
        app.ui.setVisualizerVisibility(app.settings.showVisualizer);
    }
    
    if (app.audio) {
        app.audio.setSensitivity(app.settings.sensitivity);
    }
}

/**
 * Check browser compatibility
 */
function checkCompatibility() {
    const issues = [];
    
    if (!supportsWebAudio()) {
        issues.push('Web Audio API not supported');
    }
    
    if (!supportsGetUserMedia()) {
        issues.push('Microphone access not supported');
    }
    
    if (issues.length > 0) {
        console.warn('Compatibility issues:', issues);
        return false;
    }
    
    return true;
}

/**
 * Display browser compatibility warning
 */
function showCompatibilityWarning() {
    const browserInfo = getBrowserInfo();
    
    app.ui.showNotification(
        `Some features may not work properly in ${browserInfo.browser} ${browserInfo.version}. For best experience, use the latest Chrome, Firefox, or Edge.`,
        'warning',
        5000
    );
}

/**
 * Handle errors globally
 */
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        
        if (app.ui) {
            app.ui.showNotification('An unexpected error occurred', 'error');
        }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        if (app.ui) {
            app.ui.showNotification('An unexpected error occurred', 'error');
        }
    });
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupErrorHandling();
        
        // Check compatibility
        const isCompatible = checkCompatibility();
        
        if (!isCompatible) {
            showCompatibilityWarning();
        }
        
        // Initialize app
        initializeApp();
    });
} else {
    setupErrorHandling();
    
    // Check compatibility
    const isCompatible = checkCompatibility();
    
    if (!isCompatible) {
        showCompatibilityWarning();
    }
    
    // Initialize app
    initializeApp();
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.ShushApp = app;
}
