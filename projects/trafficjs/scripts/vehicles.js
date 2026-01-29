/**
 * Vehicle Management System
 * Each vehicle is an independent entity
 */

class Vehicle {
    constructor(id, direction, type = 0, laneIndex = 0) {
        this.id = id;
        this.direction = direction; // 'north', 'south', 'east', 'west'
        this.type = type; // 0: Car, 1: SUV, 2: Truck
        this.laneIndex = laneIndex; // 0 or 1

        // Physics state
        this.position = { x: 0, y: 0 };
        this.speed = 0; // pixels/second
        this.targetSpeed = 0;
        this.acceleration = 0;

        // Path tracking
        // Get waypoints specifically for this lane
        this.waypoints = CONFIG.ROAD_LAYOUT.GET_WAYPOINTS(direction, laneIndex);
        this.currentWaypointIndex = 0;
        this.pathProgress = 0; // Between 0 and 1

        // Behavior state
        this.state = 'SPAWNING'; // 'SPAWNING', 'ACCELERATING', 'CRUISING', 'DECELERATING', 'STOPPED', 'LEAVING'
        this.isBraking = false;
        this.hasStopped = false;

        // Visual elements
        this.element = null;
        this.createVisualElement();

        // Initialize position
        this.initializePosition();

        // Random speed variation
        const speedVariation = 1 + (Math.random() - 0.5) * CONFIG.VEHICLE_PHYSICS.SPEED_VARIATION;
        this.maxSpeed = CONFIG.VEHICLE_PHYSICS.MAX_SPEED * speedVariation;
    }

    /**
     * Create vehicle visual element
     */
    createVisualElement() {
        const vehicleType = CONFIG.VISUAL.VEHICLE_TYPES[this.type];

        this.element = document.createElement('div');
        this.element.className = `vehicle ${this.direction}`;
        this.element.id = `vehicle-${this.id}`;
        this.element.style.width = `${vehicleType.width}px`;
        this.element.style.height = `${vehicleType.length}px`;
        this.element.style.backgroundColor = vehicleType.color;

        // Add headlights
        const headlights = document.createElement('div');
        headlights.className = 'vehicle-headlights left';
        this.element.appendChild(headlights);

        const headlights2 = document.createElement('div');
        headlights2.className = 'vehicle-headlights right';
        this.element.appendChild(headlights2);

        const brakelights = document.createElement('div');
        brakelights.className = 'vehicle-brakelights left';
        this.element.appendChild(brakelights);

        const brakelights2 = document.createElement('div');
        brakelights2.className = 'vehicle-brakelights right';
        this.element.appendChild(brakelights2);

        // Add vehicle ID label
        const idLabel = document.createElement('div');
        idLabel.className = 'vehicle-id';
        idLabel.textContent = `#${this.id}`;
        this.element.appendChild(idLabel);

        // Add to container
        document.getElementById('vehicles-container').appendChild(this.element);
    }

    /**
     * Initialize vehicle position
     */
    initializePosition() {
        if (this.waypoints.length > 0) {
            const startPoint = this.waypoints[0];
            this.position = { x: startPoint.x, y: startPoint.y };
            this.updateVisualPosition();
        } else {
            console.error(`No waypoints found for vehicle ${this.id} (${this.direction})`);
        }
    }

    /**
     * Update vehicle physics state
     * @param {number} deltaTime - Time elapsed (seconds)
     * @param {Array} nearbyVehicles - Nearby vehicles
     */
    update(deltaTime, nearbyVehicles) {
        // Update state machine
        this.updateState(deltaTime);

        // Calculate target speed
        this.calculateTargetSpeed(nearbyVehicles);

        // Update acceleration
        this.updateAcceleration(deltaTime);

        // Update speed
        this.updateSpeed(deltaTime);

        // Update position
        this.updatePosition(deltaTime);

        // Update visuals
        this.updateVisuals();

        // Check if leaving
        if (this.pathProgress >= 1) {
            this.state = 'LEAVING';
        }
    }

