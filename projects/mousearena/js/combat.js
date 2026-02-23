// ===== COMBAT SYSTEM =====
// Handles player combat mechanics, attacks, dodges, blocks, and hit detection

export class CombatSystem {
    constructor() {
        // Player state
        this.player = {
            health: 100,
            maxHealth: 100,
            isInvulnerable: false,
            isBlocking: false,
            isDead: false,
            damageReduction: 0
        };

        // Combat stats (enhanced)
        this.baseDamage = 20; // Increased base damage
        this.comboMultiplier = 1;
        this.comboCount = 0;
        this.lastHitTime = 0;
        this.comboTimeout = 3000; // Longer combo window
        this.maxComboMultiplier = 3.0; // Cap combo multiplier

        // Cooldowns (balanced)
        this.attackCooldown = 0;
        this.attackCooldownMax = 400; // Faster attacks
        this.dodgeCooldown = 0;
        this.dodgeCooldownMax = 1800; // Slightly faster dodge
        this.dodgeDuration = 1000; // Longer invulnerability

        // Active attacks
        this.activeAttacks = [];

        // UI elements
        this.healthBar = document.getElementById('player-health-bar');
        this.healthValue = document.getElementById('player-health-value');
        this.attackIndicator = document.getElementById('attack-indicator');
        this.dodgeIndicator = document.getElementById('dodge-indicator');
        this.blockIndicator = document.getElementById('block-indicator');
        this.attackCooldownBar = document.getElementById('attack-cooldown');
        this.dodgeCooldownBar = document.getElementById('dodge-cooldown');
        this.blockStatus = document.getElementById('block-status');
    }

