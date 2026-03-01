/**
 * ========================================
 * GLASSBOUND - Main Controller
 * Initialization and state management
 * ========================================
 */

/**
 * Main application class
 */
class GlassboundApp {
    constructor() {
        // State
        this.state = {
            initialized: false,
            started: false,
            broken: false,
            stage: 1,
            tension: 0,
            integrity: 100,
            clickCount: 0,
            crackCount: 0
        };
        
        // DOM elements
        this.elements = {
            glassContainer: document.querySelector('.glass-jar-container'),
            glassWalls: document.querySelectorAll('.glass-wall'),
            canvas: document.getElementById('crack-canvas'),
            interactionZones: document.querySelectorAll('.interaction-zone'),
            instructionOverlay: document.getElementById('instruction-overlay'),
            breakOverlay: document.getElementById('break-overlay'),
            beginButton: document.getElementById('begin-button'),
            tensionFill: document.getElementById('tension-fill'),
            tensionValue: document.getElementById('tension-value'),
            stageNumber: document.getElementById('stage-number'),
            stageName: document.getElementById('stage-name'),
            clickCount: document.getElementById('click-count'),
            crackCount: document.getElementById('crack-count'),
            integrityValue: document.getElementById('integrity-value'),
            stressContainer: document.querySelector('.stress-indicator-container'),
            particleContainer: document.getElementById('particle-container')
        };
        
        // Systems
        this.systems = {};
        
        // Animation loop
        this.lastFrameTime = 0;
        this.rafId = null;
        
        // Configuration
        this.config = {
            tensionPerClick: 8,
            damagePerCrack: 5,
            crackIntensityMultiplier: 1.2,
            breakThreshold: 100,
            stageTransitionDelay: 500
        };
    }
    
    /**
     * Initialize the application
     */
    async init() {
        if (this.state.initialized) return;
        
        console.log('Initializing Glassbound...');
        
        // Initialize systems
        this.initializeSystems();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Mark as initialized
        this.state.initialized = true;
        
        console.log('Glassbound initialized successfully');
    }
    
