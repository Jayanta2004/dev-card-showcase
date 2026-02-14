// ==================== DISTRACTION SYSTEM ====================

const DistractionManager = {
    container: null,
    systemContainer: null,
    distractions: [],
    density: 5,
    spawnTimer: null,
    isActive: false,
    mode: 'normal',
    disabledTypes: [],

    /**
     * Initialize distraction system
     */
    init(containerId = 'distractionsContainer', systemContainerId = 'systemDistractionsContainer') {
        this.container = document.getElementById(containerId);
        this.systemContainer = document.getElementById(systemContainerId);
        
        if (!this.container) {
            console.error('Distractions container not found');
        }
    },

    /**
     * Start spawning distractions
     */
    start() {
        this.isActive = true;
        this.scheduleNextDistraction();
    },

    /**
     * Stop spawning distractions
     */
    stop() {
        this.isActive = false;
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
    },

    /**
     * Set distraction density (1-10)
     */
    setDensity(density) {
        this.density = Utils.clamp(density, 1, 10);
    },

    /**
     * Set game mode
     */
    setMode(mode) {
        this.mode = mode;
        
        // Adjust behavior based on mode
        switch(mode) {
            case 'zen':
                this.disabledTypes = ['fake-cursor', 'screen-invert', 'glitch'];
                break;
            case 'chaos':
                this.disabledTypes = [];
                this.density = Math.min(this.density * 1.5, 10);
                break;
            case 'nightmare':
                this.disabledTypes = [];
                this.density = 10;
                break;
            default:
                this.disabledTypes = [];
        }
    },

    /**
     * Schedule next distraction
     */
    scheduleNextDistraction() {
        if (!this.isActive) return;

        // Calculate delay based on density (1-10)
        const baseDelay = 8000; // 8 seconds
        const minDelay = 2000;  // 2 seconds
        const delay = baseDelay - ((this.density - 1) * (baseDelay - minDelay) / 9);
        
        // Add randomness
        const randomDelay = Utils.random(delay * 0.5, delay * 1.5);

        this.spawnTimer = setTimeout(() => {
            this.spawnRandomDistraction();
            this.scheduleNextDistraction();
        }, randomDelay);
    },

    /**
     * Spawn a random distraction
     */
    spawnRandomDistraction() {
        const types = [
            'notification',
            'popup',
            'system-alert',
            'cookie-consent',
            'fake-ad',
            'loading-bar',
            'fake-cursor',
            'screen-invert',
            'glitch'
        ];

        // Filter out disabled types
        const availableTypes = types.filter(type => !this.disabledTypes.includes(type));
        
        // Increase chance of more annoying types in chaos/nightmare mode
        if (this.mode === 'chaos' || this.mode === 'nightmare') {
            availableTypes.push('fake-cursor', 'screen-invert', 'glitch');
        }

        const type = Utils.randomChoice(availableTypes);
        this.spawnDistraction(type);
    },

    /**
     * Spawn specific distraction type
     */
    spawnDistraction(type) {
        if (!this.container) return;

        let distraction;

        switch(type) {
            case 'notification':
                distraction = this.createNotification();
                break;
            case 'popup':
                distraction = this.createPopup();
                break;
            case 'system-alert':
                distraction = this.createSystemAlert();
                break;
            case 'cookie-consent':
                distraction = this.createCookieConsent();
                break;
            case 'fake-ad':
                distraction = this.createFakeAd();
                break;
            case 'loading-bar':
                distraction = this.createLoadingBar();
                break;
            case 'fake-cursor':
                this.createFakeCursor();
                return;
            case 'screen-invert':
                this.createScreenInvert();
                return;
            case 'glitch':
                this.createGlitchEffect();
                return;
            default:
                return;
        }

        if (distraction) {
            this.distractions.push(distraction);
            AudioManager.playDistraction();
        }
    },

    /**
     * Create fake notification
     */
    createNotification() {
        const notification = document.createElement('div');
        notification.className = 'distraction fake-notification';
        
        const position = Utils.randomChoice(['top-right', 'bottom-right']);
        notification.classList.add(position);

        const icons = ['🔔', '📧', '💬', '⚠️', '📱', '🎁', '⭐'];
        const icon = Utils.randomChoice(icons);

        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">${icon}</span>
                <span class="notification-title">${Utils.randomTitle()}</span>
                <span class="notification-close">×</span>
            </div>
            <div class="notification-body">
                ${Utils.randomMessage()}
            </div>
            <div class="notification-actions">
                <button class="notification-btn primary">Accept</button>
                <button class="notification-btn secondary">Dismiss</button>
            </div>
        `;

        this.container.appendChild(notification);

        // Add click handlers
        const closeBtn = notification.querySelector('.notification-close');
        const buttons = notification.querySelectorAll('.notification-btn');

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeDistraction(notification);
        });

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeDistraction(notification);
            });
        });

        // Auto-remove after 10-20 seconds
        setTimeout(() => {
            this.removeDistraction(notification);
        }, Utils.random(10000, 20000));

        return notification;
    },

    /**
     * Create fake popup
     */
    createPopup() {
        const popup = document.createElement('div');
        popup.className = 'distraction fake-popup';
        
        // Center it
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.zIndex = '1000';

        const titles = [
            'Important Update',
            'Security Alert',
            'Special Offer',
            'Account Verification',
            'System Notification'
        ];

        const messages = [
            'Please verify your information to continue using this service.',
            'Your session is about to expire. Please confirm to stay logged in.',
            'Congratulations! You\'ve been selected for a special promotion.',
            'Update your security settings to protect your account.',
            'Complete this quick survey to improve your experience.'
        ];

        popup.innerHTML = `
            <div class="popup-header">
                <span>${Utils.randomChoice(titles)}</span>
                <button class="popup-close-btn">×</button>
            </div>
            <div class="popup-body">
                <h3>Action Required</h3>
                <p>${Utils.randomChoice(messages)}</p>
                <input type="text" class="popup-input" placeholder="Enter your email...">
                <div class="popup-buttons">
                    <button class="popup-btn primary">Submit</button>
                    <button class="popup-btn cancel">Cancel</button>
                </div>
            </div>
        `;

        this.systemContainer.appendChild(popup);

        // Add click handlers
        const closeBtn = popup.querySelector('.popup-close-btn');
        const cancelBtn = popup.querySelector('.popup-btn.cancel');
        const submitBtn = popup.querySelector('.popup-btn.primary');

        [closeBtn, cancelBtn, submitBtn].forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeDistraction(popup);
            });
        });

        // Auto-remove after 15-25 seconds
        setTimeout(() => {
            this.removeDistraction(popup);
        }, Utils.random(15000, 25000));

        return popup;
    },

    /**
     * Create fake system alert
     */
    createSystemAlert() {
        const alert = document.createElement('div');
        alert.className = 'distraction fake-system-alert';
        
        alert.style.position = 'fixed';
        alert.style.left = '50%';
        alert.style.top = '50%';
        alert.style.transform = 'translate(-50%, -50%)';
        alert.style.zIndex = '1000';

        const types = ['warning', 'error', 'info'];
        const type = Utils.randomChoice(types);

        const icons = {
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };

        const titles = {
            warning: 'Warning',
            error: 'Error',
            info: 'Information'
        };

        const messages = {
            warning: 'Your system may be at risk. Take action immediately to prevent data loss.',
            error: 'A critical error has occurred. Please restart the application.',
            info: 'System update available. Install now to get the latest features.'
        };

        alert.innerHTML = `
            <div class="alert-icon-container ${type}">
                <div class="alert-icon">${icons[type]}</div>
            </div>
            <div class="alert-message">
                <h3>${titles[type]}</h3>
                <p>${messages[type]}</p>
            </div>
            <div class="alert-buttons">
                <button class="alert-btn primary">OK</button>
                <button class="alert-btn">Cancel</button>
            </div>
        `;

        this.systemContainer.appendChild(alert);

        // Add click handlers
        const buttons = alert.querySelectorAll('.alert-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeDistraction(alert);
            });
        });

        // Auto-remove after 12-18 seconds
        setTimeout(() => {
            this.removeDistraction(alert);
        }, Utils.random(12000, 18000));

        return alert;
    },

    /**
     * Create fake cookie consent
     */
    createCookieConsent() {
        const cookie = document.createElement('div');
        cookie.className = 'distraction fake-cookie-consent';

        cookie.innerHTML = `
            <div class="cookie-header">
                <span class="cookie-icon">🍪</span>
                <span class="cookie-title">Cookie Policy</span>
            </div>
            <div class="cookie-text">
                We use cookies to improve your experience. By continuing to use this site, 
                you accept our use of cookies. Manage your preferences below.
            </div>
            <div class="cookie-details">
                <div class="cookie-toggle">
                    <div class="toggle-switch active">
                        <div class="toggle-slider"></div>
                    </div>
                    <span>Essential</span>
                </div>
                <div class="cookie-toggle">
                    <div class="toggle-switch">
                        <div class="toggle-slider"></div>
                    </div>
                    <span>Analytics</span>
                </div>
                <div class="cookie-toggle">
                    <div class="toggle-switch">
                        <div class="toggle-slider"></div>
                    </div>
                    <span>Marketing</span>
                </div>
            </div>
            <div class="cookie-buttons">
                <button class="cookie-btn accept">Accept All</button>
                <button class="cookie-btn decline">Decline</button>
            </div>
        `;

        this.systemContainer.appendChild(cookie);

        // Add toggle functionality
        const toggles = cookie.querySelectorAll('.toggle-switch');
        toggles.forEach(toggle => {
            if (!toggle.classList.contains('active')) {
                toggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    this.classList.toggle('active');
                });
            }
        });

        // Add button handlers
        const buttons = cookie.querySelectorAll('.cookie-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeDistraction(cookie);
            });
        });

        // Auto-remove after 20-30 seconds
        setTimeout(() => {
            this.removeDistraction(cookie);
        }, Utils.random(20000, 30000));

        return cookie;
    },

    /**
     * Create fake ad
     */
    createFakeAd() {
        const ad = document.createElement('div');
        ad.className = 'distraction fake-ad';
        
        const position = Utils.randomChoice([
            { left: '20px', top: '20%' },
            { right: '20px', top: '20%' },
            { left: '50%', top: '80%', transform: 'translateX(-50%)' }
        ]);

        Object.assign(ad.style, position);

        const adTexts = [
            '🎉 WIN A FREE IPHONE! 🎉',
            '💰 EARN $5000 FROM HOME! 💰',
            '🔥 HOT SINGLES IN YOUR AREA! 🔥',
            '⚡ DOCTORS HATE THIS TRICK! ⚡',
            '🎁 CLAIM YOUR PRIZE NOW! 🎁',
            '💎 GET RICH QUICK! 💎'
        ];

        ad.innerHTML = `
            <span class="ad-close">×</span>
            <div class="ad-content">${Utils.randomChoice(adTexts)}</div>
            <button class="ad-cta">CLICK HERE!</button>
        `;

        this.container.appendChild(ad);

        // Add close handler
        const closeBtn = ad.querySelector('.ad-close');
        const ctaBtn = ad.querySelector('.ad-cta');

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeDistraction(ad);
        });

        ctaBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeDistraction(ad);
        });

        // Auto-remove after 8-15 seconds
        setTimeout(() => {
            this.removeDistraction(ad);
        }, Utils.random(8000, 15000));

        return ad;
    },

    /**
     * Create fake loading bar
     */
    createLoadingBar() {
        const loading = document.createElement('div');
        loading.className = 'distraction fake-loading';
        
        loading.style.position = 'fixed';
        loading.style.left = '50%';
        loading.style.top = '50%';
        loading.style.transform = 'translate(-50%, -50%)';
        loading.style.zIndex = '1000';

        const messages = [
            'Loading game assets...',
            'Downloading updates...',
            'Installing components...',
            'Verifying files...',
            'Connecting to server...',
            'Processing data...'
        ];

        loading.innerHTML = `
            <div class="loading-text">${Utils.randomChoice(messages)}</div>
            <div class="loading-bar-container">
                <div class="loading-bar"></div>
                <div class="loading-percentage">0%</div>
            </div>
        `;

        this.systemContainer.appendChild(loading);

        // Animate percentage
        const percentage = loading.querySelector('.loading-percentage');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Utils.random(5, 15);
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.removeDistraction(loading);
                }, 500);
            }
            percentage.textContent = Math.floor(progress) + '%';
        }, 300);

        // Force remove after 5 seconds
        setTimeout(() => {
            clearInterval(interval);
            this.removeDistraction(loading);
        }, 5000);

        return loading;
    },

    /**
     * Create fake cursor
     */
    createFakeCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'fake-cursor';
        cursor.style.left = Utils.random(20, 80) + '%';
        cursor.style.top = Utils.random(20, 80) + '%';

        document.body.appendChild(cursor);

        // Move it around randomly
        const moveInterval = setInterval(() => {
            cursor.style.left = Utils.random(20, 80) + '%';
            cursor.style.top = Utils.random(20, 80) + '%';
        }, 1000);

        setTimeout(() => {
            clearInterval(moveInterval);
            cursor.remove();
        }, Utils.random(3000, 6000));
    },

    /**
     * Create screen invert effect
     */
    createScreenInvert() {
        const invert = document.createElement('div');
        invert.className = 'screen-invert';

        document.querySelector('.game-container').appendChild(invert);

        setTimeout(() => {
            invert.remove();
        }, 100);
    },

    /**
     * Create glitch effect
     */
    createGlitchEffect() {
        ParticleSystem.createGlitchEffect();
        
        // Also shake the screen
        if (Math.random() > 0.5) {
            ParticleSystem.createScreenShake('light');
        }
    },

    /**
     * Remove a distraction
     */
    removeDistraction(element) {
        if (!element) return;

        element.classList.add('fade-out');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            const index = this.distractions.indexOf(element);
            if (index > -1) {
                this.distractions.splice(index, 1);
            }
        }, 300);
    },

    /**
     * Clear all distractions
     */
    clearAll() {
        this.distractions.forEach(distraction => {
            if (distraction.parentNode) {
                distraction.parentNode.removeChild(distraction);
            }
        });

        this.distractions = [];

        if (this.container) {
            this.container.innerHTML = '';
        }
        if (this.systemContainer) {
            this.systemContainer.innerHTML = '';
        }
    },

    /**
     * Get active distraction count
     */
    getCount() {
        return this.distractions.length;
    }
};
