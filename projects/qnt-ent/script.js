        const particleA = document.getElementById('particleA');
        const particleB = document.getElementById('particleB');
        const spinA = document.getElementById('spinA');
        const spinB = document.getElementById('spinB');
        const meter = document.getElementById('entanglementMeter');
        const entanglementStat = document.getElementById('entanglementStat');
        const coherenceStat = document.getElementById('coherenceStat');
        
        let entangled = true;
        let spinState = ['↑', '↓']; // A, B (always opposite when entangled)
        let particlePosA = { x: 150, y: 90 };
        let particlePosB = { x: 150, y: 90 };
        
        function updateParticles() {
            // Update spin displays
            spinA.textContent = spinState[0];
            spinB.textContent = spinState[1];
            
            // Update particle colors based on spin
            particleA.style.background = spinState[0] === '↑' ? '#4ade80' : '#f87171';
            particleB.style.background = spinState[1] === '↑' ? '#4ade80' : '#f87171';
            
            particleA.style.boxShadow = spinState[0] === '↑' ? '0 0 30px #4ade80' : '0 0 30px #f87171';
            particleB.style.boxShadow = spinState[1] === '↑' ? '0 0 30px #4ade80' : '0 0 30px #f87171';
            
            // Update positions (jiggle)
            particleA.style.left = particlePosA.x + 'px';
            particleA.style.top = particlePosA.y + 'px';
            particleB.style.left = particlePosB.x + 'px';
            particleB.style.top = particlePosB.y + 'px';
        }
        
        function measure() {
            if (entangled) {
                // When entangled, measurement collapses both
                const randomSpin = Math.random() > 0.5 ? '↑' : '↓';
                spinState[0] = randomSpin;
                spinState[1] = randomSpin === '↑' ? '↓' : '↑';
                
                // Entanglement degrades slightly
                entangled = false;
                meter.style.width = '70%';
                entanglementStat.textContent = '70%';
                coherenceStat.textContent = Math.floor(70 + Math.random() * 10) + '%';
            } else {
                // Independent particles
                spinState[0] = Math.random() > 0.5 ? '↑' : '↓';
                spinState[1] = Math.random() > 0.5 ? '↑' : '↓';
            }
            
            // Particles jump
            particlePosA.x = 100 + Math.random() * 100;
            particlePosA.y = 50 + Math.random() * 100;
            particlePosB.x = 100 + Math.random() * 100;
            particlePosB.y = 50 + Math.random() * 100;
            
            updateParticles();
        }
        
        function entangle() {
            entangled = true;
            // Force opposite spins
            const baseSpin = Math.random() > 0.5 ? '↑' : '↓';
            spinState[0] = baseSpin;
            spinState[1] = baseSpin === '↑' ? '↓' : '↑';
            
            meter.style.width = '100%';
            entanglementStat.textContent = '100%';
            coherenceStat.textContent = '98%';
            
            // Particles align in motion
            particlePosA.x = 150;
            particlePosA.y = 90;
            particlePosB.x = 150;
            particlePosB.y = 90;
            
            updateParticles();
        }
        
        function reset() {
            entangle(); // Reset to entangled state
            spinState = ['↑', '↓'];
            meter.style.width = '100%';
            entanglementStat.textContent = '100%';
            coherenceStat.textContent = '98%';
            updateParticles();
        }
        
        // Animate particles (Brownian motion)
        function animateParticles() {
            if (!entangled) {
                // Independent motion
                particlePosA.x += (Math.random() - 0.5) * 10;
                particlePosA.y += (Math.random() - 0.5) * 10;
                particlePosB.x += (Math.random() - 0.5) * 10;
                particlePosB.y += (Math.random() - 0.5) * 10;
            } else {
                // Correlated motion (mirror)
                const dx = (Math.random() - 0.5) * 8;
                const dy = (Math.random() - 0.5) * 8;
                particlePosA.x += dx;
                particlePosA.y += dy;
                particlePosB.x -= dx; // Opposite direction (entangled)
                particlePosB.y -= dy;
            }
            
            // Keep in bounds
            particlePosA.x = Math.max(20, Math.min(280, particlePosA.x));
            particlePosA.y = Math.max(20, Math.min(180, particlePosA.y));
            particlePosB.x = Math.max(20, Math.min(280, particlePosB.x));
            particlePosB.y = Math.max(20, Math.min(180, particlePosB.y));
            
            updateParticles();
            requestAnimationFrame(animateParticles);
        }
        
        document.getElementById('measureBtn').addEventListener('click', measure);
        document.getElementById('entangleBtn').addEventListener('click', entangle);
        document.getElementById('resetBtn').addEventListener('click', reset);
        
        // Initialize
        reset();
        animateParticles();