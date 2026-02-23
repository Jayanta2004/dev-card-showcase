        (function() {
            // ---------- CONSCIOUSNESS FIELD SIMULATOR ----------
            // Models global neural correlates with integrated information theory
            
            const neuralCanvas = document.getElementById('neuralCanvas');
            const phiCanvas = document.getElementById('phiCanvas');
            const consciousnessCanvas = document.getElementById('consciousnessCanvas');
            
            const ctxNeural = neuralCanvas.getContext('2d');
            const ctxPhi = phiCanvas.getContext('2d');
            const ctxConsciousness = consciousnessCanvas.getContext('2d');

            let width, height;
            let time = 0;

            // consciousness parameters
            let integration = 0.6;    // integration strength (phi)
            let information = 0.45;    // information content
            let coherence = 0.7;       // quantum coherence
            
            // neural network
            const neurons = [];
            const NEURON_COUNT = 128;
            const connections = [];
            
            // phi field (integrated information)
            let phiField = new Float32Array(64 * 64);

            // quotes about consciousness
            const quotes = [
                "consciousness is integrated information",
                "the hard problem of consciousness",
                "neural correlates of consciousness",
                "global workspace theory",
                "quantum brain dynamics",
                "panpsychism vs emergence",
                "binding problem solution",
                "qualia as information geometry",
                "consciousness is fundamental",
                "the unity of experience"
            ];

            // UI elements
            const integrationDisplay = document.getElementById('integrationDisplay');
            const informationDisplay = document.getElementById('informationDisplay');
            const coherenceDisplay = document.getElementById('coherenceDisplay');
            const phiValue = document.getElementById('phiValue');
            const neuralSync = document.getElementById('neuralSync');
            const consciousnessMeter = document.getElementById('consciousnessMeter');
            const consciousnessQuote = document.getElementById('consciousnessQuote');
            
            // sliders
            const integrationSlider = document.getElementById('integrationSlider');
            const integrationHandle = document.getElementById('integrationHandle');
            const integrationFill = document.getElementById('integrationFill');
            
            const informationSlider = document.getElementById('informationSlider');
            const informationHandle = document.getElementById('informationHandle');
            const informationFill = document.getElementById('informationFill');
            
            const coherenceSlider = document.getElementById('coherenceSlider');
            const coherenceHandle = document.getElementById('coherenceHandle');
            const coherenceFill = document.getElementById('coherenceFill');

            // neuron class
            class Neuron {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.potential = Math.random();
                    this.phase = Math.random() * Math.PI * 2;
                    this.frequency = 0.5 + Math.random() * 2;
                    this.connected = [];
                }
                
                update(integration, coherence, time) {
                    // integrate inputs from connected neurons
                    let input = 0;
                    for (let conn of this.connected) {
                        let other = neurons[conn];
                        let dist = Math.hypot(this.x - other.x, this.y - other.y);
                        input += other.potential * Math.exp(-dist * 0.1) * integration;
                    }
                    
                    // intrinsic dynamics (quantum coherence)
                    let quantum = Math.sin(time * this.frequency + this.phase) * coherence;
                    
                    // update potential (nonlinear)
                    this.potential = 0.5 * Math.tanh(input + quantum) + 0.5;
                    
                    return this.potential;
                }
            }

            // initialize neural network
            function initNeurons() {
                neurons.length = 0;
                connections.length = 0;
                
                // create neurons in a grid with some randomness
                let cols = 12;
                let rows = 10;
                
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        let nx = (x + 0.5) / cols;
                        let ny = (y + 0.5) / rows;
                        
                        // add jitter
                        nx += (Math.random() - 0.5) * 0.1;
                        ny += (Math.random() - 0.5) * 0.1;
                        
                        neurons.push(new Neuron(nx, ny));
                    }
                }
                
                // create connections (small-world topology)
                for (let i = 0; i < neurons.length; i++) {
                    for (let j = i + 1; j < neurons.length; j++) {
                        let dx = neurons[i].x - neurons[j].x;
                        let dy = neurons[i].y - neurons[j].y;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        
                        // connect if close or random long-range
                        if (dist < 0.2 || Math.random() < 0.05) {
                            neurons[i].connected.push(j);
                            neurons[j].connected.push(i);
                            connections.push({ from: i, to: j, strength: Math.random() });
                        }
                    }
                }
            }

            // resize
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                neuralCanvas.width = width;
                neuralCanvas.height = height;
                phiCanvas.width = width;
                phiCanvas.height = height;
                consciousnessCanvas.width = width;
                consciousnessCanvas.height = height;
                
                initNeurons();
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // slider interactions
            function setupSliders() {
                // integration slider
                function updateIntegrationFromEvent(e) {
                    const rect = integrationSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    integration = val;
                    integrationDisplay.innerText = integration.toFixed(2);
                    integrationFill.style.width = (val * 100) + '%';
                    integrationHandle.style.left = (val * 100) + '%';
                }
                
                integrationHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateIntegrationFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                integrationSlider.addEventListener('click', (e) => {
                    updateIntegrationFromEvent(e);
                });
                
                // information slider
                function updateInformationFromEvent(e) {
                    const rect = informationSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    information = val;
                    informationDisplay.innerText = information.toFixed(2);
                    informationFill.style.width = (val * 100) + '%';
                    informationHandle.style.left = (val * 100) + '%';
                }
                
                informationHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateInformationFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                informationSlider.addEventListener('click', (e) => {
                    updateInformationFromEvent(e);
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

            // update neural network
            function updateNeuralNetwork() {
                let totalPotential = 0;
                let syncMeasure = 0;
                
                for (let neuron of neurons) {
                    let potential = neuron.update(integration, coherence, time);
                    totalPotential += potential;
                }
                
                // calculate synchronization (simplified)
                let meanPotential = totalPotential / neurons.length;
                for (let neuron of neurons) {
                    syncMeasure += Math.pow(neuron.potential - meanPotential, 2);
                }
                syncMeasure = 1 - Math.sqrt(syncMeasure / neurons.length);
                
                // update UI
                let phi = integration * information * coherence * (0.8 + 0.2 * Math.sin(time));
                phiValue.innerText = phi.toFixed(2);
                
                neuralSync.innerText = Math.round(syncMeasure * 100) + '%';
                consciousnessMeter.style.width = (phi * 100) + '%';
                
                // update quote occasionally
                if (Math.floor(time * 2) % 50 === 0) {
                    let quoteIdx = Math.floor(Math.random() * quotes.length);
                    consciousnessQuote.innerText = '"' + quotes[quoteIdx] + '"';
                }
            }

            // draw neural network
            function drawNeuralNetwork() {
                ctxNeural.clearRect(0, 0, width, height);
                
                // draw connections
                for (let conn of connections) {
                    let n1 = neurons[conn.from];
                    let n2 = neurons[conn.to];
                    
                    let x1 = n1.x * width;
                    let y1 = n1.y * height;
                    let x2 = n2.x * width;
                    let y2 = n2.y * height;
                    
                    let alpha = conn.strength * integration * 0.3;
                    
                    ctxNeural.beginPath();
                    ctxNeural.moveTo(x1, y1);
                    ctxNeural.lineTo(x2, y2);
                    ctxNeural.strokeStyle = `rgba(200, 130, 255, ${alpha})`;
                    ctxNeural.lineWidth = 1;
                    ctxNeural.stroke();
                }
                
                // draw neurons
                for (let neuron of neurons) {
                    let x = neuron.x * width;
                    let y = neuron.y * height;
                    
                    // size based on potential
                    let size = 5 + neuron.potential * 15;
                    
                    // color based on phase and coherence
                    let hue = (neuron.phase * 180 / Math.PI + time * 20) % 360;
                    let brightness = 50 + neuron.potential * 50;
                    
                    ctxNeural.beginPath();
                    ctxNeural.arc(x, y, size, 0, 2 * Math.PI);
                    ctxNeural.fillStyle = `hsla(${hue}, 80%, ${brightness}%, 0.8)`;
                    ctxNeural.shadowColor = `hsl(${hue}, 90%, 70%)`;
                    ctxNeural.shadowBlur = 20;
                    ctxNeural.fill();
                    
                    // inner glow for high coherence
                    if (coherence > 0.6) {
                        ctxNeural.beginPath();
                        ctxNeural.arc(x, y, size * 0.3, 0, 2 * Math.PI);
                        ctxNeural.fillStyle = 'white';
                        ctxNeural.shadowBlur = 30;
                        ctxNeural.fill();
                    }
                }
            }

            // draw phi field (integrated information)
            function drawPhiField() {
                ctxPhi.clearRect(0, 0, width, height);
                
                let res = 64;
                let cellW = width / res;
                let cellH = height / res;
                
                // compute phi field
                for (let y = 0; y < res; y++) {
                    for (let x = 0; x < res; x++) {
                        let nx = x / res;
                        let ny = y / res;
                        
                        // distance to nearest neurons
                        let field = 0;
                        for (let neuron of neurons) {
                            let dx = nx - neuron.x;
                            let dy = ny - neuron.y;
                            let dist = Math.sqrt(dx*dx + dy*dy);
                            field += neuron.potential * Math.exp(-dist * 5) * integration;
                        }
                        
                        // add quantum coherence effects
                        field += coherence * Math.sin(nx * 20 + time) * Math.cos(ny * 20 + time) * 0.2;
                        
                        phiField[y * res + x] = field;
                    }
                }
                
                // draw phi field
                let imageData = ctxPhi.createImageData(res, res);
                for (let y = 0; y < res; y++) {
                    for (let x = 0; x < res; x++) {
                        let val = phiField[y * res + x];
                        let idx = (y * res + x) * 4;
                        
                        // colormap: purple to gold
                        imageData.data[idx] = 150 + 105 * val;     // R
                        imageData.data[idx+1] = 50 + 150 * val;    // G
                        imageData.data[idx+2] = 200 + 55 * val;    // B
                        imageData.data[idx+3] = 200;               // A
                    }
                }
                
                // scale up to canvas
                ctxPhi.putImageData(imageData, 0, 0, 0, 0, width, height);
            }

            // draw consciousness field
            function drawConsciousness() {
                ctxConsciousness.clearRect(0, 0, width, height);
                
                // draw global workspace
                let centerX = width/2;
                let centerY = height/2;
                
                // draw binding waves
                for (let i = 0; i < 5; i++) {
                    let radius = 100 + i * 80 + 30 * Math.sin(time * 2 + i);
                    let alpha = 0.1 * (5 - i) * integration;
                    
                    ctxConsciousness.beginPath();
                    ctxConsciousness.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctxConsciousness.strokeStyle = `rgba(200, 100, 255, ${alpha})`;
                    ctxConsciousness.lineWidth = 2;
                    ctxConsciousness.stroke();
                }
                
                // draw information integration lines
                for (let i = 0; i < 20; i++) {
                    let angle = (i / 20) * Math.PI * 2 + time;
                    let x1 = centerX + 150 * Math.cos(angle);
                    let y1 = centerY + 150 * Math.sin(angle);
                    let x2 = centerX + 150 * Math.cos(angle + Math.PI);
                    let y2 = centerY + 150 * Math.sin(angle + Math.PI);
                    
                    ctxConsciousness.beginPath();
                    ctxConsciousness.moveTo(x1, y1);
                    ctxConsciousness.lineTo(x2, y2);
                    ctxConsciousness.strokeStyle = `rgba(255, 150, 200, ${0.1 * information})`;
                    ctxConsciousness.stroke();
                }
                
                // draw qualia bubbles
                for (let i = 0; i < 8; i++) {
                    let angle = (i / 8) * Math.PI * 2 + time * 0.5;
                    let x = centerX + 200 * Math.cos(angle);
                    let y = centerY + 200 * Math.sin(angle);
                    
                    ctxConsciousness.beginPath();
                    ctxConsciousness.arc(x, y, 30 + 10 * Math.sin(time*3 + i), 0, 2*Math.PI);
                    ctxConsciousness.fillStyle = `rgba(180, 100, 255, ${0.1})`;
                    ctxConsciousness.shadowBlur = 40;
                    ctxConsciousness.shadowColor = '#f6f';
                    ctxConsciousness.fill();
                }
            }

            // animation loop
            function animate() {
                time += 0.02;
                
                updateNeuralNetwork();
                drawNeuralNetwork();
                drawPhiField();
                drawConsciousness();
                
                requestAnimationFrame(animate);
            }
            animate();
        })();