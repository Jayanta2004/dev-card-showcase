        const canvas = document.getElementById('starCanvas');
        const ctx = canvas.getContext('2d');
        
        let width, height;
        let stars = [];
        let connections = [];
        let isConnecting = false;
        let selectedStars = [];
        
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            generateStars();
        }
        
        function generateStars() {
            stars = [];
            const starCount = 50 + Math.floor(Math.random() * 50);
            
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: 2 + Math.random() * 6,
                    brightness: 0.5 + Math.random() * 0.5,
                    twinkle: Math.random() * Math.PI * 2,
                    name: `Star ${i+1}`
                });
            }
            
            document.getElementById('starCount').textContent = stars.length;
            connections = [];
            drawStars();
        }
        
        function drawStars() {
            ctx.clearRect(0, 0, width, height);
            
            // Draw nebulae
            drawNebulae();
            
            // Draw connections
            ctx.strokeStyle = '#b8a9ff66';
            ctx.lineWidth = 1;
            connections.forEach(conn => {
                const star1 = stars[conn[0]];
                const star2 = stars[conn[1]];
                if (star1 && star2) {
                    ctx.beginPath();
                    ctx.moveTo(star1.x, star1.y);
                    ctx.lineTo(star2.x, star2.y);
                    ctx.strokeStyle = `rgba(184, 169, 255, ${0.2 + conn[2] * 0.3})`;
                    ctx.stroke();
                }
            });
            
            // Draw stars
            stars.forEach((star, index) => {
                const brightness = parseFloat(document.getElementById('starBrightness').value) / 100;
                const twinkleEffect = 0.7 + 0.3 * Math.sin(star.twinkle + Date.now() * 0.002);
                
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * brightness * twinkleEffect, 0, Math.PI * 2);
                
                // Star glow
                const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
                gradient.addColorStop(0.5, `rgba(184, 169, 255, ${brightness * 0.5})`);
                gradient.addColorStop(1, 'rgba(184, 169, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Selected highlight
                if (selectedStars.includes(index)) {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                    ctx.strokeStyle = '#ffd700';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
            
            requestAnimationFrame(drawStars);
        }
        
        function drawNebulae() {
            // Random nebulae
            for (let i = 0; i < 5; i++) {
                const x = (Math.sin(Date.now() * 0.0001 + i) * 0.3 + 0.5) * width;
                const y = (Math.cos(Date.now() * 0.00015 + i) * 0.3 + 0.5) * height;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 300);
                gradient.addColorStop(0, `rgba(100, 50, 150, 0.1)`);
                gradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
        }
        
        function findStar(x, y) {
            let minDist = Infinity;
            let closestStar = -1;
            
            stars.forEach((star, index) => {
                const dist = Math.hypot(star.x - x, star.y - y);
                if (dist < 30 && dist < minDist) {
                    minDist = dist;
                    closestStar = index;
                }
            });
            
            return closestStar;
        }
        
        // Event listeners
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const starIndex = findStar(x, y);
            
            if (isConnecting && starIndex !== -1) {
                if (!selectedStars.includes(starIndex)) {
                    selectedStars.push(starIndex);
                    
                    if (selectedStars.length === 2) {
                        // Create connection
                        connections.push([selectedStars[0], selectedStars[1], Math.random()]);
                        selectedStars = [];
                        isConnecting = false;
                        document.getElementById('connectStars').textContent = '⚡ CONNECT';
                    }
                }
            }
        });
        
        document.getElementById('newConstellation').addEventListener('click', generateStars);
        
        document.getElementById('connectStars').addEventListener('click', () => {
            isConnecting = !isConnecting;
            selectedStars = [];
            document.getElementById('connectStars').textContent = isConnecting ? '✨ SELECT TWO' : '⚡ CONNECT';
        });
        
        // Constellation names cycle
        const constellations = ['ORION', 'URSA MAJOR', 'CASSIOPEIA', 'DRACO', 'CYGNUS', 'LYRA', 'AQUILA'];
        let constIndex = 0;
        setInterval(() => {
            constIndex = (constIndex + 1) % constellations.length;
            document.getElementById('constellationName').textContent = constellations[constIndex];
        }, 3000);
        
        window.addEventListener('resize', resize);
        resize();
        generateStars();