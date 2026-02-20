// ==================== UI MANAGER ====================

const UIManager = {
    elements: {},
    currentMenu: null,

    /**
     * Initialize UI
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateControls();
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        // HUD elements
        this.elements.scoreDisplay = document.getElementById('scoreDisplay');
        this.elements.accuracyDisplay = document.getElementById('accuracyDisplay');
        this.elements.comboDisplay = document.getElementById('comboDisplay');
        this.elements.timerDisplay = document.getElementById('timerDisplay');
        this.elements.focusBar = document.getElementById('focusBar');
        this.elements.focusDisplay = document.getElementById('focusDisplay');
        
        // Control panel
        this.elements.distractionDensity = document.getElementById('distractionDensity');
        this.elements.densityValue = document.getElementById('densityValue');
        this.elements.gameMode = document.getElementById('gameMode');
        this.elements.soundToggle = document.getElementById('soundToggle');
        this.elements.screenShakeToggle = document.getElementById('screenShakeToggle');
        
        // Menus
        this.elements.mainMenu = document.getElementById('mainMenu');
        this.elements.pauseMenu = document.getElementById('pauseMenu');
        this.elements.gameOverMenu = document.getElementById('gameOverMenu');
        this.elements.tutorialMenu = document.getElementById('tutorialMenu');
        
        // Buttons
        this.elements.startBtn = document.getElementById('startBtn');
        this.elements.tutorialBtn = document.getElementById('tutorialBtn');
        this.elements.resumeBtn = document.getElementById('resumeBtn');
        this.elements.restartBtn = document.getElementById('restartBtn');
        this.elements.quitBtn = document.getElementById('quitBtn');
        this.elements.playAgainBtn = document.getElementById('playAgainBtn');
        this.elements.mainMenuBtn = document.getElementById('mainMenuBtn');
        this.elements.closeTutorialBtn = document.getElementById('closeTutorialBtn');
        
        // Difficulty buttons
        this.elements.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        // Crosshair
        this.elements.crosshair = document.getElementById('crosshair');
        
        // Game area
        this.elements.gameArea = document.getElementById('gameArea');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Distraction density slider
        if (this.elements.distractionDensity) {
            this.elements.distractionDensity.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.elements.densityValue.textContent = value;
                DistractionManager.setDensity(value);
            });
        }
        
        // Game mode selector
        if (this.elements.gameMode) {
            this.elements.gameMode.addEventListener('change', (e) => {
                DistractionManager.setMode(e.target.value);
            });
        }
        
        // Sound toggle
        if (this.elements.soundToggle) {
            this.elements.soundToggle.addEventListener('change', (e) => {
                AudioManager.setEnabled(e.target.checked);
            });
        }
        
        // Difficulty buttons
        this.elements.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.difficultyButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                StatsManager.difficulty = btn.dataset.difficulty;
            });
        });
        
        // Crosshair movement
        document.addEventListener('mousemove', (e) => {
            if (this.elements.crosshair) {
                this.elements.crosshair.style.left = e.clientX + 'px';
                this.elements.crosshair.style.top = e.clientY + 'px';
            }
        });
    },

    /**
     * Update HUD displays
     */
    updateHUD() {
        // Score
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = Utils.formatNumber(StatsManager.score);
        }
        
        // Accuracy
        if (this.elements.accuracyDisplay) {
            const accuracy = StatsManager.getAccuracy();
            this.elements.accuracyDisplay.textContent = accuracy.toFixed(1) + '%';
            
            // Color based on accuracy
            if (accuracy >= 75) {
                this.elements.accuracyDisplay.style.color = 'var(--primary-color)';
            } else if (accuracy >= 50) {
                this.elements.accuracyDisplay.style.color = 'var(--warning-color)';
            } else {
                this.elements.accuracyDisplay.style.color = 'var(--danger-color)';
            }
        }
        
        // Combo
        if (this.elements.comboDisplay) {
            const combo = StatsManager.combo;
            this.elements.comboDisplay.textContent = combo + 'x';
            
            if (combo >= 10) {
                this.elements.comboDisplay.style.color = 'var(--warning-color)';
                this.elements.comboDisplay.style.textShadow = '0 0 20px var(--warning-color)';
            } else if (combo >= 5) {
                this.elements.comboDisplay.style.color = 'var(--accent-color)';
                this.elements.comboDisplay.style.textShadow = '0 0 15px var(--accent-color)';
            } else {
                this.elements.comboDisplay.style.color = 'var(--primary-color)';
                this.elements.comboDisplay.style.textShadow = 'var(--shadow-glow)';
            }
        }
        
        // Focus
        if (this.elements.focusBar && this.elements.focusDisplay) {
            const focus = StatsManager.focus;
            this.elements.focusBar.style.width = focus + '%';
            this.elements.focusDisplay.textContent = Math.floor(focus) + '%';
            
            // Color and effects based on focus
            if (focus < 30) {
                this.elements.focusBar.style.filter = 'hue-rotate(0deg)'; // Red
                this.elements.focusBar.parentElement.classList.add('accuracy-warning');
            } else if (focus < 60) {
                this.elements.focusBar.style.filter = 'hue-rotate(-60deg)'; // Orange/Yellow
                this.elements.focusBar.parentElement.classList.remove('accuracy-warning');
            } else {
                this.elements.focusBar.style.filter = 'hue-rotate(0deg)'; // Green
                this.elements.focusBar.parentElement.classList.remove('accuracy-warning');
            }
        }
    },

    /**
     * Update timer display
     */
    updateTimer(seconds) {
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = Math.ceil(seconds);
            
            // Warning effects when time is low
            if (seconds <= 10 && seconds > 0) {
                this.elements.timerDisplay.style.color = 'var(--danger-color)';
                this.elements.timerDisplay.style.textShadow = '0 0 20px var(--danger-color)';
                
                // Tick sound
                if (Math.floor(seconds) !== Math.floor(seconds + 0.016)) { // Changed
                    AudioManager.playTick();
                }
            } else {
                this.elements.timerDisplay.style.color = 'var(--primary-color)';
                this.elements.timerDisplay.style.textShadow = 'var(--shadow-glow)';
            }
        }
    },

    /**
     * Update controls display
     */
    updateControls() {
        if (this.elements.distractionDensity && this.elements.densityValue) {
            this.elements.densityValue.textContent = this.elements.distractionDensity.value;
        }
    },

    /**
     * Show menu
     */
    showMenu(menuName) {
        // Hide all menus
        this.hideAllMenus();
        
        // Show requested menu
        const menu = this.elements[menuName];
        if (menu) {
            menu.classList.add('active');
            this.currentMenu = menuName;
        }
    },

    /**
     * Hide all menus
     */
    hideAllMenus() {
        ['mainMenu', 'pauseMenu', 'gameOverMenu', 'tutorialMenu'].forEach(menuName => {
            const menu = this.elements[menuName];
            if (menu) {
                menu.classList.remove('active');
            }
        });
        this.currentMenu = null;
    },

    /**
     * Show game over screen with stats
     */
    showGameOver() {
        const summary = StatsManager.getSummary();
        
        // Update stats
        document.getElementById('finalScore').textContent = Utils.formatNumber(summary.finalScore);
        document.getElementById('finalAccuracy').textContent = summary.accuracy.toFixed(1) + '%';
        document.getElementById('finalTargets').textContent = summary.targetsHit;
        document.getElementById('finalCombo').textContent = summary.maxCombo + 'x';
        document.getElementById('finalFocus').textContent = summary.avgFocus.toFixed(1) + '%';
        document.getElementById('finalDistractions').textContent = summary.distractionsResisted;
        document.getElementById('rankDisplay').textContent = summary.rank;
        
        // Show achievements
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        
        if (summary.achievements.length > 0) {
            summary.achievements.forEach(achievement => {
                const badge = document.createElement('div');
                badge.className = 'achievement';
                badge.innerHTML = `
                    <strong>${achievement.title}</strong><br>
                    <small>${achievement.description}</small>
                `;
                achievementsList.appendChild(badge);
            });
        }
        
        // Check for new high score
        if (StatsManager.saveHighScore()) {
            const newBadge = document.createElement('div');
            newBadge.className = 'achievement';
            newBadge.style.borderColor = 'var(--warning-color)';
            newBadge.style.background = 'linear-gradient(135deg, rgba(255, 170, 0, 0.3), rgba(255, 0, 102, 0.3))';
            newBadge.innerHTML = `
                <strong>🏆 NEW HIGH SCORE! 🏆</strong><br>
                <small>${Utils.formatNumber(summary.finalScore)} points</small>
            `;
            achievementsList.insertBefore(newBadge, achievementsList.firstChild);
        }
        
        // Color rank based on grade
        const rankDisplay = document.getElementById('rankDisplay');
        if (summary.rank.startsWith('S')) {
            rankDisplay.style.color = 'var(--warning-color)';
        } else if (summary.rank.startsWith('A')) {
            rankDisplay.style.color = 'var(--primary-color)';
        } else if (summary.rank.startsWith('B')) {
            rankDisplay.style.color = 'var(--accent-color)';
        } else {
            rankDisplay.style.color = 'var(--text-light)';
        }
        
        this.showMenu('gameOverMenu');
        AudioManager.playGameOver();
    },

    /**
     * Show pause menu with current stats
     */
    showPause() {
        document.getElementById('pauseScore').textContent = Utils.formatNumber(StatsManager.score);
        document.getElementById('pauseAccuracy').textContent = StatsManager.getAccuracy().toFixed(1) + '%';
        this.showMenu('pauseMenu');
    },

    /**
     * Flash crosshair
     */
    flashCrosshair(type = 'active') {
        if (!this.elements.crosshair) return;
        
        this.elements.crosshair.classList.remove('active', 'missed');
        
        // Force reflow
        void this.elements.crosshair.offsetWidth;
        
        this.elements.crosshair.classList.add(type);
        
        setTimeout(() => {
            this.elements.crosshair.classList.remove(type);
        }, 200);
    },

    /**
     * Show notification toast
     */
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 0, 0.9);
            color: black;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            animation: slideInTop 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    /**
     * Toggle control panel
     */
    toggleControls(show) {
        const panel = document.querySelector('.control-panel');
        if (panel) {
            panel.style.display = show ? 'flex' : 'none';
        }
    },

    /**
     * Toggle HUD
     */
    toggleHUD(show) {
        const hud = document.querySelector('.hud');
        if (hud) {
            hud.style.display = show ? 'flex' : 'none';
        }
    },

    /**
     * Set game cursor visibility
     */
    setCursorVisible(visible) {
        document.body.style.cursor = visible ? 'default' : 'none';
        if (this.elements.crosshair) {
            this.elements.crosshair.style.display = visible ? 'block' : 'none';
        }
    }
};
