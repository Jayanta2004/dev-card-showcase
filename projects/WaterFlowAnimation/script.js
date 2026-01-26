        document.addEventListener('DOMContentLoaded', function() {
            // Canvas setup
            const canvas = document.getElementById('waterCanvas');
            const ctx = canvas.getContext('2d');
            const liquidTransition = document.getElementById('liquidTransition');
            
            // Set canvas size
            function resizeCanvas() {
                const container = canvas.parentElement;
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
                initWaterSimulation();
            }
            
            // Water simulation variables
            let width, height;
            let current = [];
            let previous = [];
            let density = [];
            let viscosity = 0.98;
            let waveSpeed = 0.05;
            let damping = 0.99;
            let rainIntensity = 0;
            let waterColor = '#4cc9f0';
            let isRaining = false;
            let isFlowing = false;
            let flowDirection = 1;
            let animationId;
            
            // DOM Elements
            const viscositySlider = document.getElementById('viscosity');
            const waveSpeedSlider = document.getElementById('waveSpeed');
            const dampingSlider = document.getElementById('damping');
            const rainSlider = document.getElementById('rain');
            const viscosityValue = document.getElementById('viscosityValue');
            const waveSpeedValue = document.getElementById('waveSpeedValue');
            const dampingValue = document.getElementById('dampingValue');
            const rainValue = document.getElementById('rainValue');
            const resetBtn = document.getElementById('resetBtn');
            const colorBoxes = document.querySelectorAll('.color-box');
            const rainBtn = document.getElementById('rainBtn');
            const rippleBtn = document.getElementById('rippleBtn');
            const flowBtn = document.getElementById('flowBtn');
            const clearBtn = document.getElementById('clearBtn');
            
            // Initialize water simulation
            function initWaterSimulation() {
                width = canvas.width;
                height = canvas.height;
                
                // Initialize arrays
                current = new Array(width * height).fill(0);
                previous = new Array(width * height).fill(0);
                density = new Array(width * height).fill(0);
                
                // Draw initial water
                drawWater();
            }
            
            // Get index from coordinates
            function getIndex(x, y) {
                return x + y * width;
            }
            
            // Add water drop at position
            function addDrop(x, y, radius, intensity) {
                for (let i = -radius; i <= radius; i++) {
                    for (let j = -radius; j <= radius; j++) {
                        const dx = x + i;
                        const dy = y + j;
                        
                        if (dx >= 0 && dx < width && dy >= 0 && dy < height) {
                            const distance = Math.sqrt(i * i + j * j);
                            if (distance <= radius) {
                                const index = getIndex(dx, dy);
                                const force = intensity * (1 - distance / radius);
                                current[index] += force;
                                density[index] = 1.0;
                            }
                        }
                    }
                }
            }
            
            // Add flow effect
            function addFlow() {
                if (!isFlowing) return;
                
                const flowIntensity = 5;
                const flowWidth = 50;
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < flowWidth; x++) {
                        const index = getIndex(
                            flowDirection > 0 ? x : width - 1 - x,
                            y
                        );
                        current[index] += flowIntensity * Math.random() * 0.1;
                        density[index] = 1.0;
                    }
                }
            }
            
            // Update water simulation
            function updateWater() {
                // Swap buffers
                const temp = previous;
                previous = current;
                current = temp;
                
                // Update water simulation
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        const index = getIndex(x, y);
                        
                        // Wave propagation
                        const val = (
                            previous[getIndex(x + 1, y)] +
                            previous[getIndex(x - 1, y)] +
                            previous[getIndex(x, y + 1)] +
                            previous[getIndex(x, y - 1)]
                        ) / 2 - current[index];
                        
                        // Apply viscosity and damping
                        current[index] = val * viscosity * damping;
                        
                        // Density dissipation
                        density[index] *= 0.99;
                    }
                }
                
                // Add rain if active
                if (isRaining && rainIntensity > 0) {
                    for (let i = 0; i < rainIntensity; i++) {
                        const x = Math.floor(Math.random() * width);
                        const y = Math.floor(Math.random() * height);
                        addDrop(x, y, 5, 2.0);
                    }
                }
                
                // Add flow if active
                addFlow();
                
                // Draw updated water
                drawWater();
                
                // Continue animation
                animationId = requestAnimationFrame(updateWater);
            }
            
            // Draw water to canvas
            function drawWater() {
                // Clear canvas with gradient background
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#0a192f');
                gradient.addColorStop(1, '#0c2b4b');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // Create image data for water
                const imageData = ctx.createImageData(width, height);
                const data = imageData.data;
                
                // Convert water color to RGB
                const color = hexToRgb(waterColor);
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = getIndex(x, y);
                        const pixelIndex = (y * width + x) * 4;
                        
                        // Calculate water height and density
                        const waterHeight = Math.abs(current[index]) * waveSpeed * 100;
                        const densityValue = density[index];
                        
                        if (waterHeight > 0.1 || densityValue > 0.01) {
                            // Calculate color based on water height and density
                            const intensity = Math.min(waterHeight * 2, 1);
                            const alpha = Math.min(densityValue * 0.8, 0.8);
                            
                            // Add lighting effect based on height
                            const light = 0.3 + intensity * 0.7;
                            
                            data[pixelIndex] = color.r * light;     // Red
                            data[pixelIndex + 1] = color.g * light; // Green
                            data[pixelIndex + 2] = color.b * light; // Blue
                            data[pixelIndex + 3] = alpha * 255;     // Alpha
                        } else {
                            // Transparent pixel
                            data[pixelIndex + 3] = 0;
                        }
                    }
                }
                
                // Put image data to canvas
                ctx.putImageData(imageData, 0, 0);
            }
            
            // Convert hex color to RGB
            function hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : { r: 76, g: 201, b: 240 }; // Default color
            }
            
            // Create ripple effect
            function createRipple(x, y, radius = 20, intensity = 5.0) {
                addDrop(x, y, radius, intensity);
                
                // Create visual ripple effect
                const ripple = document.createElement('div');
                ripple.classList.add('ripple');
                ripple.style.left = (x - 150) + 'px';
                ripple.style.top = (y - 150) + 'px';
                document.body.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                }, 1500);
            }
            
            // Create water drop
            function createWaterDrop(x, y) {
                const drop = document.createElement('div');
                drop.classList.add('water-drop');
                drop.style.left = x + 'px';
                drop.style.top = y + 'px';
                drop.style.background = `radial-gradient(circle at 30% 30%, ${waterColor}, ${darkenColor(waterColor, 20)})`;
                document.body.appendChild(drop);
                
                // Remove drop after animation
                setTimeout(() => {
                    drop.remove();
                }, 2000);
            }
            
            // Create flowing text
            function createWaterText(x, y, text) {
                const waterText = document.createElement('div');
                waterText.classList.add('water-text');
                waterText.textContent = text;
                waterText.style.left = x + 'px';
                waterText.style.top = y + 'px';
                waterText.style.color = waterColor;
                document.body.appendChild(waterText);
                
                // Remove text after animation
                setTimeout(() => {
                    waterText.remove();
                }, 4000);
            }
            
            // Darken a color
            function darkenColor(hex, percent) {
                const num = parseInt(hex.replace("#", ""), 16);
                const amt = Math.round(2.55 * percent);
                const R = (num >> 16) - amt;
                const G = (num >> 8 & 0x00FF) - amt;
                const B = (num & 0x0000FF) - amt;
                
                return "#" + (
                    0x1000000 +
                    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                    (B < 255 ? B < 1 ? 0 : B : 255)
                ).toString(16).slice(1);
            }
            
            // Liquid transition effect
            function liquidTransitionEffect() {
                liquidTransition.classList.add('transition-active');
                
                // Create liquid overlay
                const overlay = document.createElement('canvas');
                const overlayCtx = overlay.getContext('2d');
                overlay.width = window.innerWidth;
                overlay.height = window.innerHeight;
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.zIndex = '1000';
                overlay.style.pointerEvents = 'none';
                liquidTransition.appendChild(overlay);
                
                // Animate liquid fill
                let progress = 0;
                const duration = 1000;
                const startTime = Date.now();
                
                function animate() {
                    const elapsed = Date.now() - startTime;
                    progress = Math.min(elapsed / duration, 1);
                    
                    // Clear canvas
                    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
                    
                    // Draw liquid with wave effect
                    const waveHeight = 50;
                    const frequency = 0.02;
                    
                    overlayCtx.fillStyle = waterColor;
                    overlayCtx.beginPath();
                    overlayCtx.moveTo(0, overlay.height);
                    
                    // Create wave effect
                    for (let x = 0; x <= overlay.width; x += 10) {
                        const y = overlay.height * (1 - progress) + 
                                 Math.sin(x * frequency + elapsed * 0.005) * waveHeight * progress;
                        overlayCtx.lineTo(x, y);
                    }
                    
                    overlayCtx.lineTo(overlay.width, overlay.height);
                    overlayCtx.closePath();
                    overlayCtx.fill();
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Reverse animation
                        setTimeout(() => {
                            liquidTransition.classList.remove('transition-active');
                            overlay.remove();
                        }, 300);
                    }
                }
                
                animate();
            }
            
            // Event Listeners
            
            // Canvas click - create ripple
            canvas.addEventListener('click', function(e) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                createRipple(x, y, 25, 8.0);
                createWaterDrop(e.clientX, e.clientY);
                createWaterText(e.clientX, e.clientY, 'Splash!');
            });
            
            // Canvas mousemove - subtle effect
            canvas.addEventListener('mousemove', function(e) {
                if (e.buttons !== 1) return; // Only if mouse button is pressed
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                createRipple(x, y, 15, 3.0);
            });
            
            // Control sliders
            viscositySlider.addEventListener('input', function() {
                viscosity = parseFloat(this.value);
                viscosityValue.textContent = viscosity.toFixed(3);
            });
            
            waveSpeedSlider.addEventListener('input', function() {
                waveSpeed = parseFloat(this.value);
                waveSpeedValue.textContent = waveSpeed.toFixed(2);
            });
            
            dampingSlider.addEventListener('input', function() {
                damping = parseFloat(this.value);
                dampingValue.textContent = damping.toFixed(3);
            });
            
            rainSlider.addEventListener('input', function() {
                rainIntensity = parseInt(this.value);
                rainValue.textContent = rainIntensity;
                isRaining = rainIntensity > 0;
            });
            
            // Color pickers
            colorBoxes.forEach(box => {
                box.addEventListener('click', function() {
                    waterColor = this.getAttribute('data-color');
                    
                    // Update active color
                    colorBoxes.forEach(b => b.style.border = '2px solid white');
                    this.style.border = '2px solid #4cc9f0';
                    
                    // Transition effect
                    liquidTransitionEffect();
                });
            });
            
            // Control buttons
            rainBtn.addEventListener('click', function() {
                isRaining = !isRaining;
                rainIntensity = isRaining ? 5 : 0;
                rainSlider.value = rainIntensity;
                rainValue.textContent = rainIntensity;
                
                this.innerHTML = isRaining 
                    ? '<i class="fas fa-cloud-rain"></i> Stop Rain' 
                    : '<i class="fas fa-cloud-rain"></i> Start Rain';
                
                if (isRaining) {
                    createWaterText(100, 100, 'Rain!');
                }
            });
            
            rippleBtn.addEventListener('click', function() {
                // Create multiple ripples
                for (let i = 0; i < 5; i++) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    setTimeout(() => {
                        createRipple(x, y, 20 + Math.random() * 20, 5.0);
                    }, i * 200);
                }
                
                createWaterText(width/2, 50, 'Ripples!');
            });
            
            flowBtn.addEventListener('click', function() {
                isFlowing = !isFlowing;
                flowDirection *= -1; // Reverse direction
                
                this.innerHTML = isFlowing 
                    ? '<i class="fas fa-wind"></i> Stop Flow' 
                    : '<i class="fas fa-wind"></i> Water Flow';
                
                createWaterText(width/2, height/2, isFlowing ? 'Flow!' : 'Stop');
            });
            
            clearBtn.addEventListener('click', function() {
                // Clear water simulation
                current.fill(0);
                previous.fill(0);
                density.fill(0);
                
                // Stop effects
                isRaining = false;
                isFlowing = false;
                rainIntensity = 0;
                rainSlider.value = 0;
                rainValue.textContent = '0';
                
                // Reset buttons
                rainBtn.innerHTML = '<i class="fas fa-cloud-rain"></i> Start Rain';
                flowBtn.innerHTML = '<i class="fas fa-wind"></i> Water Flow';
                
                createWaterText(width/2, height/2, 'Clear!');
            });
            
            resetBtn.addEventListener('click', function() {
                // Reset sliders to default values
                viscosity = 0.98;
                waveSpeed = 0.05;
                damping = 0.99;
                rainIntensity = 0;
                waterColor = '#4cc9f0';
                isRaining = false;
                isFlowing = false;
                
                viscositySlider.value = viscosity;
                waveSpeedSlider.value = waveSpeed;
                dampingSlider.value = damping;
                rainSlider.value = rainIntensity;
                
                viscosityValue.textContent = viscosity.toFixed(3);
                waveSpeedValue.textContent = waveSpeed.toFixed(2);
                dampingValue.textContent = damping.toFixed(3);
                rainValue.textContent = rainIntensity;
                
                // Reset color picker
                colorBoxes.forEach(box => {
                    box.style.border = '2px solid white';
                    if (box.getAttribute('data-color') === waterColor) {
                        box.style.border = '2px solid #4cc9f0';
                    }
                });
                
                // Reset buttons
                rainBtn.innerHTML = '<i class="fas fa-cloud-rain"></i> Start Rain';
                flowBtn.innerHTML = '<i class="fas fa-wind"></i> Water Flow';
                
                // Clear simulation
                current.fill(0);
                previous.fill(0);
                density.fill(0);
                
                // Transition effect
                liquidTransitionEffect();
                createWaterText(width/2, height/2, 'Reset!');
            });
            
            // Initialize and start
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();
            updateWater();
            
            // Initial transition effect
            setTimeout(liquidTransitionEffect, 500);
            
            // Add random raindrops occasionally
            setInterval(() => {
                if (Math.random() > 0.7) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    addDrop(x, y, 3, 1.5);
                }
            }, 1000);
        });
