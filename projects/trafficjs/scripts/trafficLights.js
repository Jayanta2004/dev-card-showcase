/**
 * Traffic Light Management System
 * Implemented based on Finite State Machine (FSM)
 */

class TrafficLightSystem {
    constructor() {
        this.state = {
            // Current State
            currentDirection: 'NS', // 'NS' or 'EW'
            currentLight: 'RED',    // 'RED', 'YELLOW', 'GREEN'

            // Timer
            timer: 0,
            elapsedTime: 0,

            // State Duration
            durations: {
                NS_GREEN: CONFIG.TRAFFIC_LIGHTS.NS.GREEN,
                NS_YELLOW: CONFIG.TRAFFIC_LIGHTS.NS.YELLOW,
                EW_GREEN: CONFIG.TRAFFIC_LIGHTS.EW.GREEN,
                EW_YELLOW: CONFIG.TRAFFIC_LIGHTS.EW.YELLOW
            },

            // History
            history: []
        };

        // Transition Table
        this.transitions = {
            'NS_GREEN': {
                next: 'NS_YELLOW',
                condition: (time) => time >= this.state.durations.NS_GREEN
            },
            'NS_YELLOW': {
                next: 'EW_GREEN',
                condition: (time) => time >= this.state.durations.NS_YELLOW
            },
            'EW_GREEN': {
                next: 'EW_YELLOW',
                condition: (time) => time >= this.state.durations.EW_GREEN
            },
            'EW_YELLOW': {
                next: 'NS_GREEN',
                condition: (time) => time >= this.state.durations.EW_YELLOW
            }
        };

        this.initializeLights();
    }

    /**
     * Initialize Traffic Light DOM Elements
     */
    initializeLights() {
        this.lightElements = {
            north: {
                red: document.querySelector('.traffic-light-container.north .light.red'),
                yellow: document.querySelector('.traffic-light-container.north .light.yellow'),
                green: document.querySelector('.traffic-light-container.north .light.green')
            },
            south: {
                red: document.querySelector('.traffic-light-container.south .light.red'),
                yellow: document.querySelector('.traffic-light-container.south .light.yellow'),
                green: document.querySelector('.traffic-light-container.south .light.green')
            },
            east: {
                red: document.querySelector('.traffic-light-container.east .light.red'),
                yellow: document.querySelector('.traffic-light-container.east .light.yellow'),
                green: document.querySelector('.traffic-light-container.east .light.green')
            },
            west: {
                red: document.querySelector('.traffic-light-container.west .light.red'),
                yellow: document.querySelector('.traffic-light-container.west .light.yellow'),
                green: document.querySelector('.traffic-light-container.west .light.green')
            }
        };
    }

    /**
     * Update traffic light state
     * @param {number} deltaTime - Time elapsed (seconds)
     */
    update(deltaTime) {
        this.state.elapsedTime += deltaTime;
        this.state.timer += deltaTime;

        const currentState = `${this.state.currentDirection}_${this.state.currentLight}`;
        const transition = this.transitions[currentState];

        // Check if transition is needed
        if (transition && transition.condition(this.state.timer)) {
            this.transitionTo(transition.next);
        }

        // Log history
        if (this.state.history.length >= CONFIG.PERFORMANCE.MAX_HISTORY) {
            this.state.history.shift();
        }
        this.state.history.push({
            timestamp: Date.now(),
            direction: this.state.currentDirection,
            light: this.state.currentLight,
            timer: this.state.timer
        });
    }

    /**
     * Execute state transition
     * @param {string} nextState - Next state
     */
    transitionTo(nextState) {
        const [direction, light] = nextState.split('_');
        const previousState = `${this.state.currentDirection}_${this.state.currentLight}`;

        // Reset timer
        this.state.timer = 0;
        this.state.currentDirection = direction;
        this.state.currentLight = light;

        // Update visual state
        this.updateLightVisuals();

        // Log transition
        console.log(`Traffic light transition: ${previousState} -> ${nextState}`);

        // Trigger event
        this.triggerEvent('trafficLightChange', {
            previous: previousState,
            current: nextState,
            timestamp: Date.now()
        });
    }

