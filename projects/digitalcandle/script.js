document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const candleBody = document.getElementById('candleBody');
    const wick = document.getElementById('wick');
    const flame = document.getElementById('flame');
    const smokeContainer = document.getElementById('smokeContainer');
    const candleGlow = document.getElementById('candleGlow');
    const ambientLight = document.getElementById('ambientLight');
    const statusLight = document.getElementById('statusLight');
    const statusText = document.getElementById('statusText');
    const micStatus = document.getElementById('micStatus');
    const burnTime = document.getElementById('burnTime');
    const timesLit = document.getElementById('timesLit');
    
    // Control elements
    const candleType = document.getElementById('candleType');
    const flameSize = document.getElementById('flameSize');
    const flickerIntensity = document.getElementById('flickerIntensity');
    const flameFill = document.getElementById('flameFill');
    const lightCandleBtn = document.getElementById('lightCandleBtn');
    const blowCandleBtn = document.getElementById('blowCandleBtn');
    const micToggleBtn = document.getElementById('micToggleBtn');
    
    // Audio elements
    const lightSound = document.getElementById('lightSound');
    const blowSound = document.getElementById('blowSound');
    
    // State variables
    let isLit = false;
    let micEnabled = false;
    let burnTimer = null;
    let burnSeconds = 0;
    let litCount = 0;
    let audioContext = null;
    let analyser = null;
    let microphone = null;
    let animationFrameId = null;
    
    // Initialize
    updateFlameSize();
    updateTimesLit();
    
    // Event listeners
    candleType.addEventListener('change', changeCandleType);
    flameSize.addEventListener('input', updateFlameSize);
    flickerIntensity.addEventListener('input', updateFlickerIntensity);
    lightCandleBtn.addEventListener('click', lightCandle);
    blowCandleBtn.addEventListener('click', blowCandle);
    micToggleBtn.addEventListener('click', toggleMicrophone);
    
    // Change candle color/type
    function changeCandleType() {
        const type = candleType.value;
        candleBody.className = 'candle-body';
        candleBody.classList.add(type);
        
        // Update flame color for certain candle types
        if (type === 'blue') {
            document.querySelector('.flame-core').style.background = 
                'radial-gradient(circle at center, #bbdefb, #64b5f6, #2196f3)';
        } else if (type === 'purple') {
            document.querySelector('.flame-core').style.background = 
                'radial-gradient(circle at center, #e1bee7, #ba68c8, #9c27b0)';
        } else if (type === 'green') {
            document.querySelector('.flame-core').style.background = 
                'radial-gradient(circle at center, #c8e6c9, #81c784, #4caf50)';
        } else {
            document.querySelector('.flame-core').style.background = 
                'radial-gradient(circle at center, #fff9c4, #ffeb3b, #ff9800)';
        }
    }
    
    // Update flame size based on slider
    function updateFlameSize() {
        const size = parseInt(flameSize.value);
        const flameWidth = 20 + (size * 3);
        const flameHeight = 50 + (size * 5);
        
        flame.style.width = `${flameWidth}px`;
        flame.style.height = `${flameHeight}px`;
        
        // Update visual indicator
        flameFill.style.width = `${size * 10}%`;
        
        // Adjust flame position
        flame.style.top = `-${flameHeight + 5}px`;
        
        // Update flame animation speed based on size
        const speed = 0.5 - (size * 0.03);
        flame.style.animationDuration = `${speed}s`;
    }
    
    // Update flicker intensity
    function updateFlickerIntensity() {
        const intensity = parseInt(flickerIntensity.value);
        const blur = 1 + (intensity * 0.3);
        document.querySelector('.flame-core').style.filter = `blur(${blur}px)`;
    }
    
    // Light the candle
    function lightCandle() {
        if (isLit) return;
        
        isLit = true;
        litCount++;
        
        // Update UI
        flame.classList.add('lit');
        candleGlow.style.opacity = '1';
        ambientLight.style.opacity = '1';
        statusLight.classList.add('lit');
        statusText.textContent = 'The candle is burning brightly 🔥';
        
        // Update button states
        lightCandleBtn.disabled = true;
        blowCandleBtn.disabled = false;
        
        // Play sound
        lightSound.currentTime = 0;
        lightSound.play().catch(e => console.log("Audio play failed:", e));
        
        // Start burn timer
        startBurnTimer();
        
        // Update times lit counter
        updateTimesLit();
        
        // Trigger small flicker animation
        animateFlameFlicker();
    }
    
    // Blow out the candle
    function blowCandle() {
        if (!isLit) return;
        
        isLit = false;
        
        // Update UI
        flame.classList.remove('lit');
        candleGlow.style.opacity = '0';
        ambientLight.style.opacity = '0';
        statusLight.classList.remove('lit');
        statusText.textContent = 'The candle has been blown out 🌙';
        
        // Update button states
        lightCandleBtn.disabled = false;
        blowCandleBtn.disabled = true;
        
        // Play sound
        blowSound.currentTime = 0;
        blowSound.play().catch(e => console.log("Audio play failed:", e));
        
        // Show smoke
        showSmoke();
        
        // Stop burn timer
        stopBurnTimer();
        
        // Reset burn time for next lighting
        burnSeconds = 0;
        updateBurnTime();
    }
    
    // Toggle microphone for blow detection
    function toggleMicrophone() {
        if (!micEnabled) {
            enableMicrophone();
        } else {
            disableMicrophone();
        }
    }
    
    // Enable microphone
    function enableMicrophone() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Microphone access is not supported in your browser.");
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                micEnabled = true;
                
                // Update UI
                micStatus.textContent = 'Microphone: Enabled (blow to extinguish)';
                micToggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Disable Mic';
                micToggleBtn.style.background = 'linear-gradient(to bottom, #f44336, #d32f2f)';
                
                // Set up audio analysis
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                microphone = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                microphone.connect(analyser);
                
                // Start analyzing audio for blow detection
                startBlowDetection();
            })
            .catch(err => {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please check permissions.");
                micEnabled = false;
            });
    }
    
    // Disable microphone
    function disableMicrophone() {
        micEnabled = false;
        
        // Update UI
        micStatus.textContent = 'Microphone: Disabled';
        micToggleBtn.innerHTML = '<i class="fas fa-microphone"></i> Enable Mic';
        micToggleBtn.style.background = 'linear-gradient(to bottom, #9c27b0, #7b1fa2)';
        
        // Stop audio analysis
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Close audio context
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }
    
    // Start blow detection via microphone
    function startBlowDetection() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function detectBlow() {
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const averageVolume = sum / bufferLength;
            
            // If volume is high and candle is lit, blow it out
            if (averageVolume > 30 && isLit) {
                blowCandle();
                
                // Show visual feedback for blow detection
                showBlowFeedback();
            }
            
            // Continue detection
            animationFrameId = requestAnimationFrame(detectBlow);
        }
        
        detectBlow();
    }
    
    // Show visual feedback when blow is detected
    function showBlowFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'blow-feedback';
        feedback.innerHTML = '<i class="fas fa-wind"></i>';
        feedback.style.position = 'absolute';
        feedback.style.top = '50%';
        feedback.style.left = '50%';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.fontSize = '40px';
        feedback.style.color = 'rgba(255, 255, 255, 0.7)';
        feedback.style.zIndex = '100';
        feedback.style.animation = 'fadeOut 1s forwards';
        
        document.querySelector('.candle-area').appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }
    
    // Show smoke animation
    function showSmoke() {
        smokeContainer.style.opacity = '1';
        
        // Set random direction for smoke particles
        const smokeParticles = document.querySelectorAll('.smoke-particle');
        smokeParticles.forEach(particle => {
            const x = Math.random() * 2 - 1; // -1 to 1
            const y = Math.random() * 2 - 1; // -1 to 1
            particle.style.setProperty('--smoke-x', x);
            particle.style.setProperty('--smoke-y', y);
        });
        
        // Hide smoke after animation
        setTimeout(() => {
            smokeContainer.style.opacity = '0';
        }, 3000);
    }
    
    // Start burn timer
    function startBurnTimer() {
        burnTimer = setInterval(() => {
            burnSeconds++;
            updateBurnTime();
        }, 1000);
    }
    
    // Stop burn timer
    function stopBurnTimer() {
        if (burnTimer) {
            clearInterval(burnTimer);
            burnTimer = null;
        }
    }
    
    // Update burn time display
    function updateBurnTime() {
        const minutes = Math.floor(burnSeconds / 60);
        const seconds = burnSeconds % 60;
        burnTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update times lit counter
    function updateTimesLit() {
        timesLit.textContent = litCount;
    }
    
    // Animate flame flicker
    function animateFlameFlicker() {
        if (!isLit) return;
        
        // Randomly adjust flame size slightly for flicker effect
        const flickerAmount = parseInt(flickerIntensity.value) * 0.05;
        const randomScale = 1 + (Math.random() * flickerAmount * 2 - flickerAmount);
        
        flame.style.transform = `translateX(-50%) scale(${randomScale})`;
        
        // Schedule next flicker
        setTimeout(() => {
            animateFlameFlicker();
        }, 100 + Math.random() * 200);
    }
    
    // Add CSS for blow feedback animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -100px) scale(1.5); }
        }
        .blow-feedback {
            animation: fadeOut 1s forwards;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize with default candle
    changeCandleType();
});