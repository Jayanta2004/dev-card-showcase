/**
 * Simulation main loop and state management
 */

class Simulation {
    constructor() {
        this.state = {
            isRunning: false,
            isPaused: false,
            speed: CONFIG.SIMULATION.BASE_SPEED,
            elapsedTime: 0,
            frameCount: 0,
            fps: 0,
            lastFrameTime: performance.now(),
            lastFpsUpdate: performance.now()
        };

        this.systems = {
            trafficLights: trafficLightSystem,
            vehicles: vehicleManager
        };

        this.animationFrameId = null;
        this.initialize();
    }

    /**
     * Initialize simulation
     */
    initialize() {
        // Initialize UI
        this.updateUI();

        // Setup event listeners
        this.setupEventListeners();

        // Start performance monitoring
        this.startPerformanceMonitoring();

        console.log('Simulation system initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Traffic light change event
        window.addEventListener('trafficLightChange', (event) => {
            this.onTrafficLightChange(event.detail);
        });

        // Performance warning
        window.addEventListener('performanceWarning', (event) => {
            this.showPerformanceWarning(event.detail);
        });
    }

    /**
     * Start simulation
     */
    start() {
        if (this.state.isRunning && !this.state.isPaused) {
            return;
        }

        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.lastFrameTime = performance.now();

        this.startAnimationLoop();
        this.updateUI();

        console.log('Simulation started');
        this.showStatus('Simulation started', 'success');
    }

    /**
     * Pause simulation
     */
    pause() {
        if (!this.state.isRunning || this.state.isPaused) {
            return;
        }

        this.state.isPaused = true;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.updateUI();

        console.log('Simulation paused');
        this.showStatus('Simulation paused', 'warning');
    }

    /**
     * Resume simulation
     */
    resume() {
        if (!this.state.isRunning || !this.state.isPaused) {
            return;
        }

        this.state.isPaused = false;
        this.state.lastFrameTime = performance.now();

        this.startAnimationLoop();
        this.updateUI();

        console.log('Simulation resumed');
        this.showStatus('Simulation resumed', 'success');
    }

    /**
     * Reset simulation
     */
    reset() {
        this.pause();

        // Reset all systems
        this.systems.trafficLights.reset();
        this.systems.vehicles.reset();

        // Reset state
        this.state.elapsedTime = 0;
        this.state.frameCount = 0;
        this.state.fps = 0;

        this.updateUI();

        console.log('Simulation reset');
        this.showStatus('Simulation reset', 'warning');
    }

    /**
     * Start animation loop
     */
    startAnimationLoop() {
        const loop = (currentTime) => {
            if (!this.state.isRunning || this.state.isPaused) {
                return;
            }

            // Calculate time delta
            const deltaTime = (currentTime - this.state.lastFrameTime) / 1000; // Convert to seconds
            this.state.lastFrameTime = currentTime;

            // Apply simulation speed
            const scaledDeltaTime = deltaTime * this.state.speed;

            // Update simulation time
            this.state.elapsedTime += scaledDeltaTime;
            this.state.frameCount++;

            // Update FPS
            this.updateFPS(currentTime);

            // Update all systems
            this.update(scaledDeltaTime);

            // Update UI
            this.updateUI();

            // Performance check
            this.checkPerformance(deltaTime);

            // Continue loop
            this.animationFrameId = requestAnimationFrame(loop);
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    /**
     * Update simulation
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        // Update traffic lights
        this.systems.trafficLights.update(deltaTime);

        // Update vehicles
        this.systems.vehicles.update(deltaTime);
    }

    /**
     * Update FPS calculation
     * @param {number} currentTime 
     */
    updateFPS(currentTime) {
        if (currentTime - this.state.lastFpsUpdate >= 1000) {
            this.state.fps = this.state.frameCount;
            this.state.frameCount = 0;
            this.state.lastFpsUpdate = currentTime;
        }
    }

    /**
     * Check performance
     * @param {number} deltaTime 
     */
    checkPerformance(deltaTime) {
        const currentFPS = 1 / deltaTime;

        // If FPS is too low, adjust vehicle spawning
        if (currentFPS < CONFIG.PERFORMANCE.TARGET_FPS && this.systems.vehicles.getVehicleCount() > 20) {
            this.systems.vehicles.setDensity(3); // Reduce to low density

            // Emit performance warning
            if (currentFPS < 30) {
                this.triggerEvent('performanceWarning', {
                    fps: currentFPS,
                    vehicleCount: this.systems.vehicles.getVehicleCount(),
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Update UI display
     */
    updateUI() {
        // Update vehicle count
        document.getElementById('vehicle-count').textContent =
            this.systems.vehicles.getVehicleCount();

        // Update simulation speed
        document.getElementById('simulation-speed').textContent =
            `${this.state.speed.toFixed(1)}x`;

        // Update runtime
        document.getElementById('simulation-time').textContent =
            `${Math.floor(this.state.elapsedTime)}s`;

        // Update status
        const statusElement = document.getElementById('simulation-status');
        if (this.state.isRunning && !this.state.isPaused) {
            statusElement.textContent = 'Running';
            statusElement.className = 'info-value status-running';
        } else if (this.state.isPaused) {
            statusElement.textContent = 'Paused';
            statusElement.className = 'info-value status-paused';
        } else {
            statusElement.textContent = 'Stopped';
            statusElement.className = 'info-value status-paused';
        }

        // Update traffic light timing display
        document.getElementById('ns-green').textContent =
            CONFIG.TRAFFIC_LIGHTS.NS.GREEN;
        document.getElementById('ns-yellow').textContent =
            CONFIG.TRAFFIC_LIGHTS.NS.YELLOW;
        document.getElementById('ew-green').textContent =
            CONFIG.TRAFFIC_LIGHTS.EW.GREEN;
        document.getElementById('ew-yellow').textContent =
            CONFIG.TRAFFIC_LIGHTS.EW.YELLOW;
    }

    /**
     * Set simulation speed
     * @param {number} speed 
     */
    setSpeed(speed) {
        const clampedSpeed = Math.max(
            CONFIG.SIMULATION.MIN_SPEED,
            Math.min(CONFIG.SIMULATION.MAX_SPEED, speed)
        );

        this.state.speed = clampedSpeed;
        this.updateUI();

        console.log(`Simulation speed set to: ${clampedSpeed}x`);
    }

    /**
     * Set vehicle density
     * @param {number} densityLevel 
     */
    setDensity(densityLevel) {
        this.systems.vehicles.setDensity(densityLevel);
        console.log(`Vehicle density set to: ${densityLevel}/10`);
    }

    /**
     * Traffic light change event handler
     * @param {Object} detail 
     */
    onTrafficLightChange(detail) {
        // Add extra logic here
        // E.g.: Log changes, trigger animations etc
        console.log(`Traffic light change: ${detail.previous} -> ${detail.current}`);
    }

    /**
     * Show performance warning
     * @param {Object} detail 
     */
    showPerformanceWarning(detail) {
        const warning = document.createElement('div');
        warning.className = 'status-indicator warning';
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Performance Warning: FPS ${detail.fps.toFixed(1)}, Vehicles: ${detail.vehicleCount}</span>
        `;

        document.body.appendChild(warning);

        // 3秒后移除
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }

    /**
     * Show status message
     * @param {string} message 
     * @param {string} type 
     */
    showStatus(message, type = 'info') {
        const status = document.createElement('div');
        status.className = `status-indicator ${type}`;
        status.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' :
                type === 'warning' ? 'exclamation-triangle' :
                    'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(status);

        // 2秒后移除
        setTimeout(() => {
            status.remove();
        }, 2000);
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        setInterval(() => {
            const stats = this.systems.vehicles.getStats();
            console.log(`Performance Stats: ${stats.current} vehicles, FPS: ${this.state.fps}`);
        }, 5000);
    }

    /**
     * Get simulation state
     * @returns {Object}
     */
    getState() {
        return {
            ...this.state,
            trafficLightState: this.systems.trafficLights.getCurrentState(),
            vehicleStats: this.systems.vehicles.getStats()
        };
    }

    /**
     * Trigger custom event
     * @param {string} eventName 
     * @param {Object} detail 
     */
    triggerEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
}

// Create global instance
const simulation = new Simulation();