// ==================== GAME MANAGER ====================

const Game = {
    state: 'menu', // menu, playing, paused, gameover
    gameArea: null,
    gameLoopId: null,
    lastTime: 0,
    
    // Game settings
    gameDuration: 60, // seconds
    timeRemaining: 60,
    
    // Mouse tracking
    mouseX: 0,
    mouseY: 0,
    isOnTarget: false,
    currentTargetHover: null,
    
    // Focus tracking
    lastFocusWarning: 0,
    screenShakeEnabled: true,
    
    // Difficulty modifiers
    difficultySettings: {
        easy: {
            targetSpawnRate: 3000,
            maxTargets: 3,
            distractionDensity: 3,
            focusLossRate: 7,
            focusRecoveryRate: 20
        },
        normal: {
            targetSpawnRate: 2000,
            maxTargets: 5,
            distractionDensity: 5,
            focusLossRate: 10,
            focusRecoveryRate: 15
        },
        hard: {
            targetSpawnRate: 1500,
            maxTargets: 7,
            distractionDensity: 8,
            focusLossRate: 15,
            focusRecoveryRate: 10
        }
    },

    /**
     * Initialize the game
     */
    init() {
        console.log('Initializing Focus Sniper...');
        
        // Initialize all systems
        ParticleSystem.init();
        DistractionManager.init();
        TargetManager.init();
        StatsManager.init();
        UIManager.init();
        
        this.gameArea = document.getElementById('gameArea');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show main menu
        UIManager.showMenu('mainMenu');
        UIManager.setCursorVisible(true);
        
        console.log('Focus Sniper ready!');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            AudioManager.playClick();
            this.startGame();
        });
        
        // Tutorial button
        document.getElementById('tutorialBtn').addEventListener('click', () => {
            AudioManager.playClick();
            UIManager.showMenu('tutorialMenu');
        });
        
        // Close tutorial
        document.getElementById('closeTutorialBtn').addEventListener('click', () => {
            AudioManager.playClick();
            UIManager.showMenu('mainMenu');
        });
        
        // Resume button
        document.getElementById('resumeBtn').addEventListener('click', () => {
            AudioManager.playClick();
            this.resumeGame();
        });
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            AudioManager.playClick();
            this.startGame();
        });
        
        // Quit button
        document.getElementById('quitBtn').addEventListener('click', () => {
            AudioManager.playClick();
            this.quitToMenu();
        });
        
        // Play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            AudioManager.playClick();
            this.startGame();
        });
        
        // Main menu button
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            AudioManager.playClick();
            this.quitToMenu();
        });
        
        // Game area click
        if (this.gameArea) {
            this.gameArea.addEventListener('click', (e) => this.handleClick(e));
            this.gameArea.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Screen shake toggle
        document.getElementById('screenShakeToggle').addEventListener('change', (e) => {
            this.screenShakeEnabled = e.target.checked;
        });
        
        // Prevent context menu on game area
        if (this.gameArea) {
            this.gameArea.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    },

    /**
     * Start a new game
     */
    startGame() {
        console.log('Starting game...');
        
        // Apply difficulty settings
        const difficulty = StatsManager.difficulty;
        const settings = this.difficultySettings[difficulty];
        
        TargetManager.setSpawnRate(settings.targetSpawnRate);
        TargetManager.setMaxTargets(settings.maxTargets);
        DistractionManager.setDensity(settings.distractionDensity);
        StatsManager.focusLossRate = settings.focusLossRate;
        StatsManager.focusRecoveryRate = settings.focusRecoveryRate;
        
        // Reset everything
        StatsManager.reset();
        ParticleSystem.clear();
        TargetManager.clearAll();
        DistractionManager.clearAll();
        
        // Reset timer
        this.timeRemaining = this.gameDuration;
        
        // Hide menus
        UIManager.hideAllMenus();
        UIManager.setCursorVisible(false);
        UIManager.toggleControls(false);
        
        // Start systems
        TargetManager.start();
        DistractionManager.start();
        
        // Set game mode
        const mode = document.getElementById('gameMode').value;
        DistractionManager.setMode(mode);
        
        // Change state and start loop
        this.state = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
        
        // Play start sound
        AudioManager.playGameStart();
        
        // Show start notification
        UIManager.showNotification('FOCUS!', 2000);
    },

    /**
     * Pause the game
     */
    pauseGame() {
        if (this.state !== 'playing') return;
        
        this.state = 'paused';
        TargetManager.stop();
        DistractionManager.stop();
        
        UIManager.showPause();
        UIManager.setCursorVisible(true);
    },

    /**
     * Resume the game
     */
    resumeGame() {
        if (this.state !== 'paused') return;
        
        this.state = 'playing';
        this.lastTime = performance.now();
        
        TargetManager.start();
        DistractionManager.start();
        
        UIManager.hideAllMenus();
        UIManager.setCursorVisible(false);
        
        this.gameLoop();
    },

    /**
     * End the game
     */
    endGame() {
        console.log('Game over!');
        
        this.state = 'gameover';
        
        TargetManager.stop();
        DistractionManager.stop();
        TargetManager.clearAll();
        DistractionManager.clearAll();
        
        UIManager.showGameOver();
        UIManager.setCursorVisible(true);
        UIManager.toggleControls(true);
    },

    /**
     * Quit to main menu
     */
    quitToMenu() {
        this.state = 'menu';
        
        TargetManager.stop();
        DistractionManager.stop();
        TargetManager.clearAll();
        DistractionManager.clearAll();
        ParticleSystem.clear();
        
        UIManager.showMenu('mainMenu');
        UIManager.setCursorVisible(true);
        UIManager.toggleControls(true);
    },

    /**
     * Main game loop
     */
    gameLoop(currentTime = performance.now()) {
        if (this.state !== 'playing') return;
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue loop
        this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    },

    /**
     * Update game state
     */
    update(deltaTime) {
        // Update timer
        this.timeRemaining -= deltaTime / 1000;
        
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.endGame();
            return;
        }
        
        // Update target positions
        TargetManager.update(deltaTime);
        
        // Check if mouse is on a target
        this.checkTargetHover();
        
        // Update focus based on player state
        const isDistracted = DistractionManager.getCount() > 0;
        StatsManager.updateFocus(deltaTime, this.isOnTarget, isDistracted);
        
        // Focus warnings
        if (StatsManager.focus < 30) {
            const now = Date.now();
            if (now - this.lastFocusWarning > 3000) {
                AudioManager.playWarning();
                this.lastFocusWarning = now;
            }
        }
    },

    /**
     * Render game state
     */
    render() {
        UIManager.updateHUD();
        UIManager.updateTimer(this.timeRemaining);
    },

    /**
     * Check if mouse is hovering over a target
     */
    checkTargetHover() {
        if (!this.gameArea) return;
        
        const bounds = this.gameArea.getBoundingClientRect();
        const relativeX = this.mouseX - bounds.left;
        const relativeY = this.mouseY - bounds.top;
        
        this.isOnTarget = false;
        this.currentTargetHover = null;
        
        const targets = TargetManager.getPositions();
        for (const target of targets) {
            const centerX = target.x + target.size / 2;
            const centerY = target.y + target.size / 2;
            const radius = target.size / 2;
            
            const distance = Utils.distance(relativeX, relativeY, centerX, centerY);
            
            if (distance <= radius) {
                this.isOnTarget = true;
                this.currentTargetHover = target;
                break;
            }
        }
    },

    /**
     * Handle mouse move
     */
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    },

    /**
     * Handle click
     */
    handleClick(e) {
        if (this.state !== 'playing') return;
        
        const hitData = TargetManager.checkHit(e.clientX, e.clientY);
        
        if (hitData) {
            // Hit!
            this.handleTargetHit(hitData);
        } else {
            // Miss!
            this.handleMiss(e.clientX, e.clientY);
        }
    },

    /**
     * Handle target hit
     */
    handleTargetHit(hitData) {
        const { target, x, y, type, points, distance } = hitData;
        
        // Remove target
        TargetManager.removeTarget(target);
        
        // Calculate if critical (hit center)
        const isCritical = distance < 10;
        
        // Record stats
        StatsManager.recordShot(true, { points: isCritical ? points * 2 : points });
        
        // Visual effects
        UIManager.flashCrosshair('active');
        ParticleSystem.createExplosion(x, y, 15, type === 'bonus' ? '#00ffff' : '#00ff00');
        ParticleSystem.createRipple(x, y, type === 'bonus' ? '#00ffff' : '#00ff00');
        
        // Hit marker
        const markerText = isCritical ? 'CRITICAL!' : '+' + (isCritical ? points * 2 : points);
        ParticleSystem.createHitMarker(x, y, markerText, isCritical);
        
        // Sound
        if (isCritical) {
            AudioManager.playCritical();
            ParticleSystem.createScreenFlash('critical');
        } else {
            AudioManager.playHit();
        }
        
        // Combo effects
        if (StatsManager.combo > 0 && StatsManager.combo % 5 === 0) {
            ParticleSystem.createComboNotification(StatsManager.combo);
            AudioManager.playCombo(StatsManager.combo);
            
            if (this.screenShakeEnabled) {
                ParticleSystem.createScreenShake('light');
            }
        }
        
        // Danger target penalty
        if (type === 'danger') {
            AudioManager.playWarning();
            ParticleSystem.createScreenFlash('damage');
            UIManager.showNotification('DANGER! -50 points', 1500);
        }
        
        // Bonus target rewards
        if (type === 'bonus') {
            ParticleSystem.createConfetti(x, y, 20);
            UIManager.showNotification('BONUS! +50 points', 1500);
        }
    },

    /**
     * Handle miss
     */
    handleMiss(x, y) {
        // Record stats
        StatsManager.recordShot(false);
        
        // Visual effects
        UIManager.flashCrosshair('missed');
        ParticleSystem.createHitMarker(x, y, 'MISS', false, true);
        
        // Sound
        AudioManager.playMiss();
        
        // Small screen shake on miss
        if (this.screenShakeEnabled && Math.random() > 0.7) {
            ParticleSystem.createScreenShake('light');
        }
    },

    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        // ESC to pause/unpause
        if (e.key === 'Escape') {
            if (this.state === 'playing') {
                this.pauseGame();
            } else if (this.state === 'paused') {
                this.resumeGame();
            }
        }
        
        // Spacebar to shoot (for accessibility)
        if (e.code === 'Space' && this.state === 'playing') {
            e.preventDefault();
            
            if (this.currentTargetHover && this.isOnTarget) {
                // Simulate click on current target
                const bounds = this.gameArea.getBoundingClientRect();
                const fakeEvent = {
                    clientX: bounds.left + this.mouseX,
                    clientY: bounds.top + this.mouseY
                };
                this.handleClick(fakeEvent);
            }
        }
        
        // Debug keys (only in development)
        if (e.shiftKey && e.ctrlKey) {
            if (e.key === 'D') {
                // Toggle debug mode
                console.log('Stats:', StatsManager.getSummary());
            } else if (e.key === 'T') {
                // Add time
                this.timeRemaining += 10;
            } else if (e.key === 'S') {
                // Add score
                StatsManager.score += 1000;
            }
        }
    }
};

// Initialize game when window loads
window.addEventListener('load', () => {
    Game.init();
});

// Prevent accidental navigation
window.addEventListener('beforeunload', (e) => {
    if (Game.state === 'playing') {
        e.preventDefault();
        e.returnValue = 'Game in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});
