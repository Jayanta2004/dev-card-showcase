        (function() {
            // ---------- QUANTUM TUNNELING MICROSCOPE ----------
            // Simulates electron wavefunctions and tunneling probability
            
            const probCanvas = document.getElementById('probabilityCanvas');
            const phaseCanvas = document.getElementById('phaseCanvas');
            const interCanvas = document.getElementById('interferenceCanvas');
            
            const ctxProb = probCanvas.getContext('2d');
            const ctxPhase = phaseCanvas.getContext('2d');
            const ctxInter = interCanvas.getContext('2d');

            let width, height;
            let time = 0;

            // quantum parameters
            let energy = 1.3; // eV
            let barrierHeight = 5.0; // eV
            let coherence = 0.7; // decoherence factor
            
            // wavefunction grid
            const GRID_SIZE = 256;
            let waveReal = new Float32Array(GRID_SIZE * GRID_SIZE);
            let waveImag = new Float32Array(GRID_SIZE * GRID_SIZE);
            let probability = new Float32Array(GRID_SIZE * GRID_SIZE);

            // UI elements
            const energyDisplay = document.getElementById('energyDisplay');
            const barrierDisplay = document.getElementById('barrierDisplay');
            const coherenceDisplay = document.getElementById('coherenceDisplay');
            const tunnelProb = document.getElementById('tunnelProb');
            const uncertaintyValue = document.getElementById('uncertaintyValue');
            
            // sliders
            const energySlider = document.getElementById('energySlider');
            const energyHandle = document.getElementById('energyHandle');
            const energyFill = document.getElementById('energyFill');
            
            const barrierSlider = document.getElementById('barrierSlider');
            const barrierHandle = document.getElementById('barrierHandle');
            const barrierFill = document.getElementById('barrierFill');
            
            const coherenceSlider = document.getElementById('coherenceSlider');
            const coherenceHandle = document.getElementById('coherenceHandle');
            const coherenceFill = document.getElementById('coherenceFill');

            // resize
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                probCanvas.width = width;
                probCanvas.height = height;
                phaseCanvas.width = width;
                phaseCanvas.height = height;
                interCanvas.width = width;
                interCanvas.height = height;
                
                initWavefunction();
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // slider interactions
            function setupSliders() {
                // energy slider
                function updateEnergyFromEvent(e) {
                    const rect = energySlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    energy = 0.5 + val * 4.5; // 0.5 to 5.0 eV
                    energyDisplay.innerText = energy.toFixed(2);
                    energyFill.style.width = (val * 100) + '%';
                    energyHandle.style.left = (val * 100) + '%';
                    
                    updateWavefunction();
                }
                
                energyHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateEnergyFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                energySlider.addEventListener('click', (e) => {
                    updateEnergyFromEvent(e);
                });
                
                // barrier slider
                function updateBarrierFromEvent(e) {
                    const rect = barrierSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    barrierHeight = 1 + val * 9; // 1 to 10 eV
                    barrierDisplay.innerText = barrierHeight.toFixed(1);
                    barrierFill.style.width = (val * 100) + '%';
                    barrierHandle.style.left = (val * 100) + '%';
                    
                    updateWavefunction();
                }
                
                barrierHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateBarrierFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                barrierSlider.addEventListener('click', (e) => {
                    updateBarrierFromEvent(e);
                });
                
                // coherence slider
                function updateCoherenceFromEvent(e) {
                    const rect = coherenceSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    coherence = val;
                    coherenceDisplay.innerText = coherence.toFixed(2);
                    coherenceFill.style.width = (val * 100) + '%';
                    coherenceHandle.style.left = (val * 100) + '%';
                    
                    updateWavefunction();
                }
                
                coherenceHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateCoherenceFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                coherenceSlider.addEventListener('click', (e) => {
                    updateCoherenceFromEvent(e);
                });
            }
            setupSliders();

            // initialize wavefunction (Gaussian wave packet)
            function initWavefunction() {
                let centerX = GRID_SIZE / 4;
                let centerY = GRID_SIZE / 2;
                let sigma = GRID_SIZE / 8;
                
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        let idx = y * GRID_SIZE + x;
                        
                        // Gaussian envelope
                        let dx = (x - centerX) / sigma;
                        let dy = (y - centerY) / sigma;
                        let gauss = Math.exp(-(dx*dx + dy*dy) / 2);
                        
                        // plane wave (momentum)
                        let k = 0.5;
                        let phase = k * x;
                        
                        waveReal[idx] = gauss * Math.cos(phase);
                        waveImag[idx] = gauss * Math.sin(phase);
                    }
                }
                
                normalizeWavefunction();
                computeProbability();
            }

            // normalize wavefunction (total probability = 1)
            function normalizeWavefunction() {
                let norm = 0;
                for (let i = 0; i < waveReal.length; i++) {
                    norm += waveReal[i] * waveReal[i] + waveImag[i] * waveImag[i];
                }
                norm = Math.sqrt(norm);
                
                for (let i = 0; i < waveReal.length; i++) {
                    waveReal[i] /= norm;
                    waveImag[i] /= norm;
                }
            }

            // compute probability density
            function computeProbability() {
                for (let i = 0; i < waveReal.length; i++) {
                    probability[i] = waveReal[i] * waveReal[i] + waveImag[i] * waveImag[i];
                }
            }

            // apply potential barrier and time evolution
            function updateWavefunction() {
                // simple tunneling simulation
                let barrierX = GRID_SIZE / 2;
                let barrierWidth = GRID_SIZE / 8;
                
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        let idx = y * GRID_SIZE + x;
                        
                        // potential barrier
                        if (x > barrierX - barrierWidth/2 && x < barrierX + barrierWidth/2) {
                            let V = barrierHeight;
                            
                            // tunneling probability (exponential decay in barrier)
                            if (energy < V) {
                                // classical forbidden region
                                let decay = Math.exp(-Math.sqrt(2 * (V - energy)) * barrierWidth/4);
                                waveReal[idx] *= (1 - decay) * coherence;
                                waveImag[idx] *= (1 - decay) * coherence;
                            }
                        }
                        
                        // decoherence
                        waveReal[idx] *= coherence;
                        waveImag[idx] *= coherence;
                        
                        // time evolution (simple phase rotation)
                        let phase = energy * 0.1;
                        let re = waveReal[idx];
                        let im = waveImag[idx];
                        waveReal[idx] = re * Math.cos(phase) - im * Math.sin(phase);
                        waveImag[idx] = re * Math.sin(phase) + im * Math.cos(phase);
                    }
                }
                
                normalizeWavefunction();
                computeProbability();
                
                // calculate tunneling probability (probability in right half)
                let rightProb = 0;
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = GRID_SIZE/2; x < GRID_SIZE; x++) {
                        let idx = y * GRID_SIZE + x;
                        rightProb += probability[idx];
                    }
                }
                
                tunnelProb.innerText = 'TUNNELING PROB: ' + (rightProb * 100).toFixed(1) + '%';
                
                // uncertainty principle
                let uncertainty = 0.5 / coherence + 0.3 * Math.sin(time);
                uncertaintyValue.innerText = uncertainty.toFixed(2);
            }

            // draw probability cloud
            function drawProbability() {
                let imageData = ctxProb.createImageData(width, height);
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        // map to grid
                        let gx = Math.floor(x * GRID_SIZE / width);
                        let gy = Math.floor(y * GRID_SIZE / height);
                        
                        if (gx >= GRID_SIZE) gx = GRID_SIZE - 1;
                        if (gy >= GRID_SIZE) gy = GRID_SIZE - 1;
                        
                        let idx = gy * GRID_SIZE + gx;
                        let prob = probability[idx];
                        
                        // color mapping (hot colormap)
                        let r = Math.min(255, Math.floor(255 * prob * 4));
                        let g = Math.min(255, Math.floor(255 * prob * 2));
                        let b = Math.min(255, Math.floor(255 * prob));
                        
                        let pixelIdx = (y * width + x) * 4;
                        imageData.data[pixelIdx] = r;
                        imageData.data[pixelIdx+1] = g;
                        imageData.data[pixelIdx+2] = b;
                        imageData.data[pixelIdx+3] = 255;
                    }
                }
                
                ctxProb.putImageData(imageData, 0, 0);
            }

            // draw phase information
            function drawPhase() {
                let imageData = ctxPhase.createImageData(width, height);
                
                for (let y = 0; y < height; y+=2) {
                    for (let x = 0; x < width; x+=2) {
                        let gx = Math.floor(x * GRID_SIZE / width);
                        let gy = Math.floor(y * GRID_SIZE / height);
                        
                        let idx = gy * GRID_SIZE + gx;
                        let re = waveReal[idx];
                        let im = waveImag[idx];
                        let phase = Math.atan2(im, re);
                        
                        // phase to color
                        let hue = (phase / (2*Math.PI) + 0.5) * 360;
                        let rgb = hslToRgb(hue/360, 0.9, 0.5);
                        
                        for (let dy = 0; dy < 2; dy++) {
                            for (let dx = 0; dx < 2; dx++) {
                                if (x+dx < width && y+dy < height) {
                                    let pixelIdx = ((y+dy) * width + (x+dx)) * 4;
                                    imageData.data[pixelIdx] = rgb[0] * 255;
                                    imageData.data[pixelIdx+1] = rgb[1] * 255;
                                    imageData.data[pixelIdx+2] = rgb[2] * 255;
                                    imageData.data[pixelIdx+3] = 200;
                                }
                            }
                        }
                    }
                }
                
                ctxPhase.putImageData(imageData, 0, 0);
            }

            // draw interference patterns
            function drawInterference() {
                ctxInter.clearRect(0, 0, width, height);
                
                // draw barrier
                let barrierX = width / 2;
                let barrierWidth = 20;
                
                ctxInter.fillStyle = 'rgba(0, 255, 255, 0.2)';
                ctxInter.fillRect(barrierX - barrierWidth/2, 0, barrierWidth, height);
                
                // draw equipotential lines
                ctxInter.strokeStyle = '#0ff80';
                ctxInter.lineWidth = 1;
                
                for (let i = 0; i < 5; i++) {
                    let y = height * (i+1) / 6;
                    ctxInter.beginPath();
                    ctxInter.moveTo(0, y);
                    ctxInter.lineTo(width, y);
                    ctxInter.strokeStyle = `rgba(0, 255, 255, ${0.1 + i*0.05})`;
                    ctxInter.stroke();
                }
                
                // draw probability contours
                for (let i = 0; i < 10; i++) {
                    let probLevel = 0.1 * (i+1);
                    ctxInter.beginPath();
                    
                    for (let x = 0; x < width; x+=5) {
                        let gx = Math.floor(x * GRID_SIZE / width);
                        let found = false;
                        
                        for (let y = 0; y < height; y+=5) {
                            let gy = Math.floor(y * GRID_SIZE / height);
                            let idx = gy * GRID_SIZE + gx;
                            
                            if (probability[idx] > probLevel) {
                                if (!found) {
                                    ctxInter.moveTo(x, y);
                                    found = true;
                                } else {
                                    ctxInter.lineTo(x, y);
                                }
                            }
                        }
                    }
                    
                    ctxInter.strokeStyle = `rgba(255, 0, 255, ${0.1})`;
                    ctxInter.stroke();
                }
            }

            // hsl to rgb helper
            function hslToRgb(h, s, l) {
                let r, g, b;
                if (s === 0) {
                    r = g = b = l;
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
                return [r, g, b];
            }

            // animation loop
            function animate() {
                time += 0.02;
                
                updateWavefunction();
                drawProbability();
                drawPhase();
                drawInterference();
                
                requestAnimationFrame(animate);
            }
            animate();
        })();