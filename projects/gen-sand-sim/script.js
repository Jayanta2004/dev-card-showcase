    (function() {
        // ====================  high‑level unique sand simulation ====================
        // not your ordinary particles — meta‑granular flow with 
        // cohesion, wind memory, and reactive sediments.
        
        const canvas = document.getElementById('sandCanvas');
        const ctx = canvas.getContext('2d', { alpha: false });   // solid background for unique look
        
        const W = canvas.width, H = canvas.height;

        // ==========  simulation parameters ==========
        const PARTICLE_COUNT = 2400;               // more than enough for rich texture
        const GRAVITY = 0.12;
        const BOUND_DAMP = 0.78;
        const FLOW_HISTORY = 18;                    // trail memory length (wind coherence)

        // dynamic ranges
        let fluxGain = 1.2;                          // from slider (wind influence)
        let grainCohesion = 1.8;                      // from slider (particle attraction)

        // ==========  particle array ==========
        let particles = new Array(PARTICLE_COUNT);
        
        // flow field (wind) – dynamic, changes over time & with interaction
        let flowField = [];
        const FLOW_RES = 24;  // 24x15 grid cells (40x36px each)
        const COLS = FLOW_RES;
        const ROWS = Math.floor(FLOW_RES * H / W);   // ~15

        // perlinish memory / flow inertia
        let flowVx = new Array(COLS * ROWS).fill(0);
        let flowVy = new Array(COLS * ROWS).fill(0);
        let flowTargetVx = new Array(COLS * ROWS).fill(0);
        let flowTargetVy = new Array(COLS * ROWS).fill(0);

        // === helpers ===
        function cellIndex(col, row) { return row * COLS + col; }

        // flow field smooth noise update (organic shifting)
        function updateFlowTargets() {
            const t = performance.now() / 800;   // slowly evolving

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const i = cellIndex(c, r);
                    // use harmonic pseudo‑perlin
                    const nx = c / COLS - 0.5;
                    const ny = r / ROWS - 0.5;
                    const angle1 = Math.sin(nx * 4.7 + t) * Math.cos(ny * 5.3 + t * 0.7);
                    const angle2 = Math.sin(ny * 6.2 - t * 0.4) * Math.cos(nx * 7.1 + t * 0.3);
                    const angle = angle1 * 2.5 + angle2 * 2.1 + t * 1.2;
                    
                    // target speed magnitude influenced by flux slider
                    const baseSpeed = 0.9 * fluxGain;
                    flowTargetVx[i] = Math.cos(angle) * baseSpeed + 0.3 * Math.sin(t + c * 0.4);
                    flowTargetVy[i] = Math.sin(angle) * baseSpeed + 0.3 * Math.cos(t * 1.3 + r);
                }
            }
        }

        // make flow follow target (inertial low‑pass)
        function advectFlow() {
            const inert = 0.92;      // smooth memory
            for (let i = 0; i < flowVx.length; i++) {
                flowVx[i] = flowVx[i] * inert + flowTargetVx[i] * (1 - inert);
                flowVy[i] = flowVy[i] * inert + flowTargetVy[i] * (1 - inert);
            }
        }

        // get interpolated flow at continuous (x,y)
        function sampleFlow(x, y) {
            const gx = (x / W) * COLS;
            const gy = (y / H) * ROWS;
            const c0 = Math.floor(gx);
            const r0 = Math.floor(gy);
            const fx = gx - c0;
            const fy = gy - r0;
            
            const c1 = Math.min(c0 + 1, COLS - 1);
            const r1 = Math.min(r0 + 1, ROWS - 1);
            
            // bilinear
            const i00 = cellIndex(c0, r0);
            const i10 = cellIndex(c1, r0);
            const i01 = cellIndex(c0, r1);
            const i11 = cellIndex(c1, r1);
            
            const vx00 = flowVx[i00], vy00 = flowVy[i00];
            const vx10 = flowVx[i10], vy10 = flowVy[i10];
            const vx01 = flowVx[i01], vy01 = flowVy[i01];
            const vx11 = flowVx[i11], vy11 = flowVy[i11];
            
            // interpolate vx
            const vx0 = vx00 * (1 - fx) + vx10 * fx;
            const vx1 = vx01 * (1 - fx) + vx11 * fx;
            const vx = vx0 * (1 - fy) + vx1 * fy;
            
            const vy0 = vy00 * (1 - fx) + vy10 * fx;
            const vy1 = vy01 * (1 - fx) + vy11 * fx;
            const vy = vy0 * (1 - fy) + vy1 * fy;
            
            return { fx: vx, fy: vy };
        }

        // ==========  particle reset / init ==========
        function initParticles(seed = null) {
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles[i] = {
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.8) * 1.5,
                    age: Math.random() * 100,
                };
            }
        }

        // reset canvas & flow, inject random seeds
        function fullReset() {
            initParticles();
            // reset flow memory
            for (let i = 0; i < flowVx.length; i++) {
                flowVx[i] = (Math.random() - 0.5) * 1.2;
                flowVy[i] = (Math.random() - 0.5) * 1.2;
                flowTargetVx[i] = flowVx[i];
                flowTargetVy[i] = flowVy[i];
            }
            updateFlowTargets(); // immediate fresh targets
        }

        // ==========  gust burst (add impulse to flow and particles) ==========
        function gustBurst() {
            const cx = W / 2 + (Math.random() - 0.5) * 300;
            const cy = H / 2 + (Math.random() - 0.5) * 200;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.x - cx;
                const dy = p.y - cy;
                const dist = Math.hypot(dx, dy) + 20;
                const strength = 24 * fluxGain / Math.sqrt(dist) * 1.4;
                p.vx += (dx / dist) * strength * 0.5;
                p.vy += (dy / dist) * strength * 0.5;
            }
            // also inject flow field energy
            for (let idx = 0; idx < flowVx.length; idx++) {
                flowVx[idx] += (Math.random() - 0.5) * 2.2 * fluxGain;
                flowVy[idx] += (Math.random() - 0.5) * 2.2 * fluxGain;
            }
        }

        // ==========  interaction ==========
        let mouseX = -1000, mouseY = -1000, mouseDown = false;
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouseX = (e.clientX - rect.left) * scaleX;
            mouseY = (e.clientY - rect.top) * scaleY;
            mouseDown = e.buttons === 1; // left button
        });
        canvas.addEventListener('mouseleave', () => { mouseDown = false; mouseX = -1000; });
        canvas.addEventListener('mousedown', (e) => { if (e.button === 0) mouseDown = true; });
        canvas.addEventListener('mouseup', (e) => { if (e.button === 0) mouseDown = false; });

        // slider events
        document.getElementById('fluxSlider').addEventListener('input', (e) => {
            fluxGain = parseFloat(e.target.value);
        });
        document.getElementById('grainSlider').addEventListener('input', (e) => {
            grainCohesion = parseFloat(e.target.value);
        });
        document.getElementById('resetBtn').addEventListener('click', fullReset);
        document.getElementById('gustBtn').addEventListener('click', gustBurst);

        // ==========  simulation update & render ==========
        function simulate() {
            // update flow field from organic motion
            updateFlowTargets();
            advectFlow();

            // mouse influence: repel / attract based on button (down = attract, else neutral)
            if (mouseX > 0 && mouseY > 0 && mouseX < W && mouseY < H) {
                const inflRadius = 140;
                const mx = mouseX, my = mouseY;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    const dx = p.x - mx;
                    const dy = p.y - my;
                    const dist = Math.hypot(dx, dy) + 0.1;
                    if (dist < inflRadius) {
                        const intensity = (1 - dist / inflRadius) * 1.4 * (mouseDown ? -0.7 : 0.5); // attract if down, else push
                        const normX = dx / dist, normY = dy / dist;
                        p.vx += normX * intensity * 0.8;
                        p.vy += normY * intensity * 0.8;
                    }
                }
            }

            // cohesion / grain coupling (unique: particles lightly attract each other within threshold)
            for (let iter = 0; iter < 1; iter++) {   // semi‑brute but optimized loop (random samples)
                for (let i = 0; i < PARTICLE_COUNT; i += 3) {  // sparse coupling for uniqueness
                    const a = particles[i];
                    const b = particles[(i + 137) % PARTICLE_COUNT];   // pseudo‑random neighbour
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 0.1 && dist < 42) {
                        const strength = 0.00012 * grainCohesion * (42 - dist);
                        a.vx -= dx * strength;
                        a.vy -= dy * strength;
                        b.vx += dx * strength;
                        b.vy += dy * strength;
                    }
                }
            }

            // main particle integration
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];

                // flow field influence
                const flow = sampleFlow(p.x, p.y);
                p.vx += flow.fx * fluxGain * 0.4;
                p.vy += flow.fy * fluxGain * 0.4;

                // gravity (soft)
                p.vy += GRAVITY * 0.2;

                // move
                p.x += p.vx;
                p.y += p.vy;

                // boundary friction & containment (soft, organic)
                if (p.x < 5) { p.x = 5 + (5 - p.x) * 0.2; p.vx *= -0.3; p.vy *= 0.96; }
                if (p.x > W - 5) { p.x = W - 5 - (p.x - (W - 5)) * 0.2; p.vx *= -0.3; p.vy *= 0.96; }
                if (p.y < 5) { p.y = 5 + (5 - p.y) * 0.2; p.vy *= -0.2; p.vx *= 0.96; }
                if (p.y > H - 5) { p.y = H - 5 - (p.y - (H - 5)) * 0.3; p.vy *= -0.25; p.vx *= 0.96; }

                // drag
                p.vx *= 0.996;
                p.vy *= 0.996;
            }

            // rendering (solid background + glowing grains)
            ctx.fillStyle = '#1f2120';     // deep warm gray
            ctx.fillRect(0, 0, W, H);

            // draw particles with unique sand style: layered radiance
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                const intensity = 0.7 + 0.3 * Math.sin(p.age + p.x * 0.02);
                
                // color palette: warm ochre / gold / sand
                const r = 190 + Math.floor(45 * Math.sin(p.x * 0.01 + p.y * 0.008));
                const g = 140 + Math.floor(30 * Math.cos(p.y * 0.009));
                const b = 90 + Math.floor(20 * Math.sin(p.x * 0.012 + 2));
                
                // glow size based on cohesion slider (unique interaction)
                const size = 1.8 + grainCohesion * 1.0 + 1.2 * Math.sin(p.x * 0.05 + p.y * 0.03);
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
                ctx.fill();
                // extra bloom highlight
                ctx.beginPath();
                ctx.arc(p.x-0.8, p.y-0.5, size*0.3, 0, Math.PI*2);
                ctx.fillStyle = `rgba(255, 230, 170, 0.5)`;
                ctx.fill();
            }

            // draw faint flow lines (unique wind traces)
            ctx.globalAlpha = 0.08;
            ctx.strokeStyle = '#a7855a';
            ctx.lineWidth = 1.4;
            for (let r = 0; r < ROWS; r+=2) {
                for (let c = 0; c < COLS; c+=2) {
                    const i = cellIndex(c, r);
                    const x = (c + 0.5) * W / COLS;
                    const y = (r + 0.5) * H / ROWS;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + flowVx[i] * 20, y + flowVy[i] * 18);
                    ctx.strokeStyle = '#dbb484';
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1.0;
        }

        // ==========  animation loop with FPS counter ==========
        let fps = 0, lastFrame = performance.now(), frameCount = 0;
        function animate() {
            simulate();

            // update FPS
            frameCount++;
            const now = performance.now();
            const delta = now - lastFrame;
            if (delta >= 200) {
                fps = Math.round((frameCount * 1000) / delta);
                document.getElementById('frameCounter').innerText = `⏵ ${fps} fps`;
                frameCount = 0;
                lastFrame = now;
            }

            requestAnimationFrame(animate);
        }

        // start
        fullReset();
        animate();

        // optional: occasional micro gust (spontaneous)
        setInterval(() => {
            if (Math.random() < 0.15) gustBurst();  // random bursts
        }, 3200);

    })();