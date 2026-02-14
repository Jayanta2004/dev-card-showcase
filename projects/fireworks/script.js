        // Canvas setup
        const canvas = document.getElementById('fireworksCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas to full container size
        function resizeCanvas() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
        
        // Initial resize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Fireworks system variables
        let fireworks = [];
        let particles = [];
        let fireworkCount = 0;
        let autoLaunchInterval = null;
        let isAutoLaunchActive = false;
        
        // Current settings
        let currentColor = '#ff0000';
        let currentSize = 50;
        let currentParticles = 80;
        let currentType = 'circle';
        
        // DOM elements
        const colorOptions = document.querySelectorAll('.color-option');
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue');
        const particleSlider = document.getElementById('particleSlider');
        const particleValue = document.getElementById('particleValue');
        const fireworkTypes = document.querySelectorAll('.firework-type');
        const launchBtn = document.getElementById('launchBtn');
        const autoLaunchBtn = document.getElementById('autoLaunchBtn');
        const clearBtn = document.getElementById('clearBtn');
        const fireworkCountElement = document.getElementById('fireworkCount');
        
        // Color picker
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                currentColor = option.getAttribute('data-color');
            });
        });
        
        // Size slider
        sizeSlider.addEventListener('input', () => {
            currentSize = parseInt(sizeSlider.value);
            const sizeText = currentSize < 33 ? 'Small' : currentSize < 66 ? 'Medium' : 'Large';
            sizeValue.textContent = sizeText;
        });
        
        // Particle slider
        particleSlider.addEventListener('input', () => {
            currentParticles = parseInt(particleSlider.value);
            particleValue.textContent = currentParticles;
        });
        
        // Firework type selector
        fireworkTypes.forEach(type => {
            type.addEventListener('click', () => {
                fireworkTypes.forEach(t => t.classList.remove('active'));
                type.classList.add('active');
                currentType = type.getAttribute('data-type');
            });
        });
        
        // Launch button
        launchBtn.addEventListener('click', () => {
            launchFirework();
        });
        
        // Auto launch button
        autoLaunchBtn.addEventListener('click', () => {
            if (isAutoLaunchActive) {
                stopAutoLaunch();
                autoLaunchBtn.innerHTML = '<i class="fas fa-play"></i> Auto Launch';
                autoLaunchBtn.style.background = 'rgba(64, 224, 208, 0.2)';
            } else {
                startAutoLaunch();
                autoLaunchBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Auto';
                autoLaunchBtn.style.background = 'rgba(255, 0, 128, 0.3)';
            }
            isAutoLaunchActive = !isAutoLaunchActive;
        });
        
        // Clear button
        clearBtn.addEventListener('click', () => {
            fireworks = [];
            particles = [];
        });
        
        // Launch firework from random position
        function launchFirework(x = null, y = null) {
            // If x and y are not provided, use random position
            const launchX = x || Math.random() * canvas.width;
            const launchY = y || canvas.height;
            
            // Create firework
            const firework = {
                x: launchX,
                y: launchY,
                startY: canvas.height,
                targetX: launchX,
                targetY: y || Math.random() * (canvas.height * 0.5) + 50,
                speed: 5 + Math.random() * 3,
                color: currentColor,
                size: currentSize,
                particleCount: currentParticles,
                type: currentType,
                exploded: false,
                trail: []
            };
            
            fireworks.push(firework);
            fireworkCount++;
            fireworkCountElement.textContent = fireworkCount;
        }
        
        // Start auto launch
        function startAutoLaunch() {
            autoLaunchInterval = setInterval(() => {
                // Randomize some properties for auto launch
                const randomColorIndex = Math.floor(Math.random() * colorOptions.length);
                const randomTypeIndex = Math.floor(Math.random() * fireworkTypes.length);
                
                // Update UI to reflect random selection
                colorOptions.forEach((opt, i) => {
                    if (i === randomColorIndex) {
                        opt.classList.add('active');
                        currentColor = opt.getAttribute('data-color');
                    } else {
                        opt.classList.remove('active');
                    }
                });
                
                fireworkTypes.forEach((type, i) => {
                    if (i === randomTypeIndex) {
                        type.classList.add('active');
                        currentType = type.getAttribute('data-type');
                    } else {
                        type.classList.remove('active');
                    }
                });
                
                // Launch firework
                launchFirework();
            }, 800);
        }
        
        // Stop auto launch
        function stopAutoLaunch() {
            clearInterval(autoLaunchInterval);
        }
        
        // Click on canvas to launch firework at that position
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            launchFirework(x, y);
        });
        
        // Firework and particle classes
        class Particle {
            constructor(x, y, color, size, velocityX, velocityY, life = 100) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.size = size;
                this.velocityX = velocityX;
                this.velocityY = velocityY;
                this.life = life;
                this.maxLife = life;
                this.gravity = 0.05;
                this.decay = 0.97;
            }
            
            update() {
                this.velocityY += this.gravity;
                this.velocityX *= this.decay;
                this.velocityY *= this.decay;
                this.x += this.velocityX;
                this.y += this.velocityY;
                this.life--;
            }
            
            draw() {
                const alpha = this.life / this.maxLife;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
            
            isDead() {
                return this.life <= 0;
            }
        }
        
        // Animation loop
        function animate() {
            // Clear canvas with a fade effect
            ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw a starry background
            drawStars();
            
            // Update and draw fireworks
            for (let i = fireworks.length - 1; i >= 0; i--) {
                const firework = fireworks[i];
                
                if (!firework.exploded) {
                    // Draw firework trail
                    firework.trail.push({x: firework.x, y: firework.y});
                    if (firework.trail.length > 10) {
                        firework.trail.shift();
                    }
                    
                    // Draw trail
                    for (let j = 0; j < firework.trail.length; j++) {
                        const point = firework.trail[j];
                        const alpha = j / firework.trail.length;
                        ctx.globalAlpha = alpha * 0.7;
                        ctx.fillStyle = firework.color;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.globalAlpha = 1.0;
                    
                    // Draw firework
                    ctx.fillStyle = firework.color;
                    ctx.beginPath();
                    ctx.arc(firework.x, firework.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Move firework
                    const dx = firework.targetX - firework.x;
                    const dy = firework.targetY - firework.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < firework.speed) {
                        firework.exploded = true;
                        explodeFirework(firework);
                    } else {
                        firework.x += (dx / distance) * firework.speed;
                        firework.y += (dy / distance) * firework.speed;
                    }
                }
                
                // Remove firework after explosion
                if (firework.exploded && particles.length === 0) {
                    fireworks.splice(i, 1);
                }
            }
            
            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.update();
                particle.draw();
                
                if (particle.isDead()) {
                    particles.splice(i, 1);
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        // Create explosion based on firework type
        function explodeFirework(firework) {
            const explosionSize = (firework.size / 100) * 80 + 20;
            const particleCount = firework.particleCount;
            
            switch(firework.type) {
                case 'circle':
                    createCircleExplosion(firework.x, firework.y, explosionSize, particleCount, firework.color);
                    break;
                case 'heart':
                    createHeartExplosion(firework.x, firework.y, explosionSize, particleCount, firework.color);
                    break;
                case 'star':
                    createStarExplosion(firework.x, firework.y, explosionSize, particleCount, firework.color);
                    break;
                case 'spiral':
                    createSpiralExplosion(firework.x, firework.y, explosionSize, particleCount, firework.color);
                    break;
                case 'random':
                    createRandomExplosion(firework.x, firework.y, explosionSize, particleCount, firework.color);
                    break;
                case 'fountain':
                    createFountainExplosion(firework.x, firework.y, explosionSize, particleCount, firework.color);
                    break;
            }
        }
        
        // Different explosion patterns
        function createCircleExplosion(x, y, size, count, color) {
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const speed = 2 + Math.random() * 4;
                const velocityX = Math.cos(angle) * speed;
                const velocityY = Math.sin(angle) * speed;
                const particleSize = 1 + Math.random() * 3;
                
                particles.push(new Particle(x, y, color, particleSize, velocityX, velocityY));
            }
        }
        
        function createHeartExplosion(x, y, size, count, color) {
            for (let i = 0; i < count; i++) {
                const t = (i / count) * Math.PI * 2;
                // Heart parametric equation
                const heartX = 16 * Math.pow(Math.sin(t), 3);
                const heartY = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
                
                const scale = size / 20;
                const velocityX = heartX * scale * 0.1;
                const velocityY = -heartY * scale * 0.1; // Negative to flip vertically
                const particleSize = 1 + Math.random() * 3;
                
                particles.push(new Particle(x, y, color, particleSize, velocityX, velocityY));
            }
        }
        
        function createStarExplosion(x, y, size, count, color) {
            const points = 5;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const radius = size * (0.5 + 0.5 * Math.sin(points * angle));
                const velocityX = Math.cos(angle) * radius * 0.1;
                const velocityY = Math.sin(angle) * radius * 0.1;
                const particleSize = 1 + Math.random() * 3;
                
                particles.push(new Particle(x, y, color, particleSize, velocityX, velocityY));
            }
        }
        
        function createSpiralExplosion(x, y, size, count, color) {
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 10;
                const radius = (i / count) * size;
                const velocityX = Math.cos(angle) * radius * 0.1;
                const velocityY = Math.sin(angle) * radius * 0.1;
                const particleSize = 1 + Math.random() * 3;
                
                particles.push(new Particle(x, y, color, particleSize, velocityX, velocityY));
            }
        }
        
        function createRandomExplosion(x, y, size, count, color) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 5;
                const velocityX = Math.cos(angle) * speed;
                const velocityY = Math.sin(angle) * speed;
                const particleSize = 1 + Math.random() * 4;
                
                particles.push(new Particle(x, y, color, particleSize, velocityX, velocityY));
            }
        }
        
        function createFountainExplosion(x, y, size, count, color) {
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
                const speed = 2 + Math.random() * 6;
                const velocityX = Math.cos(angle) * speed;
                const velocityY = Math.sin(angle) * speed;
                const particleSize = 1 + Math.random() * 3;
                
                particles.push(new Particle(x, y, color, particleSize, velocityX, velocityY, 150));
            }
        }
        
        // Draw starry background
        function drawStars() {
            // Initialize stars on first call
            if (!window.stars) {
                window.stars = [];
                for (let i = 0; i < 100; i++) {
                    window.stars.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        size: Math.random() * 1.5,
                        brightness: Math.random() * 0.8 + 0.2
                    });
                }
            }
            
            // Draw stars
            ctx.fillStyle = '#ffffff';
            window.stars.forEach(star => {
                ctx.globalAlpha = star.brightness * 0.7;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
        }
        
        // Initialize with a few fireworks
        function init() {
            // Launch a few initial fireworks
            setTimeout(() => launchFirework(canvas.width * 0.3, canvas.height * 0.5), 300);
            setTimeout(() => launchFirework(canvas.width * 0.7, canvas.height * 0.4), 800);
            setTimeout(() => launchFirework(canvas.width * 0.5, canvas.height * 0.6), 1300);
            
            // Start animation
            animate();
        }
        
        // Start everything
        init();