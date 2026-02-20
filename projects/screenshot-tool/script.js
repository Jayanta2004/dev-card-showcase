        (function() {
            // ---------- DOM elements ----------
            const canvas = document.getElementById('shot-canvas');
            const ctx = canvas.getContext('2d');
            const offscreenCanvas = document.getElementById('offscreen-canvas');
            const offCtx = offscreenCanvas.getContext('2d');

            const dimDisplay = document.getElementById('dimDisplay');
            const coordDisplay = document.getElementById('coordDisplay');
            const filenameInput = document.getElementById('filenameInput');

            // Buttons
            const fullPageBtn = document.getElementById('fullPageBtn');
            const visibleBtn = document.getElementById('visibleBtn');
            const resetCropBtn = document.getElementById('resetCropBtn');
            const clearOverlayBtn = document.getElementById('clearOverlayBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const copyBtn = document.getElementById('copyBtn');
            const addTextBtn = document.getElementById('addTextBtn');
            const resetBtn = document.getElementById('resetBtn');

            // ---------- state ----------
            let originalImageData = null;         // stores full screenshot ImageData (backup)
            let displayWidth = 960, displayHeight = 540; // current canvas display (CSS)
            let naturalWidth = 960, naturalHeight = 540; // native canvas resolution

            // crop region (in canvas pixel coordinates)
            let cropStartX = null, cropStartY = null, cropEndX = null, cropEndY = null;
            let isDragging = false;
            let cropActive = false;  // whether a crop rectangle is drawn

            // overlay / extra drawings (stored as a separate layer? we combine on each redraw)
            let overlayItems = [];    // simple array for extra drawings (text, etc.)

            // ---------- helper: reset canvas to original image (or fallback gradient) ----------
            function resetToOriginal() {
                if (originalImageData) {
                    // restore from saved image data
                    ctx.putImageData(originalImageData, 0, 0);
                } else {
                    // fallback: draw gradient + demo content
                    drawDemoScene();
                }
                // reset crop selection
                cropStartX = cropStartY = cropEndX = cropEndY = null;
                cropActive = false;
                overlayItems = [];
                updateCoordDisplay();
                // sync dimensions
                dimDisplay.innerText = `📐 ${canvas.width} x ${canvas.height}`;
            }

            // draw a nice demo scene (so canvas isn't empty)
            function drawDemoScene() {
                const w = canvas.width, h = canvas.height;
                // background galaxy
                const grad = ctx.createLinearGradient(0, 0, w*0.8, h);
                grad.addColorStop(0, '#1d3b4f');
                grad.addColorStop(0.6, '#3f627c');
                grad.addColorStop(1, '#608aa3');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // grid pattern
                ctx.strokeStyle = '#ffffff30';
                ctx.lineWidth = 1;
                for (let i = 0; i < w; i += 40) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, h);
                    ctx.strokeStyle = '#b0e0ff30';
                    ctx.stroke();
                }
                for (let i = 0; i < h; i += 40) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(w, i);
                    ctx.strokeStyle = '#b0e0ff30';
                    ctx.stroke();
                }

                // some shapes to simulate screenshot content
                ctx.fillStyle = '#f5c542d0';
                ctx.beginPath();
                ctx.arc(300, 200, 70, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#b33e5cd0';
                ctx.beginPath();
                ctx.arc(600, 350, 90, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#5abf8ed0';
                ctx.beginPath();
                ctx.arc(750, 120, 50, 0, 2 * Math.PI);
                ctx.fill();

                // text
                ctx.font = 'bold 42px "Inter", sans-serif';
                ctx.fillStyle = '#fffcf0';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 15;
                ctx.fillText('SNAP', 120, 400);
                ctx.shadowBlur = 0;
                ctx.font = '22px monospace';
                ctx.fillStyle = '#ddeeff';
                ctx.fillText('drag to select region', 520, 500);
            }

            // initial capture of original image data (first load)
            function captureOriginalFromCanvas() {
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }

            // redraw canvas with original + overlays and crop overlay (visual)
            function redrawFull() {
                if (originalImageData) {
                    ctx.putImageData(originalImageData, 0, 0);
                } else {
                    drawDemoScene();
                }
                // draw overlay items (like text)
                overlayItems.forEach(item => {
                    if (item.type === 'text') {
                        ctx.font = item.font || '28px "Inter", sans-serif';
                        ctx.fillStyle = item.color || '#ffffff';
                        ctx.shadowColor = 'black';
                        ctx.shadowBlur = 8;
                        ctx.fillText(item.text, item.x, item.y);
                        ctx.shadowBlur = 0;
                    }
                });

                // draw crop rectangle if active (selection)
                if (cropActive && cropStartX !== null && cropEndX !== null) {
                    const x = Math.min(cropStartX, cropEndX);
                    const y = Math.min(cropStartY, cropEndY);
                    const w = Math.abs(cropEndX - cropStartX);
                    const h = Math.abs(cropEndY - cropStartY);

                    ctx.strokeStyle = '#ffdf7e';
                    ctx.lineWidth = 4;
                    ctx.setLineDash([10, 8]);
                    ctx.strokeRect(x, y, w, h);
                    ctx.setLineDash([]); // reset

                    // semi-transparent overlay outside region
                    ctx.fillStyle = '#00000060';
                    ctx.globalCompositeOperation = 'source-over';
                    // top
                    ctx.fillRect(0, 0, canvas.width, y);
                    // bottom
                    ctx.fillRect(0, y + h, canvas.width, canvas.height - (y + h));
                    // left
                    ctx.fillRect(0, y, x, h);
                    // right
                    ctx.fillRect(x + w, y, canvas.width - (x + w), h);
                    ctx.globalCompositeOperation = 'source-over';
                }
            }

            // update coordinate display
            function updateCoordDisplay() {
                if (cropActive && cropStartX !== null && cropEndX !== null) {
                    const x = Math.min(cropStartX, cropEndX);
                    const y = Math.min(cropStartY, cropEndY);
                    const w = Math.abs(cropEndX - cropStartX);
                    const h = Math.abs(cropEndY - cropStartY);
                    coordDisplay.innerText = `📍 crop: (${Math.round(x)},${Math.round(y)})  ${Math.round(w)}x${Math.round(h)}`;
                } else {
                    coordDisplay.innerText = `⬤ selection: none`;
                }
            }

            // ---------- simulate full page screenshot (via html2canvas-like? we'll just fill with random pattern) ----------
            function simulateFullPageScreenshot() {
                // In real extension, you'd use chrome.tabs.captureVisibleTab / html2canvas.
                // Here we fill canvas with a "fake" screenshot: larger pattern
                canvas.width = 1280;
                canvas.height = 1800;
                dimDisplay.innerText = `📐 1280 x 1800 (demo full page)`;
                const grad = ctx.createLinearGradient(0, 0, 800, 600);
                grad.addColorStop(0, '#0d3b4c');
                grad.addColorStop(0.5, '#3f5e72');
                grad.addColorStop(1, '#618b9e');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                for (let i=0; i<20; i++) {
                    ctx.fillStyle = `hsl(${i*35}, 70%, 60%)`;
                    ctx.beginPath();
                    ctx.arc(150 + i*55, 300 + i*70, 40, 0, 2*Math.PI);
                    ctx.fill();
                }
                ctx.font = 'bold 60px sans-serif';
                ctx.fillStyle = '#fcf9e1';
                ctx.fillText('📸 full page', 300, 800);
                // store as original
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resetCrop();
            }

            function simulateVisibleTabScreenshot() {
                // simulate visible viewport ~ 1280x720
                canvas.width = 1280;
                canvas.height = 720;
                dimDisplay.innerText = `📐 1280 x 720 (visible tab)`;
                ctx.fillStyle = '#2c4a5e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#e5c27f';
                ctx.font = '48px "Inter"';
                ctx.fillText('tab content', 400, 340);
                for (let i=0; i<5; i++) {
                    ctx.fillStyle = '#c05a7b';
                    ctx.beginPath();
                    ctx.arc(300 + i*180, 500, 45, 0, 2*Math.PI);
                    ctx.fill();
                }
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resetCrop();
            }

            function resetCrop() {
                cropStartX = cropStartY = cropEndX = cropEndY = null;
                cropActive = false;
                redrawFull();
                updateCoordDisplay();
            }

            // crop to selection (if any) -> produce new canvas
            function applyCropAndReplace() {
                if (!cropActive || cropStartX === null || cropEndX === null) return;
                const x1 = Math.min(cropStartX, cropEndX);
                const y1 = Math.min(cropStartY, cropEndY);
                const x2 = Math.max(cropStartX, cropEndX);
                const y2 = Math.max(cropStartY, cropEndY);
                const cropW = x2 - x1;
                const cropH = y2 - y1;
                if (cropW < 5 || cropH < 5) return;

                // get image data, create new canvas
                const imageData = ctx.getImageData(x1, y1, cropW, cropH);
                canvas.width = cropW;
                canvas.height = cropH;
                ctx.putImageData(imageData, 0, 0);
                // update original data
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                dimDisplay.innerText = `📐 ${canvas.width} x ${canvas.height}`;
                resetCrop(); // also redraw
            }

            // ---------- mouse events for crop ----------
            function getMouseCanvasCoords(e) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const mouseX = (e.clientX - rect.left) * scaleX;
                const mouseY = (e.clientY - rect.top) * scaleY;
                return { x: Math.min(canvas.width, Math.max(0, mouseX)), y: Math.min(canvas.height, Math.max(0, mouseY)) };
            }

            function onMouseDown(e) {
                e.preventDefault();
                const { x, y } = getMouseCanvasCoords(e);
                isDragging = true;
                cropStartX = x;
                cropStartY = y;
                cropEndX = x;
                cropEndY = y;
                cropActive = true;
            }

            function onMouseMove(e) {
                if (!isDragging) return;
                e.preventDefault();
                const { x, y } = getMouseCanvasCoords(e);
                cropEndX = Math.min(canvas.width, Math.max(0, x));
                cropEndY = Math.min(canvas.height, Math.max(0, y));
                redrawFull();
                updateCoordDisplay();
            }

            function onMouseUp(e) {
                if (isDragging) {
                    isDragging = false;
                    if (cropStartX !== null && cropEndX !== null) {
                        const w = Math.abs(cropEndX - cropStartX);
                        const h = Math.abs(cropEndY - cropStartY);
                        if (w < 5 || h < 5) {
                            // too small, cancel crop
                            cropActive = false;
                            redrawFull();
                        } else {
                            // keep active, redraw handles
                        }
                        updateCoordDisplay();
                    }
                }
            }

            // attach mouse events
            canvas.addEventListener('mousedown', onMouseDown);
            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mouseup', onMouseUp);
            canvas.addEventListener('mouseleave', (e) => {
                if (isDragging) {
                    isDragging = false;
                    // optionally keep crop as is
                }
            });

            // ----- buttons -----
            fullPageBtn.addEventListener('click', () => {
                simulateFullPageScreenshot();
            });

            visibleBtn.addEventListener('click', () => {
                simulateVisibleTabScreenshot();
            });

            resetCropBtn.addEventListener('click', () => {
                if (cropActive) {
                    resetCrop();
                } else {
                    // nothing
                }
            });

            clearOverlayBtn.addEventListener('click', () => {
                overlayItems = [];
                redrawFull();
            });

            downloadBtn.addEventListener('click', () => {
                let filename = filenameInput.value.trim();
                if (!filename) filename = 'snap.png';
                if (!filename.endsWith('.png')) filename += '.png';
                // create download link
                const link = document.createElement('a');
                link.download = filename;
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }, 'image/png');
            });

            copyBtn.addEventListener('click', async () => {
                try {
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    alert('✅ image copied to clipboard!');
                } catch (err) {
                    alert('❌ copy failed: ' + err.message);
                }
            });

            addTextBtn.addEventListener('click', () => {
                overlayItems.push({
                    type: 'text',
                    text: '🐾 snapshot',
                    x: 120,
                    y: 150,
                    font: 'bold 48px "Inter"',
                    color: '#ffe8a0'
                });
                redrawFull();
            });

            resetBtn.addEventListener('click', () => {
                // restore to default demo scene
                canvas.width = 960;
                canvas.height = 540;
                dimDisplay.innerText = `📐 960 x 540`;
                drawDemoScene();
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resetCrop();
            });

            // apply crop from selection (double-click on canvas)
            canvas.addEventListener('dblclick', (e) => {
                e.preventDefault();
                if (cropActive && cropStartX !== null && cropEndX !== null) {
                    applyCropAndReplace();
                }
            });

            // also add "crop now" via button? maybe use resetCrop? we'll add a hidden feature: ctrl+enter? but simple.
            // let's add a little note
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    if (cropActive) applyCropAndReplace();
                }
            });

            // initialise demo
            (function init() {
                drawDemoScene();
                captureOriginalFromCanvas();
                dimDisplay.innerText = `📐 ${canvas.width} x ${canvas.height}`;
            })();

        })();