        const canvas = document.getElementById('mandalaCanvas');
        const ctx = canvas.getContext('2d');
        const symmetryValue = document.getElementById('symmetryValue');
        
        let symmetry = 8;
        let currentColor = '#ff4d4d';
        let isDrawing = false;
        let lastX, lastY;
        
        function drawSymmetrical(x, y, color) {
            const centerX = 250;
            const centerY = 250;
            
            for (let i = 0; i < symmetry; i++) {
                const angle = (i / symmetry) * Math.PI * 2;
                
                // Rotate point around center
                const dx = x - centerX;
                const dy = y - centerY;
                
                const rotatedX = centerX + dx * Math.cos(angle) - dy * Math.sin(angle);
                const rotatedY = centerY + dx * Math.sin(angle) + dy * Math.cos(angle);
                
                ctx.beginPath();
                ctx.arc(rotatedX, rotatedY, 8, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        }
        
        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            drawSymmetrical(x, y, currentColor);
            lastX = x;
            lastY = y;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Draw line segments for smoother drawing
            const steps = 5;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const interpX = lastX + (x - lastX) * t;
                const interpY = lastY + (y - lastY) * t;
                drawSymmetrical(interpX, interpY, currentColor);
            }
            
            lastX = x;
            lastY = y;
        });
        
        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
        });
        
        document.getElementById('symmetryUp').addEventListener('click', () => {
            symmetry = Math.min(24, symmetry + 2);
            symmetryValue.textContent = symmetry;
        });
        
        document.getElementById('symmetryDown').addEventListener('click', () => {
            symmetry = Math.max(2, symmetry - 2);
            symmetryValue.textContent = symmetry;
        });
        
        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                currentColor = dot.dataset.color;
            });
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            ctx.fillStyle = '#1a0f0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'mandala.png';
            link.href = canvas.toDataURL();
            link.click();
        });
        
        document.getElementById('randomBtn').addEventListener('click', () => {
            ctx.fillStyle = '#1a0f0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw random mandala
            for (let i = 0; i < 50; i++) {
                const x = 250 + (Math.random() - 0.5) * 400;
                const y = 250 + (Math.random() - 0.5) * 400;
                const colors = ['#ff4d4d', '#ffb84d', '#ffff4d', '#4dff4d', '#4dffff', '#4d4dff', '#ff4dff'];
                drawSymmetrical(x, y, colors[Math.floor(Math.random() * colors.length)]);
            }
        });
        
        // Initialize with a simple mandala
        ctx.fillStyle = '#1a0f0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw center point
        ctx.beginPath();
        ctx.arc(250, 250, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();