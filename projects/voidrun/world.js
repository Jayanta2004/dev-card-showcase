// world.js

class World {
    constructor() {
        this.tunnelRadius = 10;
        this.tunnelSegments = 32;
        this.segmentSpacing = 5;
        this.rings = [];
        this.obstacles = [];
        this.powerUps = [];
        this.maxRings = 30;
        this.nextRingZ = 0;
        this.obstacleSpawnChance = 0.3;
        this.powerUpSpawnChance = 0.15;
        this.minObstacleSpacing = 15;
        this.minPowerUpSpacing = 20;
        this.lastObstacleZ = -999;
        this.lastPowerUpZ = -999;
        this.score = 0;
        this.difficulty = 1;

        this.initialize();
    }

    initialize() {
        // Generate initial tunnel rings
        for (let i = 0; i < this.maxRings; i++) {
            this.rings.push(this.nextRingZ);
            this.nextRingZ += this.segmentSpacing;
        }
    }

    update(playerZ, playerSpeed, dt) {
        // Update difficulty based on score
        this.difficulty = 1 + Math.floor(this.score / 500) * 0.2;

        // Move rings and obstacles backward relative to player
        const moveDistance = playerSpeed * dt;

        // Remove rings that are behind player
        this.rings = this.rings.filter(z => z > playerZ - 20);

        // Add new rings ahead
        while (this.rings.length < this.maxRings) {
            this.rings.push(this.nextRingZ);

            // Spawn obstacles with difficulty scaling
            const obstacleSpacing = this.nextRingZ - this.lastObstacleZ;
            const adjustedChance = this.obstacleSpawnChance * this.difficulty;

            if (obstacleSpacing > this.minObstacleSpacing && Math.random() < adjustedChance) {
                this.spawnObstacle(this.nextRingZ);
                this.lastObstacleZ = this.nextRingZ;
            }

            // Spawn power-ups
            const powerUpSpacing = this.nextRingZ - this.lastPowerUpZ;
            if (powerUpSpacing > this.minPowerUpSpacing && Math.random() < this.powerUpSpawnChance) {
                this.spawnPowerUp(this.nextRingZ);
                this.lastPowerUpZ = this.nextRingZ;
            }

            this.nextRingZ += this.segmentSpacing;
        }

        // Remove obstacles and power-ups behind player
        this.obstacles = this.obstacles.filter(obs => obs.z > playerZ - 10);
        this.powerUps = this.powerUps.filter(p => p.z > playerZ - 10);

        // Update score based on distance traveled (with multiplier in engine)
        this.score += Math.floor(playerSpeed * dt * 10);
    }

    spawnObstacle(z) {
        // Random position on tunnel perimeter
        const angle = Math.random() * Math.PI * 2;
        const radiusOffset = 0.7; // Keep obstacles on tunnel surface

        // Random obstacle type
        const types = ['sphere', 'cube'];
        const type = types[Math.floor(Math.random() * types.length)];

        const obstacle = {
            x: Math.cos(angle) * this.tunnelRadius * radiusOffset,
            y: Math.sin(angle) * this.tunnelRadius * radiusOffset,
            z: z,
            radius: type === 'cube' ? 1.0 : 1.2,
            angle: angle,
            type: type,
            rotation: 0
        };

        this.obstacles.push(obstacle);
    }

    checkCollision(player) {
        const playerPos = player.getPosition();

        for (let obs of this.obstacles) {
            // Check if obstacle is at similar Z depth
            const zDist = Math.abs(obs.z - player.z);
            if (zDist < 2) { // Tighter Z check

                // Get player position with jump height included
                // Player "height" is radiusOffset
                const playerHeight = player.radiusOffset;

                // Obstacle height from surface
                // We assume obstacles are on the surface (height 0) up to their diameter
                // Simple collision: check if player is "low enough" to hit obstacle

                const angularDist = Math.abs(playerPos.angle - obs.angle);
                // Handle angle wrapping (e.g. 359 vs 1 degree)
                const normalizedAngularDist = Math.min(angularDist, Math.PI * 2 - angularDist);

                // Convert angular distance to arc length roughly
                const arcDist = normalizedAngularDist * this.tunnelRadius;

                // Collision happened if horizontal distance is close AND player hasn't jumped over
                // Obstacle height is roughly its diameter (2 * radius)
                if (arcDist < (player.radius + obs.radius) * 0.8) {
                    if (playerHeight < obs.radius * 1.5) { // Can jump over small obstacles
                        return obs;
                    }
                }
            }
        }
        return null;
    }

    reset() {
        this.rings = [];
        this.obstacles = [];
        this.powerUps = [];
        this.nextRingZ = 0;
        this.lastObstacleZ = -999;
        this.lastPowerUpZ = -999;
        this.score = 0;
        this.difficulty = 1;
        this.initialize();
    }

    spawnPowerUp(z) {
        const angle = Math.random() * Math.PI * 2;
        const radiusOffset = 0.6;

        const types = [
            { type: 'speed', color: 'rgba(255, 255, 0, 1)' },
            { type: 'shield', color: 'rgba(0, 255, 200, 1)' },
            { type: 'multiplier', color: 'rgba(255, 100, 255, 1)' }
        ];

        const selected = types[Math.floor(Math.random() * types.length)];

        const powerUp = {
            x: Math.cos(angle) * this.tunnelRadius * radiusOffset,
            y: Math.sin(angle) * this.tunnelRadius * radiusOffset,
            z: z,
            radius: 1.0,
            type: selected.type,
            color: selected.color
        };

        this.powerUps.push(powerUp);
    }

    checkPowerUpCollection(player) {
        const playerPos = player.getPosition();

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            const zDist = Math.abs(powerUp.z - player.z);

            if (zDist < 3) {
                const dist = MathUtils.distance2D(playerPos.x, playerPos.y, powerUp.x, powerUp.y);
                if (dist < player.radius + powerUp.radius) {
                    const collected = this.powerUps.splice(i, 1)[0];
                    return collected;
                }
            }
        }
        return null;
    }
}