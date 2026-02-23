        class StyleTransfer {
            constructor() {
                this.canvas = document.getElementById('main-canvas');
                this.ctx = this.canvas.getContext('2d');
                this.video = document.getElementById('video');
                this.stream = null;
                
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.canvas.width = this.width;
                this.canvas.height = this.height;
                
                this.style = 'starry';
                this.styleIntensity = 0.7;
                this.detailPreservation = 0.5;
                this.recording = false;
                this.recordedFrames = [];
                this.frameCount = 0;
                this.lastTime = performance.now();
                this.fps = 30;
                
                this.models = {};
                this.modelLoaded = false;
                
                this.initCamera();
                this.initModels();
                this.animate();
                this.setupResize();
            }

            async initCamera() {
                try {
                    this.stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { 
                            width: { ideal: 640 },
                            height: { ideal: 480 },
                            facingMode: 'user'
                        } 
                    });
                    this.video.srcObject = this.stream;
                    
                    // Hide loading overlay after camera is ready
                    setTimeout(() => {
                        document.getElementById('loading-overlay').style.opacity = '0';
                        setTimeout(() => {
                            document.getElementById('loading-overlay').style.display = 'none';
                        }, 500);
                    }, 2000);
                    
                } catch (err) {
                    console.error('Camera error:', err);
                    document.getElementById('loading-status').textContent = 
                        '❌ Camera access denied. Using demo mode.';
                }
            }

            async initModels() {
                document.getElementById('loading-status').textContent = 
                    'Loading style transfer models...';
                
                // Simulate model loading (in real implementation, you'd load actual TF models)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                document.getElementById('loading-status').textContent = 
                    'Initializing neural networks...';
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                this.modelLoaded = true;
                
                // In a real implementation, you would load actual TensorFlow.js models:
                // this.models.starry = await tf.loadLayersModel('path/to/starry_model.json');
            }

            applyStyle(frame) {
                if (!this.modelLoaded) return frame;
                
                // This is a simplified style transfer simulation
                // In reality, you'd run the frame through a neural network
                
                const imageData = frame.data;
                const width = frame.width;
                const height = frame.height;
                
                // Create a new ImageData for the stylized output
                const output = new ImageData(width, height);
                
                // Apply style effects based on selected style
                for (let i = 0; i < imageData.length; i += 4) {
                    let r = imageData[i];
                    let g = imageData[i + 1];
                    let b = imageData[i + 2];
                    let a = imageData[i + 3];
                    
                    // Apply style-specific color transformations
                    switch(this.style) {
                        case 'starry':
                            // Van Gogh style: increased contrast, swirling colors
                            r = Math.min(255, r * 1.2 + 20);
                            g = Math.min(255, g * 1.1 + 10);
                            b = Math.min(255, b * 1.3 + 30);
                            
                            // Add some swirl based on position
                            const x = (i / 4) % width;
                            const y = Math.floor((i / 4) / width);
                            const swirl = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 20;
                            
                            r = Math.min(255, Math.max(0, r + swirl));
                            g = Math.min(255, Math.max(0, g + swirl * 0.5));
                            b = Math.min(255, Math.max(0, b - swirl * 0.3));
                            break;
                            
                        case 'monet':
                            // Impressionist style: softer, pastel colors
                            r = r * 0.9 + 30;
                            g = g * 0.9 + 40;
                            b = b * 0.9 + 50;
                            break;
                            
                        case 'picasso':
                            // Cubist style: geometric color blocking
                            const blockSize = 20;
                            const blockX = Math.floor((i / 4) % width / blockSize);
                            const blockY = Math.floor(Math.floor((i / 4) / width) / blockSize);
                            
                            if ((blockX + blockY) % 3 === 0) {
                                r = Math.min(255, r * 1.5);
                            } else if ((blockX + blockY) % 3 === 1) {
                                g = Math.min(255, g * 1.5);
                            } else {
                                b = Math.min(255, b * 1.5);
                            }
                            break;
                            
                        case 'munch':
                            // Expressionist style: high contrast, distorted
                            const gray = (r + g + b) / 3;
                            r = gray * 1.5;
                            g = gray * 0.8;
                            b = gray * 1.2;
                            
                            // Add distortion waves
                            const waveY = Math.floor((i / 4) / width);
                            if (Math.sin(waveY * 0.1) > 0.5) {
                                r = Math.min(255, r * 1.2);
                            }
                            break;
                            
                        case 'kandinsky':
                            // Abstract style: bold colors, geometric patterns
                            const patternX = (i / 4) % width;
                            const patternY = Math.floor((i / 4) / width);
                            
                            if (Math.sin(patternX * 0.05) * Math.cos(patternY * 0.05) > 0) {
                                r = 255;
                                g = 0;
                                b = 0;
                            } else {
                                r = 0;
                                g = 0;
                                b = 255;
                            }
                            break;
                            
                        case 'hokusai':
                            // Ukiyo-e style: blue tones, high contrast
                            const blueGray = (r + g + b) / 3;
                            r = blueGray * 0.7;
                            g = blueGray * 0.8;
                            b = blueGray * 1.5;
                            
                            // Add wave patterns
                            const waveX = (i / 4) % width;
                            const waveY = Math.floor((i / 4) / width);
                            const wave = Math.sin(waveX * 0.02) * Math.cos(waveY * 0.02) * 30;
                            
                            b = Math.min(255, b + wave);
                            break;
                    }
                    
                    // Mix original and stylized based on intensity
                    const intensity = this.styleIntensity;
                    output.data[i] = r * intensity + imageData[i] * (1 - intensity);
                    output.data[i + 1] = g * intensity + imageData[i + 1] * (1 - intensity);
                    output.data[i + 2] = b * intensity + imageData[i + 2] * (1 - intensity);
                    output.data[i + 3] = a;
                }
                
                return output;
            }

            processFrame() {
                if (!this.video.readyState) return;
                
                const startTime = performance.now();
                
                // Create temporary canvas to capture video frame
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.video.videoWidth;
                tempCanvas.height = this.video.videoHeight;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(this.video, 0, 0, tempCanvas.width, tempCanvas.height);
                
                // Get frame data
                const frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Apply style transfer
                const stylized = this.applyStyle(frame);
                
                // Draw to main canvas (scaled to fit)
                this.ctx.clearRect(0, 0, this.width, this.height);
                
                // Calculate aspect ratio to fit
                const scale = Math.max(
                    this.width / stylized.width,
                    this.height / stylized.height
                );
                
                const x = (this.width - stylized.width * scale) / 2;
                const y = (this.height - stylized.height * scale) / 2;
                
                // Create temporary canvas for the stylized frame
                const stylizedCanvas = document.createElement('canvas');
                stylizedCanvas.width = stylized.width;
                stylizedCanvas.height = stylized.height;
                stylizedCanvas.getContext('2d').putImageData(stylized, 0, 0);
                
                // Draw scaled
                this.ctx.drawImage(
                    stylizedCanvas, 
                    0, 0, stylized.width, stylized.height,
                    x, y, stylized.width * scale, stylized.height * scale
                );
                
                // Update stats
                const processingTime = performance.now() - startTime;
                document.getElementById('processingTime').textContent = 
                    Math.round(processingTime) + 'ms';
                
                // Update progress bar (simulated)
                const progress = Math.min(100, (processingTime / 50) * 100);
                document.getElementById('processingProgress').style.width = progress + '%';
                
                // Record if enabled
                if (this.recording) {
                    this.recordedFrames.push(stylized);
                    if (this.recordedFrames.length > 30) {
                        this.recordedFrames.shift();
                    }
                }
            }

            updateFPS() {
                this.frameCount++;
                const now = performance.now();
                const delta = now - this.lastTime;
                
                if (delta >= 1000) {
                    this.fps = this.frameCount;
                    this.frameCount = 0;
                    this.lastTime = now;
                    
                    document.getElementById('fps').textContent = this.fps;
                    document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
                }
            }

            animate() {
                if (this.video.readyState === 4) {
                    this.processFrame();
                    this.updateFPS();
                }
                
                requestAnimationFrame(() => this.animate());
            }

            setupResize() {
                window.addEventListener('resize', () => {
                    this.width = window.innerWidth;
                    this.height = window.innerHeight;
                    this.canvas.width = this.width;
                    this.canvas.height = this.height;
                });
            }

            captureFrame() {
                const link = document.createElement('a');
                link.download = `style-transfer-${this.style}-${Date.now()}.png`;
                link.href = this.canvas.toDataURL();
                link.click();
            }

            toggleRecording() {
                this.recording = !this.recording;
                const indicator = document.getElementById('recordingIndicator');
                const btn = document.getElementById('recordBtn');
                
                if (this.recording) {
                    indicator.style.display = 'block';
                    btn.textContent = '⏹️ Stop';
                    btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff4757)';
                } else {
                    indicator.style.display = 'none';
                    btn.textContent = '⏺️ Record';
                    btn.style.background = 'linear-gradient(135deg, #4ecdc4, #45b7d1)';
                    
                    // Save recording as GIF (simplified - would need actual GIF encoder)
                    if (this.recordedFrames.length > 0) {
                        alert(`Recorded ${this.recordedFrames.length} frames. In a full implementation, these would be saved as an animated GIF.`);
                    }
                }
            }

            downloadArt() {
                this.captureFrame();
            }

            resetStyle() {
                this.styleIntensity = 0.7;
                this.detailPreservation = 0.5;
                
                document.getElementById('styleIntensity').value = '0.7';
                document.getElementById('detailPreservation').value = '0.5';
                document.getElementById('styleIntensityVal').textContent = '0.7';
                document.getElementById('detailPreservationVal').textContent = '0.5';
            }

            setStyle(style) {
                this.style = style;
                
                // Update active card
                document.querySelectorAll('.style-card').forEach(card => {
                    card.classList.remove('active');
                });
                event.currentTarget.classList.add('active');
                
                // Update style name in stats
                const styleNames = {
                    starry: 'Starry Night',
                    monet: 'Water Lilies',
                    picasso: 'Cubism',
                    munch: 'The Scream',
                    kandinsky: 'Composition',
                    hokusai: 'The Wave'
                };
                document.getElementById('currentStyle').textContent = styleNames[style];
            }
        }

        // Initialize style transfer
        const styleTransfer = new StyleTransfer();

        // Global control functions
        function selectStyle(style) {
            styleTransfer.setStyle(style);
        }

        function captureFrame() {
            styleTransfer.captureFrame();
        }

        function toggleRecording() {
            styleTransfer.toggleRecording();
        }

        function downloadArt() {
            styleTransfer.downloadArt();
        }

        function resetStyle() {
            styleTransfer.resetStyle();
        }

        // Slider controls
        document.getElementById('styleIntensity').addEventListener('input', (e) => {
            styleTransfer.styleIntensity = parseFloat(e.target.value);
            document.getElementById('styleIntensityVal').textContent = e.target.value;
        });

        document.getElementById('detailPreservation').addEventListener('input', (e) => {
            styleTransfer.detailPreservation = parseFloat(e.target.value);
            document.getElementById('detailPreservationVal').textContent = e.target.value;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                styleTransfer.captureFrame();
            } else if (e.key === 'r' || e.key === 'R') {
                styleTransfer.toggleRecording();
            } else if (e.key === 's' || e.key === 'S') {
                styleTransfer.downloadArt();
            }
        });