    /**
     * Update traffic light visuals
     */
    updateLightVisuals() {
        // Reset all lights
        Object.values(this.lightElements).forEach(direction => {
            Object.values(direction).forEach(light => {
                light.classList.remove('active');
            });
        });

        // Set current active light
        const currentDirection = this.state.currentDirection;
        const currentLight = this.state.currentLight.toLowerCase();

        if (currentDirection === 'NS') {
            // North-South
            this.lightElements.north[currentLight].classList.add('active');
            this.lightElements.south[currentLight].classList.add('active');

            // East-West set to red
            this.lightElements.east.red.classList.add('active');
            this.lightElements.west.red.classList.add('active');
        } else {
            // East-West
            this.lightElements.east[currentLight].classList.add('active');
            this.lightElements.west[currentLight].classList.add('active');

            // North-South set to red
            this.lightElements.north.red.classList.add('active');
            this.lightElements.south.red.classList.add('active');
        }
    }

    /**
     * Get current signal state
     * @returns {Object} Current state info
     */
    getCurrentState() {
        return {
            direction: this.state.currentDirection,
            light: this.state.currentLight,
            timer: this.state.timer,
            timeRemaining: this.getTimeRemaining()
        };
    }

    /**
     * Get time remaining for current state
     * @returns {number} Time remaining (seconds)
     */
    getTimeRemaining() {
        const currentState = `${this.state.currentDirection}_${this.state.currentLight}`;
        const duration = this.state.durations[currentState];
        return Math.max(0, duration - this.state.timer);
    }

    /**
     * Check if direction is allowed to pass
     * @param {string} direction - Direction ('north', 'south', 'east', 'west')
     * @returns {boolean}
     */
    canPass(direction) {
        const dirMap = {
            'north': 'NS',
            'south': 'NS',
            'east': 'EW',
            'west': 'EW'
        };

        const currentDirection = this.state.currentDirection;
        const currentLight = this.state.currentLight;

        // Check if direction matches
        if (dirMap[direction] !== currentDirection) {
            return false;
        }

        // Check light color
        return currentLight === 'GREEN' ||
            (currentLight === 'YELLOW' && this.state.timer < CONFIG.TRAFFIC_LIGHTS.SAFETY_INTERVAL);
    }

    /**
     * Check if vehicle should prepare to stop
     * @param {string} direction 
     * @param {number} distanceToIntersection 
     * @param {number} speed 
     * @returns {boolean}
     */
    shouldPrepareToStop(direction, distanceToIntersection, speed) {
        if (this.canPass(direction)) {
            return false;
        }

        // Calculate safe stop distance
        const deceleration = CONFIG.VEHICLE_PHYSICS.DECELERATION;
        const stopDistance = (speed * speed) / (2 * deceleration);

        // Add reaction distance
        const reactionDistance = speed * 0.5; // 0.5s reaction time

        return distanceToIntersection <= (stopDistance + reactionDistance);
    }

    /**
     * Update timing config
     * @param {string} direction - Direction ('NS' or 'EW')
     * @param {string} light - Light color ('GREEN' or 'YELLOW')
     * @param {number} duration - Duration (seconds)
     */
    updateTiming(direction, light, duration) {
        const key = `${direction}_${light}`;
        if (this.state.durations[key] !== undefined) {
            this.state.durations[key] = Math.max(1, duration); // Min 1 second

            // Update config
            if (direction === 'NS') {
                CONFIG.TRAFFIC_LIGHTS.NS[light] = duration;
            } else {
                CONFIG.TRAFFIC_LIGHTS.EW[light] = duration;
            }

            // If needed, apply state transition immediately
            if (this.state.currentDirection === direction &&
                this.state.currentLight === light &&
                this.state.timer >= duration) {
                const nextState = this.transitions[key].next;
                this.transitionTo(nextState);
            }

            console.log(`Update ${direction} ${light} timing to ${duration}s`);
        }
    }

    /**
     * Reset traffic light system
     */
    reset() {
        this.state = {
            currentDirection: 'NS',
            currentLight: 'RED',
            timer: 0,
            elapsedTime: 0,
            durations: {
                NS_GREEN: CONFIG.TRAFFIC_LIGHTS.NS.GREEN,
                NS_YELLOW: CONFIG.TRAFFIC_LIGHTS.NS.YELLOW,
                EW_GREEN: CONFIG.TRAFFIC_LIGHTS.EW.GREEN,
                EW_YELLOW: CONFIG.TRAFFIC_LIGHTS.EW.YELLOW
            },
            history: []
        };

        this.updateLightVisuals();
    }

    /**
     * Trigger event
     * @param {string} eventName 
     * @param {Object} detail 
     */
    triggerEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
}

// Create global instance
const trafficLightSystem = new TrafficLightSystem();