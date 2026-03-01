        (function() {
            // ---------- QUANTUM SYNTH ----------
            // Generative particle synthesizer with harmonic physics
            
            const particleCanvas = document.getElementById('particleCanvas');
            const waveCanvas = document.getElementById('waveCanvas');
            const interfaceCanvas = document.getElementById('interfaceCanvas');
            
            const ctxParticle = particleCanvas.getContext('2d');
            const ctxWave = waveCanvas.getContext('2d');
            const ctxInterface = interfaceCanvas.getContext('2d');

            const container = document.querySelector('.synth-cosmos');
            let width, height;

            // audio context
            let audioCtx = null;
            let oscillator = null;
            let gainNode = null;
            let analyser = null;
            let isAudioInitialized = false;

            // synthesis parameters
            let frequency = 440; // A4
            let harmonics = 0.5;
            let resonance = 0.3;
            let decay = 0.7;
            
            // particle system
            const particles = [];
            const PARTICLE_COUNT = 120;
            let time = 0;

            // presets
            const presets = [
                { name: '⚡ HYDROGEN ⚡', freq: 98, harm: 0.3, res: 0.6, decay: 0.4 },
                { name: '✨ HELIUM ✨', freq: 220, harm: 0.7, res: 0.4, decay: 0.6 },
                { name: '🔥 LITHIUM 🔥', freq: 440, harm: 0.9, res: 0.8, decay: 0.3 },
                { name: '💎 BERYLLIUM 💎', freq: 880, harm: 0.2, res: 0.5, decay: 0.8 },
                { name: '🌌 BORON 🌌', freq: 1760, harm: 0.6, res: 0.7, decay: 0.5 }
            ];
            let presetIndex = 0;

            // UI elements
            const freqDisplay = document.getElementById('freqDisplay');
            const harmDisplay = document.getElementById('harmDisplay');
            const resDisplay = document.getElementById('resDisplay');
            const decayDisplay = document.getElementById('decayDisplay');
            const presetName = document.getElementById('presetName');
            const noteIndicator = document.getElementById('noteIndicator');
            
            const harmFill = document.getElementById('harmFill');
            const harmHandle = document.getElementById('harmHandle');
            const resFill = document.getElementById('resFill');
            const resHandle = document.getElementById('resHandle');
            const decayFill = document.getElementById('decayFill');
            const decayHandle = document.getElementById('decayHandle');
            const dialMarker = document.getElementById('dialMarker');

            // frequency to note name
            function freqToNote(freq) {
                const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                const A4 = 440;
                let semitone = Math.round(12 * Math.log2(freq / A4));
                let octave = 4 + Math.floor((semitone + 9) / 12);
                let noteIndex = (semitone + 9) % 12;
                if (noteIndex < 0) noteIndex += 12;
                return notes[noteIndex] + octave;
            }

            // resize
            function resizeCanvases() {
                width = container.clientWidth;
                height = container.clientHeight;
                particleCanvas.width = width;
                particleCanvas.height = height;
                waveCanvas.width = width;
                waveCanvas.height = height;
                interfaceCanvas.width = width;
                interfaceCanvas.height = height;
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // particle initialization
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: 3 + Math.random() * 8,
                    phase: Math.random() * Math.PI * 2,
                    hue: Math.random() * 360
                });
            }

            // initialize audio on first interaction
            function initAudio() {
                if (isAudioInitialized) return;
                
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                gainNode = audioCtx.createGain();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                
                gainNode.connect(analyser);
                analyser.connect(audioCtx.destination);
                
                // create oscillator
                oscillator = audioCtx.createOscillator();
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = frequency;
                
                // harmonic oscillator (additional)
                oscillator.connect(gainNode);
                
                gainNode.gain.value = 0.1; // quiet start
                
                oscillator.start();
                isAudioInitialized = true;
            }

            // update frequency
            function updateFrequency(newFreq) {
                frequency = Math.max(40, Math.min(2000, newFreq));
                freqDisplay.innerText = Math.round(frequency);
                noteIndicator.innerText = freqToNote(frequency);
                
                // rotate dial (0-360 deg mapping 40-2000Hz)
                let angle = ((frequency - 40) / 1960) * 270 - 45; // -45 to 225 deg
                dialMarker.style.transform = `translateX(-50%) rotate(${angle}deg)`;
                
                if (oscillator) {
                    oscillator.frequency.value = frequency;
                }
            }

            // update harmonics
            function updateHarmonics(val) {
                harmonics = Math.max(0, Math.min(1, val));
                harmDisplay.innerText = harmonics.toFixed(2);
                harmFill.style.width = (harmonics * 100) + '%';
                harmHandle.style.left = (harmonics * 100) + '%';
            }

            // update resonance
            function updateResonance(val) {
                resonance = Math.max(0, Math.min(1, val));
                resDisplay.innerText = resonance.toFixed(2);
                resFill.style.width = (resonance * 100) + '%';
                resHandle.style.left = (resonance * 100) + '%';
            }

            // update decay
            function updateDecay(val) {
                decay = Math.max(0, Math.min(1, val));
                decayDisplay.innerText = decay.toFixed(2);
                decayFill.style.width = (decay * 100) + '%';
                decayHandle.style.left = (decay * 100) + '%';
            }

            // slider interactions
            function setupSlider(sliderId, fillId, handleId, callback, initialVal) {
                const slider = document.getElementById(sliderId);
                const handle = document.getElementById(handleId);
                
                function updateFromEvent(e) {
                    const rect = slider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    callback(val);
                }
                
                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                slider.addEventListener('click', (e) => {
                    updateFromEvent(e);
                });
            }

            // frequency dial
            const dial = document.getElementById('freqDial');
            dial.addEventListener('click', (e) => {
                const rect = dial.getBoundingClientRect();
                const centerX = rect.left + rect.width/2;
                const centerY = rect.top + rect.height/2;
                const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
                let normAngle = (angle + 90 + 360) % 360; // 0-360 where 0 is top
                if (normAngle > 270) normAngle = 270; // clamp to 270deg range
                let freq = 40 + (normAngle / 270) * 1960;
                updateFrequency(freq);
            });

            // preset cycling
            setInterval(() => {
                presetIndex = (presetIndex + 1) % presets.length;
                const p = presets[presetIndex];
                presetName.innerText = p.name;
                updateFrequency(p.freq);
                updateHarmonics(p.harm);
                updateResonance(p.res);
                updateDecay(p.decay);
            }, 6000);

            // init sliders
            setupSlider('harmSlider', 'harmFill', 'harmHandle', updateHarmonics, harmonics);
            setupSlider('resSlider', 'resFill', 'resHandle', updateResonance, resonance);
            setupSlider('decaySlider', 'decayFill', 'decayHandle', updateDecay, decay);

            // initial updates
            updateFrequency(440);
            updateHarmonics(0.5);
            updateResonance(0.3);
            updateDecay(0.7);

            // start audio on any click
            container.addEventListener('click', () => {
                initAudio();
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }, { once: true });

            // animation
            function animate() {
                time += 0.016;

                if (audioCtx && analyser) {
                    // get frequency data
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(dataArray);
                    
                    // update gain based on resonance
                    if (gainNode) {
                        gainNode.gain.value = 0.05 + resonance * 0.15;
                    }
                }

                // update particles based on frequency and harmonics
                for (let p of particles) {
                    // force based on frequency
                    let freqFactor = frequency / 440;
                    let harmFactor = harmonics * 2;
                    
                    p.vx += Math.sin(time * p.phase + p.y * 0.01) * 0.02 * freqFactor;
                    p.vy += Math.cos(time * p.phase + p.x * 0.01) * 0.02 * harmFactor;
                    
                    // damping based on decay
                    p.vx *= (0.99 - decay * 0.1);
                    p.vy *= (0.99 - decay * 0.1);
                    
                    p.x += p.vx;
                    p.y += p.vy;
                    
                    // wrap around
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;
                    
                    // update hue based on resonance
                    p.hue = (p.hue + 0.2 + resonance * 0.5) % 360;
                }

                // draw wave canvas (background waveform)
                ctxWave.clearRect(0, 0, width, height);
                ctxWave.beginPath();
                for (let i = 0; i < width; i+=4) {
                    let t = i / width;
                    let amp = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * (frequency/100) + time * 10);
                    amp *= (0.3 + harmonics * 0.7);
                    let y = height/2 + Math.sin(i * 0.02 + time * 5) * 100 * amp;
                    
                    if (i === 0) ctxWave.moveTo(i, y);
                    else ctxWave.lineTo(i, y);
                }
                ctxWave.strokeStyle = '#b066fe';
                ctxWave.lineWidth = 3;
                ctxWave.shadowColor = '#f6f';
                ctxWave.shadowBlur = 30;
                ctxWave.stroke();

                // draw particles
                ctxParticle.clearRect(0, 0, width, height);
                for (let p of particles) {
                    ctxParticle.beginPath();
                    let size = p.size * (0.5 + resonance * 0.8) * (1 + 0.3 * Math.sin(time * 5 + p.phase));
                    ctxParticle.arc(p.x, p.y, size, 0, 2 * Math.PI);
                    
                    let brightness = 50 + 50 * Math.sin(time * 3 + p.phase);
                    ctxParticle.fillStyle = `hsla(${p.hue}, 80%, ${brightness}%, 0.8)`;
                    ctxParticle.shadowColor = `hsl(${p.hue}, 90%, 70%)`;
                    ctxParticle.shadowBlur = 20;
                    ctxParticle.fill();
                }

                // draw interface (frequency rings)
                ctxInterface.clearRect(0, 0, width, height);
                ctxInterface.beginPath();
                for (let i = 0; i < 5; i++) {
                    let radius = 100 + i * 60 + Math.sin(time * 2 + i) * 20;
                    ctxInterface.beginPath();
                    ctxInterface.arc(width/2, height/2, radius, 0, 2 * Math.PI);
                    ctxInterface.strokeStyle = `rgba(200, 130, 255, ${0.1 + i * 0.05})`;
                    ctxInterface.lineWidth = 1.5;
                    ctxInterface.stroke();
                }

                requestAnimationFrame(animate);
            }
            animate();
        })();