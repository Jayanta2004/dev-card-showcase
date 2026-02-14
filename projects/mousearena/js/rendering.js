// ===== RENDERING SYSTEM =====
// Handles canvas rendering, animations, particles, and visual effects

export class RenderingSystem {
    constructor() {
        this.canvas = document.getElementById('arena-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Particles
        this.particles = [];

        // Camera shake
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;

        // Performance
        this.fps = 60;
        this.frameTime = 0;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render(inputSystem, combatSystem, aiSystem) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera shake
        this.ctx.save();
        if (this.shakeIntensity > 0) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(offsetX, offsetY);
            this.shakeIntensity *= this.shakeDecay;
        }

        // Render arena background
        this.renderArena();

        // Render background particles
        this.renderParticles('background');

        // Render enemies
        this.renderEnemies(aiSystem.getEnemies());

        // Render player attacks
        this.renderAttacks(combatSystem.getActiveAttacks());

        // Render player cursor
        this.renderPlayerCursor(inputSystem);

        // Render foreground particles
        this.renderParticles('foreground');

        // Render combo display
        if (combatSystem.getComboCount() > 1) {
            this.renderComboDisplay(combatSystem.getComboCount(), combatSystem.getComboMultiplier());
        }

        this.ctx.restore();
    }

    renderArena() {
        // Gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width / 2
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0a0a0a');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;

        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    renderEnemies(enemies) {
        for (const enemy of enemies) {
            // Shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(enemy.x + 3, enemy.y + 3, enemy.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Enemy body
            const gradient = this.ctx.createRadialGradient(
                enemy.x - enemy.radius / 3,
                enemy.y - enemy.radius / 3,
                0,
                enemy.x,
                enemy.y,
                enemy.radius
            );
            gradient.addColorStop(0, this.lightenColor(enemy.color, 40));
            gradient.addColorStop(1, enemy.color);

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Outline
            this.ctx.strokeStyle = this.lightenColor(enemy.color, 60);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Health bar
            const barWidth = enemy.radius * 2;
            const barHeight = 4;
            const barX = enemy.x - barWidth / 2;
            const barY = enemy.y - enemy.radius - 10;

            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);

            // Health
            const healthRatio = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = healthRatio > 0.5 ? '#00ff88' : '#ff4444';
            this.ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

            // State indicator
            this.renderStateIndicator(enemy);
        }
    }

    renderStateIndicator(enemy) {
        let color;
        switch (enemy.state) {
            case 'idle':
                color = '#888888';
                break;
            case 'chase':
                color = '#ffaa00';
                break;
            case 'attack':
                color = '#ff4444';
                break;
            case 'retreat':
                color = '#4488ff';
                break;
        }

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y - enemy.radius - 20, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderAttacks(attacks) {
        for (const attack of attacks) {
            // Glow
            const glowGradient = this.ctx.createRadialGradient(
                attack.x, attack.y, 0,
                attack.x, attack.y, attack.radius * 2
            );
            glowGradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
            glowGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(attack.x, attack.y, attack.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Projectile
            const gradient = this.ctx.createRadialGradient(
                attack.x - attack.radius / 3,
                attack.y - attack.radius / 3,
                0,
                attack.x,
                attack.y,
                attack.radius
            );

            if (attack.isCritical) {
                gradient.addColorStop(0, '#ffff88');
                gradient.addColorStop(1, '#ffaa00');
            } else {
                gradient.addColorStop(0, '#88ffaa');
                gradient.addColorStop(1, '#00ff88');
            }

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(attack.x, attack.y, attack.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Trail
            this.createAttackTrail(attack);
        }
    }

    createAttackTrail(attack) {
        const trailLength = 5;
        for (let i = 0; i < trailLength; i++) {
            const ratio = i / trailLength;
            const x = attack.x - attack.vx * ratio * 2;
            const y = attack.y - attack.vy * ratio * 2;
            const radius = attack.radius * (1 - ratio);
            const alpha = 0.3 * (1 - ratio);

            this.ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderPlayerCursor(inputSystem) {
        const pos = inputSystem.getMousePosition();
        const gesture = inputSystem.getGestureState();
        const speed = inputSystem.getSpeed();

        // Cursor glow
        const glowSize = 30 + speed * 2;
        const glowGradient = this.ctx.createRadialGradient(
            pos.x, pos.y, 0,
            pos.x, pos.y, glowSize
        );

        let glowColor;
        switch (gesture) {
            case 'flick':
                glowColor = 'rgba(255, 68, 68, 0.4)';
                break;
            case 'circle':
                glowColor = 'rgba(68, 136, 255, 0.4)';
                break;
            case 'hold':
                glowColor = 'rgba(255, 204, 68, 0.4)';
                break;
            default:
                glowColor = 'rgba(255, 255, 255, 0.2)';
        }

        glowGradient.addColorStop(0, glowColor);
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Cursor ring
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 10 + speed * 0.5, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner dot
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Velocity indicator
        if (speed > 5) {
            const vel = inputSystem.getVelocity();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.lineTo(pos.x + vel.x * 3, pos.y + vel.y * 3);
            this.ctx.stroke();
        }
    }

    renderParticles(layer) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            if (particle.layer !== layer) continue;

            particle.lifetime -= 16;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            if (particle.lifetime <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            const alpha = particle.lifetime / particle.maxLifetime;
            this.ctx.fillStyle = particle.color.replace('1)', `${alpha})`);
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderComboDisplay(count, multiplier) {
        const x = this.canvas.width - 100;
        const y = this.canvas.height / 2;

        // Background
        this.ctx.fillStyle = 'rgba(255, 170, 0, 0.2)';
        this.ctx.fillRect(x - 60, y - 60, 120, 120);

        // Combo count
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 48px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`x${count}`, x, y - 10);

        // Multiplier
        this.ctx.font = 'bold 20px sans-serif';
        this.ctx.fillText(`${multiplier.toFixed(1)}x`, x, y + 25);
    }

    createParticle(x, y, color, layer = 'foreground') {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;

        this.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 5,
            color: color,
            lifetime: 500 + Math.random() * 500,
            maxLifetime: 1000,
            layer: layer
        });
    }

    createImpactParticles(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, 'rgba(255, 255, 255, 1)', 'foreground');
        }
    }

    addScreenShake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    reset() {
        this.particles = [];
        this.shakeIntensity = 0;
    }
}
