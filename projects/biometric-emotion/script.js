        const zones = document.querySelectorAll('.body-zone');
        const excitementBar = document.getElementById('excitementBar');
        const calmBar = document.getElementById('calmBar');
        const focusBar = document.getElementById('focusBar');
        const creativityBar = document.getElementById('creativityBar');
        
        const heartRate = document.getElementById('heartRate');
        const skinTemp = document.getElementById('skinTemp');
        const galvanic = document.getElementById('galvanic');
        const brainWave = document.getElementById('brainWave');
        
        let scanning = false;
        let emotions = {
            excitement: 45,
            calm: 82,
            focus: 67,
            creativity: 91
        };
        
        function updateBodyZones() {
            // Activate zones based on emotions
            zones.forEach(zone => {
                const random = Math.random();
                if (random > 0.5) {
                    zone.classList.add('active');
                } else {
                    zone.classList.remove('active');
                }
            });
        }
        
        function scan() {
            scanning = !scanning;
            document.getElementById('scanBtn').textContent = scanning ? '⏹️ STOP SCAN' : '🔍 SCAN';
            
            if (scanning) {
                scanInterval = setInterval(() => {
                    // Random fluctuations
                    emotions.excitement = Math.min(100, Math.max(0, emotions.excitement + (Math.random() - 0.5) * 20));
                    emotions.calm = Math.min(100, Math.max(0, emotions.calm + (Math.random() - 0.5) * 15));
                    emotions.focus = Math.min(100, Math.max(0, emotions.focus + (Math.random() - 0.5) * 25));
                    emotions.creativity = Math.min(100, Math.max(0, emotions.creativity + (Math.random() - 0.5) * 30));
                    
                    // Update bars
                    excitementBar.style.width = emotions.excitement + '%';
                    calmBar.style.width = emotions.calm + '%';
                    focusBar.style.width = emotions.focus + '%';
                    creativityBar.style.width = emotions.creativity + '%';
                    
                    // Update metrics
                    heartRate.textContent = Math.floor(60 + Math.random() * 40);
                    skinTemp.textContent = (36 + Math.random() * 1.5).toFixed(1);
                    galvanic.textContent = (3 + Math.random() * 4).toFixed(1);
                    brainWave.textContent = (10 + Math.random() * 10).toFixed(1);
                    
                    updateBodyZones();
                }, 500);
            } else {
                clearInterval(scanInterval);
            }
        }
        
        function calibrate() {
            // Reset to baseline
            emotions = {
                excitement: 50,
                calm: 50,
                focus: 50,
                creativity: 50
            };
            
            excitementBar.style.width = '50%';
            calmBar.style.width = '50%';
            focusBar.style.width = '50%';
            creativityBar.style.width = '50%';
            
            heartRate.textContent = '72';
            skinTemp.textContent = '36.5';
            galvanic.textContent = '5.0';
            brainWave.textContent = '12.0';
            
            // Flash effect
            document.querySelector('.synesthesia-suit').style.boxShadow = '0 0 200px #7fffd4';
            setTimeout(() => {
                document.querySelector('.synesthesia-suit').style.boxShadow = '0 30px 60px #000000cc, 0 0 0 4px #00ffff, 0 0 50px #00ffff99';
            }, 500);
        }
        
        function record() {
            // Save current state
            const recording = {
                timestamp: new Date().toISOString(),
                emotions: {...emotions},
                metrics: {
                    heart: heartRate.textContent,
                    temp: skinTemp.textContent,
                    galvanic: galvanic.textContent,
                    brain: brainWave.textContent
                }
            };
            
            console.log('Recording saved:', recording);
            
            // Visual feedback
            document.getElementById('recordBtn').style.background = '#ff7fd4';
            document.getElementById('recordBtn').style.color = '#0a0f1f';
            setTimeout(() => {
                document.getElementById('recordBtn').style.background = '#1f2a3a';
                document.getElementById('recordBtn').style.color = '#7fffd4';
            }, 200);
        }
        
        document.getElementById('scanBtn').addEventListener('click', scan);
        document.getElementById('calibrateBtn').addEventListener('click', calibrate);
        document.getElementById('recordBtn').addEventListener('click', record);
        
        // Initial zone activation
        updateBodyZones();
        
        // Mouse movement affects readings
        document.addEventListener('mousemove', (e) => {
            if (scanning) {
                // Subtle influence based on mouse position
                const xPercent = e.clientX / window.innerWidth;
                emotions.excitement = 30 + xPercent * 70;
                excitementBar.style.width = emotions.excitement + '%';
            }
        });