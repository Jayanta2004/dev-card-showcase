        (function() {
            // ---------- HOLOGRAPHIC MEMORY PALACE ----------
            // 3D spatial memory architecture with neural patterns
            
            const hologramCanvas = document.getElementById('hologramCanvas');
            const neuralCanvas = document.getElementById('neuralCanvas');
            const interfaceCanvas = document.getElementById('interfaceCanvas');
            
            const ctxHolo = hologramCanvas.getContext('2d');
            const ctxNeural = neuralCanvas.getContext('2d');
            const ctxInterface = interfaceCanvas.getContext('2d');

            let width, height;
            let time = 0;

            // memory parameters
            let memoryDepth = 0.5; // 0-1
            let thetaWave = 0.5;
            let gammaWave = 0.7;
            
            // 3D memory nodes
            const memoryNodes = [];
            const NODE_COUNT = 64;
            
            // neural connections
            const connections = [];

            // UI elements
            const thetaVal = document.getElementById('thetaVal');
            const gammaVal = document.getElementById('gammaVal');
            const depthDisplay = document.getElementById('depthDisplay');
            const depthProgress = document.getElementById('depthProgress');
            const depthHandle = document.getElementById('depthHandle');
            const synapseSpan = document.getElementById('synapseCount');
            const recallSpan = document.getElementById('recallRate');
            const thoughtBubble = document.getElementById('thoughtBubble');

            // thoughts
            const thoughts = [
                "encoding memory trace...",
                "retrieving episodic buffer",
                "consolidating theta rhythm",
                "hippocampal replay",
                "cortical integration",
                "memory reconsolidation",
                "pattern separation",
                "contextual binding"
            ];

            // slider interaction
            const slider = document.getElementById('depthSlider');
            const handle = document.getElementById('depthHandle');

            function updateDepthFromEvent(e) {
                const rect = slider.getBoundingClientRect();
                let x = e.clientX - rect.left;
                x = Math.max(0, Math.min(rect.width, x));
                let val = x / rect.width;
                memoryDepth = val;
                depthDisplay.innerText = val.toFixed(2);
                depthProgress.style.width = (val * 100) + '%';
                handle.style.left = (val * 100) + '%';
                
                // update theta/gamma based on depth
                thetaWave = 0.3 + val * 0.5;
                gammaWave = 0.5 + val * 0.4;
                thetaVal.innerText = thetaWave.toFixed(2);
                gammaVal.innerText = gammaWave.toFixed(2);
            }

            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const onMove = (e) => updateDepthFromEvent(e);
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });

            slider.addEventListener('click', (e) => {
                updateDepthFromEvent(e);
            });

            // resize
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                hologramCanvas.width = width;
                hologramCanvas.height = height;
                neuralCanvas.width = width;
                neuralCanvas.height = height;
                interfaceCanvas.width = width;
                interfaceCanvas.height = height;
                
                initMemoryNodes();
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // initialize 3D memory nodes
            function initMemoryNodes() {
                memoryNodes.length = 0;
                connections.length = 0;
                
                // create nodes in a spherical arrangement
                for (let i = 0; i < NODE_COUNT; i++) {
                    // spherical coordinates
                    let phi = Math.acos(2 * Math.random() - 1);
                    let theta = 2 * Math.PI * Math.random();
                    
                    let radius = 150 + Math.random() * 100;
                    
                    let x = radius * Math.sin(phi) * Math.cos(theta);
                    let y = radius * Math.sin(phi) * Math.sin(theta);
                    let z = radius * Math.cos(phi);
                    
                    memoryNodes.push({
                        x, y, z,
                        baseX: x, baseY: y, baseZ: z,
                        phase: Math.random() * Math.PI * 2,
                        type: Math.floor(Math.random() * 3), // 0:sensory, 1:episodic, 2:semantic
                        strength: 0.3 + Math.random() * 0.7,
                        connections: []
                    });
                }
                
                // create connections (small-world)
                for (let i = 0; i < NODE_COUNT; i++) {
                    let connectCount = 3 + Math.floor(Math.random() * 5);
                    for (let j = 0; j < connectCount; j++) {
                        let target = Math.floor(Math.random() * NODE_COUNT);
                        if (target !== i) {
                            connections.push({
                                from: i,
                                to: target,
                                weight: Math.random(),
                                active: true
                            });
                        }
                    }
                }
                
                // update synapse count
                synapseSpan.innerText = connections.length + 'k';
            }

            // project 3D to 2D
            function project3D(x, y, z) {
                let perspective = 600;
                let factor = perspective / (perspective + z + 300);
                let screenX = width/2 + x * factor;
                let screenY = height/2 + y * factor;
                return { x: screenX, y: screenY, factor };
            }

            // update memory nodes with wave dynamics
            function updateNodes() {
                for (let node of memoryNodes) {
                    // theta wave modulation
                    let thetaMod = Math.sin(time * 2 + node.phase) * thetaWave * 20;
                    // gamma modulation
                    let gammaMod = Math.cos(time * 8 + node.phase) * gammaWave * 10;
                    
                    node.x = node.baseX + thetaMod + gammaMod;
                    node.y = node.baseY + Math.sin(time * 3 + node.phase) * 15 * gammaWave;
                    node.z = node.baseZ + Math.cos(time * 2.5 + node.phase) * 20 * thetaWave;
                    
                    // memory depth affects stability
                    if (memoryDepth > 0.7) {
                        node.x += Math.sin(time * 5) * 5;
                    }
                }
            }

            // draw holographic memory palace
            function drawHologram() {
                ctxHolo.clearRect(0, 0, width, height);
                
                // draw connections first
                ctxHolo.beginPath();
                ctxHolo.strokeStyle = '#b07eff30';
                ctxHolo.lineWidth = 1;
                
                for (let conn of connections) {
                    let from = memoryNodes[conn.from];
                    let to = memoryNodes[conn.to];
                    if (!from || !to) continue;
                    
                    let p1 = project3D(from.x, from.y, from.z);
                    let p2 = project3D(to.x, to.y, to.z);
                    
                    // depth-based opacity
                    let depth1 = Math.max(0, 1 - Math.abs(from.z) / 500);
                    let depth2 = Math.max(0, 1 - Math.abs(to.z) / 500);
                    let alpha = (depth1 + depth2) * 0.3 * conn.weight;
                    
                    ctxHolo.beginPath();
                    ctxHolo.moveTo(p1.x, p1.y);
                    ctxHolo.lineTo(p2.x, p2.y);
                    ctxHolo.strokeStyle = `rgba(170, 100, 255, ${alpha})`;
                    ctxHolo.shadowColor = '#c08eff';
                    ctxHolo.shadowBlur = 10 * conn.weight;
                    ctxHolo.stroke();
                }
                
                // draw nodes
                for (let node of memoryNodes) {
                    let p = project3D(node.x, node.y, node.z);
                    
                    // size based on depth and strength
                    let size = 5 + node.strength * 10;
                    size *= p.factor;
                    
                    // color by type
                    let hue;
                    if (node.type === 0) hue = 20; // sensory - orange
                    else if (node.type === 1) hue = 280; // episodic - purple
                    else hue = 190; // semantic - cyan
                    
                    // add gamma flicker
                    let brightness = 60 + 20 * Math.sin(time * 8 + node.phase) * gammaWave;
                    
                    ctxHolo.beginPath();
                    ctxHolo.arc(p.x, p.y, size, 0, 2 * Math.PI);
                    ctxHolo.fillStyle = `hsla(${hue}, 80%, ${brightness}%, 0.8)`;
                    ctxHolo.shadowColor = `hsl(${hue}, 90%, 70%)`;
                    ctxHolo.shadowBlur = 20;
                    ctxHolo.fill();
                    
                    // inner glow
                    ctxHolo.beginPath();
                    ctxHolo.arc(p.x, p.y, size * 0.4, 0, 2 * Math.PI);
                    ctxHolo.fillStyle = 'white';
                    ctxHolo.shadowBlur = 30;
                    ctxHolo.fill();
                }
                
                // draw central hub (hippocampus)
                let center = project3D(0, 0, 0);
                ctxHolo.beginPath();
                ctxHolo.arc(center.x, center.y, 40 + 10 * Math.sin(time), 0, 2 * Math.PI);
                ctxHolo.strokeStyle = '#ffaaff80';
                ctxHolo.lineWidth = 4;
                ctxHolo.shadowBlur = 50;
                ctxHolo.shadowColor = '#ffaaff';
                ctxHolo.stroke();
            }

            // draw neural activity patterns
            function drawNeural() {
                ctxNeural.clearRect(0, 0, width, height);
                
                // EEG-like waveforms
                ctxNeural.beginPath();
                ctxNeural.strokeStyle = '#b07eff40';
                ctxNeural.lineWidth = 2;
                
                for (let i = 0; i < 5; i++) {
                    let offset = i * 50;
                    ctxNeural.beginPath();
                    for (let x = 0; x < width; x += 20) {
                        let t = x / width;
                        let y = height/2 + offset + 
                               Math.sin(x * 0.01 + time * 3) * 20 * thetaWave +
                               Math.cos(x * 0.03 + time * 8) * 15 * gammaWave +
                               Math.sin(x * 0.05 + time) * 10;
                        
                        if (x === 0) ctxNeural.moveTo(x, y);
                        else ctxNeural.lineTo(x, y);
                    }
                    ctxNeural.strokeStyle = `rgba(180, 130, 255, ${0.2 + i*0.05})`;
                    ctxNeural.stroke();
                }
                
                // gamma bursts
                for (let i = 0; i < 20; i++) {
                    let x = Math.random() * width;
                    let y = Math.random() * height;
                    let r = Math.random() * 30 * gammaWave;
                    
                    ctxNeural.beginPath();
                    ctxNeural.arc(x, y, r, 0, 2*Math.PI);
                    ctxNeural.fillStyle = `rgba(255, 100, 200, ${0.1 * gammaWave})`;
                    ctxNeural.shadowBlur = 30;
                    ctxNeural.shadowColor = '#f6f';
                    ctxNeural.fill();
                }
            }

            // update interface and stats
            function drawInterface() {
                ctxInterface.clearRect(0, 0, width, height);
                
                // compute recall rate (simulated)
                let recall = 70 + 20 * memoryDepth + 5 * Math.sin(time);
                recallSpan.innerText = Math.round(recall) + '%';
                
                // update thought every few seconds
                if (Math.floor(time * 2) % 30 === 0) {
                    let thought = thoughts[Math.floor(Math.random() * thoughts.length)];
                    thoughtBubble.innerText = '"' + thought + '"';
                }
                
                // draw memory palace floor grid
                ctxInterface.strokeStyle = '#b07eff20';
                ctxInterface.lineWidth = 1;
                
                for (let i = -5; i <= 5; i++) {
                    let x = width/2 + i * 100;
                    ctxInterface.beginPath();
                    ctxInterface.moveTo(x, height/2 + 100);
                    ctxInterface.lineTo(x + 200, height/2 + 200);
                    ctxInterface.stroke();
                }
                
                // memory depth rings
                ctxInterface.beginPath();
                for (let r = 1; r <= 3; r++) {
                    ctxInterface.arc(width/2, height/2, 100 * r * memoryDepth, 0, 2*Math.PI);
                    ctxInterface.strokeStyle = `rgba(200, 100, 255, ${0.1 * r})`;
                    ctxInterface.stroke();
                }
            }

            // animation loop
            function animate() {
                time += 0.02;
                
                updateNodes();
                drawHologram();
                drawNeural();
                drawInterface();
                
                requestAnimationFrame(animate);
            }
            animate();
        })();