class PortalEffects {
    constructor(canvas, windowId) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.windowId = windowId;
        this.particles = [];
        this.maxParticles = 30;
        this.trailPoints = [];
        this.maxTrailPoints = 20;
        this.portalEdges = {
            top: null,
            right: null,
            bottom: null,
            left: null
        };
        this.activeEdge = null;
        this.edgeActiveDuration = 500;
        this.edgeActiveStartTime = 0;
    }

    initialize() {
        this.portalEdges = {
            top: document.querySelector('.portal-top'),
            right: document.querySelector('.portal-right'),
            bottom: document.querySelector('.portal-bottom'),
            left: document.querySelector('.portal-left')
        };
    }

    activatePortalEdge(edge) {
        this.activeEdge = edge;
        this.edgeActiveStartTime = Date.now();

        if (this.portalEdges[edge]) {
            this.portalEdges[edge].classList.add('active');

            setTimeout(() => {
                if (this.portalEdges[edge]) {
                    this.portalEdges[edge].classList.remove('active');
                }
            }, this.edgeActiveDuration);
        }
    }

    createTeleportFlash(x, y) {
        const flash = document.createElement('div');
        flash.className = 'teleport-flash';
        flash.style.left = x + 'px';
        flash.style.top = y + 'px';
        document.body.appendChild(flash);

        setTimeout(() => {
            flash.remove();
        }, 400);
    }

    createParticleBurst(x, y, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 100 + Math.random() * 100;
            const lifetime = 0.5 + Math.random() * 0.5;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                lifetime: lifetime,
                maxLifetime: lifetime,
                size: 3 + Math.random() * 3,
                createdAt: Date.now()
            });
        }

        while (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.lifetime -= deltaTime;
            return particle.lifetime > 0;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.lifetime / particle.maxLifetime;
            const color = this.windowId === 'window1' ?
                `rgba(0, 255, 255, ${alpha})` :
                `rgba(255, 0, 255, ${alpha})`;

            this.ctx.save();
            this.ctx.fillStyle = color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    addTrailPoint(x, y) {
        this.trailPoints.push({ x, y, timestamp: Date.now() });

        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }
    }

    drawTrail() {
        if (this.trailPoints.length < 2) return;

        this.ctx.save();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        for (let i = 1; i < this.trailPoints.length; i++) {
            const point = this.trailPoints[i];
            const prevPoint = this.trailPoints[i - 1];
            const alpha = i / this.trailPoints.length;
            const lineWidth = alpha * 4;

            const color = this.windowId === 'window1' ?
                `rgba(0, 255, 255, ${alpha * 0.5})` :
                `rgba(255, 0, 255, ${alpha * 0.5})`;

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(prevPoint.x, prevPoint.y);
            this.ctx.lineTo(point.x, point.y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    clearTrail() {
        this.trailPoints = [];
    }

    drawBall(x, y, radius, color) {
        this.ctx.save();

        const gradient = this.ctx.createRadialGradient(
            x - radius * 0.3,
            y - radius * 0.3,
            0,
            x,
            y,
            radius
        );

        if (this.windowId === 'window1') {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, '#00ffff');
            gradient.addColorStop(1, '#0088ff');
        } else {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, '#ff00ff');
            gradient.addColorStop(1, '#ff0088');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.windowId === 'window1' ?
            'rgba(0, 255, 255, 0.8)' :
            'rgba(255, 0, 255, 0.8)';

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawGlow(x, y, radius) {
        this.ctx.save();

        const glowRadius = radius * 2;
        const gradient = this.ctx.createRadialGradient(x, y, radius, x, y, glowRadius);

        if (this.windowId === 'window1') {
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 0, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    render(ballState, deltaTime) {
        this.updateParticles(deltaTime);

        if (ballState.isVisible) {
            this.drawGlow(ballState.position.x, ballState.position.y, ballState.radius);
            this.drawTrail();
            this.drawBall(ballState.position.x, ballState.position.y, ballState.radius, ballState.color);

            if (ballState.isActive) {
                this.addTrailPoint(ballState.position.x, ballState.position.y);
            }
        }

        this.drawParticles();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    handleTransfer(transferData) {
        this.activatePortalEdge(transferData.exitEdge);
        this.createTeleportFlash(
            transferData.position.x,
            transferData.position.y
        );
        this.createParticleBurst(
            transferData.position.x,
            transferData.position.y
        );
        this.clearTrail();
    }

    handleReceive(transferData) {
        this.activatePortalEdge(transferData.entryEdge || 'left');
        this.createTeleportFlash(
            transferData.position.x,
            transferData.position.y
        );
        this.createParticleBurst(
            transferData.position.x,
            transferData.position.y
        );
    }

    reset() {
        this.particles = [];
        this.trailPoints = [];
        this.activeEdge = null;
    }
}

if (typeof window !== 'undefined') {
    window.PortalEffects = PortalEffects;
}
