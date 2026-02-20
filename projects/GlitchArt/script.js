        // DOM elements
        const uploadArea = document.getElementById('uploadArea');
        const browseBtn = document.getElementById('browseBtn');
        const imageUpload = document.getElementById('imageUpload');
        const previewCanvas = document.getElementById('previewCanvas');
        const ctx = previewCanvas.getContext('2d');
        const placeholderText = document.getElementById('placeholderText');
        const applyBtn = document.getElementById('applyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const resetBtn = document.getElementById('resetBtn');
        const randomizeBtn = document.getElementById('randomizeBtn');
        
        // Sliders and their value displays
        const pixelShift = document.getElementById('pixelShift');
        const pixelShiftValue = document.getElementById('pixelShiftValue');
        const colorOffset = document.getElementById('colorOffset');
        const colorOffsetValue = document.getElementById('colorOffsetValue');
        const noiseLevel = document.getElementById('noiseLevel');
        const noiseValue = document.getElementById('noiseValue');
        const scanline = document.getElementById('scanline');
        const scanlineValue = document.getElementById('scanlineValue');
        
        // Image state
        let originalImage = null;
        let glitchedImage = null;
        let isProcessing = false;
        
        // Update slider value displays
        pixelShift.addEventListener('input', () => {
            pixelShiftValue.textContent = pixelShift.value;
            if (originalImage && !isProcessing) applyGlitchEffects();
        });
        
        colorOffset.addEventListener('input', () => {
            colorOffsetValue.textContent = colorOffset.value;
            if (originalImage && !isProcessing) applyGlitchEffects();
        });
        
        noiseLevel.addEventListener('input', () => {
            noiseValue.textContent = noiseLevel.value;
            if (originalImage && !isProcessing) applyGlitchEffects();
        });
        
        scanline.addEventListener('input', () => {
            scanlineValue.textContent = scanline.value;
            if (originalImage && !isProcessing) applyGlitchEffects();
        });
        
        // Event listeners for upload
        uploadArea.addEventListener('click', () => imageUpload.click());
        browseBtn.addEventListener('click', () => imageUpload.click());
        
        imageUpload.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        originalImage = img;
                        setupCanvas(img);
                        applyGlitchEffects();
                        placeholderText.style.display = 'none';
                    };
                    img.src = event.target.result;
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Apply glitch effects button
        applyBtn.addEventListener('click', applyGlitchEffects);
        
        // Download button
        downloadBtn.addEventListener('click', function() {
            if (!glitchedImage) return;
            
            const link = document.createElement('a');
            link.download = `glitch-art-${Date.now()}.png`;
            link.href = previewCanvas.toDataURL('image/png');
            link.click();
        });
        
        // Reset button
        resetBtn.addEventListener('click', function() {
            if (!originalImage) return;
            
            pixelShift.value = 0;
            pixelShiftValue.textContent = '0';
            colorOffset.value = 0;
            colorOffsetValue.textContent = '0';
            noiseLevel.value = 0;
            noiseValue.textContent = '0';
            scanline.value = 0;
            scanlineValue.textContent = '0';
            
            setupCanvas(originalImage);
            glitchedImage = null;
        });
        
        // Randomize button
        randomizeBtn.addEventListener('click', function() {
            pixelShift.value = Math.floor(Math.random() * 100);
            pixelShiftValue.textContent = pixelShift.value;
            colorOffset.value = Math.floor(Math.random() * 50);
            colorOffsetValue.textContent = colorOffset.value;
            noiseLevel.value = Math.floor(Math.random() * 100);
            noiseValue.textContent = noiseLevel.value;
            scanline.value = Math.floor(Math.random() * 100);
            scanlineValue.textContent = scanline.value;
            
            if (originalImage) applyGlitchEffects();
        });
        
        // Setup canvas with image
        function setupCanvas(img) {
            const maxWidth = 500;
            const maxHeight = 300;
            
            let width = img.width;
            let height = img.height;
            
            // Calculate scaled dimensions
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }
            
            previewCanvas.width = width;
            previewCanvas.height = height;
            
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Main glitch effect function
        function applyGlitchEffects() {
            if (!originalImage || isProcessing) return;
            
            isProcessing = true;
            applyBtn.classList.add('glitch-effect');
            
            // Short delay to show animation
            setTimeout(() => {
                // Get current values
                const shiftValue = parseInt(pixelShift.value);
                const offsetValue = parseInt(colorOffset.value);
                const noiseValue = parseInt(noiseLevel.value);
                const scanlineValue = parseInt(scanline.value);
                
                // Setup canvas with original image
                setupCanvas(originalImage);
                
                // Get image data
                const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
                const data = imageData.data;
                
                // Apply pixel shift
                if (shiftValue > 0) {
                    applyPixelShift(data, previewCanvas.width, previewCanvas.height, shiftValue);
                }
                
                // Apply color channel offset
                if (offsetValue > 0) {
                    applyColorOffset(data, previewCanvas.width, previewCanvas.height, offsetValue);
                }
                
                // Apply noise
                if (noiseValue > 0) {
                    applyNoise(data, noiseValue);
                }
                
                // Apply scanlines
                if (scanlineValue > 0) {
                    applyScanlines(data, previewCanvas.width, previewCanvas.height, scanlineValue);
                }
                
                // Put the glitched data back to canvas
                ctx.putImageData(imageData, 0, 0);
                
                // Store glitched image
                glitchedImage = new Image();
                glitchedImage.src = previewCanvas.toDataURL();
                
                isProcessing = false;
                applyBtn.classList.remove('glitch-effect');
            }, 100);
        }
        
        // Pixel shift effect
        function applyPixelShift(data, width, height, intensity) {
            const shift = Math.floor(intensity / 10) + 1;
            
            for (let y = 0; y < height; y++) {
                // Randomly shift some rows
                if (Math.random() < intensity / 200) {
                    const rowShift = (Math.random() > 0.5 ? 1 : -1) * shift;
                    
                    for (let x = 0; x < width; x++) {
                        const sourceX = x + rowShift;
                        
                        if (sourceX >= 0 && sourceX < width) {
                            const targetIndex = (y * width + x) * 4;
                            const sourceIndex = (y * width + sourceX) * 4;
                            
                            data[targetIndex] = data[sourceIndex];         // R
                            data[targetIndex + 1] = data[sourceIndex + 1]; // G
                            data[targetIndex + 2] = data[sourceIndex + 2]; // B
                        }
                    }
                }
            }
        }
        
        // Color channel offset effect
        function applyColorOffset(data, width, height, offset) {
            const offsetX = Math.floor(offset / 5) + 1;
            const offsetY = Math.floor(offset / 10) + 1;
            
            // Create a copy of the original data
            const originalData = new Uint8ClampedArray(data);
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    
                    // Red channel offset
                    const redX = Math.min(width - 1, Math.max(0, x + offsetX));
                    const redY = Math.min(height - 1, Math.max(0, y + offsetY));
                    const redIndex = (redY * width + redX) * 4;
                    
                    // Blue channel offset (opposite direction)
                    const blueX = Math.min(width - 1, Math.max(0, x - offsetX));
                    const blueY = Math.min(height - 1, Math.max(0, y - offsetY));
                    const blueIndex = (blueY * width + blueX) * 4;
                    
                    // Apply offsets
                    data[index] = originalData[redIndex];               // R from offset position
                    data[index + 1] = originalData[index + 1];          // G stays same
                    data[index + 2] = originalData[blueIndex + 2];      // B from opposite offset
                }
            }
        }
        
        // Noise effect
        function applyNoise(data, intensity) {
            const noiseAmount = intensity / 100;
            
            for (let i = 0; i < data.length; i += 4) {
                // Add random noise to each channel
                if (Math.random() < noiseAmount) {
                    const noise = Math.floor(Math.random() * 100) - 50;
                    
                    data[i] = Math.min(255, Math.max(0, data[i] + noise));         // R
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
                }
            }
        }
        
        // Scanline effect
        function applyScanlines(data, width, height, intensity) {
            const lineIntensity = intensity / 100;
            
            for (let y = 0; y < height; y++) {
                // Every other line gets darkened
                if (y % 2 === 0) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * 4;
                        
                        data[index] *= (1 - lineIntensity * 0.5);     // R
                        data[index + 1] *= (1 - lineIntensity * 0.5); // G
                        data[index + 2] *= (1 - lineIntensity * 0.5); // B
                    }
                }
                
                // Occasionally add a bright scanline
                if (Math.random() < intensity / 500) {
                    for (let x = 0; x < width; x++) {
                        const index = (y * width + x) * 4;
                        
                        data[index] = Math.min(255, data[index] + 100);     // R
                        data[index + 1] = Math.min(255, data[index + 1] + 100); // G
                        data[index + 2] = Math.min(255, data[index + 2] + 100); // B
                    }
                }
            }
        }
        
        // Initialize with a sample image
        window.addEventListener('load', function() {
            // Create a sample image programmatically
            const sampleCanvas = document.createElement('canvas');
            sampleCanvas.width = 400;
            sampleCanvas.height = 300;
            const sampleCtx = sampleCanvas.getContext('2d');
            
            // Draw a gradient background
            const gradient = sampleCtx.createLinearGradient(0, 0, 400, 300);
            gradient.addColorStop(0, '#ff0066');
            gradient.addColorStop(0.5, '#6600ff');
            gradient.addColorStop(1, '#00ffea');
            sampleCtx.fillStyle = gradient;
            sampleCtx.fillRect(0, 0, 400, 300);
            
            // Draw some geometric shapes
            sampleCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            sampleCtx.beginPath();
            sampleCtx.arc(100, 150, 50, 0, Math.PI * 2);
            sampleCtx.fill();
            
            sampleCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            sampleCtx.beginPath();
            sampleCtx.rect(200, 100, 100, 100);
            sampleCtx.fill();
            
            sampleCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            sampleCtx.beginPath();
            sampleCtx.moveTo(350, 150);
            sampleCtx.lineTo(320, 220);
            sampleCtx.lineTo(380, 220);
            sampleCtx.closePath();
            sampleCtx.fill();
            
            // Add text
            sampleCtx.fillStyle = '#ffffff';
            sampleCtx.font = 'bold 24px Courier New';
            sampleCtx.textAlign = 'center';
            sampleCtx.fillText('GLITCH STUDIO', 200, 50);
            
            // Convert to image
            const sampleImage = new Image();
            sampleImage.onload = function() {
                originalImage = sampleImage;
                setupCanvas(sampleImage);
                applyGlitchEffects();
                placeholderText.style.display = 'none';
            };
            sampleImage.src = sampleCanvas.toDataURL();
        });