    /**
     * Update vehicle state
     * @param {number} deltaTime 
     */
    updateState(deltaTime) {
        switch (this.state) {
            case 'SPAWNING':
                this.state = 'ACCELERATING';
                break;

            case 'ACCELERATING':
                if (this.speed >= this.maxSpeed * 0.9) {
                    this.state = 'CRUISING';
                }
                break;

            case 'DECELERATING':
                if (this.speed <= 5) {
                    this.state = 'STOPPED';
                    this.speed = 0;
                    this.hasStopped = true;
                }
                break;

            case 'STOPPED':
                // Check if can accelerate again
                if (trafficLightSystem.canPass(this.direction) && this.hasStopped) {
                    this.state = 'ACCELERATING';
                    this.hasStopped = false;
                }
                break;
        }
    }

    /**
     * Calculate target speed
     * @param {Array} nearbyVehicles 
     */
    calculateTargetSpeed(nearbyVehicles) {
        // Default target speed
        this.targetSpeed = this.maxSpeed;

        // Check traffic lights
        const nextWaypoint = this.getNextWaypoint();

        if (nextWaypoint) {
            const distanceToIntersection = this.calculateDistanceToIntersection();

            // ONLY check light if we are approaching it (positive distance) 
            // and close enough (e.g., within 300px) but not past it needs check
            if (distanceToIntersection > -50 && distanceToIntersection < 400) {
                if (trafficLightSystem.shouldPrepareToStop(this.direction, distanceToIntersection, this.speed)) {
                    this.targetSpeed = 0;
                    this.state = 'DECELERATING';
                    // We only want to RETURN here if we are actually stopping due to light
                    // Because we still need to check for leading vehicles!
                    // Actually, if we stop for light, we stop. Leading vehicle check might set speed even lower (e.g. stopped car ahead).
                    // So we should NOT return, but continue to find min speed.
                }

                if (!trafficLightSystem.canPass(this.direction)) {
                    // Check if we are past the stop line (tolerant -10px)
                    // If distanceToIntersection is negative, we are past stop line
                    if (distanceToIntersection > -20) {
                        const stopLine = CONFIG.ROAD_LAYOUT.STOP_LINES[this.direction.toUpperCase()];

                        // Determine stopping distance
                        const requiredSpeed = this.calculateStoppingSpeed(distanceToIntersection);
                        if (requiredSpeed !== null) {
                            this.targetSpeed = Math.min(this.targetSpeed, requiredSpeed);
                        }
                    }
                }
            }
        }

        // Check vehicle in front (ONLY in same lane!)
        const leadingVehicle = this.findLeadingVehicle(nearbyVehicles);
        if (leadingVehicle) {
            const safeDistance = this.calculateSafeFollowingDistance();
            const actualDistance = this.calculateDistanceToVehicle(leadingVehicle);

            if (actualDistance < safeDistance) {
                // Too close, slow down
                const distanceRatio = Math.max(0, actualDistance / safeDistance);

                // Aggressive braking if very close
                let targetFactor = distanceRatio;
                if (actualDistance < CONFIG.VEHICLE_PHYSICS.MIN_FOLLOWING_DISTANCE) {
                    targetFactor = 0; // Emergency stop
                }

                this.targetSpeed = Math.min(
                    this.targetSpeed,
                    leadingVehicle.speed * targetFactor,
                    this.maxSpeed * targetFactor // Also limit by own max speed scaled
                );
            }
        }

        // Ensure target speed does not exceed max speed
        this.targetSpeed = Math.min(this.targetSpeed, this.maxSpeed);
    }

    calculateStoppingSpeed(distance) {
        if (distance <= 0) return 0;
        const deceleration = CONFIG.VEHICLE_PHYSICS.DECELERATION;
        // v^2 = u^2 + 2as => v = sqrt(2 * a * s)
        // Here we want final speed 0, so init speed u = sqrt(2 * dec * dist)
        return Math.sqrt(2 * deceleration * distance);
    }

    /**
     * Update acceleration
     * @param {number} deltaTime 
     */
    updateAcceleration(deltaTime) {
        const speedDiff = this.targetSpeed - this.speed;

        if (Math.abs(speedDiff) < 1) {
            this.acceleration = 0;
            // Snap to target if very close
            if (Math.abs(this.speed - this.targetSpeed) < 1) {
                this.speed = this.targetSpeed;
            }
            return;
        }

        if (speedDiff > 0) {
            // Accelerate
            this.acceleration = CONFIG.VEHICLE_PHYSICS.ACCELERATION;
            this.isBraking = false;
        } else {
            // Decelerate
            this.acceleration = -CONFIG.VEHICLE_PHYSICS.DECELERATION;
            this.isBraking = true;
        }
    }

