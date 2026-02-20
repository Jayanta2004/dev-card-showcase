/**
 * User Interface Controls
 */

class UIControls {
    constructor() {
        this.simulation = simulation;
        this.isPanelCollapsed = false;
        this.initializeControls();
    }

    /**
     * Initialize all controls
     */
    initializeControls() {
        this.setupButtonControls();
        this.setupSliderControls();
        this.setupTimingControls();
        this.setupToggleControls();
        this.setupPanelToggle();

        // Initial state
        this.updateControlStates();
    }

    /**
     * Setup button controls
     */
    setupButtonControls() {
        // Start button
        document.getElementById('btn-start').addEventListener('click', () => {
            if (this.simulation.state.isRunning && !this.simulation.state.isPaused) {
                return;
            }

            if (this.simulation.state.isPaused) {
                this.simulation.resume();
            } else {
                this.simulation.start();
            }

            this.updateControlStates();
        });

        // Pause button
        document.getElementById('btn-pause').addEventListener('click', () => {
            if (!this.simulation.state.isRunning || this.simulation.state.isPaused) {
                return;
            }

            this.simulation.pause();
            this.updateControlStates();
        });

        // Reset button
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.simulation.reset();
            this.updateControlStates();
        });
    }

    /**
     * Setup slider controls
     */
    setupSliderControls() {
        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.simulation.setSpeed(speed);
        });

        // Density slider
        const densitySlider = document.getElementById('density-slider');
        densitySlider.addEventListener('input', (e) => {
            const density = parseInt(e.target.value);
            this.simulation.setDensity(density);

            // Update labels
            const labels = ['Very Low', 'Low', 'Low-Medium', 'Medium', 'Medium-High', 'High', 'Very High', 'Extreme', 'Crazy', 'Limit'];
            const labelIndex = density - 1;
            if (labelIndex >= 0 && labelIndex < labels.length) {
                // Visual feedback can be added here
            }
        });
    }

    /**
     * Setup timing controls
     */
    setupTimingControls() {
        // Timing control buttons
        document.querySelectorAll('.btn-icon[data-direction][data-light][data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const direction = button.dataset.direction;
                const light = button.dataset.light.toUpperCase();
                const action = button.dataset.action;

                this.adjustTiming(direction, light, action);
            });
        });
    }

    /**
     * Adjust timing
     * @param {string} direction 
     * @param {string} light 
     * @param {string} action 
     */
    adjustTiming(direction, light, action) {
        let currentValue;
        const configKey = direction === 'ns' ? 'NS' : 'EW';

        if (light === 'GREEN') {
            currentValue = CONFIG.TRAFFIC_LIGHTS[configKey].GREEN;
        } else {
            currentValue = CONFIG.TRAFFIC_LIGHTS[configKey].YELLOW;
        }

        // Adjust value
        let newValue;
        if (action === 'increase') {
            newValue = currentValue + 1;
        } else {
            newValue = Math.max(1, currentValue - 1);
        }

        // Update system
        trafficLightSystem.updateTiming(configKey, light, newValue);

        // Update UI
        this.updateTimingDisplay();

        // Provide feedback
        this.showTimingFeedback(direction, light, newValue);
    }

    /**
     * Update timing display
     */
    updateTimingDisplay() {
        document.getElementById('ns-green').textContent = CONFIG.TRAFFIC_LIGHTS.NS.GREEN;
        document.getElementById('ns-yellow').textContent = CONFIG.TRAFFIC_LIGHTS.NS.YELLOW;
        document.getElementById('ew-green').textContent = CONFIG.TRAFFIC_LIGHTS.EW.GREEN;
        document.getElementById('ew-yellow').textContent = CONFIG.TRAFFIC_LIGHTS.EW.YELLOW;
    }

    /**
     * Show timing adjustment feedback
     */
    showTimingFeedback(direction, light, value) {
        const directionText = direction === 'ns' ? 'N-S ' : 'E-W ';
        const lightText = light === 'GREEN' ? 'Green Light' : 'Yellow Light';

        simulation.showStatus(`${directionText}${lightText} set to ${value}s`, 'success');
    }

    /**
     * Setup toggle controls
     */
    setupToggleControls() {
        // Grid toggle
        document.getElementById('toggle-grid').addEventListener('click', (e) => {
            const button = e.target.closest('.toggle-btn');
            const gridOverlay = document.getElementById('grid-overlay');

            if (button.classList.contains('active')) {
                button.classList.remove('active');
                gridOverlay.style.opacity = '0';
                CONFIG.VISUAL.SHOW_GRID = false;
            } else {
                button.classList.add('active');
                gridOverlay.style.opacity = '0.2';
                CONFIG.VISUAL.SHOW_GRID = true;
            }
        });

        // Path toggle
        document.getElementById('toggle-paths').addEventListener('click', (e) => {
            const button = e.target.closest('.toggle-btn');

            if (button.classList.contains('active')) {
                button.classList.remove('active');
                CONFIG.VISUAL.SHOW_PATHS = false;
                this.hidePaths();
            } else {
                button.classList.add('active');
                CONFIG.VISUAL.SHOW_PATHS = true;
                this.showPaths();
            }
        });
    }

    /**
     * Show vehicle paths
     */
    showPaths() {
        // Create path visualization
        const pathsContainer = document.createElement('div');
        pathsContainer.id = 'paths-container';
        pathsContainer.style.position = 'absolute';
        pathsContainer.style.top = '0';
        pathsContainer.style.left = '0';
        pathsContainer.style.width = '100%';
        pathsContainer.style.height = '100%';
        pathsContainer.style.pointerEvents = 'none';
        pathsContainer.style.zIndex = '1';

        document.getElementById('intersection').appendChild(pathsContainer);

        // Create path for each direction
        const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        const colors = {
            NORTH: '#60a5fa',
            SOUTH: '#34d399',
            EAST: '#f472b6',
            WEST: '#fbbf24'
        };

        directions.forEach(direction => {
            const waypoints = CONFIG.ROAD_LAYOUT.WAYPOINTS[direction];

            // Create SVG path
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.classList.add('vehicle-path');

            const path = document.createElementNS(svgNS, "path");
            let d = `M ${waypoints[0].x} ${waypoints[0].y}`;

            for (let i = 1; i < waypoints.length; i++) {
                d += ` L ${waypoints[i].x} ${waypoints[i].y}`;
            }

            path.setAttribute('d', d);
            path.setAttribute('stroke', colors[direction]);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', '0.3');
            path.classList.add('path-line');

            svg.appendChild(path);
            pathsContainer.appendChild(svg);
        });
    }

    /**
     * Hide vehicle paths
     */
    hidePaths() {
        const pathsContainer = document.getElementById('paths-container');
        if (pathsContainer) {
            pathsContainer.remove();
        }
    }

    /**
     * Setup panel toggle
     */
    setupPanelToggle() {
        const toggleButton = document.getElementById('panel-toggle');
        const panelContent = document.getElementById('panel-content');

        toggleButton.addEventListener('click', () => {
            if (this.isPanelCollapsed) {
                // Expand
                panelContent.classList.remove('collapsed');
                toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
                this.isPanelCollapsed = false;
            } else {
                // Collapse
                panelContent.classList.add('collapsed');
                toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
                this.isPanelCollapsed = true;
            }
        });
    }

    /**
     * Update control states
     */
    updateControlStates() {
        const startButton = document.getElementById('btn-start');
        const pauseButton = document.getElementById('btn-pause');

        if (this.simulation.state.isRunning && !this.simulation.state.isPaused) {
            startButton.disabled = true;
            pauseButton.disabled = false;
            startButton.innerHTML = '<i class="fas fa-play"></i> Running';
        } else if (this.simulation.state.isPaused) {
            startButton.disabled = false;
            pauseButton.disabled = true;
            startButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            startButton.disabled = false;
            pauseButton.disabled = true;
            startButton.innerHTML = '<i class="fas fa-play"></i> Start';
        }
    }

    /**
     * Add tooltip
     * @param {HTMLElement} element 
     * @param {string} text 
     */
    addTooltip(element, text) {
        let tooltip = null;

        element.addEventListener('mouseenter', (e) => {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = text;

            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 10}px`;
            tooltip.style.transform = 'translate(-50%, -100%)';

            document.body.appendChild(tooltip);

            setTimeout(() => {
                if (tooltip) tooltip.style.opacity = '1';
            }, 10);
        });

        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
    }

    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        // Add tooltips to control buttons
        const tooltips = [
            { selector: '#btn-start', text: 'Start Simulation' },
            { selector: '#btn-pause', text: 'Pause Simulation' },
            { selector: '#btn-reset', text: 'Reset Simulation to Initial State' },
            { selector: '#speed-slider', text: 'Adjust Simulation Speed (0.5x - 3.0x)' },
            { selector: '#density-slider', text: 'Adjust Vehicle Spawn Density' },
            { selector: '#toggle-grid', text: 'Show/Hide Grid' },
            { selector: '#toggle-paths', text: 'Show/Hide Vehicle Paths' }
        ];

        tooltips.forEach(({ selector, text }) => {
            const element = document.querySelector(selector);
            if (element) {
                this.addTooltip(element, text);
            }
        });
    }
}

// Initialize UI Controls
document.addEventListener('DOMContentLoaded', () => {
    const uiControls = new UIControls();
    uiControls.initializeTooltips();

    // Initial path display
    if (CONFIG.VISUAL.SHOW_PATHS) {
        uiControls.showPaths();
    }

    console.log('UI Controls Initialized');
});