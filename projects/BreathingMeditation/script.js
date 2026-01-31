        // DOM Elements
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const timerElement = document.getElementById('timer');
        const instructionElement = document.getElementById('instruction');
        const cycleIndicators = document.getElementById('cycleIndicators');
        
        // Breathing settings elements
        const inhaleSlider = document.getElementById('inhaleTime');
        const holdSlider = document.getElementById('holdTime');
        const exhaleSlider = document.getElementById('exhaleTime');
        const rateSlider = document.getElementById('breathingRate');
        
        const inhaleValue = document.getElementById('inhaleValue');
        const holdValue = document.getElementById('holdValue');
        const exhaleValue = document.getElementById('exhaleValue');
        const rateValue = document.getElementById('rateValue');
        
        // Breathing state
        let isBreathing = false;
        let isPaused = false;
        let currentPhase = 'inhale'; // inhale, hold, exhale
        let currentTime = 0;
        let totalCycles = 0;
        let currentCycle = 0;
        
        // Default breathing settings (in seconds)
        let inhaleTime = 4;
        let holdTime = 4;
        let exhaleTime = 4;
        let breathingRate = 6; // breaths per minute
        
        // Timer variables
        let timerInterval;
        let breathingStartTime;
        
        // Initialize cycle indicators
        function initCycleIndicators() {
            cycleIndicators.innerHTML = '';
            totalCycles = breathingRate;
            
            for (let i = 0; i < totalCycles; i++) {
                const cycle = document.createElement('div');
                cycle.className = 'cycle';
                if (i === 0) cycle.classList.add('active');
                cycleIndicators.appendChild(cycle);
            }
        }
        
        // Update timer display
        function updateTimerDisplay() {
            const minutes = Math.floor(currentTime / 60);
            const seconds = currentTime % 60;
            const tenths = Math.floor((currentTime % 1) * 10);
            timerElement.textContent = `${minutes}:${seconds}:${tenths}`;
        }
        
        // Update breathing instruction
        function updateInstruction() {
            switch(currentPhase) {
                case 'inhale':
                    instructionElement.textContent = 'Breathe In';
                    instructionElement.style.color = '#48bbff';
                    break;
                case 'hold':
                    instructionElement.textContent = 'Hold';
                    instructionElement.style.color = '#a8d0e6';
                    break;
                case 'exhale':
                    instructionElement.textContent = 'Breathe Out';
                    instructionElement.style.color = '#4cd964';
                    break;
            }
        }
        
        // Update cycle indicators
        function updateCycleIndicators() {
            const cycles = document.querySelectorAll('.cycle');
            cycles.forEach((cycle, index) => {
                if (index === currentCycle) {
                    cycle.classList.add('active');
                } else {
                    cycle.classList.remove('active');
                }
            });
        }
        
        // Start breathing session
        function startBreathing() {
            if (isBreathing && !isPaused) return;
            
            if (!isBreathing) {
                // Starting fresh
                isBreathing = true;
                currentPhase = 'inhale';
                currentTime = inhaleTime;
                currentCycle = 0;
                breathingStartTime = Date.now();
                initCycleIndicators();
            }
            
            isPaused = false;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            updateInstruction();
            updateTimerDisplay();
            updateCycleIndicators();
            
            // Clear any existing interval
            clearInterval(timerInterval);
            
            // Start the breathing timer
            timerInterval = setInterval(() => {
                currentTime -= 0.1;
                
                if (currentTime <= 0) {
                    // Move to next phase
                    switch(currentPhase) {
                        case 'inhale':
                            currentPhase = holdTime > 0 ? 'hold' : 'exhale';
                            currentTime = currentPhase === 'hold' ? holdTime : exhaleTime;
                            break;
                        case 'hold':
                            currentPhase = 'exhale';
                            currentTime = exhaleTime;
                            break;
                        case 'exhale':
                            currentPhase = 'inhale';
                            currentTime = inhaleTime;
                            
                            // Move to next cycle
                            currentCycle = (currentCycle + 1) % totalCycles;
                            updateCycleIndicators();
                            break;
                    }
                    
                    updateInstruction();
                }
                
                updateTimerDisplay();
            }, 100);
        }
        
        // Pause breathing session
        function pauseBreathing() {
            if (!isBreathing) return;
            
            isPaused = !isPaused;
            
            if (isPaused) {
                clearInterval(timerInterval);
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                instructionElement.textContent = 'Paused';
                instructionElement.style.color = '#ffcc00';
            } else {
                startBreathing();
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        }
        
        // Reset breathing session
        function resetBreathing() {
            clearInterval(timerInterval);
            isBreathing = false;
            isPaused = false;
            currentPhase = 'inhale';
            currentTime = inhaleTime;
            currentCycle = 0;
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            
            updateTimerDisplay();
            updateInstruction();
            initCycleIndicators();
        }
        
        // Update breathing settings from sliders
        function updateSettings() {
            inhaleTime = parseInt(inhaleSlider.value);
            holdTime = parseInt(holdSlider.value);
            exhaleTime = parseInt(exhaleSlider.value);
            breathingRate = parseInt(rateSlider.value);
            
            inhaleValue.textContent = inhaleTime;
            holdValue.textContent = holdTime;
            exhaleValue.textContent = exhaleTime;
            rateValue.textContent = breathingRate;
            
            // Reset if settings change during a session
            if (isBreathing) {
                resetBreathing();
            }
        }
        
        // Event listeners
        startBtn.addEventListener('click', startBreathing);
        pauseBtn.addEventListener('click', pauseBreathing);
        resetBtn.addEventListener('click', resetBreathing);
        
        inhaleSlider.addEventListener('input', updateSettings);
        holdSlider.addEventListener('input', updateSettings);
        exhaleSlider.addEventListener('input', updateSettings);
        rateSlider.addEventListener('input', updateSettings);
        
        // Initialize
        updateSettings();
        updateTimerDisplay();
        initCycleIndicators();
        
        // Add subtle color shift to the background for more immersion
        const body = document.body;
        let hueShift = 0;
        
        setInterval(() => {
            hueShift = (hueShift + 0.1) % 360;
            body.style.background = `linear-gradient(135deg, 
                hsl(${200 + Math.sin(hueShift * Math.PI / 180) * 10}, 70%, 15%) 0%, 
                hsl(${210 + Math.cos(hueShift * Math.PI / 180) * 10}, 70%, 25%) 100%)`;
        }, 100);