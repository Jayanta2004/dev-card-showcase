document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    const fuelEl = document.getElementById('fuel-value');
    const scoreEl = document.getElementById('score-value');

    // Game constants
    const PLAYER_SIZE = 20;
    const DEBRIS_SIZE = 10;
    const MAX_DEBRIS = 10;
    const FUEL_CONSUMPTION = 0.1;
    const THRUST = 0.2;
    const FRICTION = 0.98;
    const TETHER_FORCE = 0.05;
    const CLEANUP_ZONE = { x: 50, y: 50, w: 100, h: 100 };

    // Game state
    let player = { x: canvas.width / 2, y: canvas.height / 2, vx: 0, vy: 0 };
    let fuel = 100;
    let score = 0;
    let debris = [];
    let tethered = null; // index of tethered debris
    let mouse = { x: 0, y: 0 };

    // Initialize debris
    for (let i = 0; i < MAX_DEBRIS; i++) {
        debris.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }

    // Controls
    const keys = {};
    document.addEventListener('keydown', (e) => keys[e.key] = true);
    document.addEventListener('keyup', (e) => keys[e.key] = false);
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('click', () => {
        if (tethered === null) {
            // Find nearest debris
            let nearest = -1;
            let minDist = Infinity;
            debris.forEach((d, i) => {
                const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = i;
                }
            });
            if (minDist < 50) tethered = nearest;
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') tethered = null;
    });

    function update() {
        // Player movement
        if (fuel > 0) {
            if (keys['w'] || keys['W']) { player.vy -= THRUST; fuel -= FUEL_CONSUMPTION; }
            if (keys['s'] || keys['S']) { player.vy += THRUST; fuel -= FUEL_CONSUMPTION; }
            if (keys['a'] || keys['A']) { player.vx -= THRUST; fuel -= FUEL_CONSUMPTION; }
            if (keys['d'] || keys['D']) { player.vx += THRUST; fuel -= FUEL_CONSUMPTION; }
        }

        // Apply friction
        player.vx *= FRICTION;
        player.vy *= FRICTION;

        // Update player position
        player.x += player.vx;
        player.y += player.vy;

        // Keep player in bounds
        player.x = Math.max(PLAYER_SIZE/2, Math.min(canvas.width - PLAYER_SIZE/2, player.x));
        player.y = Math.max(PLAYER_SIZE/2, Math.min(canvas.height - PLAYER_SIZE/2, player.y));

        // Update debris
        debris.forEach((d, i) => {
            d.x += d.vx;
            d.y += d.vy;
            d.vx *= FRICTION;
            d.vy *= FRICTION;

            // Wrap around screen
            if (d.x < 0) d.x = canvas.width;
            if (d.x > canvas.width) d.x = 0;
            if (d.y < 0) d.y = canvas.height;
            if (d.y > canvas.height) d.y = 0;

            // Tether logic
            if (tethered === i) {
                const dx = player.x - d.x;
                const dy = player.y - d.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 100) { // Max tether length
                    tethered = null;
                } else {
                    const force = TETHER_FORCE;
                    player.vx -= dx / dist * force;
                    player.vy -= dy / dist * force;
                    d.vx += dx / dist * force;
                    d.vy += dy / dist * force;

                    // Check if in cleanup zone
                    if (d.x > CLEANUP_ZONE.x && d.x < CLEANUP_ZONE.x + CLEANUP_ZONE.w &&
                        d.y > CLEANUP_ZONE.y && d.y < CLEANUP_ZONE.y + CLEANUP_ZONE.h) {
                        score += 10;
                        debris.splice(i, 1);
                        tethered = null;
                        // Add new debris
                        debris.push({
                            x: Math.random() * canvas.width,
                            y: Math.random() * canvas.height,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2
                        });
                    }
                }
            }
        });

        fuel = Math.max(0, fuel);
        fuelEl.textContent = Math.round(fuel);
        scoreEl.textContent = score;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw cleanup zone
        ctx.strokeStyle = '#0f0';
        ctx.strokeRect(CLEANUP_ZONE.x, CLEANUP_ZONE.y, CLEANUP_ZONE.w, CLEANUP_ZONE.h);

        // Draw debris
        ctx.fillStyle = '#f00';
        debris.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, DEBRIS_SIZE, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw player
        ctx.fillStyle = '#00f';
        ctx.fillRect(player.x - PLAYER_SIZE/2, player.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);

        // Draw tether
        if (tethered !== null) {
            ctx.strokeStyle = '#ff0';
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(debris[tethered].x, debris[tethered].y);
            ctx.stroke();
        }

        // Draw mouse aim
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});