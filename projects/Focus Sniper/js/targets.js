// ==================== TARGET SYSTEM ====================

const TargetManager = {
    container: null,
    targets: [],
    spawnTimer: null,
    isActive: false,
    spawnRate: 2000, // ms between spawns
    maxTargets: 5,
    gameArea: null,

    /**
     * Initialize target system
     */
    init(containerId = 'targetsContainer') {
        this.container = document.getElementById(containerId);
        this.gameArea = document.getElementById('gameArea');
        
        if (!this.container) {
            console.error('Targets container not found');
        }
    },

    /**
     * Start spawning targets
     */
    start() {
        this.isActive = true;
        this.scheduleNextTarget();
    },

    /**
     * Stop spawning targets
     */
    stop() {
        this.isActive = false;
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
    },

    /**
     * Set spawn rate
     */
    setSpawnRate(rate) {
        this.spawnRate = Math.max(500, rate);
    },

    /**
     * Set max targets
     */
    setMaxTargets(max) {
        this.maxTargets = Math.max(1, max);
    },

    /**
     * Schedule next target spawn
     */
    scheduleNextTarget() {
        if (!this.isActive) return;

        const delay = Utils.random(this.spawnRate * 0.7, this.spawnRate * 1.3);

        this.spawnTimer = setTimeout(() => {
            if (this.targets.length < this.maxTargets) {
                this.spawnTarget();
            }
            this.scheduleNextTarget();
        }, delay);
    },

    /**
     * Spawn a new target
     */
    spawnTarget() {
        if (!this.container || !this.gameArea) return;

        const bounds = this.gameArea.getBoundingClientRect();
        const margin = 80; // Keep targets away from edges

        // Random position
        const x = Utils.random(margin, bounds.width - margin);
        const y = Utils.random(margin, bounds.height - margin);

        // Check if too close to existing targets
        const tooClose = this.targets.some(target => {
            const targetData = target.dataset;
            const distance = Utils.distance(
                x, y,
                parseFloat(targetData.x), parseFloat(targetData.y)
            );
            return distance < 100; // Minimum distance between targets
        });

        if (tooClose && this.targets.length > 0) {
            // Try again
            setTimeout(() => this.spawnTarget(), 100);
            return;
        }

        // Determine target type
        const rand = Math.random();
        let type, points, lifetime, size;

        if (rand < 0.05) { // 5% - Danger (penalty)
            type = 'danger';
            points = -50;
            lifetime = 3000;
            size = 70;
        } else if (rand < 0.20) { // 15% - Bonus
            type = 'bonus';
            points = 50;
            lifetime = 2000;
            size = 50;
        } else { // 80% - Normal
            type = 'normal';
            points = 10;
            lifetime = 3500;
            size = 60;
        }

        // Create target element
        const target = document.createElement('div');
        target.className = `target ${type}`;
        target.style.left = x + 'px';
        target.style.top = y + 'px';
        target.style.width = size + 'px';
        target.style.height = size + 'px';

        // Store target data
        target.dataset.x = x;
        target.dataset.y = y;
        target.dataset.type = type;
        target.dataset.points = points;
        target.dataset.size = size;
        target.dataset.id = Utils.uuid();

        // Add movement for bonus targets
        if (type === 'bonus') {
            const speed = Utils.random(30, 60);
            const angle = Utils.random(0, Math.PI * 2);
            target.dataset.vx = Math.cos(angle) * speed;
            target.dataset.vy = Math.sin(angle) * speed;
        }

        this.container.appendChild(target);
        this.targets.push(target);

        AudioManager.playTargetSpawn();

        // Auto-expire after lifetime
        setTimeout(() => {
            this.removeTarget(target, true);
        }, lifetime);
    },

    /**
     * Check if click hit a target
     */
    checkHit(clickX, clickY) {
        if (!this.gameArea) return null;

        const bounds = this.gameArea.getBoundingClientRect();
        const relativeX = clickX - bounds.left;
        const relativeY = clickY - bounds.top;

        // Check all targets
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            const targetX = parseFloat(target.dataset.x);
            const targetY = parseFloat(target.dataset.y);
            const targetSize = parseFloat(target.dataset.size);
            const radius = targetSize / 2;

            const distance = Utils.distance(relativeX, relativeY, targetX + radius, targetY + radius);

            if (distance <= radius) {
                return {
                    target: target,
                    x: targetX + radius,
                    y: targetY + radius,
                    type: target.dataset.type,
                    points: parseInt(target.dataset.points),
                    distance: distance
                };
            }
        }

        return null;
    },

    /**
     * Remove a target
     */
    removeTarget(target, expired = false) {
        if (!target || !target.parentNode) return;

        const index = this.targets.indexOf(target);
        if (index > -1) {
            this.targets.splice(index, 1);
        }

        if (!expired) {
            // Hit animation
            target.classList.add('target-hit');
        }

        setTimeout(() => {
            if (target.parentNode) {
                target.parentNode.removeChild(target);
            }
        }, expired ? 0 : 300);
    },

    /**
     * Update target positions (for moving targets)
     */
    update(deltaTime) {
        if (!this.gameArea) return;

        const bounds = this.gameArea.getBoundingClientRect();

        this.targets.forEach(target => {
            const vx = parseFloat(target.dataset.vx) || 0;
            const vy = parseFloat(target.dataset.vy) || 0;

            if (vx === 0 && vy === 0) return;

            let x = parseFloat(target.dataset.x);
            let y = parseFloat(target.dataset.y);
            const size = parseFloat(target.dataset.size);

            // Update position
            x += vx * (deltaTime / 1000);
            y += vy * (deltaTime / 1000);

            // Bounce off walls
            if (x < 0 || x > bounds.width - size) {
                target.dataset.vx = -vx;
                x = Utils.clamp(x, 0, bounds.width - size);
            }

            if (y < 0 || y > bounds.height - size) {
                target.dataset.vy = -vy;
                y = Utils.clamp(y, 0, bounds.height - size);
            }

            // Update DOM
            target.dataset.x = x;
            target.dataset.y = y;
            target.style.left = x + 'px';
            target.style.top = y + 'px';
        });
    },

    /**
     * Get target count
     */
    getCount() {
        return this.targets.length;
    },

    /**
     * Clear all targets
     */
    clearAll() {
        this.targets.forEach(target => {
            if (target.parentNode) {
                target.parentNode.removeChild(target);
            }
        });

        this.targets = [];

        if (this.container) {
            this.container.innerHTML = '';
        }
    },

    /**
     * Get all target positions
     */
    getPositions() {
        return this.targets.map(target => ({
            x: parseFloat(target.dataset.x),
            y: parseFloat(target.dataset.y),
            size: parseFloat(target.dataset.size),
            type: target.dataset.type
        }));
    }
};
