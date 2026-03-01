// ===== AI SYSTEM =====
// Handles enemy entities, behavior states, and pathfinding

export class AISystem {
    constructor() {
        this.enemies = [];
        this.nextEnemyId = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 2500; // Faster spawning
        this.maxEnemies = 10; // More enemies
        this.currentWave = 1;
        this.enemiesPerWave = 4; // Start with more enemies
        this.waveEnemiesSpawned = 0;
        this.waveInProgress = false;
        this.difficultyMultiplier = 1;
    }

    update(deltaTime, mousePos, combatSystem) {
        // Update spawn timer
        this.spawnTimer += deltaTime;

        // Spawn enemies for current wave
        if (this.waveInProgress &&
            this.enemies.length < this.maxEnemies &&
            this.waveEnemiesSpawned < this.enemiesPerWave &&
            this.spawnTimer > this.spawnInterval) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }

        // Update each enemy
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
                this.createDeathEffect(enemy.x, enemy.y);
                continue;
            }

            this.updateEnemy(enemy, deltaTime, mousePos, combatSystem);
        }

        // Check wave completion
        if (this.waveInProgress &&
            this.waveEnemiesSpawned >= this.enemiesPerWave &&
            this.enemies.length === 0) {
            this.completeWave();
        }
    }

    updateEnemy(enemy, deltaTime, mousePos, combatSystem) {
        // Update state machine
        this.updateBehaviorState(enemy, mousePos);

        // Execute behavior
        switch (enemy.state) {
            case 'idle':
                this.behaviorIdle(enemy, deltaTime);
                break;
            case 'chase':
                this.behaviorChase(enemy, deltaTime, mousePos);
                break;
            case 'attack':
                this.behaviorAttack(enemy, deltaTime, mousePos, combatSystem);
                break;
            case 'retreat':
                this.behaviorRetreat(enemy, deltaTime, mousePos);
                break;
        }

        // Update position
        enemy.x += enemy.vx * deltaTime / 16;
        enemy.y += enemy.vy * deltaTime / 16;

        // Apply friction
        enemy.vx *= 0.95;
        enemy.vy *= 0.95;

        // Keep in bounds
        const margin = 50;
        if (enemy.x < margin) enemy.x = margin;
        if (enemy.x > window.innerWidth - margin) enemy.x = window.innerWidth - margin;
        if (enemy.y < margin) enemy.y = margin;
        if (enemy.y > window.innerHeight - margin) enemy.y = window.innerHeight - margin;

        // Update attack cooldown
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown -= deltaTime;
        }
    }

    updateBehaviorState(enemy, mousePos) {
        const dx = mousePos.x - enemy.x;
        const dy = mousePos.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Enhanced state transitions with more intelligence
        if (enemy.health < enemy.maxHealth * 0.25 && distance > 150) {
            enemy.state = 'retreat';
        } else if (distance < enemy.attackRange && enemy.attackCooldown <= 0) {
            enemy.state = 'attack';
        } else if (distance < enemy.detectionRange) {
            // Vary behavior based on enemy type
            if (enemy.type === 'aggressive') {
                enemy.state = 'chase';
            } else if (enemy.type === 'tactical' && distance < 200) {
                // Tactical enemies circle the player
                enemy.state = Math.random() > 0.3 ? 'chase' : 'idle';
            } else {
                enemy.state = 'chase';
            }
        } else {
            enemy.state = 'idle';
        }
    }

    behaviorIdle(enemy, deltaTime) {
        // Wander randomly
        if (Math.random() < 0.02) {
            const angle = Math.random() * Math.PI * 2;
            enemy.vx = Math.cos(angle) * enemy.speed * 0.3;
            enemy.vy = Math.sin(angle) * enemy.speed * 0.3;
        }
    }

    behaviorChase(enemy, deltaTime, mousePos) {
        // Enhanced movement with prediction
        const dx = mousePos.x - enemy.x;
        const dy = mousePos.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Add some variation based on enemy type
            let speedMultiplier = 1;
            if (enemy.type === 'fast') {
                speedMultiplier = 1.3;
            } else if (enemy.type === 'tank') {
                speedMultiplier = 0.7;
            }

            enemy.vx = dirX * enemy.speed * speedMultiplier;
            enemy.vy = dirY * enemy.speed * speedMultiplier;
        }
    }

    behaviorAttack(enemy, deltaTime, mousePos, combatSystem) {
        // Stop moving
        enemy.vx *= 0.8;
        enemy.vy *= 0.8;

        // Perform attack
        if (enemy.attackCooldown <= 0) {
            // Calculate direction to mouse
            const dx = mousePos.x - enemy.x;
            const dy = mousePos.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const dirX = dx / distance;
                const dirY = dy / distance;

                // Lunge attack
                enemy.vx = dirX * enemy.speed * 2;
                enemy.vy = dirY * enemy.speed * 2;

                // Deal damage if close enough
                if (distance < enemy.attackRange * 0.5) {
                    combatSystem.takeDamage(enemy.damage);
                }

                // Set cooldown
                enemy.attackCooldown = enemy.attackCooldownMax;
            }
        }
    }

    behaviorRetreat(enemy, deltaTime, mousePos) {
        // Move away from mouse
        const dx = mousePos.x - enemy.x;
        const dy = mousePos.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;

            enemy.vx = -dirX * enemy.speed * 1.5;
            enemy.vy = -dirY * enemy.speed * 1.5;
        }
    }

    spawnEnemy() {
        // Random spawn position at edge
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: // Top
                x = Math.random() * window.innerWidth;
                y = -50;
                break;
            case 1: // Right
                x = window.innerWidth + 50;
                y = Math.random() * window.innerHeight;
                break;
            case 2: // Bottom
                x = Math.random() * window.innerWidth;
                y = window.innerHeight + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * window.innerHeight;
                break;
        }

        // Enhanced enemy types with wave scaling
        const waveMultiplier = 1 + (this.currentWave - 1) * 0.25;
        const types = ['normal', 'fast', 'tank', 'aggressive', 'tactical'];
        const enemyType = types[Math.floor(Math.random() * Math.min(types.length, 2 + this.currentWave))];

        let health, damage, speed, radius;

        switch (enemyType) {
            case 'fast':
                health = 35 * waveMultiplier;
                damage = 8 * waveMultiplier;
                speed = 3.5 + (this.currentWave * 0.3);
                radius = 15;
                break;
            case 'tank':
                health = 80 * waveMultiplier;
                damage = 15 * waveMultiplier;
                speed = 1.5 + (this.currentWave * 0.1);
                radius = 28;
                break;
            case 'aggressive':
                health = 45 * waveMultiplier;
                damage = 12 * waveMultiplier;
                speed = 2.8 + (this.currentWave * 0.2);
                radius = 20;
                break;
            case 'tactical':
                health = 50 * waveMultiplier;
                damage = 10 * waveMultiplier;
                speed = 2.5 + (this.currentWave * 0.2);
                radius = 18;
                break;
            default: // normal
                health = 50 * waveMultiplier;
                damage = 10 * waveMultiplier;
                speed = 2 + (this.currentWave * 0.2);
                radius = 20;
        }

        const enemy = {
            id: this.nextEnemyId++,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: radius,
            health: health,
            maxHealth: health,
            damage: damage,
            speed: speed,
            state: 'idle',
            type: enemyType,
            detectionRange: 450,
            attackRange: 120,
            attackCooldown: 0,
            attackCooldownMax: 1500,
            color: this.getEnemyColor(enemyType)
        };

        this.enemies.push(enemy);
        this.waveEnemiesSpawned++;
    }

    getEnemyColor(enemyType = 'normal') {
        const colorMap = {
            'normal': '#ff4444',
            'fast': '#44ff44',
            'tank': '#4444ff',
            'aggressive': '#ff44aa',
            'tactical': '#ffaa44'
        };
        return colorMap[enemyType] || '#ff4444';
    }

    damageEnemy(enemyId, damage) {
        const enemy = this.enemies.find(e => e.id === enemyId);
        if (enemy) {
            enemy.health -= damage;
            return true;
        }
        return false;
    }

    checkEnemyHit(combatSystem) {
        let score = 0;

        for (const enemy of this.enemies) {
            const damage = combatSystem.checkAttackHit(enemy);
            if (damage > 0) {
                enemy.health -= damage;
                score += Math.ceil(damage * combatSystem.getComboMultiplier());
            }
        }

        return score;
    }

    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.enemiesPerWave = 3 + (waveNumber - 1) * 2;
        this.waveEnemiesSpawned = 0;
        this.waveInProgress = true;
        this.spawnTimer = 0;

        // Show wave announcement
        this.showWaveAnnouncement(waveNumber);
    }

    completeWave() {
        this.waveInProgress = false;
    }

    showWaveAnnouncement(waveNumber) {
        const announcement = document.createElement('div');
        announcement.className = 'wave-announcement';
        announcement.textContent = `WAVE ${waveNumber}`;
        document.body.appendChild(announcement);

        setTimeout(() => {
            announcement.remove();
        }, 2000);
    }

    createDeathEffect(x, y) {
        // Create particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle hit';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = '#ff4444';

            const angle = (Math.PI * 2 * i) / 8;
            const distance = 50 + Math.random() * 30;
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 600);
        }
    }

    getEnemies() {
        return this.enemies;
    }

    isWaveComplete() {
        return !this.waveInProgress;
    }

    getCurrentWave() {
        return this.currentWave;
    }

    reset() {
        this.enemies = [];
        this.currentWave = 1;
        this.waveEnemiesSpawned = 0;
        this.waveInProgress = false;
        this.spawnTimer = 0;
    }
}
