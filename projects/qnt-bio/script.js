        (function() {
            // ---------- QUANTUM BIOLOGY SIMULATOR ----------
            // Models quantum effects in photosynthesis, magnetoreception, and enzyme catalysis
            
            const chloroplastCanvas = document.getElementById('chloroplastCanvas');
            const magnetosomeCanvas = document.getElementById('magnetosomeCanvas');
            const enzymeCanvas = document.getElementById('enzymeCanvas');
            
            const ctxChloro = chloroplastCanvas.getContext('2d');
            const ctxMagneto = magnetosomeCanvas.getContext('2d');
            const ctxEnzyme = enzymeCanvas.getContext('2d');

            let width, height;
            let time = 0;

            // quantum biology parameters
            let coherence = 0.8;      // quantum coherence in photosynthesis
            let tunneling = 0.45;       // enzyme tunneling probability
            let magnetic = 0.6;         // magnetoreception sensitivity
            
            // photosynthetic complexes
            const complexes = [];
            const COMPLEX_COUNT = 36;
            
            // magnetosomes (magnetic nanoparticles)
            const magnetosomes = [];
            const MAGNETOSOME_COUNT = 24;

            // effect descriptions
            const effects = [
                "🍃 quantum coherence in FMO complex",
                "🧬 enzyme quantum tunneling",
                "🧲 radical pair magnetoreception",
                "☀️ 95% photosynthetic efficiency",
                "🦋 avian navigation via entanglement",
                "🌱 zero-point energy in ATP synthase",
                "🧪 deuterium tunneling in enzymes",
                "🕊️ cryptochrome magnetic sensing"
            ];

            // UI elements
            const coherenceDisplay = document.getElementById('coherenceDisplay');
            const tunnelingDisplay = document.getElementById('tunnelingDisplay');
            const magneticDisplay = document.getElementById('magneticDisplay');
            const efficiencySpan = document.getElementById('efficiency');
            const navigationSpan = document.getElementById('navigation');
            const efficiencyMeter = document.getElementById('efficiencyMeter');
            const effectDisplay = document.getElementById('effectDisplay');
            
            // sliders
            const coherenceSlider = document.getElementById('coherenceSlider');
            const coherenceHandle = document.getElementById('coherenceHandle');
            const coherenceFill = document.getElementById('coherenceFill');
            
            const tunnelingSlider = document.getElementById('tunnelingSlider');
            const tunnelingHandle = document.getElementById('tunnelingHandle');
            const tunnelingFill = document.getElementById('tunnelingFill');
            
            const magneticSlider = document.getElementById('magneticSlider');
            const magneticHandle = document.getElementById('magneticHandle');
            const magneticFill = document.getElementById('magneticFill');

            // photosynthetic complex class
            class PhotosyntheticComplex {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.phase = Math.random() * Math.PI * 2;
                    this.energy = Math.random();
                    this.excited = false;
                    this.coherenceTime = 0;
                }
                
                update(coherence, time) {
                    // quantum coherence effects
                    this.coherenceTime += 0.02;
                    
                    // excitation by photons
                    if (Math.random() < 0.05) {
                        this.excited = true;
                        this.energy = 1.0;
                    }
                    
                    // energy transfer with quantum coherence
                    if (this.excited) {
                        this.energy *= (0.95 + coherence * 0.05);
                        if (this.energy < 0.1) {
                            this.excited = false;
                        }
                    }
                    
                    // quantum beating (coherence oscillation)
                    let beat = Math.sin(this.coherenceTime * 5 + this.phase) * coherence;
                    return beat;
                }
            }

            // magnetosome class
            class Magnetosome {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.spin = Math.random() * 2 - 1;
                    this.angle = Math.random() * Math.PI * 2;
                }
                
                update(magnetic, time) {
                    // spin precession in magnetic field
                    this.angle += magnetic * 0.1;
                    
                    // radical pair mechanism
                    this.spin = Math.sin(this.angle + time) * magnetic;
                    
                    return this.spin;
                }
            }

            // initialize components
            function initComponents() {
                complexes.length = 0;
                magnetosomes.length = 0;
                
                // photosynthetic complexes in grid
                let cols = 8;
                let rows = 6;
                
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        let nx = (x + 0.5) / cols;
                        let ny = (y + 0.5) / rows;
                        
                        // add jitter
                        nx += (Math.random() - 0.5) * 0.1;
                        ny += (Math.random() - 0.5) * 0.1;
                        
                        complexes.push(new PhotosyntheticComplex(nx, ny));
                    }
                }
                
                // magnetosomes
                for (let i = 0; i < MAGNETOSOME_COUNT; i++) {
                    magnetosomes.push(new Magnetosome(
                        Math.random(),
                        Math.random()
                    ));
                }
            }

            // resize
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                chloroplastCanvas.width = width;
                chloroplastCanvas.height = height;
                magnetosomeCanvas.width = width;
                magnetosomeCanvas.height = height;
                enzymeCanvas.width = width;
                enzymeCanvas.height = height;
                
                initComponents();
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // slider interactions
            function setupSliders() {
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
                
                // tunneling slider
                function updateTunnelingFromEvent(e) {
                    const rect = tunnelingSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    tunneling = val;
                    tunnelingDisplay.innerText = tunneling.toFixed(2);
                    tunnelingFill.style.width = (val * 100) + '%';
                    tunnelingHandle.style.left = (val * 100) + '%';
                }
                
                tunnelingHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateTunnelingFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                tunnelingSlider.addEventListener('click', (e) => {
                    updateTunnelingFromEvent(e);
                });
                
                // magnetic slider
                function updateMagneticFromEvent(e) {
                    const rect = magneticSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    magnetic = val;
                    magneticDisplay.innerText = magnetic.toFixed(2);
                    magneticFill.style.width = (val * 100) + '%';
                    magneticHandle.style.left = (val * 100) + '%';
                }
                
                magneticHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateMagneticFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                magneticSlider.addEventListener('click', (e) => {
                    updateMagneticFromEvent(e);
                });
            }
            setupSliders();

            // update simulation
            function updateSimulation() {
                let totalEnergy = 0;
                let totalSpin = 0;
                
                // update complexes
                for (let complex of complexes) {
                    let beat = complex.update(coherence, time);
                    totalEnergy += complex.energy;
                }
                
                // update magnetosomes
                for (let mag of magnetosomes) {
                    let spin = mag.update(magnetic, time);
                    totalSpin += spin;
                }
                
                // calculate efficiencies
                let photoEff = (totalEnergy / complexes.length) * (0.7 + 0.3 * coherence);
                let navEff = 0.5 + 0.5 * Math.abs(totalSpin / magnetosomes.length);
                
                efficiencySpan.innerText = Math.round(photoEff * 100) + '%';
                navigationSpan.innerText = Math.round(navEff * 100) + '%';
                efficiencyMeter.style.width = (photoEff * 100) + '%';
                
                // update effect description
                if (Math.floor(time * 2) % 40 === 0) {
                    let idx = Math.floor(Math.random() * effects.length);
                    effectDisplay.innerText = effects[idx];
                }
            }

            // draw photosynthetic complexes
            function drawChloroplast() {
                ctxChloro.clearRect(0, 0, width, height);
                
                // draw energy transfer network
                for (let i = 0; i < complexes.length; i++) {
                    for (let j = i + 1; j < complexes.length; j++) {
                        let c1 = complexes[i];
                        let c2 = complexes[j];
                        
                        let dx = c1.x - c2.x;
                        let dy = c1.y - c2.y;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        
                        if (dist < 0.2) {
                            let x1 = c1.x * width;
                            let y1 = c1.y * height;
                            let x2 = c2.x * width;
                            let y2 = c2.y * height;
                            
                            // quantum coherence enables long-range transfer
                            let alpha = coherence * (1 - dist) * 0.5;
                            
                            ctxChloro.beginPath();
                            ctxChloro.moveTo(x1, y1);
                            ctxChloro.lineTo(x2, y2);
                            ctxChloro.strokeStyle = `rgba(100, 255, 100, ${alpha})`;
                            ctxChloro.lineWidth = 1 + coherence * 2;
                            ctxChloro.shadowBlur = 10;
                            ctxChloro.shadowColor = '#6f6';
                            ctxChloro.stroke();
                        }
                    }
                }
                
                // draw complexes
                for (let complex of complexes) {
                    let x = complex.x * width;
                    let y = complex.y * height;
                    
                    // size based on energy
                    let size = 8 + complex.energy * 20;
                    
                    // quantum beating effect
                    let beat = Math.sin(time * 5 + complex.phase) * coherence * 5;
                    
                    ctxChloro.beginPath();
                    ctxChloro.arc(x, y, size + beat, 0, 2 * Math.PI);
                    
                    // color based on excitation
                    if (complex.excited) {
                        ctxChloro.fillStyle = `rgba(255, 255, 100, ${0.8})`;
                        ctxChloro.shadowColor = '#ff6';
                    } else {
                        let hue = 120 + complex.energy * 100;
                        ctxChloro.fillStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
                        ctxChloro.shadowColor = '#6f6';
                    }
                    
                    ctxChloro.shadowBlur = 20;
                    ctxChloro.fill();
                    
                    // inner glow for quantum coherence
                    if (coherence > 0.6) {
                        ctxChloro.beginPath();
                        ctxChloro.arc(x, y, size * 0.3, 0, 2 * Math.PI);
                        ctxChloro.fillStyle = '#ffffff80';
                        ctxChloro.shadowBlur = 30;
                        ctxChloro.fill();
                    }
                }
            }

            // draw magnetosomes
            function drawMagnetosomes() {
                ctxMagneto.clearRect(0, 0, width, height);
                
                // draw magnetic field lines
                for (let i = 0; i < 10; i++) {
                    let y = height * (i + 1) / 11;
                    
                    ctxMagneto.beginPath();
                    for (let x = 0; x < width; x += 20) {
                        let nx = x / width;
                        let field = Math.sin(nx * 10 + time) * magnetic * 50;
                        
                        if (x === 0) ctxMagneto.moveTo(x, y + field);
                        else ctxMagneto.lineTo(x, y + field);
                    }
                    ctxMagneto.strokeStyle = `rgba(100, 200, 255, ${0.1})`;
                    ctxMagneto.lineWidth = 1;
                    ctxMagneto.stroke();
                }
                
                // draw magnetosomes
                for (let mag of magnetosomes) {
                    let x = mag.x * width;
                    let y = mag.y * height;
                    
                    // spin visualization
                    let spinDir = mag.spin * 20;
                    
                    ctxMagneto.beginPath();
                    ctxMagneto.ellipse(x, y, 15, 8, mag.angle, 0, 2 * Math.PI);
                    ctxMagneto.fillStyle = `rgba(100, 150, 255, ${0.5 + Math.abs(mag.spin)*0.3})`;
                    ctxMagneto.shadowColor = '#8cf';
                    ctxMagneto.shadowBlur = 15;
                    ctxMagneto.fill();
                    
                    // spin arrow
                    ctxMagneto.beginPath();
                    ctxMagneto.moveTo(x, y);
                    ctxMagneto.lineTo(x + spinDir * Math.cos(mag.angle), 
                                     y + spinDir * Math.sin(mag.angle));
                    ctxMagneto.strokeStyle = '#fff';
                    ctxMagneto.lineWidth = 2;
                    ctxMagneto.stroke();
                }
            }

            // draw enzyme tunneling
            function drawEnzymeTunneling() {
                ctxEnzyme.clearRect(0, 0, width, height);
                
                // draw enzyme active sites
                for (let i = 0; i < 8; i++) {
                    let x = width * (0.3 + 0.4 * Math.sin(i + time));
                    let y = height * (0.3 + 0.4 * Math.cos(i * 2 + time));
                    
                    // enzyme protein
                    ctxEnzyme.beginPath();
                    ctxEnzyme.arc(x, y, 40, 0, 2 * Math.PI);
                    ctxEnzyme.fillStyle = `rgba(150, 100, 200, ${0.2})`;
                    ctxEnzyme.shadowColor = '#f6f';
                    ctxEnzyme.shadowBlur = 30;
                    ctxEnzyme.fill();
                    
                    // tunneling particle
                    if (Math.random() < tunneling) {
                        let tx = x + 30 * Math.sin(time * 3 + i);
                        let ty = y + 30 * Math.cos(time * 3 + i);
                        
                        ctxEnzyme.beginPath();
                        ctxEnzyme.arc(tx, ty, 8, 0, 2 * Math.PI);
                        ctxEnzyme.fillStyle = '#ff0';
                        ctxEnzyme.shadowColor = '#ff6';
                        ctxEnzyme.shadowBlur = 20;
                        ctxEnzyme.fill();
                        
                        // tunneling path
                        ctxEnzyme.beginPath();
                        ctxEnzyme.moveTo(x, y);
                        ctxEnzyme.lineTo(tx, ty);
                        ctxEnzyme.strokeStyle = '#ff080';
                        ctxEnzyme.lineWidth = 2;
                        ctxEnzyme.setLineDash([5, 5]);
                        ctxEnzyme.stroke();
                        ctxEnzyme.setLineDash([]);
                    }
                }
                
                // draw zero-point energy fluctuations
                for (let i = 0; i < 20; i++) {
                    let x = Math.random() * width;
                    let y = Math.random() * height;
                    
                    ctxEnzyme.beginPath();
                    ctxEnzyme.arc(x, y, 2 + Math.random() * 5, 0, 2 * Math.PI);
                    ctxEnzyme.fillStyle = `rgba(255, 255, 255, ${0.1})`;
                    ctxEnzyme.fill();
                }
            }

            // animation loop
            function animate() {
                time += 0.02;
                
                updateSimulation();
                drawChloroplast();
                drawMagnetosomes();
                drawEnzymeTunneling();
                
                requestAnimationFrame(animate);
            }
            animate();
        })();