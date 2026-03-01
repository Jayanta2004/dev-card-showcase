        (function() {
            // ---------- COSMIC STRING THEORY ----------
            // Simulates vibrating strings in 11-dimensional spacetime
            
            const stringCanvas = document.getElementById('stringCanvas');
            const calabiCanvas = document.getElementById('calabiYauCanvas');
            const dimCanvas = document.getElementById('dimensionCanvas');
            
            const ctxString = stringCanvas.getContext('2d');
            const ctxCalabi = calabiCanvas.getContext('2d');
            const ctxDim = dimCanvas.getContext('2d');

            let width, height;
            let time = 0;

            // string parameters
            let tension = 0.5;      // 0-1
            let harmonic = 3;        // 1-10
            let dimensions = 11;      // 10,11,26
            
            // strings array
            const strings = [];
            const STRING_COUNT = 24;

            // particle types based on vibration modes
            const particles = [
                '⚛️ GRAVITON', '⚛️ PHOTON', '⚛️ GLUON', '⚛️ W-BOSON', 
                '⚛️ Z-BOSON', '⚛️ HIGGS', '⚛️ ELECTRON', '⚛️ QUARK',
                '⚛️ NEUTRINO', '⚛️ TACHYON'
            ];

            // UI elements
            const tensionDisplay = document.getElementById('tensionDisplay');
            const harmonicDisplay = document.getElementById('harmonicDisplay');
            const dimensionDisplay = document.getElementById('dimensionDisplay');
            const compactDim = document.getElementById('compactDim');
            const vibrationMode = document.getElementById('vibrationMode');
            const particleType = document.getElementById('particleType');
            
            // sliders
            const tensionSlider = document.getElementById('tensionSlider');
            const tensionHandle = document.getElementById('tensionHandle');
            const tensionFill = document.getElementById('tensionFill');
            
            const harmonicSlider = document.getElementById('harmonicSlider');
            const harmonicHandle = document.getElementById('harmonicHandle');
            const harmonicFill = document.getElementById('harmonicFill');
            
            const dimensionSlider = document.getElementById('dimensionSlider');
            const dimensionHandle = document.getElementById('dimensionHandle');
            const dimensionFill = document.getElementById('dimensionFill');

            // string class
            class CosmicString {
                constructor() {
                    this.points = [];
                    this.numPoints = 100;
                    this.phase = Math.random() * Math.PI * 2;
                    
                    for (let i = 0; i < this.numPoints; i++) {
                        this.points.push({
                            x: 0,
                            y: 0,
                            z: 0
                        });
                    }
                }
                
                update(tension, harmonic, time) {
                    let length = 300;
                    let tensionFactor = tension * 2;
                    
                    for (let i = 0; i < this.numPoints; i++) {
                        let t = i / (this.numPoints - 1);
                        
                        // base position along string
                        let x = (t - 0.5) * length;
                        
                        // vibration modes (standing waves)
                        let y = 0;
                        let z = 0;
                        
                        // fundamental and overtones
                        for (let h = 1; h <= harmonic; h++) {
                            let amplitude = (1 / h) * tensionFactor * 50;
                            let freq = h * 2 * Math.PI;
                            
                            y += amplitude * Math.sin(freq * t + time * (h + 1) + this.phase);
                            z += amplitude * Math.cos(freq * t + time * (h + 2) + this.phase);
                        }
                        
                        // extra dimensions (compactified)
                        let compactDimCount = dimensions - 4; // 4 large dimensions (x,y,z,t)
                        for (let d = 0; d < Math.min(6, compactDimCount); d++) {
                            let compactAmp = 10 * Math.sin(t * Math.PI * (d+1) + time * (d+3) + this.phase);
                            y += compactAmp * 0.1;
                            z += compactAmp * 0.1;
                        }
                        
                        this.points[i].x = x;
                        this.points[i].y = y;
                        this.points[i].z = z;
                    }
                }
                
                draw(ctx, time) {
                    ctx.beginPath();
                    
                    for (let i = 0; i < this.points.length; i++) {
                        let p = this.points[i];
                        
                        // 3D projection
                        let perspective = 600;
                        let scale = perspective / (perspective + p.z + 200);
                        let screenX = width/2 + p.x * scale;
                        let screenY = height/2 + p.y * scale;
                        
                        if (i === 0) ctx.moveTo(screenX, screenY);
                        else ctx.lineTo(screenX, screenY);
                    }
                    
                    // color based on tension and harmonic
                    let hue = (harmonic * 30 + time * 20) % 360;
                    ctx.strokeStyle = `hsl(${hue}, 80%, 70%)`;
                    ctx.lineWidth = 2 + tension * 3;
                    ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
                    ctx.shadowBlur = 20;
                    ctx.stroke();
                }
            }

            // resize
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                stringCanvas.width = width;
                stringCanvas.height = height;
                calabiCanvas.width = width;
                calabiCanvas.height = height;
                dimCanvas.width = width;
                dimCanvas.height = height;
                
                initStrings();
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // initialize strings
            function initStrings() {
                strings.length = 0;
                for (let i = 0; i < STRING_COUNT; i++) {
                    strings.push(new CosmicString());
                }
            }

            // slider interactions
            function setupSliders() {
                // tension slider
                function updateTensionFromEvent(e) {
                    const rect = tensionSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    tension = val;
                    tensionDisplay.innerText = tension.toFixed(2);
                    tensionFill.style.width = (val * 100) + '%';
                    tensionHandle.style.left = (val * 100) + '%';
                }
                
                tensionHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateTensionFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                tensionSlider.addEventListener('click', (e) => {
                    updateTensionFromEvent(e);
                });
                
                // harmonic slider
                function updateHarmonicFromEvent(e) {
                    const rect = harmonicSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    harmonic = Math.floor(1 + val * 9); // 1-10
                    harmonicDisplay.innerText = harmonic;
                    harmonicFill.style.width = (val * 100) + '%';
                    harmonicHandle.style.left = (val * 100) + '%';
                    
                    vibrationMode.innerText = harmonic;
                    particleType.innerText = particles[(harmonic - 1) % particles.length];
                }
                
                harmonicHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateHarmonicFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                harmonicSlider.addEventListener('click', (e) => {
                    updateHarmonicFromEvent(e);
                });
                
                // dimension slider
                function updateDimensionFromEvent(e) {
                    const rect = dimensionSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    dimensions = Math.floor(10 + val * 16); // 10-26
                    dimensionDisplay.innerText = dimensions;
                    dimensionFill.style.width = (val * 100) + '%';
                    dimensionHandle.style.left = (val * 100) + '%';
                    
                    compactDim.innerText = dimensions - 4;
                }
                
                dimensionHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateDimensionFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                dimensionSlider.addEventListener('click', (e) => {
                    updateDimensionFromEvent(e);
                });
            }
            setupSliders();

            // draw Calabi-Yau manifold (compactified dimensions)
            function drawCalabiYau() {
                ctxCalabi.clearRect(0, 0, width, height);
                
                let compact = dimensions - 4;
                if (compact <= 0) return;
                
                // draw torus-like shapes
                for (let d = 0; d < Math.min(6, compact); d++) {
                    let radius = 100 + d * 30;
                    let speed = 0.5 + d * 0.2;
                    
                    ctxCalabi.beginPath();
                    
                    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                        let x = width/2 + radius * Math.cos(angle + time * speed);
                        let y = height/2 + radius * Math.sin(angle * 2 + time * speed) * 0.5;
                        
                        if (angle === 0) ctxCalabi.moveTo(x, y);
                        else ctxCalabi.lineTo(x, y);
                    }
                    
                    ctxCalabi.closePath();
                    ctxCalabi.strokeStyle = `rgba(200, 100, 255, ${0.1 + d*0.05})`;
                    ctxCalabi.lineWidth = 1;
                    ctxCalabi.stroke();
                }
                
                // draw Calabi-Yau "folds"
                for (let i = 0; i < 20; i++) {
                    let x = width/2 + 150 * Math.sin(i + time);
                    let y = height/2 + 150 * Math.cos(i*2 + time);
                    
                    ctxCalabi.beginPath();
                    ctxCalabi.arc(x, y, 30, 0, 2*Math.PI);
                    ctxCalabi.fillStyle = `rgba(255, 100, 200, ${0.05})`;
                    ctxCalabi.fill();
                }
            }

            // draw dimensional fabric
            function drawDimensions() {
                ctxDim.clearRect(0, 0, width, height);
                
                // draw spacetime grid
                let gridSize = 50;
                let dimFactor = dimensions / 11;
                
                ctxDim.strokeStyle = '#a07eff20';
                ctxDim.lineWidth = 1;
                
                for (let i = 0; i < width; i += gridSize) {
                    ctxDim.beginPath();
                    ctxDim.moveTo(i, 0);
                    ctxDim.lineTo(i + Math.sin(time) * 20 * dimFactor, height);
                    ctxDim.stroke();
                }
                
                for (let i = 0; i < height; i += gridSize) {
                    ctxDim.beginPath();
                    ctxDim.moveTo(0, i);
                    ctxDim.lineTo(width, i + Math.cos(time) * 20 * dimFactor);
                    ctxDim.stroke();
                }
                
                // draw extra dimensions as "curled up" circles
                for (let d = 0; d < dimensions - 4; d++) {
                    let angle = d * (Math.PI * 2 / (dimensions - 4));
                    let x = width/2 + 200 * Math.cos(angle + time);
                    let y = height/2 + 200 * Math.sin(angle + time);
                    
                    ctxDim.beginPath();
                    ctxDim.arc(x, y, 20 + 10 * Math.sin(time*2 + d), 0, 2*Math.PI);
                    ctxDim.strokeStyle = `rgba(255, 100, 255, ${0.3})`;
                    ctxDim.lineWidth = 2;
                    ctxDim.stroke();
                }
            }

            // update strings
            function updateStrings() {
                for (let string of strings) {
                    string.update(tension, harmonic, time);
                }
            }

            // draw strings
            function drawStrings() {
                ctxString.clearRect(0, 0, width, height);
                
                // draw strings
                for (let string of strings) {
                    string.draw(ctxString, time);
                }
                
                // draw string interaction points
                for (let i = 0; i < strings.length; i+=2) {
                    if (i+1 >= strings.length) continue;
                    
                    let s1 = strings[i];
                    let s2 = strings[i+1];
                    
                    if (s1.points.length && s2.points.length) {
                        let p1 = s1.points[Math.floor(Math.random() * s1.points.length)];
                        let p2 = s2.points[Math.floor(Math.random() * s2.points.length)];
                        
                        // projection
                        let perspective = 600;
                        let scale1 = perspective / (perspective + p1.z + 200);
                        let x1 = width/2 + p1.x * scale1;
                        let y1 = height/2 + p1.y * scale1;
                        
                        let scale2 = perspective / (perspective + p2.z + 200);
                        let x2 = width/2 + p2.x * scale2;
                        let y2 = height/2 + p2.y * scale2;
                        
                        // draw interaction (gauge boson exchange)
                        ctxString.beginPath();
                        ctxString.moveTo(x1, y1);
                        ctxString.lineTo(x2, y2);
                        ctxString.strokeStyle = `rgba(255, 255, 255, ${0.1})`;
                        ctxString.lineWidth = 1;
                        ctxString.stroke();
                        
                        // interaction particle
                        ctxString.beginPath();
                        ctxString.arc((x1+x2)/2, (y1+y2)/2, 5, 0, 2*Math.PI);
                        ctxString.fillStyle = '#ffffff40';
                        ctxString.shadowBlur = 20;
                        ctxString.fill();
                    }
                }
            }

            // animation loop
            function animate() {
                time += 0.02;
                
                updateStrings();
                drawStrings();
                drawCalabiYau();
                drawDimensions();
                
                requestAnimationFrame(animate);
            }
            animate();

            // initial updates
            updateStrings();
        })();