    /**
     * Update speed
     * @param {number} deltaTime 
     */
    updateSpeed(deltaTime) {
        this.speed += this.acceleration * deltaTime;
        this.speed = Math.max(0, Math.min(this.maxSpeed, this.speed));

        // If target speed is 0 and current speed is low, set to 0 directly
        if (this.targetSpeed === 0 && this.speed < 5) {
            this.speed = 0;
            this.acceleration = 0;
        }
    }

    /**
     * Update position
     * @param {number} deltaTime 
     */
    updatePosition(deltaTime) {
        if (this.speed === 0) return;

        const distance = this.speed * deltaTime;
        const currentWaypoint = this.getCurrentWaypoint();
        const nextWaypoint = this.getNextWaypoint();

        if (!nextWaypoint) {
            this.pathProgress = 1;
            return;
        }

        // Calculate vector to next waypoint
        const dx = nextWaypoint.x - currentWaypoint.x;
        const dy = nextWaypoint.y - currentWaypoint.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        if (segmentLength === 0) {
            this.currentWaypointIndex++;
            return;
        }

        // Calculate distance from current position to next waypoint
        const toNextDx = nextWaypoint.x - this.position.x;
        const toNextDy = nextWaypoint.y - this.position.y;
        const distanceToNext = Math.sqrt(toNextDx * toNextDy);

        // Calculate distance move this frame
        const moveDistance = Math.min(distance, distanceToNext);

        // Calculate move direction
        const directionX = dx / segmentLength;
        const directionY = dy / segmentLength;

        // Update position
        this.position.x += directionX * moveDistance;
        this.position.y += directionY * moveDistance;

        // Update path progress
        // Approximate total progress
        const segmentProgress = 1 - (distanceToNext - moveDistance) / segmentLength;
        this.pathProgress = (this.currentWaypointIndex + segmentProgress) / (this.waypoints.length - 1);

        // Check if reached waypoint
        if (distanceToNext <= moveDistance) { // Use exact match tolerance
            this.currentWaypointIndex++;
            this.position.x = nextWaypoint.x;
            this.position.y = nextWaypoint.y;
        }
    }

    /**
     * Update visual state
     */
    updateVisuals() {
        // Update position
        this.updateVisualPosition();

        // Update brake lights
        if (this.isBraking) {
            this.element.classList.add('braking');
        } else {
            this.element.classList.remove('braking');
        }

        // Update opacity (fade out when leaving)
        if (this.state === 'LEAVING') {
            const opacity = 1 - (this.pathProgress - 0.9) * 10;
            this.element.style.opacity = Math.max(0, opacity);
        }
    }

    /**
     * Update visual position
     */
    updateVisualPosition() {
        this.element.style.transform = `
            translate(${this.position.x - 15}px, ${this.position.y - 25}px)
            rotate(${this.getRotation()}deg)
        `;
    }

    /**
     * Get vehicle rotation angle
     * @returns {number} Rotation angle
     */
    getRotation() {
        switch (this.direction) {
            case 'north': return 180;
            case 'south': return 0;
            case 'east': return -90;
            case 'west': return 90;
            default: return 0;
        }
    }

    /**
     * Get current waypoint
     * @returns {Object} Waypoint coordinates
     */
    getCurrentWaypoint() {
        return this.waypoints[Math.min(this.currentWaypointIndex, this.waypoints.length - 1)];
    }

    /**
     * Get next waypoint
     * @returns {Object} Waypoint coordinates or null
     */
    getNextWaypoint() {
        const nextIndex = this.currentWaypointIndex + 1;
        return nextIndex < this.waypoints.length ? this.waypoints[nextIndex] : null;
    }

