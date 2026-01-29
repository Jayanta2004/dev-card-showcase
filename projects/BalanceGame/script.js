        // DOM Elements
        const gameArea = document.getElementById('gameArea');
        const balanceBeam = document.getElementById('balanceBeam');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const restartBtn = document.getElementById('restartBtn');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const scoreElement = document.getElementById('score');
        const shapesCountElement = document.getElementById('shapesCount');
        const timeElement = document.getElementById('time');
        const finalShapesElement = document.getElementById('finalShapes');
        const finalScoreElement = document.getElementById('finalScore');
        const levelElement = document.getElementById('level');

        // Game Variables
        let gameActive = false;
        let beamAngle = 0;
        let beamPosition = 0;
        let score = 0;
        let shapesBalanced = 0;
        let shapesOnBeam = [];
        let fallenShapes = 0;
        let gameTime = 0;
        let level = 1;
        let shapeInterval;
        let gameLoop;
        let keys = {};

        // Beam settings
        const beamWidth = 300;
        const beamHeight = 20;
        const maxBeamAngle = 20;
        const beamSpeed = 0.5;
        const beamCenter = gameArea.offsetWidth / 2;

        // Shape settings
        const shapeColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd166', '#06d6a0', '#ef476f'];
        const shapeTypes = ['circle', 'square', 'triangle'];
        let shapeSpawnRate = 1500; // milliseconds
        let shapeFallSpeed = 2;

        // Initialize beam position
        balanceBeam.style.left = `${beamCenter - beamWidth / 2}px`;

        // Create particles for background
        function createParticles() {
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 4 + 1;
                const color = shapeColors[Math.floor(Math.random() * shapeColors.length)];
                const left = Math.random() * 100;
                const top = Math.random() * 100;
                const opacity = Math.random() * 0.3 + 0.1;
                const duration = Math.random() * 20 + 10;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = color;
                particle.style.left = `${left}%`;
                particle.style.top = `${top}%`;
                particle.style.opacity = opacity;
                
                // Floating animation
                particle.style.animation = `float ${duration}s ease-in-out infinite alternate`;
                
                // Add custom float animation
                const styleSheet = document.styleSheets[0];
                styleSheet.insertRule(`
                    @keyframes float {
                        0% { transform: translateY(0) translateX(0); }
                        100% { transform: translateY(-20px) translateX(${Math.random() * 40 - 20}px); }
                    }
                `, styleSheet.cssRules.length);
                
                gameArea.appendChild(particle);
            }
        }

        // Create a new falling shape
        function createShape() {
            const shape = document.createElement('div');
            shape.className = 'falling-shape';
            
            // Random properties
            const size = Math.random() * 40 + 20;
            const color = shapeColors[Math.floor(Math.random() * shapeColors.length)];
            const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            const startX = Math.random() * (gameArea.offsetWidth - size * 2) + size;
            
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
            shape.style.backgroundColor = color;
            shape.style.left = `${startX}px`;
            shape.style.top = `-${size}px`;
            
            // Shape type styling
            if (type === 'square') {
                shape.style.borderRadius = '5px';
            } else if (type === 'triangle') {
                shape.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                shape.style.backgroundColor = 'transparent';
                shape.style.borderBottom = `${size}px solid ${color}`;
                shape.style.borderLeft = `${size/2}px solid transparent`;
                shape.style.borderRight = `${size/2}px solid transparent`;
                shape.style.width = `${size}px`;
                shape.style.height = '0';
            }
            
            // Physics properties
            shape.size = size;
            shape.x = startX;
            shape.y = -size;
            shape.vx = (Math.random() - 0.5) * 2; // Horizontal velocity
            shape.vy = shapeFallSpeed; // Vertical velocity
            shape.onBeam = false;
            shape.color = color;
            shape.type = type;
            
            gameArea.appendChild(shape);
            shapesOnBeam.push(shape);
            
            return shape;
        }

        // Update beam position based on keys
        function updateBeam() {
            if (keys['ArrowLeft'] || keys['KeyA']) {
                beamAngle += beamSpeed;
            }
            if (keys['ArrowRight'] || keys['KeyD']) {
                beamAngle -= beamSpeed;
            }
            
            // Apply damping (slowly return to center)
            beamAngle *= 0.9;
            
            // Limit beam angle
            beamAngle = Math.max(-maxBeamAngle, Math.min(maxBeamAngle, beamAngle));
            
            // Update beam visual rotation
            balanceBeam.style.transform = `translateX(-50%) rotate(${beamAngle}deg)`;
            
            // Calculate beam ends position for collision detection
            const beamRect = balanceBeam.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            
            return {
                left: beamRect.left - gameAreaRect.left,
                right: beamRect.right - gameAreaRect.left,
                top: beamRect.top - gameAreaRect.top,
                bottom: beamRect.bottom - gameAreaRect.top,
                angle: beamAngle * Math.PI / 180 // Convert to radians
            };
        }

        // Check if shape is on the beam
        function checkShapeOnBeam(shape, beam) {
            const shapeCenterX = shape.x + shape.size / 2;
            const shapeBottom = shape.y + shape.size;
            
            // Calculate beam surface line
            const beamCenterX = beam.left + beamWidth / 2;
            const beamTop = beam.top;
            
            // Rotated beam collision detection
            const cosAngle = Math.cos(beam.angle);
            const sinAngle = Math.sin(beam.angle);
            
            // Transform shape position to beam's local coordinates
            const localX = (shapeCenterX - beamCenterX) * cosAngle + (shapeBottom - beamTop) * sinAngle;
            const localY = -(shapeCenterX - beamCenterX) * sinAngle + (shapeBottom - beamTop) * cosAngle;
            
            // Check if shape is touching the beam
            const onBeam = (
                Math.abs(localX) < beamWidth / 2 + shape.size / 4 &&
                localY > -shape.size / 2 &&
                localY < shape.size / 2
            );
            
            return onBeam;
        }

        // Update shape positions
        function updateShapes(beam) {
            for (let i = shapesOnBeam.length - 1; i >= 0; i--) {
                const shape = shapesOnBeam[i];
                
                if (shape.onBeam) {
                    // Shape is on the beam - apply beam physics
                    const gravity = 0.3;
                    const friction = 0.98;
                    
                    // Apply gravity component based on beam angle
                    shape.vx += Math.sin(beam.angle) * gravity;
                    shape.vy = -Math.cos(beam.angle) * gravity;
                    
                    // Apply friction
                    shape.vx *= friction;
                    
                    // Update position based on velocity
                    shape.x += shape.vx;
                    
                    // Keep shape on beam (y position fixed)
                    shape.y = beam.top - shape.size;
                    
                    // Check if shape is falling off
                    const shapeRight = shape.x + shape.size;
                    const shapeLeft = shape.x;
                    
                    if (shapeRight < beam.left || shapeLeft > beam.right) {
                        shapeFalls(shape, i);
                    }
                } else {
                    // Shape is falling
                    shape.vy += 0.1; // Gravity
                    shape.x += shape.vx;
                    shape.y += shape.vy;
                    
                    // Check if shape landed on beam
                    if (checkShapeOnBeam(shape, beam)) {
                        shape.onBeam = true;
                        shape.vy = 0;
                        shape.vx = 0;
                        createParticlesAt(shape.x + shape.size/2, shape.y + shape.size/2, shape.color);
                        shapesBalanced++;
                        shapesCountElement.textContent = shapesBalanced;
                        updateScore(10);
                    }
                    
                    // Check if shape fell off screen
                    if (shape.y > gameArea.offsetHeight) {
                        shapeFalls(shape, i);
                    }
                }
                
                // Update visual position
                shape.style.left = `${shape.x}px`;
                shape.style.top = `${shape.y}px`;
                
                // Apply rotation if on beam
                if (shape.onBeam) {
                    shape.style.transform = `rotate(${beam.angle}rad)`;
                }
            }
        }

        // Handle shape falling off
        function shapeFalls(shape, index) {
            createParticlesAt(shape.x + shape.size/2, shape.y + shape.size/2, '#ff6b6b');
            
            if (shape.onBeam) {
                fallenShapes++;
                if (fallenShapes >= 3) {
                    endGame();
                }
            }
            
            shape.remove();
            shapesOnBeam.splice(index, 1);
        }

        // Create particles at position
        function createParticlesAt(x, y, color) {
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 6 + 2;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 30 + 10;
                const duration = Math.random() * 0.5 + 0.3;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = color;
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.position = 'absolute';
                
                gameArea.appendChild(particle);
                
                // Animate particle
                particle.animate([
                    { 
                        transform: `translate(0, 0) scale(1)`, 
                        opacity: 1 
                    },
                    { 
                        transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, 
                        opacity: 0 
                    }
                ], {
                    duration: duration * 1000,
                    easing: 'ease-out'
                });
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, duration * 1000);
            }
        }

        // Update score
        function updateScore(points) {
            score += points;
            scoreElement.textContent = score;
            
            // Level up every 100 points
            const newLevel = Math.floor(score / 100) + 1;
            if (newLevel > level) {
                level = newLevel;
                levelElement.textContent = level;
                
                // Increase difficulty
                shapeSpawnRate = Math.max(500, 1500 - (level - 1) * 100);
                shapeFallSpeed = Math.min(5, 2 + (level - 1) * 0.3);
                
                // Visual feedback for level up
                createParticlesAt(gameArea.offsetWidth/2, 100, '#4ecdc4');
            }
        }

        // Update game time
        function updateTime() {
            gameTime++;
            timeElement.textContent = `${gameTime}s`;
        }

        // Game loop
        function gameUpdate() {
            if (!gameActive) return;
            
            const beam = updateBeam();
            updateShapes(beam);
        }

        // Start game
        function startGame() {
            if (gameActive) return;
            
            gameActive = true;
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Game Running';
            
            // Reset game variables
            score = 0;
            shapesBalanced = 0;
            fallenShapes = 0;
            gameTime = 0;
            level = 1;
            
            scoreElement.textContent = score;
            shapesCountElement.textContent = shapesBalanced;
            timeElement.textContent = `${gameTime}s`;
            levelElement.textContent = level;
            
            // Clear existing shapes
            shapesOnBeam.forEach(shape => shape.remove());
            shapesOnBeam = [];
            
            // Hide game over screen
            gameOverScreen.style.display = 'none';
            
            // Start game loops
            gameLoop = setInterval(gameUpdate, 16); // ~60fps
            shapeInterval = setInterval(createShape, shapeSpawnRate);
            
            // Start timer
            const timeInterval = setInterval(() => {
                if (gameActive) {
                    updateTime();
                } else {
                    clearInterval(timeInterval);
                }
            }, 1000);
        }

        // End game
        function endGame() {
            gameActive = false;
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
            
            clearInterval(gameLoop);
            clearInterval(shapeInterval);
            
            // Show game over screen
            finalShapesElement.textContent = shapesBalanced;
            finalScoreElement.textContent = score;
            gameOverScreen.style.display = 'flex';
        }

        // Reset game
        function resetGame() {
            gameActive = false;
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
            
            clearInterval(gameLoop);
            clearInterval(shapeInterval);
            
            // Reset variables
            score = 0;
            shapesBalanced = 0;
            fallenShapes = 0;
            gameTime = 0;
            level = 1;
            beamAngle = 0;
            
            // Update UI
            scoreElement.textContent = score;
            shapesCountElement.textContent = shapesBalanced;
            timeElement.textContent = `${gameTime}s`;
            levelElement.textContent = level;
            balanceBeam.style.transform = `translateX(-50%) rotate(0deg)`;
            
            // Clear shapes
            shapesOnBeam.forEach(shape => shape.remove());
            shapesOnBeam = [];
            
            // Hide game over screen
            gameOverScreen.style.display = 'none';
        }

        // Event Listeners
        startBtn.addEventListener('click', startGame);
        resetBtn.addEventListener('click', resetGame);
        restartBtn.addEventListener('click', startGame);

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            
            // Prevent arrow keys from scrolling
            if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            
            // Space to start/stop
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                if (gameActive) {
                    endGame();
                } else {
                    startGame();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        // Mouse/Touch controls for beam
        let isDragging = false;
        let lastX = 0;

        gameArea.addEventListener('mousedown', (e) => {
            if (!gameActive) return;
            
            isDragging = true;
            lastX = e.clientX;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !gameActive) return;
            
            const deltaX = e.clientX - lastX;
            beamAngle += deltaX * 0.1;
            lastX = e.clientX;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch controls for mobile
        gameArea.addEventListener('touchstart', (e) => {
            if (!gameActive) return;
            
            isDragging = true;
            lastX = e.touches[0].clientX;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging || !gameActive) return;
            
            const deltaX = e.touches[0].clientX - lastX;
            beamAngle += deltaX * 0.1;
            lastX = e.touches[0].clientX;
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Initialize
        createParticles();
        
        // Add instructions for controls
        setTimeout(() => {
            if (!gameActive) {
                createParticlesAt(gameArea.offsetWidth/2, 200, '#4ecdc4');
            }
        }, 1000);