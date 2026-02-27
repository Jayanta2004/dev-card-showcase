
        // Current state
        let currentMood = 'calm';
        let animationSpeed = 5;
        let visualIntensity = 5;
        let hueShift = 0;
        let highContrast = false;
        let reduceMotion = false;
        let darkMode = true;
        
        // DOM Elements
        const calmBtn = document.getElementById('calm-btn');
        const focusBtn = document.getElementById('focus-btn');
        const energyBtn = document.getElementById('energy-btn');
        const moodTitle = document.getElementById('mood-title');
        const waveform = document.getElementById('waveform');
        const particlesContainer = document.getElementById('particles-container');
        const tempoSlider = document.getElementById('tempo-slider');
        const intensitySlider = document.getElementById('intensity-slider');
        const hueSlider = document.getElementById('hue-slider');
        const contrastToggle = document.getElementById('contrast-toggle');
        const motionToggle = document.getElementById('motion-toggle');
        const darkmodeToggle = document.getElementById('darkmode-toggle');
        
        // Mood data with visual properties
        const moods = {
            calm: {
                title: "CALM",
                primaryColor: "#4a6fa5",
                secondaryColor: "#7db1d1",
                waveCount: 40,
                waveHeightMultiplier: 0.7,
                particleCount: 15,
                particleSpeed: 1.5,
                waveAnimation: "calmWave"
            },
            focus: {
                title: "FOCUS",
                primaryColor: "#3a7d5f",
                secondaryColor: "#5ca08e",
                waveCount: 60,
                waveHeightMultiplier: 0.9,
                particleCount: 10,
                particleSpeed: 2.0,
                waveAnimation: "focusWave"
            },
            energy: {
                title: "ENERGY",
                primaryColor: "#c44536",
                secondaryColor: "#e68a6f",
                waveCount: 80,
                waveHeightMultiplier: 1.2,
                particleCount: 25,
                particleSpeed: 3.0,
                waveAnimation: "energyWave"
            }
        };
        
        // Initialize the visualizer
        function initVisualizer() {
            createWaveBars();
            createParticles();
            updateVisualizer();
            
            // Start animation
            animateVisuals();
            
            // Set up event listeners
            setupEventListeners();
        }
        
        // Create waveform bars
        function createWaveBars() {
            waveform.innerHTML = '';
            const mood = moods[currentMood];
            
            for (let i = 0; i < mood.waveCount; i++) {
                const bar = document.createElement('div');
                bar.className = 'wave-bar';
                bar.style.height = `${10 + Math.random() * 30}px`;
                waveform.appendChild(bar);
            }
        }
        
        // Create particles
        function createParticles() {
            particlesContainer.innerHTML = '';
            const mood = moods[currentMood];
            
            for (let i = 0; i < mood.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random size between 5 and 20px
                const size = 5 + Math.random() * 15;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Random position
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                
                // Random color
                const colorChoice = Math.random() > 0.5 ? mood.primaryColor : mood.secondaryColor;
                particle.style.backgroundColor = colorChoice;
                
                particlesContainer.appendChild(particle);
            }
        }
        
        // Update visualizer based on current settings
        function updateVisualizer() {
            const mood = moods[currentMood];
            
            // Update title
            moodTitle.textContent = mood.title;
            
            // Calculate adjusted colors based on hue shift
            const primaryColor = adjustHue(mood.primaryColor, hueShift);
            const secondaryColor = adjustHue(mood.secondaryColor, hueShift);
            
            // Update waveform bars
            const waveBars = document.querySelectorAll('.wave-bar');
            waveBars.forEach((bar, index) => {
                // Calculate color gradient based on position
                const position = index / waveBars.length;
                const r = interpolateColor(primaryColor, secondaryColor, position);
                
                // Apply color and animation
                bar.style.background = `linear-gradient(to top, ${secondaryColor}, ${primaryColor})`;
                
                // Set animation with current speed
                const animationDuration = 1 + (10 - animationSpeed) * 0.5;
                const animationName = reduceMotion ? 'none' : mood.waveAnimation;
                
                bar.style.animation = `${animationName} ${animationDuration}s ease-in-out infinite`;
                bar.style.animationDelay = `${index * 0.05}s`;
                
                // Adjust height based on intensity
                const baseHeight = 10 + Math.random() * 30;
                const intensityMultiplier = 0.5 + (visualIntensity / 10);
                bar.style.height = `${baseHeight * intensityMultiplier * mood.waveHeightMultiplier}px`;
            });
            
            // Update particles
            const particles = document.querySelectorAll('.particle');
            particles.forEach((particle, index) => {
                // Calculate color
                const colorChoice = index % 2 === 0 ? primaryColor : secondaryColor;
                particle.style.backgroundColor = colorChoice;
                
                // Set animation with current speed
                if (!reduceMotion) {
                    const animationDuration = 3 + (10 - mood.particleSpeed) * 2;
                    particle.style.animation = `floatParticle ${animationDuration}s ease-in-out infinite`;
                    particle.style.animationDelay = `${index * 0.2}s`;
                } else {
                    particle.style.animation = 'none';
                }
                
                // Adjust opacity based on contrast setting
                particle.style.opacity = highContrast ? '1' : '0.7';
            });
            
            // Update container background
            const visualizerContainer = document.querySelector('.visualizer-container');
            visualizerContainer.style.background = `linear-gradient(135deg, 
                rgba(${hexToRgb(primaryColor)}, 0.1), 
                rgba(${hexToRgb(secondaryColor)}, 0.05))`;
            
            // Update mood title color
            moodTitle.style.color = primaryColor;
            
            // Update slider thumb colors
            document.documentElement.style.setProperty('--calm-secondary', secondaryColor);
        }
        
        // Main animation loop
        function animateVisuals() {
            if (reduceMotion) return;
            
            // Animate waveform bars with slight random variations
            const waveBars = document.querySelectorAll('.wave-bar');
            waveBars.forEach((bar, index) => {
                // Add subtle random movement
                const randomOffset = Math.sin(Date.now() / 1000 + index) * 5;
                bar.style.transform = `scaleY(${1 + (visualIntensity / 100) * Math.sin(Date.now() / (1000 - animationSpeed * 80) + index)}) translateY(${randomOffset}px)`;
            });
            
            // Continue animation
            requestAnimationFrame(animateVisuals);
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Mood buttons
            calmBtn.addEventListener('click', () => setMood('calm'));
            focusBtn.addEventListener('click', () => setMood('focus'));
            energyBtn.addEventListener('click', () => setMood('energy'));
            
            // Sliders
            tempoSlider.addEventListener('input', () => {
                animationSpeed = parseInt(tempoSlider.value);
                updateVisualizer();
            });
            
            intensitySlider.addEventListener('input', () => {
                visualIntensity = parseInt(intensitySlider.value);
                updateVisualizer();
            });
            
            hueSlider.addEventListener('input', () => {
                hueShift = parseInt(hueSlider.value);
                updateVisualizer();
            });
            
            // Toggles
            contrastToggle.addEventListener('change', () => {
                highContrast = contrastToggle.checked;
                updateVisualizer();
            });
            
            motionToggle.addEventListener('change', () => {
                reduceMotion = motionToggle.checked;
                if (reduceMotion) {
                    document.body.classList.add('reduced-motion');
                } else {
                    document.body.classList.remove('reduced-motion');
                    animateVisuals();
                }
                updateVisualizer();
            });
            
            darkmodeToggle.addEventListener('change', () => {
                darkMode = darkmodeToggle.checked;
                if (darkMode) {
                    document.body.style.backgroundColor = 'var(--dark-bg)';
                    document.body.style.color = 'var(--text-light)';
                } else {
                    document.body.style.backgroundColor = 'var(--light-bg)';
                    document.body.style.color = 'var(--text-dark)';
                }
            });
        }
        
        // Set the current mood
        function setMood(mood) {
            currentMood = mood;
            
            // Update active button
            document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active-mood'));
            
            if (mood === 'calm') calmBtn.classList.add('active-mood');
            if (mood === 'focus') focusBtn.classList.add('active-mood');
            if (mood === 'energy') energyBtn.classList.add('active-mood');
            
            // Recreate visual elements for new mood
            createWaveBars();
            createParticles();
            updateVisualizer();
        }
        
        // Color utility functions
        function adjustHue(hex, hueShift) {
            // Convert hex to HSL, adjust hue, convert back to hex
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            hsl.h = (hsl.h + hueShift) % 360;
            const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        }
        
        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : {r: 0, g: 0, b: 0};
        }
        
        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        
        function rgbToHsl(r, g, b) {
            r /= 255, g /= 255, b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            
            return { h: h * 360, s: s * 100, l: l * 100 };
        }
        
        function hslToRgb(h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }
        
        function interpolateColor(color1, color2, factor) {
            const rgb1 = hexToRgb(color1);
            const rgb2 = hexToRgb(color2);
            
            const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
            const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
            const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
            
            return rgbToHex(r, g, b);
        }
        
        // Add CSS animations for waveforms
        function addWaveAnimations() {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes calmWave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.2); }
                }
                
                @keyframes focusWave {
                    0%, 100% { transform: scaleY(1); }
                    25% { transform: scaleY(1.3); }
                    75% { transform: scaleY(0.9); }
                }
                
                @keyframes energyWave {
                    0%, 100% { transform: scaleY(1); }
                    20% { transform: scaleY(1.8); }
                    40% { transform: scaleY(0.7); }
                    60% { transform: scaleY(1.4); }
                    80% { transform: scaleY(0.9); }
                }
                
                @keyframes floatParticle {
                    0%, 100% { 
                        transform: translate(0, 0) rotate(0deg); 
                    }
                    25% { 
                        transform: translate(20px, -30px) rotate(90deg); 
                    }
                    50% { 
                        transform: translate(-15px, -50px) rotate(180deg); 
                    }
                    75% { 
                        transform: translate(10px, -20px) rotate(270deg); 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', () => {
            addWaveAnimations();
            initVisualizer();
        });
    