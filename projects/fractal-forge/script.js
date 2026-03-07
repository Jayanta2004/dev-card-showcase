        const canvas = document.getElementById('fractalCanvas');
        const ctx = canvas.getContext('2d');
        
        // Controls
        const depthSlider = document.getElementById('depth');
        const hueSlider = document.getElementById('hueShift');
        const spinSlider = document.getElementById('spin');
        const scaleSlider = document.getElementById('scale');
        
        const depthVal = document.getElementById('depthVal');
        const hueVal = document.getElementById('hueVal');
        const spinVal = document.getElementById('spinVal');
        const scaleVal = document.getElementById('scaleVal');
        
        const infoText = document.getElementById('infoText');
        
        let currentPattern = 'mandala';
        
        function updateDisplayValues() {
            depthVal.textContent = depthSlider.value;
            hueVal.textContent = hueSlider.value;
            spinVal.textContent = spinSlider.value;
            scaleVal.textContent = parseFloat(scaleSlider.value).toFixed(2);
        }
        
        function drawFractal() {
            ctx.clearRect(0, 0, 600, 600);
            ctx.fillStyle = '#080814';
            ctx.fillRect(0, 0, 600, 600);
            
            const centerX = 300;
            const centerY = 300;
            const depth = parseInt(depthSlider.value);
            const hueShift = parseInt(hueSlider.value);
            const spin = parseInt(spinSlider.value);
            const scale = parseFloat(scaleSlider.value);
            
            ctx.translate(centerX, centerY);
            
            if (currentPattern === 'mandala') {
                drawMandala(0, 0, 250, depth, 0);
            } else if (currentPattern === 'tree') {
                drawTree(0, 150, 100, depth, -Math.PI/2);
            } else if (currentPattern === 'snowflake') {
                drawSnowflake(0, 0, 200, depth);
            } else if (currentPattern === 'spiral') {
                drawSpiral(0, 0, 50, depth, 0);
            }
            
            ctx.translate(-centerX, -centerY);
            
            infoText.textContent = `⍟ ${currentPattern.toUpperCase()} · DEPTH: ${depth} · HUE: ${hueShift}° ⍟`;
        }
        
        function drawMandala(x, y, radius, depth, angle) {
            if (depth === 0) return;
            
            const hue = (hueSlider.value + depth * 30) % 360;
            ctx.strokeStyle = `hsl(${hue}, 90%, 70%)`;
            ctx.lineWidth = depth * 1.5;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            const count = 6 + depth;
            for (let i = 0; i < count; i++) {
                const newAngle = (i / count) * Math.PI * 2 + angle + spinSlider.value * 0.01;
                const newX = x + Math.cos(newAngle) * radius * 0.7;
                const newY = y + Math.sin(newAngle) * radius * 0.7;
                
                drawMandala(newX, newY, radius * scaleSlider.value, depth - 1, newAngle);
            }
        }
        
        function drawTree(x, y, length, depth, angle) {
            if (depth === 0) return;
            
            const hue = (hueSlider.value + depth * 40) % 360;
            ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
            ctx.lineWidth = depth * 2;
            
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            const newLength = length * scaleSlider.value;
            const angleSpread = spinSlider.value * 0.02;
            
            drawTree(endX, endY, newLength, depth - 1, angle - angleSpread);
            drawTree(endX, endY, newLength, depth - 1, angle + angleSpread);
        }
        
        function drawSnowflake(x, y, radius, depth) {
            if (depth === 0) return;
            
            const hue = (hueSlider.value + depth * 20) % 360;
            ctx.strokeStyle = `hsl(${hue}, 90%, 70%)`;
            ctx.lineWidth = depth;
            
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const endX = x + Math.cos(angle) * radius;
                const endY = y + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                
                // Branch
                const branchAngle = angle + spinSlider.value * 0.01;
                const branchX = x + Math.cos(angle) * radius * 0.6;
                const branchY = y + Math.sin(angle) * radius * 0.6;
                const branchEndX = branchX + Math.cos(branchAngle) * radius * 0.4;
                const branchEndY = branchY + Math.sin(branchAngle) * radius * 0.4;
                
                ctx.beginPath();
                ctx.moveTo(branchX, branchY);
                ctx.lineTo(branchEndX, branchEndY);
                ctx.stroke();
            }
            
            drawSnowflake(x, y, radius * scaleSlider.value, depth - 1);
        }
        
        function drawSpiral(x, y, size, depth, angle) {
            if (depth === 0) return;
            
            const hue = (hueSlider.value + depth * 15) % 360;
            ctx.fillStyle = `hsla(${hue}, 90%, 70%, 0.3)`;
            ctx.strokeStyle = `hsl(${hue}, 90%, 70%)`;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            const newAngle = angle + spinSlider.value * 0.05;
            const newX = x + Math.cos(newAngle) * size * 1.5;
            const newY = y + Math.sin(newAngle) * size * 1.5;
            
            drawSpiral(newX, newY, size * scaleSlider.value, depth - 1, newAngle);
        }
        
        // Event listeners
        depthSlider.addEventListener('input', () => {
            updateDisplayValues();
            drawFractal();
        });
        hueSlider.addEventListener('input', () => {
            updateDisplayValues();
            drawFractal();
        });
        spinSlider.addEventListener('input', () => {
            updateDisplayValues();
            drawFractal();
        });
        scaleSlider.addEventListener('input', () => {
            updateDisplayValues();
            drawFractal();
        });
        
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPattern = btn.dataset.pattern;
                drawFractal();
            });
        });
        
        // Initialize
        updateDisplayValues();
        drawFractal();
        
        // Animation loop for subtle changes
        setInterval(() => {
            // Uncomment for auto-animation
            // hueSlider.value = (parseInt(hueSlider.value) + 1) % 360;
            // updateDisplayValues();
            // drawFractal();
        }, 100);