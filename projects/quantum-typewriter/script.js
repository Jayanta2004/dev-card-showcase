        const quantumText = document.getElementById('quantumText');
        const keyboard = document.getElementById('keyboard');
        const quantumEffect = document.getElementById('quantumEffect');
        const probabilitySpan = document.getElementById('probability');
        const entanglementSpan = document.getElementById('entanglement');
        const observerSpan = document.getElementById('observer');
        
        // Quantum effects on text
        let realityDistortion = 0;
        let lastChar = '';
        
        // Create typewriter keys
        const keys = [
            'Q','W','E','R','T','Y','U','I','O','P',
            'A','S','D','F','G','H','J','K','L',';',
            'Z','X','C','V','B','N','M',',','.','/',
            '⚡','🌀','🔮','∞','⌘','⏎','⌫','⎋','⇧','␣'
        ];
        
        keys.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.className = `key ${key.length > 1 ? 'special' : ''}`;
            keyDiv.textContent = key;
            
            keyDiv.addEventListener('click', () => {
                handleKeyPress(key);
            });
            
            keyboard.appendChild(keyDiv);
        });
        
        function handleKeyPress(key) {
            // Special keys
            if (key === '⏎') {
                quantumText.innerHTML += '<br>';
            } else if (key === '⌫') {
                quantumText.innerHTML = quantumText.innerHTML.slice(0, -1);
            } else if (key === '␣') {
                quantumText.innerHTML += ' ';
            } else if (key === '⚡' || key === '🌀' || key === '🔮' || key === '∞' || key === '⌘') {
                // Quantum effect keys - add reality distortion
                realityDistortion += 0.1;
                applyQuantumEffect(key);
            } else {
                quantumText.innerHTML += key;
            }
            
            // Random quantum fluctuations
            if (Math.random() > 0.7) {
                quantumFluctuation();
            }
            
            updateRealityMetrics();
        }
        
        function applyQuantumEffect(effect) {
            const effects = [
                { name: '⚡', msg: 'REALITY SHIFT DETECTED', prob: 0.8 },
                { name: '🌀', msg: 'PROBABILITY COLLAPSE', prob: 0.6 },
                { name: '🔮', msg: 'FUTURE OVERLAP', prob: 0.9 },
                { name: '∞', msg: 'INFINITE LOOP', prob: 0.3 },
                { name: '⌘', msg: 'COMMAND REALITY', prob: 0.7 }
            ];
            
            const found = effects.find(e => e.name === effect);
            if (found) {
                quantumEffect.textContent = found.msg;
                quantumEffect.style.background = '#8f6b4d';
                quantumEffect.style.boxShadow = `0 0 50px ${found.name === '⚡' ? '#ffff00' : '#8faabc'}`;
                
                // Distort text slightly
                if (found.name === '🌀') {
                    const currentText = quantumText.innerHTML;
                    quantumText.innerHTML = currentText.split('').reverse().join('');
                } else if (found.name === '∞') {
                    quantumText.innerHTML += quantumText.innerHTML;
                }
            }
            
            setTimeout(() => {
                quantumEffect.textContent = '⚡ REALITY STABLE ⚡';
                quantumEffect.style.background = '#4d5f6b';
                quantumEffect.style.boxShadow = '0 0 30px #8faabc';
            }, 2000);
        }
        
        function quantumFluctuation() {
            // Randomly change some characters
            const text = quantumText.innerHTML;
            if (text.length > 5) {
                const pos = Math.floor(Math.random() * text.length);
                const chars = ['∞', '⚡', '🌀', '🔮', '⌘', '?', '!', '~'];
                const newChar = chars[Math.floor(Math.random() * chars.length)];
                quantumText.innerHTML = text.substring(0, pos) + newChar + text.substring(pos + 1);
            }
        }
        
        function updateRealityMetrics() {
            // Random fluctuations
            probabilitySpan.textContent = Math.floor(70 + Math.random() * 25) + '%';
            entanglementSpan.textContent = Math.floor(30 + Math.random() * 40) + '%';
            observerSpan.textContent = Math.floor(60 + Math.random() * 30) + '%';
        }
        
        // Physical keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.key.length === 1) {
                handleKeyPress(e.key.toUpperCase());
            } else if (e.key === 'Backspace') {
                handleKeyPress('⌫');
            } else if (e.key === 'Enter') {
                handleKeyPress('⏎');
            } else if (e.key === ' ') {
                handleKeyPress('␣');
            }
        });
        
        // Initial metrics
        updateRealityMetrics();