    /**
     * Calculate distance to intersection
     * @returns {number} Distance
     */
    calculateDistanceToIntersection() {
        const stopLine = CONFIG.ROAD_LAYOUT.STOP_LINES[this.direction.toUpperCase()];

        switch (this.direction) {
            case 'north':
                // Moving down (positive Y), stop line is Y value
                // If pos.y < stopLine, dist is +ve
                return stopLine - this.position.y;
            case 'south':
                // Moving up (negative Y), stop line is Y value
                // Position starts high, goes low. stopline is 510. pos is > 510.
                return this.position.y - stopLine;
            case 'east':
                // Moving left (negative X)
                return this.position.x - stopLine;
            case 'west':
                // Moving right (positive X)
                return stopLine - this.position.x;
            default:
                return Infinity;
        }
    }

    /**
     * Calculate safe following distance
     * @returns {number} Safe distance
     */
    calculateSafeFollowingDistance() {
        return Math.max(
            CONFIG.VEHICLE_PHYSICS.MIN_FOLLOWING_DISTANCE,
            this.speed * CONFIG.VEHICLE_PHYSICS.SAFE_DISTANCE_FACTOR
        );
    }

    /**
     * Find leading vehicle
     * @param {Array} vehicles 
     * @returns {Vehicle|null}
     */
    findLeadingVehicle(vehicles) {
        let closestVehicle = null;
        let closestDistance = Infinity;

        for (const vehicle of vehicles) {
            // Must be same direction AND SAME LANE
            if (vehicle.id === this.id ||
                vehicle.direction !== this.direction ||
                vehicle.laneIndex !== this.laneIndex) {
                continue;
            }

            // Check if ahead
            let isAhead = false;
            switch (this.direction) {
                case 'north':
                    // Moving +Y. Ahead means Y > my Y
                    isAhead = vehicle.position.y > this.position.y;
                    break;
                case 'south':
                    // Moving -Y. Ahead means Y < my Y
                    isAhead = vehicle.position.y < this.position.y;
                    break;
                case 'east':
                    // Moving -X. Ahead means X < my X
                    isAhead = vehicle.position.x < this.position.x;
                    break;
                case 'west':
                    // Moving +X. Ahead means X > my X
                    isAhead = vehicle.position.x > this.position.x;
                    break;
            }

            if (isAhead) {
                const distance = this.calculateDistanceToVehicle(vehicle);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestVehicle = vehicle;
                }
            }
        }

        return closestVehicle;
    }

    /**
     * Calculate distance to another vehicle
     * @param {Vehicle} vehicle 
     * @returns {number}
     */
    calculateDistanceToVehicle(vehicle) {
        // Simple Euclidean distance
        // For traffic, mainly concerned with longitudinal distance
        const dx = vehicle.position.x - this.position.x;
        const dy = vehicle.position.y - this.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if vehicle should be removed
     * @returns {boolean}
     */
    shouldRemove() {
        return this.pathProgress >= 1 ||
            this.position.y < -150 ||
            this.position.y > 950 ||
            this.position.x < -150 ||
            this.position.x > 950;
    }

    /**
     * Remove vehicle
     */
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
    }
}

class VehicleManager {
    constructor() {
        this.vehicles = new Map();
        this.nextVehicleId = 1;
        this.spawnTimer = 0;
        this.spawnInterval = CONFIG.CONTROLS.DENSITY_LEVELS[4]; // Default medium density
        this.stats = {
            totalSpawned: 0,
            totalDespawned: 0,
            maxConcurrent: 0
        };
    }

