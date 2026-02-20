import { Utils } from './Utils.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.resize();

        window.addEventListener('resize', () => this.resize());

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            shakeMagnitude: 0
        };

        // Stars
        this.stars = [];
        this.initStars();
        this.initPlanets();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initStars() {
        for (let i = 0; i < 300; i++) {
            this.stars.push({
                x: Utils.randomRange(0, this.width),
                y: Utils.randomRange(-10000, this.height), // Deep space
                size: Utils.randomRange(0.5, 2),
                alpha: Utils.randomRange(0.3, 1)
            });
        }
    }

    initPlanets() {
        this.planets = [
            {
                name: 'Ares',
                x: this.width * 0.8,
                y: this.height * 0.2, // Will be offset by parallax
                radius: 40,
                color: '#ff4422',
                type: 'rocky'
            },
            {
                name: 'Jove',
                x: this.width * 0.2,
                y: -500, // Higher up in the sky
                radius: 120,
                color: '#dcbba0',
                type: 'gas',
                hasRings: true
            }
        ];
    }

    drawPlanets(altitude) {
        if (altitude < 20000) return; // Only visible in space

        const ctx = this.ctx;
        const visibility = Utils.smoothstep(20000, 60000, altitude);

        this.planets.forEach(planet => {
            ctx.save();
            ctx.globalAlpha = visibility;

            // Parallax: Planets move VERY slowly relative to camera (like stars)
            // But let's verify: In a vertical ascent, objects 'in the sky' (stars/planets) stay fixed relative to the screen 
            // IF we assume we are looking UP. 
            // If we are looking OUT (side view), they slide down.
            // Our camera is "Tracking" the rocket.
            // So the Rocket is fixed Y. Background moves down.
            // Stars move down at rate 1.0? 
            // In `drawSky`, stars move by `star.y - (this.camera.y * 0.05)`. 
            // This implies stars are far (0.05 parallax). Planets should be similar.

            let py = planet.y - (this.camera.y * 0.05); // Same parallax as stars roughly

            ctx.translate(planet.x, py);

            // Draw Planet Body
            const grad = ctx.createRadialGradient(-planet.radius * 0.3, -planet.radius * 0.3, 0, 0, 0, planet.radius);
            if (planet.type === 'rocky') {
                grad.addColorStop(0, '#ffaa88');
                grad.addColorStop(0.5, planet.color);
                grad.addColorStop(1, '#330000');
            } else {
                grad.addColorStop(0, '#fff0e0');
                grad.addColorStop(0.2, planet.color);
                grad.addColorStop(0.5, '#aa8866');
                grad.addColorStop(1, '#050505');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw Rings
            if (planet.hasRings) {
                ctx.rotate(Math.PI / 6); // Tilt
                ctx.beginPath();
                ctx.ellipse(0, 0, planet.radius * 2.5, planet.radius * 0.4, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(200, 180, 150, 0.4)';
                ctx.lineWidth = 15;
                ctx.stroke();

                ctx.beginPath();
                ctx.ellipse(0, 0, planet.radius * 2.3, planet.radius * 0.35, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(200, 180, 150, 0.2)';
                ctx.lineWidth = 5;
                ctx.stroke();
            }

            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }

    clear() {
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawSky(altitude, rocketX = 0) {
        // Gradient Interpolation based on Altitude
        // 0km -> Blue (#87CEEB)
        // 10km -> Dark Blue (#191970)
        // 100km -> Black (#000000)

        let t = Utils.clamp(altitude / 100000, 0, 1); // 0 to 1 scaling for 100km

        // Simple 3-stop gradient approximation by drawing a full rect
        // Actually, we can just use createLinearGradient for the background
        const ctx = this.ctx;

        // At 0 altitude: Top is DarkBlue, Bottom is LightBlue
        // At Max altitude: Top is Black, Bottom is Black

        // HACK: Interpolate the gradient stops manually for cinematic feel
        let colorBottom = '#000000';
        let colorTop = '#000000';

        if (altitude < 50000) {
            // Ground -> Stratosphere
            // We'll trust CSS or simple dark bg to handle the very bottom, 
            // but let's draw a nice atmospheric glow
        }

        // Draw Stars
        ctx.fillStyle = '#FFFFFF';
        this.stars.forEach(star => {
            // Parallax
            let py = star.y - (this.camera.y * 0.05);
            let px = star.x - (rocketX * 0.02); // Horizontal Parallax

            // Wrap Y correctly for negative numbers
            let periodY = this.height * 2;
            let wrappedPy = ((py % periodY) + periodY) % periodY;

            let periodX = this.width;
            let wrappedPx = ((px % periodX) + periodX) % periodX;

            // If altitude is low, stars are invisible (daytime)
            // Fade in stars as we go high
            let visibility = Utils.smoothstep(10000, 50000, altitude);

            if (visibility > 0) {
                ctx.globalAlpha = star.alpha * visibility;
                ctx.beginPath();
                ctx.arc(wrappedPx, wrappedPy, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
    }

    drawEarthParams(altitude) {
        const ctx = this.ctx;

        // 1. Draw Ground Plane (Low Altitude)
        if (altitude < 5000) { // 5km
            let horizonY = this.height - 20 + (altitude * 0.1); // Moves down as we go up
            ctx.fillStyle = '#151520'; // Dark ground
            ctx.fillRect(0, horizonY, this.width, 2000);
        }

        // 2. Earth Curvature (High Altitude)
        // Only visible at high altitudes
        if (altitude < 10000) return;

        const curvature = Utils.smoothstep(10000, 200000, altitude);

        // Center of earth is far below
        const earthRadius = 4000; // Visual Scale

        // As altitude increases, the top of the earth circle moves down
        const topOfEarthY = Utils.lerp(this.height + 200, this.height - 100, curvature);

        ctx.save();
        ctx.translate(0, topOfEarthY); // Move to where the top should be

        // Draw the large circle
        ctx.fillStyle = '#050a15';
        ctx.shadowColor = '#1e3c72';
        ctx.shadowBlur = 80; // Atmospheric glow

        ctx.beginPath();
        ctx.arc(this.width / 2, earthRadius, earthRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    applyCameraShake() {
        if (this.camera.shakeMagnitude > 0) {
            const dx = Utils.randomRange(-1, 1) * this.camera.shakeMagnitude;
            const dy = Utils.randomRange(-1, 1) * this.camera.shakeMagnitude;
            this.ctx.translate(dx, dy);

            this.camera.shakeMagnitude *= 0.95; // Decay
            if (this.camera.shakeMagnitude < 0.1) this.camera.shakeMagnitude = 0;
        }
    }

    resetTransform() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
