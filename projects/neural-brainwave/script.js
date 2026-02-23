        (function() {
            // ---------- NEURAL SYMPHONY ----------
            // Simulated brainwave-to-music generation
            
            const waveCanvas = document.getElementById('waveCanvas');
            const brainCanvas = document.getElementById('brainCanvas');
            const harmonyCanvas = document.getElementById('harmonyCanvas');
            
            const ctxWave = waveCanvas.getContext('2d');
            const ctxBrain = brainCanvas.getContext('2d');
            const ctxHarmony = harmonyCanvas.getContext('2d');

            let width, height;
            let time = 0;

            // brainwave frequencies (simulated)
            let delta = 0.3;    // deep sleep
            let theta = 0.45;   // meditation
            let alpha = 0.6;    // relaxed
            let beta = 0.4;     // active
            let gamma = 0.25;    // insight

            // musical parameters
            let bpm = 72;
            let keyIndex = 0; // 0:Am, 1:C, 2:G, 3:Em, 4:F
            const keys = ['Am', 'C', 'G', 'Em', 'F'];
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            
            let currentNote = 'C4';
            let currentFreq = 261.63;

            // UI elements
            const deltaFill = document.getElementById('deltaFill');
            const thetaFill = document.getElementById('thetaFill');
            const alphaFill = document.getElementById('alphaFill');
            const betaFill = document.getElementById('betaFill');
            const gammaFill = document.getElementById('gammaFill');
            
            const deltaVal = document.getElementById('deltaVal');
            const thetaVal = document.getElementById('thetaVal');
            const alphaVal = document.getElementById('alphaVal');
            const betaVal = document.getElementById('betaVal');
            const gammaVal = document.getElementById('gammaVal');
            
            const bpmDisplay = document.getElementById('bpmDisplay');
            const keyDisplay = document.getElementById('keyDisplay');
            const noteDisplay = document.getElementById('noteDisplay');

            // resize
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                waveCanvas.width = width;
                waveCanvas.height = height;
                brainCanvas.width = width;
                brainCanvas.height = height;
                harmonyCanvas.width = width;
                harmonyCanvas.height = height;
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // simulate brainwave evolution (chaotic but smooth)
            function updateBrainwaves() {
                // slow oscillation of brainwaves
                delta = 0.2 + 0.2 * Math.sin(time * 0.3) + 0.1 * Math.sin(time * 0.7);
                theta = 0.3 + 0.3 * Math.sin(time * 0.5 + 1) + 0.1 * Math.sin(time * 1.2);
                alpha = 0.4 + 0.4 * Math.sin(time * 0.4 + 2) + 0.1 * Math.sin(time * 0.9);
                beta = 0.2 + 0.3 * Math.sin(time * 0.6 + 3) + 0.15 * Math.sin(time * 1.5);
                gamma = 0.1 + 0.2 * Math.sin(time * 0.8 + 4) + 0.1 * Math.sin(time * 2.0);
                
                // normalize to 0-1 range
                delta = Math.max(0.1, Math.min(0.9, delta));
                theta = Math.max(0.1, Math.min(0.9, theta));
                alpha = Math.max(0.1, Math.min(0.9, alpha));
                beta = Math.max(0.1, Math.min(0.9, beta));
                gamma = Math.max(0.1, Math.min(0.9, gamma));
                
                // update UI
                deltaFill.style.width = (delta * 100) + '%';
                thetaFill.style.width = (theta * 100) + '%';
                alphaFill.style.width = (alpha * 100) + '%';
                betaFill.style.width = (beta * 100) + '%';
                gammaFill.style.width = (gamma * 100) + '%';
                
                deltaVal.innerText = delta.toFixed(2);
                thetaVal.innerText = theta.toFixed(2);
                alphaVal.innerText = alpha.toFixed(2);
                betaVal.innerText = beta.toFixed(2);
                gammaVal.innerText = gamma.toFixed(2);
            }

            // convert brainwaves to music parameters
            function brainwaveToMusic() {
                // BPM = 60 + 40 * alpha + 20 * beta (relaxed to active)
                bpm = Math.round(60 + 30 * alpha + 20 * beta);
                bpmDisplay.innerText = bpm;
                
                // key changes with theta/gamma
                let keyScore = theta * 2 + gamma * 3;
                keyIndex = Math.floor(keyScore * 2) % keys.length;
                keyDisplay.innerText = keys[keyIndex];
                
                // generate note based on alpha and delta
                let noteIndex = Math.floor(alpha * 12) % 12;
                let octave = 3 + Math.floor(theta * 3);
                currentNote = notes[noteIndex] + octave;
                
                // frequency calculation (A4 = 440Hz)
                let a4Index = notes.indexOf('A') + 4 * 12;
                let noteSemitone = noteIndex + octave * 12;
                let semitoneDiff = noteSemitone - 57; // A4 is 57 semitones from C0
                currentFreq = 440 * Math.pow(2, semitoneDiff / 12);
                
                noteDisplay.innerText = currentNote + ' · ' + Math.round(currentFreq) + 'Hz';
            }

            // draw brainwave patterns
            function drawBrainwaves() {
                ctxBrain.clearRect(0, 0, width, height);
                
                // draw EEG-like lines for each band
                const bands = [
                    { value: delta, color: '#ff4444', label: 'δ' },
                    { value: theta, color: '#44ff44', label: 'θ' },
                    { value: alpha, color: '#4444ff', label: 'α' },
                    { value: beta, color: '#ffff44', label: 'β' },
                    { value: gamma, color: '#ff44ff', label: 'γ' }
                ];
                
                bands.forEach((band, idx) => {
                    let offset = idx * 80 + 100;
                    let amp = band.value * 100;
                    let freq = 2 + idx * 2;
                    
                    ctxBrain.beginPath();
                    for (let x = 0; x < width; x += 10) {
                        let t = x / width;
                        let y = offset + 
                               Math.sin(x * 0.01 * freq + time * freq) * amp +
                               Math.cos(x * 0.02 + time * 0.5) * amp * 0.3;
                        
                        if (x === 0) ctxBrain.moveTo(x, y);
                        else ctxBrain.lineTo(x, y);
                    }
                    ctxBrain.strokeStyle = band.color + '80';
                    ctxBrain.lineWidth = 3;
                    ctxBrain.shadowColor = band.color;
                    ctxBrain.shadowBlur = 20;
                    ctxBrain.stroke();
                    
                    // label
                    ctxBrain.font = 'bold 24px monospace';
                    ctxBrain.fillStyle = band.color;
                    ctxBrain.shadowBlur = 30;
                    ctxBrain.fillText(band.label, 30, offset - 20);
                });
            }

            // draw harmonic waves (musical visualization)
            function drawHarmonics() {
                ctxHarmony.clearRect(0, 0, width, height);
                
                // draw frequency spectrum based on current note
                let fundamental = currentFreq;
                let harmonics = [1, 2, 3, 4, 5, 6, 7, 8];
                
                harmonics.forEach((harmonic, idx) => {
                    let freq = fundamental * harmonic;
                    let amp = 1 / harmonic; // natural harmonic series
                    
                    // adjust amplitude based on brainwaves
                    amp *= alpha * (1 + Math.sin(time * harmonic));
                    
                    let x = width/2 + Math.sin(time * 0.5 + idx) * 200 * amp;
                    let y = height/2 + Math.cos(time * 0.3 + idx) * 200 * amp;
                    
                    // draw harmonic circle
                    ctxHarmony.beginPath();
                    ctxHarmony.arc(x, y, 50 * amp, 0, 2 * Math.PI);
                    
                    let hue = (harmonic * 30 + time * 10) % 360;
                    ctxHarmony.fillStyle = `hsla(${hue}, 80%, 60%, 0.2)`;
                    ctxHarmony.shadowColor = `hsl(${hue}, 90%, 70%)`;
                    ctxHarmony.shadowBlur = 40;
                    ctxHarmony.fill();
                    
                    // draw connection to center
                    ctxHarmony.beginPath();
                    ctxHarmony.moveTo(width/2, height/2);
                    ctxHarmony.lineTo(x, y);
                    ctxHarmony.strokeStyle = `hsla(${hue}, 80%, 70%, 0.3)`;
                    ctxHarmony.lineWidth = 2;
                    ctxHarmony.stroke();
                });
                
                // draw central "brain" nucleus
                ctxHarmony.beginPath();
                ctxHarmony.arc(width/2, height/2, 80 + 20 * Math.sin(time), 0, 2*Math.PI);
                ctxHarmony.fillStyle = 'rgba(255, 200, 255, 0.1)';
                ctxHarmony.shadowColor = '#f6f';
                ctxHarmony.shadowBlur = 60;
                ctxHarmony.fill();
            }

            // draw waveform (background)
            function drawWaveform() {
                ctxWave.clearRect(0, 0, width, height);
                
                // composite waveform from all brainwaves
                ctxWave.beginPath();
                for (let x = 0; x < width; x += 5) {
                    let t = x / width;
                    
                    // mix all bands
                    let wave = 0;
                    wave += delta * Math.sin(t * 20 + time * 2);
                    wave += theta * Math.sin(t * 40 + time * 3);
                    wave += alpha * Math.sin(t * 60 + time * 4);
                    wave += beta * Math.sin(t * 80 + time * 5);
                    wave += gamma * Math.sin(t * 100 + time * 6);
                    
                    wave = wave / 3; // normalize
                    
                    let y = height/2 + wave * height * 0.3;
                    
                    if (x === 0) ctxWave.moveTo(x, y);
                    else ctxWave.lineTo(x, y);
                }
                
                // gradient stroke
                let gradient = ctxWave.createLinearGradient(0, 0, width, 0);
                gradient.addColorStop(0, '#ff44ff');
                gradient.addColorStop(0.5, '#44ffff');
                gradient.addColorStop(1, '#ffff44');
                
                ctxWave.strokeStyle = gradient;
                ctxWave.lineWidth = 4;
                ctxWave.shadowColor = '#f6f';
                ctxWave.shadowBlur = 40;
                ctxWave.stroke();
                
                // fill under wave
                ctxWave.lineTo(width, height);
                ctxWave.lineTo(0, height);
                ctxWave.closePath();
                ctxWave.fillStyle = 'rgba(100, 0, 100, 0.1)';
                ctxWave.fill();
            }

            // generate audio (simulated - would use Web Audio API in real version)
            function simulateAudio() {
                // This is a placeholder for actual audio synthesis
                // In a real implementation, we would create oscillators
                // with frequencies based on brainwaves
                
                // For now, we just update the visual representation
            }

            // animation loop
            function animate() {
                time += 0.02;
                
                updateBrainwaves();
                brainwaveToMusic();
                simulateAudio();
                
                drawBrainwaves();
                drawHarmonics();
                drawWaveform();
                
                requestAnimationFrame(animate);
            }
            animate();

            // interactive dials (placeholders for future expansion)
            // could add frequency adjustment for each band
        })();