    /**
     * Initialize all game systems
     */
    initializeSystems() {
        // Animation controller
        this.systems.animation = new AnimationController();
        this.systems.animation.start();
        
        // Physics system
        this.systems.physics = new CrackPhysics(this.elements.canvas);
        
        // Particle system
        this.systems.particles = new ParticleSystem(this.elements.particleContainer);
        
        // Tension system
        this.systems.tension = new TensionSystem(100);
        
        // Integrity system
        this.systems.integrity = new IntegritySystem(100);
        
        // Stress visualization
        this.systems.stress = new StressVisualization(this.elements.stressContainer);
        
        // Feedback system
        this.systems.feedback = new FeedbackSystem();
        
        // Interaction manager
        this.systems.interaction = new InteractionManager(
            this.elements.glassContainer,
            this.elements.interactionZones,
            (interaction) => this.handleInteraction(interaction)
        );
        
        // Gesture detector
        this.systems.gesture = new GestureDetector();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Begin button
        this.elements.beginButton.addEventListener('click', () => this.start());
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Start the experience
     */
    start() {
        if (this.state.started) return;
        
        console.log('Starting Glassbound experience...');
        
        // Hide instruction overlay
        this.elements.instructionOverlay.classList.add('hidden');
        
        // Activate interaction system
        this.systems.interaction.activate();
        
        // Start animation loop
        this.startAnimationLoop();
        
        // Mark as started
        this.state.started = true;
        
        // Apply initial glass state
        this.updateGlassState();
    }
    
    /**
     * Handle user interaction
     */
    handleInteraction(interaction) {
        if (this.state.broken) return;
        
        // Update click count
        this.state.clickCount++;
        this.updateStats();
        
        // Add tension
        const tensionAmount = this.config.tensionPerClick * interaction.comboMultiplier;
        this.systems.tension.addTension(tensionAmount, interaction.intensity);
        
        // Create crack
        const crackIntensity = 0.5 + (interaction.intensity * this.config.crackIntensityMultiplier);
        this.systems.physics.createCrack(interaction.x, interaction.y, crackIntensity);
        this.state.crackCount++;
        
        // Apply damage to integrity
        const damage = this.config.damagePerCrack * interaction.intensity;
        this.systems.integrity.applyDamage(damage, { x: interaction.x, y: interaction.y });
        
        // Add stress visualization
        this.systems.stress.addStressPoint(interaction.x, interaction.y, interaction.intensity);
        
        // Trigger visual feedback
        this.systems.feedback.impact(interaction.intensity);
        
        // Create impact ripple
        const ripple = new ImpactRipple(
            this.elements.glassContainer,
            interaction.x,
            interaction.y,
            interaction.intensity
        );
        this.systems.animation.register(`ripple_${Date.now()}`, ripple);
        
        // Shake glass
        const shake = new GlassShake(
            this.elements.glassContainer,
            interaction.intensity * 0.8,
            300
        );
        this.systems.animation.register(`shake_${Date.now()}`, shake);
        
        // Update UI
        this.updateUI();
        
        // Check for break condition
        if (this.systems.tension.isBreaking() || this.systems.integrity.isBroken()) {
            this.triggerBreak();
        } else {
            this.updateGlassState();
        }
    }
    
    /**
     * Update glass visual state based on tension and integrity
     */
    updateGlassState() {
        const tension = this.systems.tension.getPercentage();
        const integrity = this.systems.integrity.getPercentage();
        
        // Update stage
        const previousStage = this.state.stage;
        this.state.stage = this.systems.tension.stage;
        
        // Apply visual states to glass walls
        this.elements.glassWalls.forEach(wall => {
            wall.classList.remove('stressed', 'critical');
            
            if (tension >= 75 || integrity <= 30) {
                wall.classList.add('critical');
            } else if (tension >= 50 || integrity <= 60) {
                wall.classList.add('stressed');
            }
        });
        
        // Stage transition effects
        if (this.state.stage !== previousStage) {
            this.handleStageTransition(previousStage, this.state.stage);
        }
    }
    
    /**
     * Handle stage transition
     */
    handleStageTransition(from, to) {
        console.log(`Stage transition: ${from} → ${to}`);
        
        // Flash effect
        const flash = new ScreenFlash('rgba(255, 255, 255, 0.3)', 400);
        this.systems.animation.register(`flash_stage_${to}`, flash);
        
        // Pulse tension meter
        const pulse = new TensionPulse(this.elements.tensionFill, to / 5);
        this.systems.animation.register(`pulse_stage_${to}`, pulse);
    }
    
    /**
     * Trigger glass break sequence
     */
    triggerBreak() {
        if (this.state.broken) return;
        
        console.log('Glass breaking!');
        
        this.state.broken = true;
        
        // Deactivate interactions
        this.systems.interaction.deactivate();
        
        // Add breaking class to glass
        this.elements.glassContainer.classList.add('breaking');
        this.elements.glassWalls.forEach(wall => {
            wall.classList.add('breaking');
        });
        
        // Create massive crack explosion
        const centerX = this.elements.canvas.width / 2;
        const centerY = this.elements.canvas.height / 2;
        
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            this.systems.physics.createCrack(centerX, centerY, 2.0, angle);
        }
        
        // Particle explosion
        this.systems.particles.explode(centerX, centerY, 100, 2.0);
        
        // Screen flash
        const flash = new ScreenFlash('rgba(255, 255, 255, 0.9)', 800);
        this.systems.animation.register('break_flash', flash);
        
        // Show break overlay
        setTimeout(() => {
            this.elements.breakOverlay.classList.add('active');
        }, 600);
        
        // Blur glass walls
        setTimeout(() => {
            const blur = new GlassBlur(Array.from(this.elements.glassWalls), 0, 20, 1500);
            this.systems.animation.register('break_blur', blur);
        }, 300);
        
        // Option to restart
        setTimeout(() => {
            this.showRestartOption();
        }, 4000);
    }
    
    /**
     * Show restart option
     */
    showRestartOption() {
        const restartButton = document.createElement('button');
        restartButton.className = 'instruction-button';
        restartButton.textContent = 'EXPERIENCE AGAIN';
        restartButton.style.marginTop = '40px';
        restartButton.addEventListener('click', () => this.restart());
        
        const breakContent = this.elements.breakOverlay.querySelector('.break-content');
        if (breakContent && !breakContent.querySelector('button')) {
            breakContent.appendChild(restartButton);
        }
    }
    
