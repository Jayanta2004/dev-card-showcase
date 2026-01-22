// engine.js

class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = {
            x: 0,
            y: 0,
            z: 0,
            fov: 400,
            tilt: 0,
            shake: 0,
            shakeDecay: 0
        };

        this.player = new Player();
        this.world = new World();
        this.particles = [];
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;

        this.lastTime = performance.now();
        this.running = false;
        this.gameStarted = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setupStartControl();
    }

    setupStartControl() {
        const startGame = () => {
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.running = true;
                document.getElementById('instructions').style.display = 'none';
            }
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                startGame();
            }
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update(dt) {
        if (!this.running) return;

        // Update player
        this.player.update(dt);

        // Get player's actual position on tunnel surface
        const playerPos = this.player.getPosition();

        // Camera follows player with tilt based on movement - TIME BASED
        const camDecay = 10;
        const tiltDecay = 5;

        this.camera.z = this.player.z;
        this.camera.x = MathUtils.lerp(this.camera.x, playerPos.x * 0.05, 1 - Math.exp(-camDecay * dt));
        this.camera.y = MathUtils.lerp(this.camera.y, playerPos.y * 0.05, 1 - Math.exp(-camDecay * dt));

        const laneDiff = this.player.targetLane - this.player.currentLane;
        this.camera.tilt = MathUtils.lerp(this.camera.tilt, laneDiff * 0.1, 1 - Math.exp(-tiltDecay * dt));

        // Update camera shake
        if (this.camera.shake > 0) {
            this.camera.shake -= this.camera.shakeDecay * dt;
            if (this.camera.shake < 0) this.camera.shake = 0;
        }

        // Update world
        this.world.update(this.player.z, this.player.speed, dt);

        // Check power-up collection
        const collected = this.world.checkPowerUpCollection(this.player);
        if (collected) {
            this.handlePowerUp(collected);
            this.spawnCollectionParticles(collected.x, collected.y, collected.z, collected.color);
        }

        // Check collisions with obstacles
        const collision = this.world.checkCollision(this.player);
        if (collision) {
            if (this.player.hit()) {
                this.screenShake(0.3);
                this.spawnExplosionParticles(collision.x, collision.y, collision.z);
                this.combo = 0;
                this.comboTimer = 0;
                if (this.player.isDead()) {
                    this.gameOver();
                }
            }
        }

        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // Spawn trail particles
        if (Math.random() < 0.3) {
            this.spawnTrailParticle();
        }

        // Update particles
        this.updateParticles(dt);

        // Move player forward
        this.player.z += this.player.speed * dt;
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Apply camera shake
        ctx.save();
        if (this.camera.shake > 0) {
            const shakeX = (Math.random() - 0.5) * this.camera.shake * 20;
            const shakeY = (Math.random() - 0.5) * this.camera.shake * 20;
            ctx.translate(shakeX, shakeY);
        }

        // Clear with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#000428');
        gradient.addColorStop(1, '#004e92');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Add radial gradient to create tunnel depth effect
        const centerX = w / 2;
        const centerY = h / 2;
        const tunnelGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(w, h) / 2);
        tunnelGradient.addColorStop(0, 'rgba(0, 40, 80, 0)');
        tunnelGradient.addColorStop(0.5, 'rgba(0, 20, 50, 0.3)');
        tunnelGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = tunnelGradient;
        ctx.fillRect(0, 0, w, h);

        // Add stars/depth particles in background
        this.drawStarfield();

        // Draw tunnel rings
        this.drawTunnel();

        // Draw obstacles
        this.drawObstacles();

        // Draw player
        this.drawPlayer();

        // Draw power-ups
        this.drawPowerUps();

        // Draw particles
        this.drawParticles();

        // Draw combo indicator
        this.drawCombo();

        // Update UI
        this.updateUI();

        ctx.restore();
    }

    drawTunnel() {
        const ctx = this.ctx;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter'; // Additive blending for neon look

        // Draw rings with fill for "solid" tunnel feel
        const rings = this.world.rings;
        const segments = this.world.tunnelSegments;

        // Draw tracks (longitudinal) first
        const numLanes = this.player.numLanes;

        // Draw grid lines (longitudinal)
        for (let i = 0; i < segments; i += 2) {
            const angle = (i / segments) * Math.PI * 2;

            ctx.beginPath();
            let started = false;

            for (let r = 0; r < rings.length; r++) {
                const z = rings[r] - this.camera.z;
                if (z < 0.1 || z > 150) continue;

                const p = MathUtils.getTunnelPoint(angle, this.world.tunnelRadius, z);
                const proj = MathUtils.project3D(p.x, p.y, p.z, this.camera, this.canvas);

                if (!started) {
                    ctx.moveTo(proj.x, proj.y);
                    started = true;
                } else {
                    ctx.lineTo(proj.x, proj.y);
                }
            }

            const depthAlpha = 0.2;
            ctx.strokeStyle = `rgba(0, 100, 255, ${depthAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw rings (latitudinal)
        for (let ringZ of this.world.rings) {
            const relativeZ = ringZ - this.camera.z;
            if (relativeZ < 0.1 || relativeZ > 150) continue;

            const depthAlpha = MathUtils.clamp(1 - relativeZ / 120, 0, 1);
            if (depthAlpha <= 0) continue;

            const pulse = Math.sin(Date.now() * 0.002 + ringZ * 0.1) * 0.5 + 0.5;

            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const p = MathUtils.getTunnelPoint(angle, this.world.tunnelRadius, relativeZ);
                const proj = MathUtils.project3D(p.x, p.y, p.z, this.camera, this.canvas);
                if (i === 0) ctx.moveTo(proj.x, proj.y);
                else ctx.lineTo(proj.x, proj.y);
            }

            ctx.strokeStyle = `rgba(0, 255, 255, ${depthAlpha * (0.3 + pulse * 0.3)})`;
            ctx.lineWidth = 1 + pulse;
            ctx.stroke();
        }

        // Draw Active Lanes (Filled / Glowing)
        for (let lane = 0; lane < numLanes; lane++) {
            const angle = (lane / numLanes) * Math.PI * 2;
            const isCurrentLane = Math.round(this.player.currentLane) === lane;
            const isTargetLane = Math.round(this.player.targetLane) === lane;

            if (!isCurrentLane && !isTargetLane) continue;

            const nextAngle = ((lane + 1) / numLanes) * Math.PI * 2;

            ctx.fillStyle = isCurrentLane ? `rgba(0, 255, 150, 0.15)` : `rgba(0, 150, 255, 0.05)`;
            ctx.shadowBlur = isCurrentLane ? 20 : 0;
            ctx.shadowColor = '#00ffaa';

            // Build the lane strip
            const stripPointsMain = [];
            const stripPointsNext = [];

            for (let ringZ of this.world.rings) {
                const relativeZ = ringZ - this.camera.z;
                if (relativeZ < 0.1 || relativeZ > 100) continue;

                const p1 = MathUtils.getTunnelPoint(angle, this.world.tunnelRadius, relativeZ);
                const p2 = MathUtils.getTunnelPoint(nextAngle, this.world.tunnelRadius, relativeZ);

                stripPointsMain.push(MathUtils.project3D(p1.x, p1.y, p1.z, this.camera, this.canvas));
                stripPointsNext.unshift(MathUtils.project3D(p2.x, p2.y, p2.z, this.camera, this.canvas));
            }

            if (stripPointsMain.length > 1) {
                ctx.beginPath();
                ctx.moveTo(stripPointsMain[0].x, stripPointsMain[0].y);
                for (let p of stripPointsMain) ctx.lineTo(p.x, p.y);
                for (let p of stripPointsNext) ctx.lineTo(p.x, p.y);
                ctx.closePath();
                ctx.fill();

                // Edges of the lane
                ctx.strokeStyle = isCurrentLane ? `rgba(0, 255, 150, 0.8)` : `rgba(0, 150, 255, 0.4)`;
                ctx.lineWidth = isCurrentLane ? 2 : 1;
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    drawObstacles() {
        const ctx = this.ctx;

        // Sort obstacles by depth for proper rendering
        const sorted = [...this.world.obstacles].sort((a, b) => b.z - a.z);

        for (let obs of sorted) {
            const relativeZ = obs.z - this.camera.z;
            if (relativeZ < 0.1 || relativeZ > 150) continue;

            const projected = MathUtils.project3D(obs.x, obs.y, relativeZ, this.camera, this.canvas);
            const size = obs.radius * projected.scale;
            if (size < 1) continue;

            // 3D rotation effect
            obs.rotation = (obs.rotation || 0) + 0.05;

            // Draw obstacle as rotating 3D shape
            const alpha = MathUtils.clamp(1 - relativeZ / 100, 0, 1);
            if (alpha <= 0) continue;

            ctx.save();
            ctx.translate(projected.x, projected.y);
            ctx.rotate(obs.rotation);

            const type = obs.type || 'sphere';

            if (type === 'cube') {
                // Neon Cube
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ff0055';
                ctx.fillStyle = `rgba(255, 0, 85, ${alpha * 0.2})`;
                ctx.fillRect(-size, -size, size * 2, size * 2);

                ctx.strokeStyle = `rgba(255, 0, 85, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(-size, -size, size * 2, size * 2);

                // Internal cross for 3D feel
                ctx.beginPath();
                ctx.moveTo(-size, -size); ctx.lineTo(size, size);
                ctx.moveTo(size, -size); ctx.lineTo(-size, size);
                ctx.stroke();

            } else {
                // Neon Sphere (Spike Mine look)
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ff0055';

                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
                gradient.addColorStop(0, `rgba(255, 0, 85, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(255, 0, 85, ${alpha * 0.4})`);
                gradient.addColorStop(1, `rgba(255, 0, 85, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();

                // Add spikes
                ctx.strokeStyle = `rgba(255, 0, 85, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.moveTo(Math.cos(angle) * size * 0.5, Math.sin(angle) * size * 0.5);
                    ctx.lineTo(Math.cos(angle) * size * 1.3, Math.sin(angle) * size * 1.3);
                }
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    drawPlayer() {
        const ctx = this.ctx;

        // Get player position on tunnel surface
        const playerPos = this.player.getPosition();
        // Fixed relativeZ for player since camera follows z
        const relativeZ = 5;

        const projected = MathUtils.project3D(playerPos.x, playerPos.y, relativeZ, this.camera, this.canvas);
        const size = this.player.radius * projected.scale;

        // Flashing effect when invulnerable
        if (this.player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(projected.x, projected.y);

        // Rotate to align with tunnel surface
        const surfaceAngle = playerPos.angle + Math.PI / 2;
        ctx.rotate(surfaceAngle);

        // Additional tilt for lane changes
        const laneDiff = this.player.targetLane - this.player.currentLane;
        ctx.rotate(laneDiff * 0.3);

        // 1. Shield effect
        if (this.player.hasShield) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffcc';
            ctx.strokeStyle = `rgba(0, 255, 200, 0.5 + 0.2*Math.sin(Date.now()*0.01))`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(0, 255, 200, 0.1)`;
            ctx.fill();
        }

        // 2. Track Glow (below ship)
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#0088ff';
        ctx.fillStyle = 'rgba(0, 136, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, size * 1.5, size * 2, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Ship Body (Futuristic Fighter)
        // Main body
        const boostColor = this.player.speedBoost > 0 ? '#ffcc00' : '#00aaff';

        ctx.shadowBlur = 15;
        ctx.shadowColor = boostColor;

        ctx.fillStyle = '#000'; // Dark core
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.8); // Nose
        ctx.lineTo(size, size); // Right wing
        ctx.lineTo(0, size * 0.6); // Rear center
        ctx.lineTo(-size, size); // Left wing
        ctx.closePath();
        ctx.fill();

        // Neon Edges
        ctx.strokeStyle = boostColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cockpit
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(size * 0.2, 0);
        ctx.lineTo(0, size * 0.2);
        ctx.lineTo(-size * 0.2, 0);
        ctx.fill();

        // Engine Thruster
        const thrustSize = (this.player.speed / this.player.baseSpeed) * size;
        const thrusterGradient = ctx.createRadialGradient(0, size * 0.6, 0, 0, size * 0.8, thrustSize * 2);
        thrusterGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        thrusterGradient.addColorStop(0.2, 'rgba(0, 255, 255, 1)');
        thrusterGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

        ctx.fillStyle = thrusterGradient;
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, size * 0.6);
        ctx.lineTo(size * 0.4, size * 0.6);
        ctx.lineTo(0, size * 0.6 + thrustSize * 2 + Math.random() * size);
        ctx.fill();

        // Speed lines when boosting
        if (this.player.speedBoost > 0) {
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-size * 1.5, size); ctx.lineTo(-size * 1.5, size * 3);
            ctx.moveTo(size * 1.5, size); ctx.lineTo(size * 1.5, size * 3);
            ctx.stroke();
        }

        ctx.restore();
    }

    updateUI() {
        const multiplier = this.player.scoreMultiplier > 1 ? ` (${this.player.scoreMultiplier}x)` : '';
        document.getElementById('score').textContent = this.world.score + multiplier;
        document.getElementById('speed').textContent = (this.player.speed / this.player.baseSpeed).toFixed(1) + 'x';
        document.getElementById('lives').textContent = this.player.lives;

        // Update combo display
        if (this.combo > 0) {
            const comboEl = document.getElementById('combo');
            if (comboEl) {
                comboEl.textContent = this.combo;
                comboEl.parentElement.style.display = 'block';
            }
        } else {
            const comboEl = document.getElementById('combo');
            if (comboEl) {
                comboEl.parentElement.style.display = 'none';
            }
        }
    }

    gameOver() {
        this.running = false;
        document.getElementById('finalScore').textContent = this.world.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    restart() {
        this.player.reset();
        this.world.reset();
        this.particles = [];
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        this.camera.shake = 0;
        this.camera.tilt = 0;
        this.running = true;
        document.getElementById('gameOver').classList.add('hidden');
    }

    screenShake(intensity) {
        this.camera.shake = intensity;
        this.camera.shakeDecay = intensity * 2;
    }

    handlePowerUp(powerUp) {
        switch (powerUp.type) {
            case 'speed':
                this.player.applySpeedBoost();
                break;
            case 'shield':
                this.player.applyShield();
                break;
            case 'multiplier':
                this.player.applyMultiplier();
                break;
        }
        this.combo++;
        this.comboTimer = 3;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    }

    drawStarfield() {
        const ctx = this.ctx;
        const stars = 100;
        for (let i = 0; i < stars; i++) {
            const x = (i * 137.5) % this.canvas.width;
            const y = (i * 271.3) % this.canvas.height;
            const z = (i * 53.7) % 100;
            const speed = this.player.speed * 0.1;
            const offset = ((this.player.z * speed + i * 10) % 200);
            const alpha = MathUtils.clamp(1 - offset / 200, 0.1, 0.8);
            const size = MathUtils.clamp(2 - offset / 100, 0.5, 2);

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPowerUps() {
        const ctx = this.ctx;
        const sorted = [...this.world.powerUps].sort((a, b) => b.z - a.z);

        for (let powerUp of sorted) {
            const relativeZ = powerUp.z - this.camera.z;
            if (relativeZ < 0.1) continue;

            const projected = MathUtils.project3D(powerUp.x, powerUp.y, relativeZ, this.camera, this.canvas);
            const size = powerUp.radius * projected.scale;
            if (size < 1) continue;

            const alpha = MathUtils.clamp(1 - relativeZ / 80, 0.3, 1);
            const rotation = Date.now() * 0.003;

            ctx.save();
            ctx.translate(projected.x, projected.y);
            ctx.rotate(rotation);

            // Draw power-up icon
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
            gradient.addColorStop(0, `${powerUp.color}`);
            gradient.addColorStop(0.6, `${powerUp.color.replace('1)', '0.6)')}`);
            gradient.addColorStop(1, `${powerUp.color.replace('1)', '0)')}`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const r = i % 2 === 0 ? size : size * 0.5;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }
    }

    spawnTrailParticle() {
        const playerPos = this.player.getPosition();

        this.particles.push({
            x: playerPos.x + (Math.random() - 0.5) * 0.5,
            y: playerPos.y + (Math.random() - 0.5) * 0.5,
            z: this.player.z - 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            vz: -5,
            life: 0.5,
            maxLife: 0.5,
            size: 2,
            color: 'rgba(0, 200, 255, 1)'
        });
    }

    spawnExplosionParticles(x, y, z) {
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = 5 + Math.random() * 10;
            this.particles.push({
                x: x,
                y: y,
                z: z,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: (Math.random() - 0.5) * 10,
                life: 1,
                maxLife: 1,
                size: 3,
                color: 'rgba(255, 100, 0, 1)'
            });
        }
    }

    spawnCollectionParticles(x, y, z, color) {
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                z: z,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: (Math.random() - 0.5) * 5,
                life: 0.8,
                maxLife: 0.8,
                size: 2,
                color: color
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;
            p.life -= dt;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        const ctx = this.ctx;

        for (let p of this.particles) {
            const relativeZ = p.z - this.camera.z;
            if (relativeZ < 0.1) continue;

            const projected = MathUtils.project3D(p.x, p.y, relativeZ, this.camera, this.canvas);
            const size = p.size * projected.scale;
            const alpha = (p.life / p.maxLife) * MathUtils.clamp(1 - relativeZ / 50, 0, 1);

            const color = p.color.replace('1)', `${alpha})`);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCombo() {
        if (this.combo < 2) return;

        const ctx = this.ctx;
        const x = this.canvas.width / 2;
        const y = 100;

        ctx.save();
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 4;

        const text = `COMBO x${this.combo}!`;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    loop() {
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame(() => this.loop());
    }

    start() {
        this.loop();
    }
}