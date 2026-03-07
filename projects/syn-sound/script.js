        const canvas = document.getElementById('soundCanvas');
        const ctx = canvas.getContext('2d');
        const volumeDisplay = document.getElementById('volumeDisplay');
        
        let width, height;
        let audioContext, analyser, source, stream;
        let isAudioInitialized = false;
        
        // Visualization parameters
        let freqValue = 0.5;
        let resValue = 0.5;
        let harmValue = 0.5;
        let currentMode = 'wave';
        
        // Knob interaction
        const knobs = document.querySelectorAll('.knob');
        knobs.forEach(knob => {
            let isDragging = false;
            let startY, startRotation;
            
            knob.addEventListener('mousedown', (e) => {
                isDragging = true;
                startY = e.clientY;
                const currentRot = knob.style.getPropertyValue('--rotation') || '0deg';
                startRotation = parseInt(currentRot);
                e.preventDefault();
            });
            
            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaY = e.clientY - startY;
                let newRotation = startRotation - deltaY * 0.5;
                newRotation = Math.max(0, Math.min(180, newRotation));
                
                knob.style.setProperty('--rotation', newRotation + 'deg');
                
                // Update parameter based on knob id
                const value = newRotation / 180;
                if (knob.id === 'freqKnob') freqValue = value;
                if (knob.id === 'resKnob') resValue = value;
                if (knob.id === 'harmKnob') harmValue = value;
            });
            
            window.addEventListener('mouseup', () => {
                isDragging = false;
            });
        });
        
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
            });
        });
        
        // Audio initialization (user interaction required)
        function initAudio() {
            if (isAudioInitialized) return;
            
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            // Create oscillator for synthetic sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.3;
            
            oscillator.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(audioContext.destination);
            
            oscillator.start();
            
            isAudioInitialized = true;
            volumeDisplay.textContent = '🎵';
        }
        
        // Visualization
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        
        function drawWave() {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);
            
            ctx.clearRect(0, 0, width, height);
            
            // Background gradient based on freq
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, `hsl(${freqValue * 360}, 80%, 20%)`);
            gradient.addColorStop(1, `hsl(${freqValue * 360 + 60}, 80%, 20%)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            ctx.lineWidth = 3 + resValue * 5;
            ctx.strokeStyle = `hsl(${freqValue * 360 + 180}, 90%, 70%)`;
            ctx.shadowColor = `hsl(${freqValue * 360 + 180}, 90%, 70%)`;
            ctx.shadowBlur = 20;
            
            ctx.beginPath();
            
            const sliceWidth = width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2 + (Math.sin(i * harmValue) * height * 0.1 * resValue);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        function drawParticles() {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            const particleCount = 50 + Math.floor(resValue * 100);
            
            for (let i = 0; i < particleCount; i++) {
                const freqIndex = Math.floor(i * bufferLength / particleCount);
                const intensity = dataArray[freqIndex] / 255;
                
                if (intensity > 0.1) {
                    const x = width / 2 + Math.sin(i + Date.now() * 0.001 * freqValue) * width * 0.3 * intensity;
                    const y = height / 2 + Math.cos(i * 2 + Date.now() * 0.002) * height * 0.3 * intensity;
                    
                    const size = 10 + intensity * 30 * harmValue;
                    
                    const hue = (freqIndex * 10 + Date.now() * 0.1) % 360;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                    gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, 1)`);
                    gradient.addColorStop(1, `hsla(${hue}, 90%, 70%, 0)`);
                    
                    ctx.fillStyle = gradient;
                    ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
                    ctx.shadowBlur = 30;
                    ctx.fill();
                }
            }
            
            ctx.shadowBlur = 0;
        }
        
        function drawMandala() {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            
            const centerX = width / 2;
            const centerY = height / 2;
            const maxRadius = Math.min(width, height) * 0.4;
            
            const rings = 8 + Math.floor(resValue * 8);
            
            for (let ring = 0; ring < rings; ring++) {
                const radius = (ring / rings) * maxRadius * (0.5 + harmValue * 0.5);
                const points = 12 + ring * 4;
                
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * Math.PI * 2 + Date.now() * 0.001 * freqValue;
                    
                    const freqIndex = Math.floor(ring * bufferLength / rings);
                    const intensity = dataArray[freqIndex] / 255;
                    
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    
                    const size = 5 + intensity * 30;
                    
                    const hue = (angle * 50 + Date.now() * 0.1) % 360;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    
                    ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${intensity})`;
                    ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
                    ctx.shadowBlur = 20;
                    ctx.fill();
                }
            }
            
            ctx.shadowBlur = 0;
        }
        
        function drawSpectrum() {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            const barWidth = width / bufferLength * 2;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height * (0.5 + resValue * 0.5);
                
                const hue = (i * 2 + Date.now() * 0.1) % 360;
                
                ctx.fillStyle = `hsl(${hue}, 90%, 70%)`;
                ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
                ctx.shadowBlur = 20;
                
                ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
                
                x += barWidth;
            }
            
            ctx.shadowBlur = 0;
        }
        
        function animate() {
            if (!isAudioInitialized) {
                // Draw startup screen
                ctx.fillStyle = '#0a0a0a';
                ctx.fillRect(0, 0, width, height);
                
                ctx.fillStyle = '#aaccff';
                ctx.font = '24px "Space Grotesk", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('click anywhere to start sound', width/2, height/2);
            } else {
                switch(currentMode) {
                    case 'wave': drawWave(); break;
                    case 'particle': drawParticles(); break;
                    case 'mandala': drawMandala(); break;
                    case 'spectrum': drawSpectrum(); break;
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        // Click to initialize audio
        document.body.addEventListener('click', () => {
            initAudio();
        });
        
        window.addEventListener('resize', resize);
        resize();
        animate();