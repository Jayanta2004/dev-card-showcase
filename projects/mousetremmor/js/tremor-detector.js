/* ============================================
   MOUSE TREMOR ART - TREMOR DETECTOR
   High-frequency mouse tracking and tremor detection
   ============================================ */

(function() {
    'use strict';

    /* ============================================
       TREMOR DETECTOR CLASS
       ============================================ */

    class TremorDetector {
        constructor() {
            // Movement tracking
            this.currentPosition = { x: 0, y: 0 };
            this.previousPosition = { x: 0, y: 0 };
            this.lastTimestamp = 0;
            
            // Delta calculations
            this.deltaX = 0;
            this.deltaY = 0;
            this.deltaDistance = 0;
            this.deltaTime = 0;
            
            // Velocity and acceleration
            this.velocity = { x: 0, y: 0, magnitude: 0 };
            this.previousVelocity = { x: 0, y: 0, magnitude: 0 };
            this.acceleration = { x: 0, y: 0, magnitude: 0 };
            
            // Tremor metrics
            this.tremorIntensity = 0;
            this.rawTremorIntensity = 0;
            this.smoothedTremorIntensity = 0;
            
            // Movement history buffer (circular array)
            this.historySize = 30;
            this.movementHistory = [];
            this.historyIndex = 0;
            
            // Settings
            this.sensitivity = 1.0;
            this.smoothingFactor = 0.3;
            this.minMovementThreshold = 0.5;
            
            // State
            this.isTracking = false;
            this.hasStarted = false;
            this.totalPoints = 0;
            
            // Callbacks
            this.onTremorDetected = null;
            this.onMovementStart = null;
            this.onMovementEnd = null;
            
            // Timing
            this.lastMovementTime = 0;
            this.movementTimeout = null;
            this.idleThreshold = 100; // ms
            
            // Initialize
            this.initializeHistory();
        }

        /* ============================================
           INITIALIZATION
           ============================================ */

        initializeHistory() {
            for (let i = 0; i < this.historySize; i++) {
                this.movementHistory.push({
                    x: 0,
                    y: 0,
                    timestamp: 0,
                    velocity: 0,
                    acceleration: 0,
                    tremorIntensity: 0
                });
            }
        }

        /* ============================================
           CONFIGURATION
           ============================================ */

        setSensitivity(value) {
            this.sensitivity = Math.max(0.1, Math.min(5.0, value));
        }

        setSmoothing(value) {
            // Convert percentage (0-100) to factor (0-1)
            this.smoothingFactor = Math.max(0, Math.min(1, value / 100));
        }

        /* ============================================
           TRACKING CONTROL
           ============================================ */

        startTracking() {
            this.isTracking = true;
            this.hasStarted = false;
        }

        stopTracking() {
            this.isTracking = false;
            this.resetState();
        }

        resetState() {
            this.deltaX = 0;
            this.deltaY = 0;
            this.deltaDistance = 0;
            this.velocity = { x: 0, y: 0, magnitude: 0 };
            this.acceleration = { x: 0, y: 0, magnitude: 0 };
            this.tremorIntensity = 0;
            this.rawTremorIntensity = 0;
            this.smoothedTremorIntensity = 0;
            this.totalPoints = 0;
        }

        /* ============================================
           MOUSE POSITION UPDATE
           ============================================ */

        updatePosition(x, y, timestamp = performance.now()) {
            if (!this.isTracking) return null;

            // Store previous position
            this.previousPosition.x = this.currentPosition.x;
            this.previousPosition.y = this.currentPosition.y;

            // Update current position
            this.currentPosition.x = x;
            this.currentPosition.y = y;

            // Calculate time delta
            this.deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;

            // Skip first frame (no previous position)
            if (!this.hasStarted) {
                this.hasStarted = true;
                return null;
            }

            // Calculate deltas
            this.calculateDeltas();

            // Check movement threshold
            if (this.deltaDistance < this.minMovementThreshold) {
                return null;
            }

            // Calculate velocity and acceleration
            this.calculateVelocity();
            this.calculateAcceleration();

            // Calculate tremor intensity
            this.calculateTremorIntensity();

            // Update movement history
            this.updateHistory(timestamp);

            // Track movement timing
            this.trackMovement();

            // Increment point counter
            this.totalPoints++;

            // Return tremor data
            return this.getTremorData();
        }

        /* ============================================
           DELTA CALCULATIONS
           ============================================ */

        calculateDeltas() {
            this.deltaX = this.currentPosition.x - this.previousPosition.x;
            this.deltaY = this.currentPosition.y - this.previousPosition.y;
            this.deltaDistance = Math.sqrt(
                this.deltaX * this.deltaX + 
                this.deltaY * this.deltaY
            );
        }

        /* ============================================
           VELOCITY CALCULATIONS
           ============================================ */

        calculateVelocity() {
            // Store previous velocity
            this.previousVelocity.x = this.velocity.x;
            this.previousVelocity.y = this.velocity.y;
            this.previousVelocity.magnitude = this.velocity.magnitude;

            // Calculate current velocity (pixels per millisecond)
            if (this.deltaTime > 0) {
                this.velocity.x = this.deltaX / this.deltaTime;
                this.velocity.y = this.deltaY / this.deltaTime;
                this.velocity.magnitude = this.deltaDistance / this.deltaTime;
            } else {
                this.velocity.x = 0;
                this.velocity.y = 0;
                this.velocity.magnitude = 0;
            }
        }

        /* ============================================
           ACCELERATION CALCULATIONS
           ============================================ */

        calculateAcceleration() {
            // Calculate acceleration (change in velocity)
            if (this.deltaTime > 0) {
                this.acceleration.x = (this.velocity.x - this.previousVelocity.x) / this.deltaTime;
                this.acceleration.y = (this.velocity.y - this.previousVelocity.y) / this.deltaTime;
                this.acceleration.magnitude = Math.sqrt(
                    this.acceleration.x * this.acceleration.x +
                    this.acceleration.y * this.acceleration.y
                );
            } else {
                this.acceleration.x = 0;
                this.acceleration.y = 0;
                this.acceleration.magnitude = 0;
            }
        }

        /* ============================================
           TREMOR INTENSITY CALCULATION
           ============================================ */

        calculateTremorIntensity() {
            // Base tremor calculation from acceleration and velocity changes
            const velocityChange = Math.abs(this.velocity.magnitude - this.previousVelocity.magnitude);
            const accelerationMagnitude = this.acceleration.magnitude;
            
            // Combine factors with weights
            const velocityWeight = 0.4;
            const accelerationWeight = 0.6;
            
            this.rawTremorIntensity = (
                velocityChange * velocityWeight +
                accelerationMagnitude * accelerationWeight
            ) * this.sensitivity;

            // Apply smoothing using exponential moving average
            if (this.smoothingFactor > 0) {
                this.smoothedTremorIntensity = 
                    this.smoothedTremorIntensity * this.smoothingFactor +
                    this.rawTremorIntensity * (1 - this.smoothingFactor);
            } else {
                this.smoothedTremorIntensity = this.rawTremorIntensity;
            }

            // Final tremor intensity
            this.tremorIntensity = this.smoothedTremorIntensity;

            // Clamp to reasonable range
            this.tremorIntensity = Math.max(0, Math.min(100, this.tremorIntensity));
        }

        /* ============================================
           MOVEMENT HISTORY
           ============================================ */

        updateHistory(timestamp) {
            // Circular buffer implementation
            const entry = this.movementHistory[this.historyIndex];
            
            entry.x = this.currentPosition.x;
            entry.y = this.currentPosition.y;
            entry.timestamp = timestamp;
            entry.velocity = this.velocity.magnitude;
            entry.acceleration = this.acceleration.magnitude;
            entry.tremorIntensity = this.tremorIntensity;

            // Move to next index
            this.historyIndex = (this.historyIndex + 1) % this.historySize;
        }

        getHistory(count = 10) {
            const history = [];
            const actualCount = Math.min(count, this.historySize);
            
            for (let i = 0; i < actualCount; i++) {
                const index = (this.historyIndex - i - 1 + this.historySize) % this.historySize;
                history.push({ ...this.movementHistory[index] });
            }
            
            return history;
        }

        /* ============================================
           MOVEMENT TRACKING
           ============================================ */

        trackMovement() {
            const now = performance.now();
            
            // Check if this is a new movement
            if (now - this.lastMovementTime > this.idleThreshold) {
                if (this.onMovementStart) {
                    this.onMovementStart();
                }
            }

            this.lastMovementTime = now;

            // Clear existing timeout
            if (this.movementTimeout) {
                clearTimeout(this.movementTimeout);
            }

            // Set new timeout for movement end
            this.movementTimeout = setTimeout(() => {
                if (this.onMovementEnd) {
                    this.onMovementEnd();
                }
            }, this.idleThreshold);
        }

        /* ============================================
           DATA RETRIEVAL
           ============================================ */

        getTremorData() {
            return {
                position: {
                    x: this.currentPosition.x,
                    y: this.currentPosition.y
                },
                previousPosition: {
                    x: this.previousPosition.x,
                    y: this.previousPosition.y
                },
                delta: {
                    x: this.deltaX,
                    y: this.deltaY,
                    distance: this.deltaDistance
                },
                velocity: {
                    x: this.velocity.x,
                    y: this.velocity.y,
                    magnitude: this.velocity.magnitude
                },
                acceleration: {
                    x: this.acceleration.x,
                    y: this.acceleration.y,
                    magnitude: this.acceleration.magnitude
                },
                tremorIntensity: this.tremorIntensity,
                rawTremorIntensity: this.rawTremorIntensity,
                smoothedTremorIntensity: this.smoothedTremorIntensity,
                timestamp: this.lastTimestamp
            };
        }

        getTremorIntensity() {
            return this.tremorIntensity;
        }

        getTotalPoints() {
            return this.totalPoints;
        }

        /* ============================================
           STATISTICS
           ============================================ */

        getStatistics() {
            const history = this.getHistory(this.historySize);
            
            if (history.length === 0) {
                return {
                    avgVelocity: 0,
                    maxVelocity: 0,
                    avgAcceleration: 0,
                    maxAcceleration: 0,
                    avgTremorIntensity: 0,
                    maxTremorIntensity: 0
                };
            }

            const velocities = history.map(h => h.velocity);
            const accelerations = history.map(h => h.acceleration);
            const tremorIntensities = history.map(h => h.tremorIntensity);

            return {
                avgVelocity: this.average(velocities),
                maxVelocity: Math.max(...velocities),
                avgAcceleration: this.average(accelerations),
                maxAcceleration: Math.max(...accelerations),
                avgTremorIntensity: this.average(tremorIntensities),
                maxTremorIntensity: Math.max(...tremorIntensities)
            };
        }

        average(array) {
            if (array.length === 0) return 0;
            return array.reduce((sum, val) => sum + val, 0) / array.length;
        }

        /* ============================================
           CLEANUP
           ============================================ */

        destroy() {
            this.stopTracking();
            if (this.movementTimeout) {
                clearTimeout(this.movementTimeout);
            }
            this.movementHistory = [];
            this.onTremorDetected = null;
            this.onMovementStart = null;
            this.onMovementEnd = null;
        }
    }

    /* ============================================
       EXPORT TO GLOBAL SCOPE
       ============================================ */

    window.TremorDetector = TremorDetector;

})();