    /**
     * Update all vehicles
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        // Spawn new vehicle
        this.updateSpawning(deltaTime);

        // Update existing vehicles
        const vehicleArray = Array.from(this.vehicles.values());

        // Update each vehicle
        vehicleArray.forEach(vehicle => {
            const nearbyVehicles = vehicleArray.filter(v => v.id !== vehicle.id);
            vehicle.update(deltaTime, nearbyVehicles);
        });

        // Remove leaving vehicles
        this.removeFinishedVehicles();

        // Update stats
        this.updateStats();
    }

    /**
     * Update vehicle spawning
     * @param {number} deltaTime 
     */
    updateSpawning(deltaTime) {
        if (this.vehicles.size >= CONFIG.SIMULATION.MAX_VEHICLES) {
            return;
        }

        this.spawnTimer += deltaTime * 1000; // Convert to ms

        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;

            // Randomly select direction
            const directions = ['north', 'south', 'east', 'west'];
            const direction = directions[Math.floor(Math.random() * directions.length)];

            // Randomly select lane (0 or 1)
            const laneIndex = Math.floor(Math.random() * 2);

            // Check if there is space to spawn new vehicle
            if (this.canSpawnInDirection(direction, laneIndex)) {
                this.spawnVehicle(direction, laneIndex);
            }

            // Randomize spawn interval
            const variation = 0.3; // ±30%
            const baseInterval = this.spawnInterval;
            const minInterval = baseInterval * (1 - variation);
            const maxInterval = baseInterval * (1 + variation);
            this.spawnInterval = minInterval + Math.random() * (maxInterval - minInterval);
        }
    }

    /**
     * Check if can spawn new vehicle
     * @param {string} direction 
     * @param {number} laneIndex
     * @returns {boolean}
     */
    canSpawnInDirection(direction, laneIndex) {
        const spawnArea = 120; // pixels safe distance
        const vehiclesInLane = Array.from(this.vehicles.values())
            .filter(v => v.direction === direction && v.laneIndex === laneIndex);

        // Check if spawn area has vehicles
        for (const vehicle of vehiclesInLane) {
            let distance;
            switch (direction) {
                case 'north':
                    // Spawn at -100. Existing vehicle at Y. Dist = Y - (-100) = Y + 100
                    distance = vehicle.position.y + 100;
                    break;
                case 'south':
                    // Spawn at 900. Existing vehicle at Y. Dist = 900 - Y
                    distance = 900 - vehicle.position.y;
                    break;
                case 'east':
                    // Spawn at 900. Existing vehicle at X. Dist = 900 - X
                    distance = 900 - vehicle.position.x;
                    break;
                case 'west':
                    // Spawn at -100. Existing vehicle at X. Dist = X + 100
                    distance = vehicle.position.x + 100;
                    break;
            }

            if (distance < spawnArea) {
                return false;
            }
        }

        return true;
    }

    /**
     * Spawn new vehicle
     * @param {string} direction 
     * @param {number} laneIndex
     */
    spawnVehicle(direction, laneIndex) {
        const type = Math.floor(Math.random() * CONFIG.VISUAL.VEHICLE_TYPES.length);
        const vehicle = new Vehicle(this.nextVehicleId++, direction, type, laneIndex);
        this.vehicles.set(vehicle.id, vehicle);
        this.stats.totalSpawned++;
    }

    /**
     * Remove finished vehicles
     */
    removeFinishedVehicles() {
        const toRemove = [];

        for (const [id, vehicle] of this.vehicles) {
            if (vehicle.shouldRemove()) {
                toRemove.push(id);
            }
        }

        toRemove.forEach(id => {
            const vehicle = this.vehicles.get(id);
            vehicle.remove();
            this.vehicles.delete(id);
            this.stats.totalDespawned++;
        });
    }

    /**
     * Update statistics
     */
    updateStats() {
        const currentCount = this.vehicles.size;
        if (currentCount > this.stats.maxConcurrent) {
            this.stats.maxConcurrent = currentCount;
        }
    }

    /**
     * Set spawn density
     * @param {number} densityLevel 1-10
     */
    setDensity(densityLevel) {
        const level = Math.max(1, Math.min(10, densityLevel));
        this.spawnInterval = CONFIG.CONTROLS.DENSITY_LEVELS[level - 1];
    }

    /**
     * Get current vehicle count
     * @returns {number}
     */
    getVehicleCount() {
        return this.vehicles.size;
    }

    /**
     * Get statistics
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            current: this.vehicles.size
        };
    }

    /**
     * Reset vehicle manager
     */
    reset() {
        // Remove all vehicles
        this.vehicles.forEach(vehicle => vehicle.remove());
        this.vehicles.clear();

        // Reset state
        this.nextVehicleId = 1;
        this.spawnTimer = 0;
        this.spawnInterval = CONFIG.CONTROLS.DENSITY_LEVELS[4];
        this.stats = {
            totalSpawned: 0,
            totalDespawned: 0,
            maxConcurrent: 0
        };
    }
}

// Create global instance
const vehicleManager = new VehicleManager();