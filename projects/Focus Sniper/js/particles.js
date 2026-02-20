// ==================== PARTICLE SYSTEM ====================

const ParticleSystem = {
    container: null,
    particles: [],
    maxParticles: 500,

    /**
     * Initialize particle system
     */
    init(containerId = 'particlesContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Particles container not found');
        }
    },

    /**
     * Create explosion particles
     */
    createExplosion(x, y, count = 20, color = '#00ff00') {
        if (!this.container) return;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = Utils.random(50, 150);
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            this.createParticle(x, y, vx, vy, color, Utils.random(3, 8));
        }
    },

    /**
     * Create particle trail
     */
    createTrail(x, y, count = 5, color = '#00ff00') {
        if (!this.container) return;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const vx = Utils.random(-20, 20);
                const vy = Utils.random(20, 60);
                this.createParticle(x, y, vx, vy, color, Utils.random(2, 5), 'trail');
            }, i * 50);
        }
    },

    /**
     * Create confetti
     */
    createConfetti(x, y, count = 30) {
        if (!this.container) return;

        const colors = ['#00ff00', '#00ffff', '#ff0066', '#ffaa00', '#ff00ff'];

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = Utils.randomChoice(colors);
            particle.style.setProperty('--fall-distance', Utils.random(200, 400) + 'px');
            particle.style.setProperty('--rotation', Utils.random(0, 720) + 'deg');

            this.container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    },

    /**
     * Create individual particle
     */
    createParticle(x, y, vx, vy, color, size, type = 'explosion') {
        if (!this.container) return;
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            const oldest = this.particles.shift();
            if (oldest && oldest.element && oldest.element.parentNode) {
                oldest.element.remove();
            }
        }

        const particle = document.createElement('div');
        particle.className = `particle ${type}`;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

        if (type === 'explosion') {
            particle.style.setProperty('--tx', vx + 'px');
            particle.style.setProperty('--ty', vy + 'px');
        } else if (type === 'trail') {
            particle.style.setProperty('--fall-distance', vy + 'px');
        }

        this.container.appendChild(particle);

        const particleData = { element: particle, created: Date.now() };
        this.particles.push(particleData);

        // Remove after animation
        const duration = type === 'explosion' ? 600 : 800;
        setTimeout(() => {
            particle.remove();
            const index = this.particles.indexOf(particleData);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, duration);
    },

    /**
     * Create hit marker text
     */
    createHitMarker(x, y, text, critical = false, miss = false) {
        if (!this.container) return;

        const marker = document.createElement('div');
        marker.className = `hit-marker${critical ? ' critical' : ''}${miss ? ' miss' : ''}`;
        marker.textContent = text;
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';

        this.container.appendChild(marker);

        setTimeout(() => {
            marker.remove();
        }, 1000);
    },

    /**
     * Create ripple effect
     */
    createRipple(x, y, color = '#00ff00') {
        if (!this.container) return;

        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = (x - 100) + 'px';
        ripple.style.top = (y - 100) + 'px';
        ripple.style.borderColor = color;

        this.container.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 800);
    },

    /**
     * Create energy ring
     */
    createEnergyRing(x, y, color = '#00ffff') {
        if (!this.container) return;

        const ring = document.createElement('div');
        ring.className = 'energy-ring';
        ring.style.left = (x - 10) + 'px';
        ring.style.top = (y - 10) + 'px';
        ring.style.borderColor = color;

        this.container.appendChild(ring);

        setTimeout(() => {
            ring.remove();
        }, 1000);
    },

    /**
     * Create laser beam from point to point
     */
    createLaserBeam(x1, y1, x2, y2, color = '#00ff00') {
        if (!this.container) return;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const beam = document.createElement('div');
        beam.className = 'laser-beam';
        beam.style.left = x1 + 'px';
        beam.style.top = y1 + 'px';
        beam.style.transform = `rotate(${angle}rad)`;
        beam.style.background = `linear-gradient(90deg, transparent, ${color}, #00ffff, transparent)`;
        beam.style.setProperty('--beam-length', length + 'px');

        this.container.appendChild(beam);

        setTimeout(() => {
            beam.remove();
        }, 400);
    },

    /**
     * Create combo notification
     */
    createComboNotification(comboCount) {
        const notification = document.createElement('div');
        notification.className = 'combo-notification';
        notification.textContent = `${comboCount}x COMBO!`;

        document.querySelector('.game-area').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 1500);
    },

    /**
     * Create streak notification
     */
    createStreakNotification(streakCount) {
        const notification = document.createElement('div');
        notification.className = 'streak-notification';
        notification.textContent = `🔥 ${streakCount} STREAK! 🔥`;
        notification.style.left = '50%';
        notification.style.top = '30%';
        notification.style.transform = 'translate(-50%, -50%)';

        document.querySelector('.game-area').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    },

    /**
     * Create screen flash effect
     */
    createScreenFlash(type = 'critical') {
        const flash = document.createElement('div');
        flash.className = type === 'critical' ? 'critical-flash' : 'damage-vignette';

        document.querySelector('.game-container').appendChild(flash);

        setTimeout(() => {
            flash.remove();
        }, 400);
    },

    /**
     * Create screen shake effect
     */
    createScreenShake(intensity = 'medium') {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;

        gameArea.classList.add(`shake-${intensity}`);

        setTimeout(() => {
            gameArea.classList.remove(`shake-${intensity}`);
        }, intensity === 'light' ? 300 : intensity === 'medium' ? 500 : 700);
    },

    /**
     * Create glitch effect
     */
    createGlitchEffect() {
        const glitch = document.createElement('div');
        glitch.className = 'screen-glitch';

        document.querySelector('.game-container').appendChild(glitch);

        setTimeout(() => {
            glitch.remove();
        }, 300);
    },

    /**
     * Create distortion wave
     */
    createDistortionWave() {
        const wave = document.createElement('div');
        wave.className = 'distortion-wave';

        document.querySelector('.game-container').appendChild(wave);

        setTimeout(() => {
            wave.remove();
        }, 500);
    },

    /**
     * Create scan line
     */
    createScanLine() {
        const existing = document.querySelector('.scan-line');
        if (existing) return; // Only one at a time

        const scanLine = document.createElement('div');
        scanLine.className = 'scan-line';

        document.querySelector('.game-area').appendChild(scanLine);

        setTimeout(() => {
            scanLine.remove();
        }, 2000);
    },

    /**
     * Create level up notification
     */
    createLevelUpNotification(level) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.textContent = `LEVEL ${level}!`;

        document.querySelector('.game-container').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    },

    /**
     * Clear all particles
     */
    clear() {
        if (!this.container) return;

        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.remove();
            }
        });

        this.particles = [];
        this.container.innerHTML = '';
    },

    /**
     * Update particles (cleanup old ones)
     */
    update() {
        const now = Date.now();
        const maxAge = 5000; // 5 seconds

        this.particles = this.particles.filter(particle => {
            if (now - particle.created > maxAge) {
                if (particle.element && particle.element.parentNode) {
                    particle.element.remove();
                }
                return false;
            }
            return true;
        });
    }
};

// Periodically clean up old particles
if (typeof window !== 'undefined') {
    setInterval(() => {
        ParticleSystem.update();
    }, 5000);
}