    update(deltaTime, inputSystem) {
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
            const ratio = Math.max(0, this.attackCooldown / this.attackCooldownMax);
            this.updateCooldownUI('attack', ratio);
        } else {
            this.updateCooldownUI('attack', 0);
        }

        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= deltaTime;
            const ratio = Math.max(0, this.dodgeCooldown / this.dodgeCooldownMax);
            this.updateCooldownUI('dodge', ratio);
        } else {
            this.updateCooldownUI('dodge', 0);
        }

        // Check combo timeout
        const now = Date.now();
        if (now - this.lastHitTime > this.comboTimeout) {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }

        // Update active attacks
        this.activeAttacks = this.activeAttacks.filter(attack => {
            attack.lifetime -= deltaTime;
            attack.x += attack.vx * deltaTime / 16;
            attack.y += attack.vy * deltaTime / 16;
            return attack.lifetime > 0;
        });

        // Handle gestures
        const gesture = inputSystem.getGestureState();

        if (gesture === 'flick' && this.attackCooldown <= 0) {
            this.performAttack(inputSystem);
        }

        if (gesture === 'circle' && this.dodgeCooldown <= 0) {
            this.performDodge();
        }

        if (gesture === 'hold') {
            this.performBlock(true);
        } else {
            this.performBlock(false);
        }
    }

    performAttack(inputSystem) {
        const direction = inputSystem.getFlickDirection();
        const speed = inputSystem.getSpeed();
        const mousePos = inputSystem.getMousePosition();

        // Enhanced damage calculation
        const speedMultiplier = Math.min(speed / 15, 2.5); // Better scaling
        const damage = this.baseDamage * speedMultiplier * this.comboMultiplier;

        // Determine if critical hit
        const isCritical = speedMultiplier > 1.8 || this.comboCount >= 5;

        // Create attack projectile with enhanced properties
        const attack = {
            x: mousePos.x,
            y: mousePos.y,
            vx: direction.x * 25, // Faster projectiles
            vy: direction.y * 25,
            damage: isCritical ? damage * 1.5 : damage,
            radius: isCritical ? 20 : 15,
            lifetime: 600,
            isCritical: isCritical
        };

        this.activeAttacks.push(attack);

        // Set cooldown
        this.attackCooldown = this.attackCooldownMax;

        // Enhanced UI feedback
        this.attackIndicator.classList.add('active');
        setTimeout(() => {
            this.attackIndicator.classList.remove('active');
        }, 300);

        // Create visual effect
        this.createSlashEffect(mousePos.x, mousePos.y, direction);
    }

    performDodge() {
        // Grant invulnerability
        this.player.isInvulnerable = true;

        // Set cooldown
        this.dodgeCooldown = this.dodgeCooldownMax;

        // UI feedback
        this.dodgeIndicator.classList.add('active');

        // Create visual effect
        this.createCombatFlash('dodge');

        // End invulnerability after duration
        setTimeout(() => {
            this.player.isInvulnerable = false;
            this.dodgeIndicator.classList.remove('active');
        }, this.dodgeDuration);
    }

    performBlock(isBlocking) {
        this.player.isBlocking = isBlocking;

        if (isBlocking) {
            this.player.damageReduction = 0.75;
            this.blockIndicator.classList.add('active');
            this.blockStatus.classList.add('active');
        } else {
            this.player.damageReduction = 0;
            this.blockIndicator.classList.remove('active');
            this.blockStatus.classList.remove('active');
        }
    }

    checkAttackHit(enemy) {
        for (let i = this.activeAttacks.length - 1; i >= 0; i--) {
            const attack = this.activeAttacks[i];
            const dx = attack.x - enemy.x;
            const dy = attack.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < attack.radius + enemy.radius) {
                // Hit detected
                const damage = attack.damage;
                this.activeAttacks.splice(i, 1);

                // Enhanced combo system
                this.comboCount++;
                this.comboMultiplier = Math.min(
                    1 + (this.comboCount * 0.15), // Better scaling
                    this.maxComboMultiplier
                );
                this.lastHitTime = Date.now();

                // Enhanced visual feedback
                this.createImpactEffect(enemy.x, enemy.y);
                this.createDamageNumber(enemy.x, enemy.y, damage, 'enemy');

                if (attack.isCritical) {
                    this.createCriticalHit(enemy.x, enemy.y);
                }

                // Show combo counter if combo > 2
                if (this.comboCount > 2) {
                    this.showComboCounter();
                }

                return damage;
            }
        }

        return 0;
    }

    takeDamage(amount) {
        if (this.player.isDead || this.player.isInvulnerable) {
            return;
        }

        // Apply damage reduction
        const actualDamage = amount * (1 - this.player.damageReduction);
        this.player.health -= actualDamage;

        // Reset combo
        this.comboCount = 0;
        this.comboMultiplier = 1;

        // Clamp health
        if (this.player.health < 0) {
            this.player.health = 0;
            this.player.isDead = true;
        }

        // Update UI
        this.updateHealthUI();

        // Visual feedback
        this.createCombatFlash('hit');
        this.createDamageNumber(window.innerWidth / 2, 100, actualDamage, 'player');

        // Screen shake
        document.body.classList.add('shake');
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 400);
    }

    updateHealthUI() {
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        this.healthBar.style.width = healthPercent + '%';
        this.healthValue.textContent = Math.ceil(this.player.health);

        // Critical health warning
        if (healthPercent < 25) {
            this.healthBar.classList.add('critical');
        } else {
            this.healthBar.classList.remove('critical');
        }

        // Damage animation
        this.healthBar.classList.add('damaged');
        setTimeout(() => {
            this.healthBar.classList.remove('damaged');
        }, 300);
    }

    updateCooldownUI(type, ratio) {
        if (type === 'attack') {
            // Create fill element if it doesn't exist
            let fill = this.attackCooldownBar.querySelector('.cooldown-bar-fill');
            if (!fill) {
                fill = document.createElement('div');
                fill.className = 'cooldown-bar-fill';
                this.attackCooldownBar.appendChild(fill);
            }
            fill.style.width = (ratio * 100) + '%';
        } else if (type === 'dodge') {
            let fill = this.dodgeCooldownBar.querySelector('.cooldown-bar-fill');
            if (!fill) {
                fill = document.createElement('div');
                fill.className = 'cooldown-bar-fill';
                this.dodgeCooldownBar.appendChild(fill);
            }
            fill.style.width = (ratio * 100) + '%';
        }
    }

    createSlashEffect(x, y, direction) {
        const slash = document.createElement('div');
        slash.className = 'slash-effect';
        slash.style.left = x + 'px';
        slash.style.top = y + 'px';

        const angle = Math.atan2(direction.y, direction.x);
        slash.style.transform = `rotate(${angle}rad)`;

        document.body.appendChild(slash);

        setTimeout(() => {
            slash.remove();
        }, 300);
    }

    createCombatFlash(type) {
        const flash = document.createElement('div');
        flash.className = `combat-flash ${type}`;
        document.body.appendChild(flash);

        setTimeout(() => {
            flash.remove();
        }, 300);
    }

    createImpactEffect(x, y) {
        const impact = document.createElement('div');
        impact.className = 'impact-ring';
        impact.style.left = (x - 5) + 'px';
        impact.style.top = (y - 5) + 'px';
        document.body.appendChild(impact);

        setTimeout(() => {
            impact.remove();
        }, 500);
    }

    createDamageNumber(x, y, damage, type) {
        const damageNum = document.createElement('div');
        damageNum.className = `damage-number ${type}`;
        damageNum.textContent = Math.ceil(damage);
        damageNum.style.left = x + 'px';
        damageNum.style.top = y + 'px';
        document.body.appendChild(damageNum);

        setTimeout(() => {
            damageNum.remove();
        }, 1000);
    }

    createCriticalHit(x, y) {
        const critical = document.createElement('div');
        critical.className = 'critical-hit';
        critical.textContent = 'CRITICAL!';
        critical.style.left = x + 'px';
        critical.style.top = y + 'px';
        document.body.appendChild(critical);

        setTimeout(() => {
            critical.remove();
        }, 800);
    }

    getActiveAttacks() {
        return this.activeAttacks;
    }

    getPlayerHealth() {
        return this.player.health;
    }

    isPlayerDead() {
        return this.player.isDead;
    }

    getComboMultiplier() {
        return this.comboMultiplier;
    }

    getComboCount() {
        return this.comboCount;
    }


    showComboCounter() {
        // Remove existing combo display
        const existing = document.querySelector('.combo-counter-display');
        if (existing) {
            existing.remove();
        }

        // Create new combo display
        const comboDisplay = document.createElement('div');
        comboDisplay.className = 'combo-counter-display';
        comboDisplay.innerHTML = `
            <div class="combo-count">${this.comboCount}x</div>
            <div class="combo-text">COMBO!</div>
        `;
        comboDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            right: 80px;
            transform: translateY(-50%);
            text-align: center;
            pointer-events: none;
            z-index: 70;
            animation: pulse 0.3s ease-out;
        `;

        document.body.appendChild(comboDisplay);
    }

    reset() {
        this.player.health = this.player.maxHealth;
        this.player.isInvulnerable = false;
        this.player.isBlocking = false;
        this.player.isDead = false;
        this.player.damageReduction = 0;
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.attackCooldown = 0;
        this.dodgeCooldown = 0;
        this.activeAttacks = [];
        this.updateHealthUI();
    }
}