    /**
     * Restart the experience
     */
    restart() {
        console.log('Restarting Glassbound...');
        
        // Reset state
        this.state.broken = false;
        this.state.started = false;
        this.state.stage = 1;
        this.state.clickCount = 0;
        this.state.crackCount = 0;
        
        // Reset systems
        this.systems.tension.reset();
        this.systems.integrity.reset();
        this.systems.interaction.reset();
        this.systems.physics.clear();
        this.systems.particles.clear();
        this.systems.stress.clear();
        this.systems.animation.clear();
        
        // Reset glass visuals
        this.elements.glassContainer.classList.remove('breaking');
        this.elements.glassWalls.forEach(wall => {
            wall.classList.remove('stressed', 'critical', 'breaking');
            wall.style.filter = '';
        });
        
        // Hide break overlay
        this.elements.breakOverlay.classList.remove('active');
        const restartButton = this.elements.breakOverlay.querySelector('button');
        if (restartButton) restartButton.remove();
        
        // Show instruction overlay
        this.elements.instructionOverlay.classList.remove('hidden');
        
        // Update UI
        this.updateUI();
        this.updateStats();
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        // Tension meter
        const tension = this.systems.tension.getPercentage();
        this.elements.tensionFill.style.width = `${tension}%`;
        this.elements.tensionValue.textContent = `${Math.round(tension)}%`;
        
        // Stage indicator
        this.elements.stageNumber.textContent = this.state.stage;
        this.elements.stageName.textContent = this.systems.tension.getStageName();
        
        // Update stats
        this.updateStats();
    }
    
    /**
     * Update stats display
     */
    updateStats() {
        this.elements.clickCount.textContent = this.state.clickCount;
        this.elements.crackCount.textContent = this.state.crackCount;
        
        const integrity = this.systems.integrity.getPercentage();
        this.elements.integrityValue.textContent = `${Math.round(integrity)}%`;
    }
    
    /**
     * Main animation loop
     */
    startAnimationLoop() {
        const animate = (timestamp) => {
            if (!this.state.started && !this.state.broken) return;
            
            // Calculate delta time
            const deltaTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;
            
            // Update systems
            this.systems.tension.update(deltaTime);
            this.systems.physics.update(deltaTime);
            this.systems.particles.update();
            
            // Render
            this.systems.physics.render();
            this.systems.particles.render();
            
            // Update UI
            this.updateUI();
            
            // Continue loop
            this.rafId = requestAnimationFrame(animate);
        };
        
        this.lastFrameTime = performance.now();
        this.rafId = requestAnimationFrame(animate);
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.systems.physics.resize();
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyPress(event) {
        // R - Restart
        if (event.key === 'r' || event.key === 'R') {
            if (this.state.broken) {
                this.restart();
            }
        }
        
        // Escape - Exit (show restart)
        if (event.key === 'Escape') {
            if (this.state.started && !this.state.broken) {
                // Optional: pause functionality
            }
        }
        
        // Space - Start
        if (event.key === ' ' && !this.state.started) {
            event.preventDefault();
            this.start();
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Stop animation loop
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Stop animation controller
        this.systems.animation.stop();
        
        // Clean up systems
        Object.values(this.systems).forEach(system => {
            if (system.clear) system.clear();
            if (system.destroy) system.destroy();
        });
        
        console.log('Glassbound destroyed');
    }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.glassboundApp = new GlassboundApp();
    
    // Initialize
    window.glassboundApp.init();
    
    // Development helpers
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Glassbound - Development Mode');
        console.log('Press R to restart');
        console.log('Press Space to begin');
        
        // Expose app to window for debugging
        window.app = window.glassboundApp;
    }
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - could pause here if needed
    } else {
        // Page is visible again
        if (window.glassboundApp) {
            window.glassboundApp.lastFrameTime = performance.now();
        }
    }
});

/**
 * Handle before unload
 */
window.addEventListener('beforeunload', () => {
    if (window.glassboundApp) {
        window.glassboundApp.destroy();
    }
});

/**
 * Export for module usage
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GlassboundApp };
}
