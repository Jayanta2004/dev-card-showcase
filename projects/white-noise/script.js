        // DOM Elements
        const playBtn = document.getElementById('playBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        const soundTypesContainer = document.getElementById('soundTypes');
        const currentSoundName = document.getElementById('currentSoundName');
        const soundWave = document.getElementById('soundWave');
        const timerDisplay = document.getElementById('timerDisplay');
        const timerStartBtn = document.getElementById('timerStartBtn');
        const timerPauseBtn = document.getElementById('timerPauseBtn');
        const timerResetBtn = document.getElementById('timerResetBtn');
        const mixerControls = document.getElementById('mixerControls');
        const volumeDots = document.querySelectorAll('.volume-dot');
        
        // Audio context and variables
        let audioContext;
        let gainNode;
        let noiseNodes = [];
        let isPlaying = false;
        let currentSound = null;
        
        // Timer variables
        let timerInterval;
        let timerSeconds = 60 * 60; // 60 minutes default
        let timerRunning = false;
        
        // Sound definitions with parameters
        const soundTypes = [
            { id: 'white', name: 'White Noise', icon: 'fas fa-wind', color: '#a8edea', description: 'Constant soothing sound' },
            { id: 'pink', name: 'Pink Noise', icon: 'fas fa-feather-alt', color: '#fed6e3', description: 'Softer than white noise' },
            { id: 'brown', name: 'Brown Noise', icon: 'fas fa-water', color: '#d4a5a5', description: 'Deep, rumbling sound' },
            { id: 'rain', name: 'Rain', icon: 'fas fa-cloud-rain', color: '#89c2d9', description: 'Gentle rainfall' },
            { id: 'thunder', name: 'Thunderstorm', icon: 'fas fa-bolt', color: '#ffd166', description: 'Distant thunder and rain' },
            { id: 'waves', name: 'Ocean Waves', icon: 'fas fa-water', color: '#1d4e89', description: 'Calm ocean waves' },
            { id: 'stream', name: 'Forest Stream', icon: 'fas fa-tree', color: '#2a9d8f', description: 'Flowing stream in forest' },
            { id: 'fire', name: 'Crackling Fire', icon: 'fas fa-fire', color: '#e76f51', description: 'Warm fireplace sounds' },
            { id: 'fan', name: 'Fan', icon: 'fas fa-fan', color: '#b7b7a4', description: 'Consistent fan noise' },
            { id: 'city', name: 'City Ambience', icon: 'fas fa-city', color: '#6d6875', description: 'Distant city sounds' }
        ];
        
        // Initialize the application
        function init() {
            createSoundTypeButtons();
            createSoundVisualizer();
            createMixerControls();
            updateTimerDisplay();
            updateVolumeDots();
            
            // Initialize audio context (will be created on user interaction)
            playBtn.addEventListener('click', togglePlay);
            volumeSlider.addEventListener('input', updateVolume);
            
            // Timer event listeners
            timerStartBtn.addEventListener('click', startTimer);
            timerPauseBtn.addEventListener('click', pauseTimer);
            timerResetBtn.addEventListener('click', resetTimer);
            
            // Timer preset buttons
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove active class from all presets
                    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                    
                    // Add active class to clicked preset
                    this.classList.add('active');
                    
                    // Get minutes from data attribute
                    const minutes = parseInt(this.getAttribute('data-minutes'));
                    
                    if (minutes === 0) {
                        // Turn off timer
                        timerSeconds = 0;
                        if (timerRunning) {
                            clearInterval(timerInterval);
                            timerRunning = false;
                            updateTimerButtons();
                        }
                    } else {
                        timerSeconds = minutes * 60;
                    }
                    
                    updateTimerDisplay();
                });
            });
            
            // Initialize with white noise selected
            selectSound('white');
        }
        
        // Create sound type buttons
        function createSoundTypeButtons() {
            soundTypes.forEach(sound => {
                const soundBtn = document.createElement('div');
                soundBtn.className = 'sound-type';
                soundBtn.setAttribute('data-sound', sound.id);
                
                soundBtn.innerHTML = `
                    <div class="sound-icon"><i class="${sound.icon}"></i></div>
                    <div class="sound-name">${sound.name}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">${sound.description}</div>
                `;
                
                soundBtn.addEventListener('click', () => selectSound(sound.id));
                
                soundTypesContainer.appendChild(soundBtn);
            });
        }
        
        // Create sound visualizer bars
        function createSoundVisualizer() {
            // Clear existing bars
            soundWave.innerHTML = '';
            
            // Create 50 bars for visualization
            for (let i = 0; i < 50; i++) {
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.height = `${Math.random() * 80 + 20}px`;
                soundWave.appendChild(bar);
            }
            
            // Animate the bars
            animateSoundVisualizer();
        }
        
        // Animate the sound visualizer
        function animateSoundVisualizer() {
            const bars = document.querySelectorAll('.bar');
            
            function updateBars() {
                bars.forEach(bar => {
                    // Only animate if sound is playing
                    if (isPlaying) {
                        // Randomize height slightly
                        const currentHeight = parseInt(bar.style.height);
                        const newHeight = currentHeight + (Math.random() * 20 - 10);
                        
                        // Keep height within bounds
                        bar.style.height = `${Math.max(20, Math.min(100, newHeight))}px`;
                        
                        // Update opacity based on volume
                        const volume = parseInt(volumeSlider.value) / 100;
                        bar.style.opacity = 0.5 + (volume * 0.5);
                    }
                });
                
                // Continue animation
                if (isPlaying || timerRunning) {
                    requestAnimationFrame(updateBars);
                }
            }
            
            updateBars();
        }
        
        // Create mixer controls
        function createMixerControls() {
            // Select first 4 sounds for mixer
            const mixerSounds = soundTypes.slice(0, 4);
            
            mixerSounds.forEach(sound => {
                const mixerItem = document.createElement('div');
                mixerItem.className = 'mixer-item';
                
                mixerItem.innerHTML = `
                    <div class="mixer-label">
                        <span><i class="${sound.icon}"></i> ${sound.name}</span>
                        <span class="mixer-value">0%</span>
                    </div>
                    <div class="slider-container">
                        <input type="range" min="0" max="100" value="0" class="slider mixer-slider" data-sound="${sound.id}">
                    </div>
                `;
                
                mixerControls.appendChild(mixerItem);
            });
            
            // Add event listeners to mixer sliders
            document.querySelectorAll('.mixer-slider').forEach(slider => {
                slider.addEventListener('input', function() {
                    const value = this.value;
                    const soundId = this.getAttribute('data-sound');
                    const valueSpan = this.parentElement.parentElement.querySelector('.mixer-value');
                    
                    valueSpan.textContent = `${value}%`;
                    
                    // In a real implementation, this would adjust the mix of different sounds
                    // For this demo, we'll just log the change
                    console.log(`Mixer: ${soundId} set to ${value}%`);
                });
            });
        }
        
        // Initialize audio context (requires user interaction)
        function initAudio() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                gainNode = audioContext.createGain();
                gainNode.connect(audioContext.destination);
                
                // Set initial volume
                updateVolume();
            }
        }
        
        // Select a sound type
        function selectSound(soundId) {
            // Update UI
            document.querySelectorAll('.sound-type').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelector(`[data-sound="${soundId}"]`).classList.add('active');
            
            // Find the selected sound
            const selectedSound = soundTypes.find(s => s.id === soundId);
            currentSoundName.textContent = selectedSound.name;
            
            // Stop current sound if playing
            if (isPlaying) {
                stopSound();
                playSound(soundId);
            }
            
            currentSound = soundId;
        }
        
        // Play the selected sound
        function playSound(soundId = currentSound) {
            if (!soundId) return;
            
            initAudio();
            
            // Create noise source based on sound type
            const source = audioContext.createBufferSource();
            
            // Create buffer with noise
            const bufferSize = 2 * audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            // Fill the buffer with noise based on sound type
            for (let i = 0; i < bufferSize; i++) {
                switch(soundId) {
                    case 'white':
                        // White noise: equal energy per frequency
                        output[i] = Math.random() * 2 - 1;
                        break;
                    case 'pink':
                        // Pink noise: energy decreases by 3dB per octave
                        output[i] = (Math.random() * 2 - 1) * 0.5;
                        break;
                    case 'brown':
                        // Brown noise: energy decreases by 6dB per octave
                        output[i] = (Math.random() * 2 - 1) * 0.3;
                        break;
                    default:
                        // For other sounds, use filtered noise
                        output[i] = (Math.random() * 2 - 1) * 0.7;
                }
            }
            
            source.buffer = buffer;
            source.loop = true;
            source.connect(gainNode);
            source.start();
            
            // Store reference to stop later
            noiseNodes.push(source);
            
            // Start visualizer animation
            if (!isPlaying) {
                animateSoundVisualizer();
            }
            
            isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playBtn.classList.add('playing');
        }
        
        // Stop all sounds
        function stopSound() {
            noiseNodes.forEach(node => {
                try {
                    node.stop();
                } catch(e) {
                    // Node might already be stopped
                }
            });
            
            noiseNodes = [];
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.classList.remove('playing');
        }
        
        // Toggle play/pause
        function togglePlay() {
            if (!currentSound) {
                // If no sound selected, select white noise
                selectSound('white');
            }
            
            if (isPlaying) {
                stopSound();
            } else {
                playSound();
            }
        }
        
        // Update volume
        function updateVolume() {
            const volume = parseInt(volumeSlider.value) / 100;
            volumeValue.textContent = `${volumeSlider.value}%`;
            
            if (gainNode) {
                gainNode.gain.value = volume * 0.5; // Scale down to avoid clipping
            }
            
            updateVolumeDots();
        }
        
        // Update volume indicator dots
        function updateVolumeDots() {
            const volume = parseInt(volumeSlider.value);
            const activeDots = Math.ceil(volume / 10);
            
            volumeDots.forEach((dot, index) => {
                if (index < activeDots) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Timer functions
        function startTimer() {
            if (timerSeconds <= 0) return;
            
            timerRunning = true;
            updateTimerButtons();
            
            timerInterval = setInterval(() => {
                timerSeconds--;
                updateTimerDisplay();
                
                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    updateTimerButtons();
                    
                    // Stop sound when timer ends
                    if (isPlaying) {
                        stopSound();
                    }
                    
                    // Show notification
                    showNotification('Timer completed! Sound has been stopped.');
                }
            }, 1000);
        }
        
        function pauseTimer() {
            if (timerRunning) {
                clearInterval(timerInterval);
                timerRunning = false;
                updateTimerButtons();
            }
        }
        
        function resetTimer() {
            clearInterval(timerInterval);
            timerRunning = false;
            
            // Reset to current preset value
            const activePreset = document.querySelector('.preset-btn.active');
            if (activePreset) {
                const minutes = parseInt(activePreset.getAttribute('data-minutes'));
                timerSeconds = minutes * 60;
            } else {
                timerSeconds = 60 * 60; // Default to 60 minutes
            }
            
            updateTimerDisplay();
            updateTimerButtons();
        }
        
        function updateTimerDisplay() {
            const minutes = Math.floor(timerSeconds / 60);
            const seconds = timerSeconds % 60;
            
            timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Change color when timer is low
            if (timerSeconds < 60) {
                timerDisplay.style.color = '#ff6b6b';
            } else if (timerSeconds < 300) {
                timerDisplay.style.color = '#ffd166';
            } else {
                timerDisplay.style.color = '#a8edea';
            }
        }
        
        function updateTimerButtons() {
            if (timerRunning) {
                timerStartBtn.disabled = true;
                timerPauseBtn.disabled = false;
                timerStartBtn.innerHTML = '<i class="fas fa-play-circle"></i> Running';
            } else {
                timerStartBtn.disabled = timerSeconds <= 0;
                timerPauseBtn.disabled = true;
                timerStartBtn.innerHTML = '<i class="fas fa-play-circle"></i> Start Timer';
            }
        }
        
        // Show notification
        function showNotification(message) {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #a8edea, #fed6e3);
                color: #203a43;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                font-weight: 600;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
            `;
            
            notification.innerHTML = `<i class="fas fa-bell"></i> ${message}`;
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateY(0)';
                notification.style.opacity = '1';
            }, 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.transform = 'translateY(100px)';
                notification.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
        
        // Initialize the app
        init();