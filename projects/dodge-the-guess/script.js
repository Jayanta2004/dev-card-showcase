    (function() {
        // ==================== UNIQUE HYBRID: DEFLECTOR + DODGE ====================
        // canvas & context
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // UI elements
        const scoreSpan = document.getElementById('scoreDisplay');
        const hpSpan = document.getElementById('hpDisplay');
        const hpIconSpan = document.getElementById('hpIcon');
        const restartBtn = document.getElementById('restartButton');
        const soundToggle = document.getElementById('soundTogle');

        // ---------- game constants ----------
        const PLAYER_RADIUS = 16;            // visual size, collision is circular
        const BASE_ENEMY_RADIUS = 14;         // cubes are squares but collision circle
        const MAX_HEALTH = 3;
        const INVINCIBLE_DURATION = 70;       // frames ~1.2 sec (60fps)
        readonly const SPAWN_RATE = 24;        // frames between spawns (0.4 sec)
        readonly const MAX_ENEMIES = 32;
        const BASE_SPEED = 1.7;
        const SLOW_MODE_FACTOR = 0.65;         // after half health, unique twist

        // ---------- global state ----------
        let gameActive = true;                  // false = game over
        let score = 0;
        let health = MAX_HEALTH;
        let invincibleFrames = 0;               // >0 => blinking / no damage

        // player position (mouse relative to canvas)
        let player = { x: canvas.width/2, y: canvas.height/2 };

        // enemies array
        let enemies = [];

        // spawn counter
        let spawnTimer = 0;

        // sound/mute (pseudo toggle, just visual indicator)
        let soundMuted = false;   // no actual audio, just UI feedback

        // game loop & frame id
        let animationId = null;
        let frame = 0;

        // mouse tracking (relative to canvas)
        function handleMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            let rawX = (e.clientX - rect.left) * scaleX;
            let rawY = (e.clientY - rect.top) * scaleY;

            // clamp to canvas (with some padding so whole circle stays inside)
            const margin = PLAYER_RADIUS;
            player.x = Math.min(Math.max(rawX, margin), canvas.width - margin);
            player.y = Math.min(Math.max(rawY, margin), canvas.height - margin);
        }

        // mouse leave -> don't break, just keep last position (safe)
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseenter', handleMouseMove);

        // optional touch for mobile? but fine, mouse only but graceful.
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            let rawX = (touch.clientX - rect.left) * scaleX;
            let rawY = (touch.clientY - rect.top) * scaleY;
            player.x = Math.min(Math.max(rawX, PLAYER_RADIUS), canvas.width - PLAYER_RADIUS);
            player.y = Math.min(Math.max(rawY, PLAYER_RADIUS), canvas.height - PLAYER_RADIUS);
        }, { passive: false });

        // restart function : reset everything
        function restartGame() {
            gameActive = true;
            health = MAX_HEALTH;
            score = 0;
            invincibleFrames = 0;
            enemies = [];
            spawnTimer = 0;
            frame = 0;
            // reset player to middle (safer)
            player.x = canvas.width/2;
            player.y = canvas.height/2;
            updateUI();
        }

        // UI update (score & hp)
        function updateUI() {
            // score with leading zeros
            scoreSpan.textContent = String(Math.min(score, 999)).padStart(3, '0');
            hpSpan.textContent = health;

            // heart icons (visual only)
            let hearts = '';
            for (let i=0; i<MAX_HEALTH; i++) {
                hearts += (i < health) ? '❤️' : '🖤';
            }
            hpIconSpan.textContent = hearts;
        }

        // spawn new cube enemy (square but circle collision)
        function spawnEnemy() {
            if (!gameActive) return;
            if (enemies.length >= MAX_ENEMIES) return;

            const side = Math.floor(Math.random() * 4); // 0:left,1:right,2:top,3:bottom
            let x, y;
            const pad = BASE_ENEMY_RADIUS + 4;
            if (side === 0) { // left
                x = -pad;
                y = Math.random() * canvas.height;
            } else if (side === 1) { // right
                x = canvas.width + pad;
                y = Math.random() * canvas.height;
            } else if (side === 2) { // top
                x = Math.random() * canvas.width;
                y = -pad;
            } else { // bottom
                x = Math.random() * canvas.width;
                y = canvas.height + pad;
            }

            // direction: towards player (with some randomness ~ unique twist: homing hybrid)
            const angleToPlayer = Math.atan2(player.y - y, player.x - x);
            // add random deviation up to 0.4 rad (makes it less robotic)
            const angle = angleToPlayer + (Math.random() - 0.5) * 0.8;

            // speed affected by health (unique: slower when hurt = easier to recover)
            let currentSpeed = BASE_SPEED;
            if (health <= 1) {
                currentSpeed *= SLOW_MODE_FACTOR;  // less frantic when last heart
            }

            const vx = Math.cos(angle) * currentSpeed;
            const vy = Math.sin(angle) * currentSpeed;

            enemies.push({
                x, y,
                vx, vy,
                r: BASE_ENEMY_RADIUS,
                // unique property: each enemy wiggles slightly? we add per-frame offset later
                phase: Math.random() * 100,
            });
        }

        // collision detection & logic
        function updateGame() {
            if (!gameActive) return;

            // 1. decrease invincibility
            if (invincibleFrames > 0) {
                invincibleFrames--;
            }

            // 2. spawn enemies
            spawnTimer++;
            if (spawnTimer >= SPAWN_RATE) {
                spawnTimer = 0;
                spawnEnemy();
                // sometimes spawn an extra if score high (unique: pressure)
                if (score > 50 && Math.random() < 0.45 && enemies.length < MAX_ENEMIES-1) {
                    spawnEnemy(); // double spawn occasionally
                }
            }

            // 3. move enemies & boundary removal
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];

                // move
                e.x += e.vx;
                e.y += e.vy;

                // unique perlin-like wiggle (tiny sine shift)
                e.x += Math.sin(frame * 0.02 + e.phase) * 0.2;
                e.y += Math.cos(frame * 0.03 + e.phase) * 0.2;

                // remove if far outside (off by 100px)
                if (e.x < -100 || e.x > canvas.width + 100 || e.y < -100 || e.y > canvas.height + 100) {
                    enemies.splice(i, 1);
                }
            }

            // 4. player collision (circle)
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const dx = player.x - e.x;
                const dy = player.y - e.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const collisionDist = PLAYER_RADIUS + e.r;

                if (dist < collisionDist) {
                    if (invincibleFrames <= 0 && gameActive) {
                        // hit!
                        health--;
                        if (health <= 0) {
                            health = 0;
                            gameActive = false;
                            updateUI();
                            break;  // stop checking, game over
                        } else {
                            invincibleFrames = INVINCIBLE_DURATION;
                            // unique twist: remove enemy on hit? yes (defensive burst)
                            enemies.splice(i, 1);
                            i--; // adjust index
                            // continue checking other enemies
                        }
                    } else {
                        // invincible: still remove enemy? unique: deflector shield! removes enemy, no damage.
                        enemies.splice(i, 1);
                        i--;
                        // tiny score bonus for deflect? sure, +2
                        if (gameActive) {
                            score = Math.min(score + 2, 999);
                        }
                    }
                    updateUI();
                }
            }

            // if game became inactive due to health, stop extra processing
            if (!gameActive) {
                // but we still need to draw gameOver state
            } else {
                // increase score slowly over time (survival)
                if (frame % 6 === 0) {
                    score = Math.min(score + 1, 999);
                    updateUI();
                }
            }

            // update UI health if changed during loop
            updateUI();
        }

        // drawing routine (with style)
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // background grid (unique aesthetic)
            ctx.strokeStyle = '#2e5570';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < canvas.width; i += 35) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.strokeStyle = '#4f7e9e';
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 35) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.strokeStyle = '#4f7e9e';
                ctx.stroke();
            }
            ctx.globalAlpha = 1.0;

            // draw enemies (red cubes with glint)
            for (let e of enemies) {
                // unique cube style
                ctx.shadowColor = '#ff8c8c';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#de3c3c';
                ctx.beginPath();
                ctx.rect(e.x - e.r, e.y - e.r, e.r*2, e.r*2);
                ctx.fill();

                // inner highlight
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.rect(e.x - e.r + 3, e.y - e.r + 3, e.r*2 - 6, e.r*2 - 6);
                ctx.fill();

                // creepy eyes
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(e.x - 5, e.y - 4, 4, 0, 2*Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(e.x + 5, e.y - 4, 4, 0, 2*Math.PI);
                ctx.fill();
                ctx.fillStyle = '#0f1f2f';
                ctx.beginPath();
                ctx.arc(e.x - 6, e.y - 6, 2, 0, 2*Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(e.x + 4, e.y - 6, 2, 0, 2*Math.PI);
                ctx.fill();
            }

            // draw player (unique: circle with crosshair + shield if invincible)
            ctx.shadowColor = '#b3f0ff';
            ctx.shadowBlur = 22;

            // invincible effect: rainbow shield
            if (invincibleFrames > 0) {
                ctx.shadowColor = '#f5ff9c';
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.arc(player.x, player.y, PLAYER_RADIUS + 6, 0, 2*Math.PI);
                ctx.strokeStyle = '#fffeca';
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            // body
            ctx.shadowBlur = 24;
            ctx.fillStyle = '#96e6ff';
            ctx.beginPath();
            ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, 2*Math.PI);
            ctx.fill();

            // inner core
            ctx.fillStyle = '#d4f4ff';
            ctx.beginPath();
            ctx.arc(player.x, player.y, PLAYER_RADIUS-4, 0, 2*Math.PI);
            ctx.fill();

            // crosshair
            ctx.shadowBlur = 8;
            ctx.strokeStyle = '#191919';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(player.x - 18, player.y);
            ctx.lineTo(player.x - 8, player.y);
            ctx.moveTo(player.x + 8, player.y);
            ctx.lineTo(player.x + 18, player.y);
            ctx.moveTo(player.x, player.y - 18);
            ctx.lineTo(player.x, player.y - 8);
            ctx.moveTo(player.x, player.y + 8);
            ctx.lineTo(player.x, player.y + 18);
            ctx.stroke();

            ctx.shadowBlur = 0;

            // game over overlay
            if (!gameActive) {
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = '#0b141e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
                ctx.font = 'bold 46px "Segoe UI", monospace';
                ctx.fillStyle = '#fbc0a0';
                ctx.shadowColor = '#ff6767';
                ctx.shadowBlur = 17;
                ctx.fillText('☠ GAME OVER', 160, 260);
                ctx.shadowBlur = 0;
            }
        }

        // main loop
        function gameLoop() {
            if (gameActive) {
                updateGame();
            }
            draw();
            frame++;
            animationId = requestAnimationFrame(gameLoop);
        }

        // start loop
        restartGame(); // initial fresh state
        animationId = requestAnimationFrame(gameLoop);

        // restart button event
        restartBtn.addEventListener('click', () => {
            restartGame();
        });

        // sound toggle just for fun (visual only, no audio)
        soundToggle.addEventListener('click', () => {
            soundMuted = !soundMuted;
            soundToggle.textContent = soundMuted ? '🔇 unmute (fake)' : '🔊 mute (fake)';
        });

        // handle window blur / stop jitter, but fine
        window.addEventListener('resize', () => {}); // dummy

        // clean up on page unload (optional)
        window.addEventListener('beforeunload', () => {
            if (animationId) cancelAnimationFrame(animationId);
        });

        // initial UI
        updateUI();
    })();