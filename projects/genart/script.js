        class GenerativeArt {
            constructor(canvas) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.width = canvas.width = window.innerWidth * 0.75;
                this.height = canvas.height = window.innerHeight;
                
                this.pattern = 'flow';
                this.primaryColor = '#FF6B6B';
                this.secondaryColor = '#4ECDC4';
                this.bgColor = '#1A1A2E';
                this.complexity = 50;
                this.density = 50;
                this.speed = 50;
                this.scale = 50;
                this.rotation = 0;
                
                this.animating = true;
                this.time = 0;
                this.particles = [];
                this.frames = 0;
                this.lastTime = performance.now();
                this.fps = 60;
                this.artCounter = 1;
                this.savedArts = [];
                
                this.initParticles();
                this.animate();
                this.setupResize();
            }

            initParticles() {
                this.particles = [];
                const count = Math.floor(this.density * 2);
                for (let i = 0; i < count; i++) {
                    this.particles.push({
                        x: Math.random() * this.width,
                        y: Math.random() * this.height,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        size: Math.random() * 3 + 1,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }

            drawFlow() {
                const ctx = this.ctx;
                const time = this.time * (this.speed / 50);
                const scale = this.scale / 20;
                const complexity = this.complexity / 20;

                ctx.strokeStyle = this.primaryColor;
                ctx.lineWidth = 1;

                for (let i = 0; i < this.density * 2; i++) {
                    const x = (i / (this.density * 2)) * this.width;
                    
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    
                    for (let y = 0; y < this.height; y += 5) {
                        const noise = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time) * 50;
                        const offset = Math.sin(y * 0.02 + time * 2) * 20;
                        const xOffset = Math.sin(y * 0.01 + time) * 30 * (this.complexity / 50);
                        
                        ctx.lineTo(x + xOffset + noise, y);
                    }
                    
                    ctx.strokeStyle = `hsla(${(i * 5 + time * 10) % 360}, 70%, 60%, 0.3)`;
                    ctx.stroke();
                }
            }

            drawCrystal() {
                const ctx = this.ctx;
                const time = this.time * (this.speed / 50);
                const complexity = this.complexity / 20;

                ctx.clearRect(0, 0, this.width, this.height);
                ctx.fillStyle = this.bgColor;
                ctx.fillRect(0, 0, this.width, this.height);

                const centerX = this.width / 2;
                const centerY = this.height / 2;
                const maxRadius = Math.min(this.width, this.height) * 0.4;

                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2 + time;
                    
                    for (let j = 0; j < this.density; j++) {
                        const radius = (j / this.density) * maxRadius;
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;
                        
                        const size = 5 * (1 - j / this.density) * (this.scale / 50);
                        const rotation = angle + time;
                        
                        ctx.save();
                        ctx.translate(x, y);
                        ctx.rotate(rotation);
                        
                        // Draw crystal shape
                        ctx.beginPath();
                        for (let k = 0; k < 6; k++) {
                            const crystalAngle = (k / 6) * Math.PI * 2;
                            const x1 = Math.cos(crystalAngle) * size;
                            const y1 = Math.sin(crystalAngle) * size;
                            
                            if (k === 0) ctx.moveTo(x1, y1);
                            else ctx.lineTo(x1, y1);
                        }
                        ctx.closePath();
                        
                        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
                        gradient.addColorStop(0, this.primaryColor);
                        gradient.addColorStop(1, this.secondaryColor);
                        
                        ctx.fillStyle = gradient;
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.stroke();
                        
                        ctx.restore();
                    }
                }
            }

            drawWave() {
                const ctx = this.ctx;
                const time = this.time * (this.speed / 50);
                const scale = this.scale / 20;

                ctx.clearRect(0, 0, this.width, this.height);
                ctx.fillStyle = this.bgColor;
                ctx.fillRect(0, 0, this.width, this.height);

                for (let i = 0; i < this.density; i++) {
                    const y = (i / this.density) * this.height;
                    const amplitude = 50 * (this.complexity / 50);
                    const frequency = 0.02 * (this.scale / 50);
                    
                    ctx.beginPath();
                    
                    for (let x = 0; x < this.width; x += 5) {
                        const wave1 = Math.sin(x * frequency + time) * amplitude;
                        const wave2 = Math.sin(x * frequency * 2 + time * 2) * amplitude * 0.5;
                        const wave3 = Math.cos(x * frequency * 0.5 + time) * amplitude * 0.3;
                        
                        const yOffset = y + wave1 + wave2 + wave3;
                        
                        if (x === 0) ctx.moveTo(x, yOffset);
                        else ctx.lineTo(x, yOffset);
                    }
                    
                    const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
                    gradient.addColorStop(0, this.primaryColor);
                    gradient.addColorStop(1, this.secondaryColor);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            drawSpiral() {
                const ctx = this.ctx;
                const time = this.time * (this.speed / 50);
                
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.fillStyle = this.bgColor;
                ctx.fillRect(0, 0, this.width, this.height);

                const centerX = this.width / 2;
                const centerY = this.height / 2;
                const turns = 5 * (this.complexity / 50);
                const maxRadius = Math.min(this.width, this.height) * 0.4 * (this.scale / 50);

                ctx.beginPath();
                
                for (let i = 0; i < 1000; i += 1) {
                    const t = i / 100;
                    const angle = t * Math.PI * 2 * turns + time;
                    const radius = t * maxRadius;
                    
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                
                const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
                gradient.addColorStop(0, this.primaryColor);
                gradient.addColorStop(1, this.secondaryColor);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw particles along spiral
                for (let i = 0; i < this.density * 2; i++) {
                    const t = i / (this.density * 2);
                    const angle = t * Math.PI * 2 * turns + time;
                    const radius = t * maxRadius;
                    
                    const x = centerX + Math.cos(angle + time) * radius;
                    const y = centerY + Math.sin(angle + time) * radius;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = i % 2 ? this.primaryColor : this.secondaryColor;
                    ctx.fill();
                }
            }

            drawFractal() {
                const ctx = this.ctx;
                const time = this.time * (this.speed / 50);
                
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.fillStyle = this.bgColor;
                ctx.fillRect(0, 0, this.width, this.height);

                const drawBranch = (x, y, angle, depth, scale) => {
                    if (depth === 0) return;
                    
                    const length = 50 * (depth / 5) * (this.scale / 50);
                    const endX = x + Math.cos(angle) * length;
                    const endY = y + Math.sin(angle) * length;
                    
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(endX, endY);
                    
                    const gradient = ctx.createLinearGradient(x, y, endX, endY);
                    gradient.addColorStop(0, this.primaryColor);
                    gradient.addColorStop(1, this.secondaryColor);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = depth * 2;
                    ctx.stroke();
                    
                    const newDepth = depth - 1;
                    const spread = 0.5 * (this.complexity / 50);
                    
                    drawBranch(endX, endY, angle - spread, newDepth, scale * 0.8);
                    drawBranch(endX, endY, angle + spread, newDepth, scale * 0.8);
                    
                    if (depth === 3) {
                        drawBranch(endX, endY, angle - spread * 2, newDepth - 1, scale * 0.6);
                        drawBranch(endX, endY, angle + spread * 2, newDepth - 1, scale * 0.6);
                    }
                };

                const centerX = this.width / 2;
                const centerY = this.height / 2;
                
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2 + time * 0.1;
                    drawBranch(centerX, centerY, angle, 5, 1);
                }
            }

            drawParticles() {
                const ctx = this.ctx;
                const time = this.time * (this.speed / 50);
                
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.fillStyle = this.bgColor;
                ctx.fillRect(0, 0, this.width, this.height);

                // Update and draw particles
                for (let i = 0; i < this.particles.length; i++) {
                    const p = this.particles[i];
                    
                    // Update position with flow field
                    const angle = Math.sin(p.x * 0.01 + time) * Math.cos(p.y * 0.01 + time) * 2;
                    p.vx += Math.cos(angle) * 0.1;
                    p.vy += Math.sin(angle) * 0.1;
                    
                    // Limit velocity
                    const maxSpeed = 2;
                    if (Math.abs(p.vx) > maxSpeed) p.vx = Math.sign(p.vx) * maxSpeed;
                    if (Math.abs(p.vy) > maxSpeed) p.vy = Math.sign(p.vy) * maxSpeed;
                    
                    p.x += p.vx * (this.speed / 50);
                    p.y += p.vy * (this.speed / 50);
                    
                    // Wrap around edges
                    if (p.x < 0) p.x = this.width;
                    if (p.x > this.width) p.x = 0;
                    if (p.y < 0) p.y = this.height;
                    if (p.y > this.height) p.y = 0;
                    
                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * (this.scale / 50), 0, Math.PI * 2);
                    
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
                    gradient.addColorStop(0, this.primaryColor);
                    gradient.addColorStop(1, this.secondaryColor);
                    
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    
                    // Draw connections
                    for (let j = i + 1; j < this.particles.length; j++) {
                        const p2 = this.particles[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < 100) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = `rgba(78, 205, 196, ${0.2 * (1 - dist / 100)})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
            }

            draw() {
                switch(this.pattern) {
                    case 'flow': this.drawFlow(); break;
                    case 'crystal': this.drawCrystal(); break;
                    case 'wave': this.drawWave(); break;
                    case 'spiral': this.drawSpiral(); break;
                    case 'fractal': this.drawFractal(); break;
                    case 'particles': this.drawParticles(); break;
                }
                
                // Update stats
                document.getElementById('particleCount').textContent = this.particles.length;
            }

            animate() {
                if (this.animating) {
                    this.time += 0.01;
                    
                    // Calculate FPS
                    this.frames++;
                    const now = performance.now();
                    const delta = now - this.lastTime;
                    
                    if (delta >= 1000) {
                        this.fps = this.frames;
                        this.frames = 0;
                        this.lastTime = now;
                        document.getElementById('fps').textContent = this.fps;
                    }
                    
                    this.draw();
                }
                
                requestAnimationFrame(() => this.animate());
            }

            setupResize() {
                window.addEventListener('resize', () => {
                    this.width = this.canvas.width = window.innerWidth * 0.75;
                    this.height = this.canvas.height = window.innerHeight;
                    this.initParticles();
                });
            }

            updateFromControls() {
                this.primaryColor = document.getElementById('primaryColor').value;
                this.secondaryColor = document.getElementById('secondaryColor').value;
                this.bgColor = document.getElementById('bgColor').value;
                this.complexity = parseFloat(document.getElementById('complexity').value);
                this.density = parseFloat(document.getElementById('density').value);
                this.speed = parseFloat(document.getElementById('speed').value);
                this.scale = parseFloat(document.getElementById('scale').value);
                this.rotation = parseFloat(document.getElementById('rotation').value);
                
                // Update displays
                document.getElementById('primaryColorVal').textContent = this.primaryColor;
                document.getElementById('secondaryColorVal').textContent = this.secondaryColor;
                document.getElementById('bgColorVal').textContent = this.bgColor;
                document.getElementById('complexityVal').textContent = this.complexity;
                document.getElementById('densityVal').textContent = this.density;
                document.getElementById('speedVal').textContent = this.speed;
                document.getElementById('scaleVal').textContent = this.scale;
                document.getElementById('rotationVal').textContent = this.rotation + '°';
                
                this.initParticles();
            }
        }

        // Initialize art
        const canvas = document.getElementById('canvas');
        const art = new GenerativeArt(canvas);

        // Control functions
        function setPattern(pattern) {
            art.pattern = pattern;
            
            // Update active button
            document.querySelectorAll('.pattern-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        function randomize() {
            document.getElementById('primaryColor').value = '#' + Math.floor(Math.random()*16777215).toString(16);
            document.getElementById('secondaryColor').value = '#' + Math.floor(Math.random()*16777215).toString(16);
            document.getElementById('bgColor').value = '#' + Math.floor(Math.random()*16777215).toString(16);
            document.getElementById('complexity').value = Math.floor(Math.random() * 100);
            document.getElementById('density').value = Math.floor(Math.random() * 100);
            document.getElementById('speed').value = Math.floor(Math.random() * 100);
            document.getElementById('scale').value = Math.floor(Math.random() * 100) + 20;
            document.getElementById('rotation').value = Math.floor(Math.random() * 360);
            
            art.updateFromControls();
        }

        function saveArt() {
            // Save current canvas to gallery
            const gallery = document.getElementById('gallery');
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = 100;
            thumbCanvas.height = 100;
            const thumbCtx = thumbCanvas.getContext('2d');
            thumbCtx.drawImage(canvas, 0, 0, 100, 100);
            
            item.appendChild(thumbCanvas);
            item.onclick = () => {
                // Load saved art
                const ctx = canvas.getContext('2d');
                ctx.drawImage(thumbCanvas, 0, 0, canvas.width, canvas.height);
            };
            
            gallery.insertBefore(item, gallery.firstChild);
            
            // Limit gallery size
            if (gallery.children.length > 8) {
                gallery.removeChild(gallery.lastChild);
            }
            
            // Update art ID
            art.artCounter++;
            document.getElementById('artId').textContent = '#' + String(art.artCounter).padStart(3, '0');
        }

        function toggleAnimation() {
            art.animating = !art.animating;
            event.target.textContent = art.animating ? '⏸️ PAUSE' : '▶️ PLAY';
        }

        function resetView() {
            art.time = 0;
            art.initParticles();
        }

        function loadPreset(preset) {
            const presets = {
                sunset: {
                    primary: '#FF6B6B',
                    secondary: '#FFE66D',
                    bg: '#2C3E50',
                    complexity: 60,
                    density: 70
                },
                ocean: {
                    primary: '#4ECDC4',
                    secondary: '#45B7D1',
                    bg: '#1A2F3F',
                    complexity: 40,
                    density: 80
                },
                forest: {
                    primary: '#2ECC71',
                    secondary: '#27AE60',
                    bg: '#1E3C2C',
                    complexity: 70,
                    density: 60
                },
                galaxy: {
                    primary: '#9B59B6',
                    secondary: '#8E44AD',
                    bg: '#0A0A1A',
                    complexity: 80,
                    density: 90
                },
                fire: {
                    primary: '#FF4500',
                    secondary: '#FF8C00',
                    bg: '#2D0A0A',
                    complexity: 50,
                    density: 85
                },
                ice: {
                    primary: '#00CED1',
                    secondary: '#E0FFFF',
                    bg: '#1A2F4A',
                    complexity: 30,
                    density: 75
                }
            };
            
            const p = presets[preset];
            document.getElementById('primaryColor').value = p.primary;
            document.getElementById('secondaryColor').value = p.secondary;
            document.getElementById('bgColor').value = p.bg;
            document.getElementById('complexity').value = p.complexity;
            document.getElementById('density').value = p.density;
            
            art.updateFromControls();
        }

        // Add event listeners to all controls
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => art.updateFromControls());
        });

        // Initialize
        art.updateFromControls();