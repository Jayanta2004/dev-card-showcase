        (function() {
            // ---------- NEURAL CANVAS ----------
            // Simulates a convolutional neural network's response to your drawing
            // with multi-layer feedback, gradient ascent style visualization
            
            const drawCanvas = document.getElementById('drawCanvas');
            const perceptionCanvas = document.getElementById('perceptionCanvas');
            const backCanvas = document.getElementById('backCanvas');
            
            const ctxDraw = drawCanvas.getContext('2d');
            const ctxPercept = perceptionCanvas.getContext('2d');
            const ctxBack = backCanvas.getContext('2d');

            const container = document.querySelector('.neural-studio');
            let width, height;

            // drawing state
            let isDrawing = false;
            let lastX = 0, lastY = 0;
            let brushSize = 18;
            let brushMode = 'draw'; // 'draw' or 'erase'

            // neural parameters
            let dreamDepth = 0.5; // from slider
            let time = 0;

            // UI elements
            const layerSpan = document.getElementById('layerIdx');
            const mapSpan = document.getElementById('mapCount');
            const actSpan = document.getElementById('actValue');
            const depthRange = document.getElementById('depthRange');
            const drawBtn = document.getElementById('drawBtn');
            const eraseBtn = document.getElementById('eraseBtn');
            const clearBtn = document.getElementById('clearBtn');

            // layers for display
            const layerNames = ['conv1_edge', 'conv2_texture', 'conv3_shape', 'conv4_object', 'fc_dream'];
            let layerCounter = 0;

            setInterval(() => {
                layerCounter = (layerCounter + 1) % layerNames.length;
                layerSpan.innerText = layerNames[layerCounter];
            }, 1800);

            // resize
            function resizeCanvases() {
                width = container.clientWidth;
                height = container.clientHeight;
                drawCanvas.width = width;
                drawCanvas.height = height;
                perceptionCanvas.width = width;
                perceptionCanvas.height = height;
                backCanvas.width = width;
                backCanvas.height = height;

                // fill back with subtle gradient
                let grad = ctxBack.createLinearGradient(0, 0, width*0.8, height);
                grad.addColorStop(0, '#140b2b');
                grad.addColorStop(0.7, '#020214');
                ctxBack.fillStyle = grad;
                ctxBack.fillRect(0, 0, width, height);

                // add some noise spots
                for (let i=0; i<40; i++) {
                    ctxBack.fillStyle = `rgba(100,30,200,${Math.random()*0.1})`;
                    ctxBack.beginPath();
                    ctxBack.arc(Math.random()*width, Math.random()*height, 30+Math.random()*80, 0, 2*Math.PI);
                    ctxBack.fill();
                }
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // drawing events
            drawCanvas.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isDrawing = true;
                const rect = drawCanvas.getBoundingClientRect();
                lastX = e.clientX - rect.left;
                lastY = e.clientY - rect.top;
            });

            drawCanvas.addEventListener('mousemove', (e) => {
                if (!isDrawing) return;
                e.preventDefault();
                const rect = drawCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                ctxDraw.lineWidth = brushSize;
                ctxDraw.lineCap = 'round';
                ctxDraw.lineJoin = 'round';

                if (brushMode === 'draw') {
                    ctxDraw.strokeStyle = 'white';
                    ctxDraw.shadowColor = '#aaf';
                    ctxDraw.shadowBlur = 25;
                } else {
                    ctxDraw.strokeStyle = '#030211'; // erase to background color (dark)
                    ctxDraw.shadowBlur = 0;
                }

                ctxDraw.beginPath();
                ctxDraw.moveTo(lastX, lastY);
                ctxDraw.lineTo(x, y);
                ctxDraw.stroke();

                lastX = x;
                lastY = y;
            });

            drawCanvas.addEventListener('mouseup', () => isDrawing = false);
            drawCanvas.addEventListener('mouseleave', () => isDrawing = false);

            // tool buttons
            drawBtn.addEventListener('click', () => {
                brushMode = 'draw';
                drawBtn.classList.add('active');
                eraseBtn.classList.remove('active');
            });
            eraseBtn.addEventListener('click', () => {
                brushMode = 'erase';
                eraseBtn.classList.add('active');
                drawBtn.classList.remove('active');
            });
            clearBtn.addEventListener('click', () => {
                ctxDraw.clearRect(0, 0, width, height);
                // fill with transparent (background shows through)
            });

            // depth slider
            depthRange.addEventListener('input', (e) => {
                dreamDepth = parseFloat(e.target.value);
            });

            // ---------- NEURAL PERCEPTION LAYER (simulated CNN) ----------
            function computeActivation() {
                // get image data from draw canvas
                const imageData = ctxDraw.getImageData(0, 0, width, height);
                const data = imageData.data;

                // we will generate a "feature map" based on local patterns
                // using simple convolutions: edge, blob, texture responses
                // and blend with dreamDepth + time

                const w = width, h = height;
                const outData = ctxPercept.createImageData(w, h);
                const out = outData.data;

                // downsampled perception (for performance we use a stride, but here we compute per pixel)
                for (let y = 0; y < h; y+=2) { // step 2 for speed (still high-res enough)
                    for (let x = 0; x < w; x+=2) {
                        let i = (y * w + x) * 4;
                        let r = data[i] / 255;     // 0..1 white from drawing

                        // spatial patterns: detect neighbors (simple gradient)
                        let gx = 0, gy = 0;
                        if (x > 0 && x < w-1 && y > 0 && y < h-1) {
                            let left = data[i - 4] / 255;
                            let right = data[i + 4] / 255;
                            let up = data[i - w*4] / 255;
                            let down = data[i + w*4] / 255;
                            gx = Math.abs(right - left);
                            gy = Math.abs(down - up);
                        }

                        // simulate different feature channels
                        let edgeResp = Math.min(1, (gx + gy) * 1.5);
                        let blobResp = Math.min(1, r * 1.2 * (0.8 + 0.4 * Math.sin(x * 0.01 + time)));
                        let textureResp = Math.sin(x * 0.1 + y * 0.07 + time * 4) * 0.5 + 0.5;
                        textureResp *= r;

                        // combine based on dreamDepth
                        let act = (edgeResp * 0.4 + blobResp * 0.5 + textureResp * 0.3) * (0.6 + 0.5 * dreamDepth);
                        act = Math.min(1, act + 0.1 * Math.sin(time * 3 + y * 0.05));

                        // also feedback from previous activation (temporal)
                        let prev = out[i] / 255 || 0;
                        act = act * 0.7 + prev * 0.3;

                        // colorize based on "layer"
                        let hue = (layerCounter * 70 + time * 20 + x * 0.1) % 360;
                        let sat = 70 + 30 * Math.sin(x * 0.02 + time);
                        let light = 40 + 50 * act;

                        // convert HSL to RGB (simplified for performance, but we use direct)
                        // better: use rgba with HSL via css? but we want pixel control. we'll use a simple color map
                        let rgb = hslToRgb(hue/360, sat/100, light/100);
                        
                        for (let dy = 0; dy < 2; dy++) {
                            for (let dx = 0; dx < 2; dx++) {
                                if (x+dx < w && y+dy < h) {
                                    let idx = ((y+dy) * w + (x+dx)) * 4;
                                    out[idx] = rgb[0] * 255;
                                    out[idx+1] = rgb[1] * 255;
                                    out[idx+2] = rgb[2] * 255;
                                    out[idx+3] = 255; // opaque
                                }
                            }
                        }
                    }
                }

                ctxPercept.putImageData(outData, 0, 0);
                
                // update activation stats (randomish)
                let meanAct = 0.3 + 0.5 * dreamDepth + 0.2 * Math.sin(time);
                actSpan.innerText = meanAct.toFixed(2);
                mapSpan.innerText = Math.floor(32 + 48 * dreamDepth);
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

            // animate
            function animate() {
                time += 0.02;

                // draw some drifting noise on back canvas (moving dream background)
                ctxBack.save();
                ctxBack.globalCompositeOperation = 'source-over';
                ctxBack.fillStyle = `rgba(5,0,15,0.02)`;
                ctxBack.fillRect(0,0,width,height);
                for (let i=0;i<3;i++) {
                    ctxBack.fillStyle = `rgba(100,0,200,0.05)`;
                    ctxBack.beginPath();
                    ctxBack.arc(width/2 + Math.sin(time*0.7+i)*100, height/2 + Math.cos(time*0.5+i)*80, 120, 0, 2*Math.PI);
                    ctxBack.fill();
                }
                ctxBack.restore();

                // compute CNN perception from drawing
                computeActivation();

                requestAnimationFrame(animate);
            }
            animate();

            // set default active draw
            drawBtn.classList.add('active');
        })();