        (function() {
            // high-level unique project: 
            // 3d parametric knot with time evolution + mouse interaction (field distortion)
            // dynamic knot changes: trefoil → figure‑eight → cinquefoil → hopf link (topological metamorphosis)
            // plus floating energy particles around the curve.
            
            const canvas = document.getElementById('quantumCanvas');
            const ctx = canvas.getContext('2d');
            const container = document.querySelector('.knot-container');
            const knotLabel = document.getElementById('knotName');

            let width, height;
            let mouseX = 0.5, mouseY = 0.5;          // normalized mouse coords (0..1)
            let mouseInside = true;

            // knot evolution parameters
            let time = 0;
            const KNOT_CYCLE = 4200; // ms per knot style
            let knotType = 0;         // 0:trefoil,1:figure8,2:cinquefoil,3:hopf

            // 80 particles (small glows along the knot)
            const PARTICLE_COUNT = 110;
            const particles = [];

            class Particle {
                constructor() {
                    this.reset( Math.random() );
                }
                reset(phaseOffset) {
                    this.phase = phaseOffset; // 0..1 position along knot
                    this.speed = 0.0006 + Math.random() * 0.0008;
                    this.sizeBase = 2 + Math.random() * 6;
                    this.hue = 200 + Math.random() * 200; // 200..400 (teal to magenta)
                    this.twinkle = Math.random() * 10;
                }
                update(dt) {
                    this.phase += this.speed * dt;
                    if (this.phase > 1) this.phase -= 1;
                }
            }

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }

            // resize handler
            function resizeCanvas() {
                width = container.clientWidth;
                height = container.clientHeight;
                canvas.width = width;
                canvas.height = height;
            }
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            // mouse tracking
            const tracker = document.getElementById('mouseTracker');
            tracker.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = (e.clientX - rect.left) / rect.width;
                mouseY = (e.clientY - rect.top) / rect.height;
                mouseInside = true;
            });
            tracker.addEventListener('mouseleave', () => {
                mouseInside = false;
            });

            // helper: parametric knot positions (x,y,z) in range -1..1, with time offset + morph
            function getKnotPoint(t, timeSec, typeBias) {
                // t in [0,1] parametric
                // typeBias: 0..1 (interpolation between knot types)
                // we use 4 base knots and smooth interpolation via typeBias
                const TAU = 2 * Math.PI;
                const angle = t * TAU;

                // base knot curves (3D)
                // trefoil (3,2) - standard
                let x1 = Math.sin(angle) + 2 * Math.sin(2 * angle);
                let y1 = Math.cos(angle) - 2 * Math.cos(2 * angle);
                let z1 = -Math.sin(3 * angle);

                // figure-eight (4,3) approximation
                let x2 = (0.8 * Math.cos(angle) + 1.2 * Math.cos(2*angle)) * 1.2;
                let y2 = (1.2 * Math.sin(angle) - 0.8 * Math.sin(2*angle)) * 1.2;
                let z2 = 1.4 * Math.sin(3*angle) - 0.3 * Math.cos(4*angle);

                // cinquefoil (5,2)
                let x3 = 1.6 * Math.cos(angle) - 0.8 * Math.cos(2*angle);
                let y3 = 1.6 * Math.sin(angle) + 0.8 * Math.sin(2*angle);
                let z3 = 1.5 * Math.sin(3*angle) + 0.4 * Math.cos(5*angle - 0.5);

                // hopf link (two linked circles) -> but we want single parametric curve: actually a simple torus knot (2,4) approximation giving two lobes
                let x4 = 1.8 * Math.cos(angle) + 0.7 * Math.cos(3*angle);
                let y4 = 1.4 * Math.sin(2*angle);
                let z4 = 1.6 * Math.sin(3*angle) * Math.cos(angle);

                // normalize amplitudes to roughly [-2,2] range, then blend
                function blend(a, b, f) { return a * (1-f) + b * f; }

                let x, y, z;
                if (typeBias < 0.33) {
                    let f = typeBias / 0.33; // 0..1 between knot0 and knot1
                    x = blend(x1, x2, f);
                    y = blend(y1, y2, f);
                    z = blend(z1, z2, f);
                } else if (typeBias < 0.66) {
                    let f = (typeBias - 0.33) / 0.33;
                    x = blend(x2, x3, f);
                    y = blend(y2, y3, f);
                    z = blend(z2, z3, f);
                } else {
                    let f = (typeBias - 0.66) / 0.34;
                    x = blend(x3, x4, f);
                    y = blend(y3, y4, f);
                    z = blend(z3, z4, f);
                }

                // apply slow time evolution: rotate and twist subtly
                let rotAngle = timeSec * 0.15;
                let cosR = Math.cos(rotAngle);
                let sinR = Math.sin(rotAngle);
                // rotate around Y
                let xr = x * cosR - z * sinR;
                let zr = x * sinR + z * cosR;
                let yr = y;
                // secondary twist around X
                let tilt = timeSec * 0.1;
                let yF = yr * Math.cos(tilt) - zr * Math.sin(tilt);
                let zF = yr * Math.sin(tilt) + zr * Math.cos(tilt);

                // mouse influence: distort based on mouse position (if inside)
                if (mouseInside) {
                    // shift coordinates based on mouse (unique distortion field)
                    let dx = (mouseX - 0.5) * 2.2;   // -1..1
                    let dy = (mouseY - 0.5) * 2.2;
                    // apply bulge
                    let influence = 0.35 * Math.sin(timeSec * 3) + 0.4;
                    xr += dx * influence * Math.sin(zF * 1.5);
                    yr += dy * influence * Math.cos(xr * 1.2);
                }

                return { x: xr, y: yF, z: zF };
            }

            // map 3D point to 2D with perspective
            function project(x, y, z, width, height) {
                const scale = 80; // projection scale factor
                const distance = 4; // perspective distance
                const factor = distance / (distance + z * 0.5);
                const screenX = width/2 + x * scale * factor;
                const screenY = height/2 + y * scale * factor * (width/height); // correct aspect
                return { x: screenX, y: screenY, factor };
            }

            // update knot label based on typeBias
            function updateKnotLabel(bias) {
                if (bias < 0.2) knotLabel.innerText = 'trefoil ✦ 3₁';
                else if (bias < 0.4) knotLabel.innerText = 'figure‑eight ✦ 4₁';
                else if (bias < 0.65) knotLabel.innerText = 'cinquefoil ✦ 5₁';
                else knotLabel.innerText = 'hopf link ✦ 2₁#2₁';
            }

            // animation loop
            let lastTimestamp = 0;
            let dt = 16; // approx

            function draw(timestamp) {
                if (!width || !height) return;

                if (lastTimestamp) {
                    dt = Math.min(100, timestamp - lastTimestamp); // limit jump
                }
                lastTimestamp = timestamp;
                time += dt / 1000; // seconds

                // knot morph cycle (period 5.6 seconds)
                const cycleSec = 5.6;
                let rawBias = (time % cycleSec) / cycleSec; // 0..1
                let typeBias = Math.abs(Math.sin(rawBias * Math.PI)); // smooth back&forth 0..1..0
                // make it more dynamic: bias goes from 0 to 1 and back, so knots transition both ways
                // we want it to feel like a continuous metamorphosis
                updateKnotLabel(typeBias);

                // clear canvas with deep gradient
                ctx.clearRect(0, 0, width, height);

                // Draw subtle "quantum grid" background (unique)
                ctx.save();
                ctx.strokeStyle = '#6d4f9a20';
                ctx.lineWidth = 0.8;
                for (let i = 0; i < 8; i++) {
                    let offset = (time * 10 + i * 40) % 200;
                    ctx.beginPath();
                    ctx.arc(width/2, height/2, 70 + i*25 + offset*0.1, 0, 2*Math.PI);
                    ctx.strokeStyle = `rgba(160, 130, 255, ${0.03+Math.sin(time+i)*0.01})`;
                    ctx.stroke();
                }
                ctx.restore();

                // draw knot (continuous line) with gradient
                ctx.lineWidth = 2.4;
                ctx.shadowColor = '#b57cff';
                ctx.shadowBlur = 24;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // sample many points for smooth curve
                const STEPS = 380;
                let points = [];

                for (let i = 0; i <= STEPS; i++) {
                    let t = i / STEPS;
                    let { x, y, z } = getKnotPoint(t, time, typeBias);
                    let proj = project(x, y, z, width, height);
                    points.push({ ...proj, z });
                }

                // draw lines with color based on depth
                ctx.beginPath();
                for (let i = 0; i < points.length - 1; i++) {
                    let p1 = points[i];
                    let p2 = points[i+1];

                    // luminosity based on depth
                    let depth1 = (p1.z * 0.5 + 0.8);
                    let depth2 = (p2.z * 0.5 + 0.8);
                    let gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    gradient.addColorStop(0, `rgba(210, 170, 255, ${0.8*depth1})`);
                    gradient.addColorStop(1, `rgba(130, 220, 255, ${0.9*depth2})`);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 2.0 + 1.6 * (1 - Math.abs(p1.z)*0.3);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }

                // draw particles (glowing dots)
                ctx.shadowBlur = 26;
                ctx.shadowColor = '#f0d6ff';
                for (let p of particles) {
                    p.update(dt);
                    // compute particle location along knot (phase + small time offset)
                    let t = (p.phase + time * 0.02) % 1.0;
                    let { x, y, z } = getKnotPoint(t, time, typeBias);
                    let proj = project(x, y, z, width, height);
                    
                    // size influenced by depth and twinkle
                    let depthFactor = 0.7 + 0.5 * Math.sin(p.twinkle + time * 5);
                    let size = p.sizeBase * (1.2 / (1 + Math.abs(z)*0.4)) * depthFactor;
                    
                    ctx.beginPath();
                    let hue = (p.hue + time * 10) % 360;
                    ctx.fillStyle = `hsla(${hue}, 85%, 70%, 0.9)`;
                    ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
                    ctx.arc(proj.x, proj.y, size, 0, 2*Math.PI);
                    ctx.fill();
                }

                // additionally draw thin "energy threads" connecting particles occasionally
                ctx.shadowBlur = 10;
                ctx.strokeStyle = '#ffffff30';
                ctx.lineWidth = 0.8;
                for (let k = 0; k < 12; k++) {
                    let idx = Math.floor(Math.random() * (PARTICLE_COUNT-1));
                    let p1 = particles[idx];
                    let p2 = particles[idx+3]; // arbitrary
                    let t1 = (p1.phase + time * 0.02) % 1.0;
                    let t2 = (p2.phase + time * 0.02) % 1.0;
                    let { x: x1, y: y1, z: z1 } = getKnotPoint(t1, time, typeBias);
                    let { x: x2, y: y2, z: z2 } = getKnotPoint(t2, time, typeBias);
                    let proj1 = project(x1, y1, z1, width, height);
                    let proj2 = project(x2, y2, z2, width, height);
                    ctx.beginPath();
                    ctx.moveTo(proj1.x, proj1.y);
                    ctx.lineTo(proj2.x, proj2.y);
                    ctx.strokeStyle = `rgba(200, 180, 255, 0.15)`;
                    ctx.stroke();
                }

                requestAnimationFrame(draw);
            }

            requestAnimationFrame(draw);
        })();