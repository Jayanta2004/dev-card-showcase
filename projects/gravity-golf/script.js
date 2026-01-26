class GravityGolf {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.ball = {
            x: 100,
            y: 300,
            radius: 8,
            vx: 0,
            vy: 0,
            trail: [],
            color: '#ffffff'
        };
        
        this.isAiming = false;
        this.aimStart = { x: 0, y: 0 };
        this.aimEnd = { x: 0, y: 0 };
        this.power = 0;
        this.maxPower = 15;
        
        this.currentLevel = 1;
        this.strokes = 0;
        this.isMoving = false;
        this.levelComplete = false;
        
        this.levels = this.generateLevels();
        
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
        this.gameLoop();
    }
    
    generateLevels() {
        return [
            {
                ball: { x: 100, y: 300 },
                goal: { x: 700, y: 300 },
                planets: [
                    { x: 400, y: 300, radius: 40, mass: 800, color: '#ff6b6b' }
                ],
                par: 3,
                name: "Simple Orbit"
            },
            {
                ball: { x: 100, y: 500 },
                goal: { x: 700, y: 100 },
                planets: [
                    { x: 300, y: 200, radius: 30, mass: 600, color: '#4ecdc4' },
                    { x: 500, y: 400, radius: 35, mass: 700, color: '#ff9f43' }
                ],
                par: 4,
                name: "Binary System"
            },
            {
                ball: { x: 50, y: 100 },
                goal: { x: 750, y: 500 },
                planets: [
                    { x: 200, y: 300, radius: 50, mass: 1000, color: '#ff6b6b' },
                    { x: 400, y: 150, radius: 25, mass: 400, color: '#feca57' },
                    { x: 600, y: 450, radius: 30, mass: 500, color: '#48dbfb' }
                ],
                par: 5,
                name: "Triple Challenge"
            },
            {
                ball: { x: 400, y: 550 },
                goal: { x: 400, y: 50 },
                planets: [
                    { x: 200, y: 300, radius: 35, mass: 700, color: '#ff9ff3' },
                    { x: 600, y: 300, radius: 35, mass: 700, color: '#54a0ff' },
                    { x: 400, y: 200, radius: 25, mass: 400, color: '#5f27cd' },
                    { x: 400, y: 400, radius: 25, mass: 400, color: '#00d2d3' }
                ],
                par: 4,
                name: "Vertical Gauntlet"
            },
            {
                ball: { x: 100, y: 100 },
                goal: { x: 700, y: 500 },
                planets: [
                    { x: 250, y: 250, radius: 20, mass: 300, color: '#ff7675' },
                    { x: 400, y: 200, radius: 45, mass: 900, color: '#6c5ce7' },
                    { x: 550, y: 350, radius: 30, mass: 500, color: '#a29bfe' },
                    { x: 300, y: 450, radius: 25, mass: 400, color: '#fd79a8' },
                    { x: 600, y: 150, radius: 20, mass: 300, color: '#fdcb6e' }
                ],
                par: 6,
                name: "Asteroid Field"
            }
        ];
    }
    
    setupEventListeners() {
        // Mouse events for aiming
        this.canvas.addEventListener('mousedown', (e) => this.startAim(e));
        this.canvas.addEventListener('mousemove', (e) => this.updateAim(e));
        this.canvas.addEventListener('mouseup', (e) => this.shoot(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startAim(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateAim(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.shoot(e);
        });
        
        // Button events
        document.getElementById('resetBtn').addEventListener('click', () => this.resetLevel());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('replayBtn').addEventListener('click', () => this.replayShot());
        document.getElementById('replayLevel').addEventListener('click', () => this.replayLevelModal());
        document.getElementById('nextLevel').addEventListener('click', () => this.nextLevelModal());
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    startAim(e) {
        if (this.isMoving || this.levelComplete) return;
        
        const pos = this.getMousePos(e);
        const distance = Math.sqrt(
            (pos.x - this.ball.x) ** 2 + (pos.y - this.ball.y) ** 2
        );
        
        if (distance <= 30) {
            this.isAiming = true;
            this.aimStart = { x: this.ball.x, y: this.ball.y };
            this.aimEnd = pos;
        }
    }
    
    updateAim(e) {
        if (!this.isAiming) return;
        
        this.aimEnd = this.getMousePos(e);
        
        const dx = this.aimEnd.x - this.aimStart.x;
        const dy = this.aimEnd.y - this.aimStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.power = Math.min(distance / 20, this.maxPower);
        this.updatePowerMeter();
    }
    
    updatePowerMeter() {
        const percentage = (this.power / this.maxPower) * 100;
        document.getElementById('powerFill').style.height = `${percentage}%`;
        document.getElementById('powerValue').textContent = `${Math.round(percentage)}%`;
    }
    
    shoot(e) {
        if (!this.isAiming) return;
        
        this.isAiming = false;
        this.isMoving = true;
        
        const dx = this.aimStart.x - this.aimEnd.x;
        const dy = this.aimStart.y - this.aimEnd.y;
        const force = this.power * 0.8;
        const angle = Math.atan2(dy, dx);
        
        this.ball.vx = Math.cos(angle) * force;
        this.ball.vy = Math.sin(angle) * force;
        this.ball.trail = [];
        
        this.strokes++;
        this.updateDisplay();
        this.updatePowerMeter();
    }
    
    replayShot() {
        if (this.isMoving) return;
        this.loadLevel(this.currentLevel);
    }
    
    loadLevel(levelIndex) {
        if (levelIndex > this.levels.length) {
            this.showGameComplete();
            return;
        }
        
        const level = this.levels[levelIndex - 1];
        this.ball.x = level.ball.x;
        this.ball.y = level.ball.y;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.trail = [];
        
        this.goal = { ...level.goal, radius: 20 };
        this.planets = [...level.planets];
        this.par = level.par;
        
        this.strokes = 0;
        this.isMoving = false;
        this.levelComplete = false;
        this.isAiming = false;
        
        this.updateDisplay();
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('levelComplete').classList.add('hidden');
    }
    
    updateDisplay() {
        document.getElementById('levelDisplay').textContent = this.currentLevel;
        document.getElementById('strokesDisplay').textContent = this.strokes;
        document.getElementById('parDisplay').textContent = this.par;
    }
    
    update() {
        if (!this.isMoving) return;
        
        // Apply gravity from planets
        for (const planet of this.planets) {
            const dx = planet.x - this.ball.x;
            const dy = planet.y - this.ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < planet.radius + this.ball.radius) {
                // Collision with planet - bounce
                const angle = Math.atan2(dy, dx);
                const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
                
                this.ball.x = planet.x - Math.cos(angle) * (planet.radius + this.ball.radius);
                this.ball.y = planet.y - Math.sin(angle) * (planet.radius + this.ball.radius);
                
                // Reflect velocity
                const normalX = dx / distance;
                const normalY = dy / distance;
                const dotProduct = this.ball.vx * normalX + this.ball.vy * normalY;
                
                this.ball.vx = (this.ball.vx - 2 * dotProduct * normalX) * 0.7;
                this.ball.vy = (this.ball.vy - 2 * dotProduct * normalY) * 0.7;
                
                continue;
            }
            
            // Apply gravitational force
            if (distance > 0) {
                const force = planet.mass / (distance * distance);
                const forceX = (dx / distance) * force * 0.001;
                const forceY = (dy / distance) * force * 0.001;
                
                this.ball.vx += forceX;
                this.ball.vy += forceY;
            }
        }
        
        // Update position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Add to trail
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > 50) {
            this.ball.trail.shift();
        }
        
        // Wall bounces
        if (this.ball.x - this.ball.radius <= 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -0.8;
        }
        if (this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -0.8;
        }
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -0.8;
        }
        if (this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.y = this.canvas.height - this.ball.radius;
            this.ball.vy *= -0.8;
        }
        
        // Check for goal
        const goalDistance = Math.sqrt(
            (this.ball.x - this.goal.x) ** 2 + (this.ball.y - this.goal.y) ** 2
        );
        
        if (goalDistance <= this.goal.radius) {
            this.completeLevel();
            return;
        }
        
        // Stop if velocity is very low
        const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        if (speed < 0.1) {
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.isMoving = false;
        }
    }
    
    completeLevel() {
        this.isMoving = false;
        this.levelComplete = true;
        
        const scoreDiff = this.strokes - this.par;
        let message, status, statusClass;
        
        if (scoreDiff < 0) {
            const under = Math.abs(scoreDiff);
            message = under === 1 ? "Birdie!" : under === 2 ? "Eagle!" : "Amazing!";
            status = `${under} under par`;
            statusClass = "under-par";
        } else if (scoreDiff === 0) {
            message = "Perfect par!";
            status = "At par";
            statusClass = "at-par";
        } else {
            message = "Good effort!";
            status = `${scoreDiff} over par`;
            statusClass = "over-par";
        }
        
        document.getElementById('completionMessage').textContent = message;
        document.getElementById('finalStrokes').textContent = this.strokes;
        document.getElementById('finalPar').textContent = this.par;
        document.getElementById('scoreStatus').textContent = status;
        document.getElementById('scoreStatus').className = `score-status ${statusClass}`;
        
        document.getElementById('levelComplete').classList.remove('hidden');
        
        if (this.currentLevel < this.levels.length) {
            document.getElementById('nextBtn').disabled = false;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw planets
        for (const planet of this.planets) {
            // Planet glow
            const gradient = this.ctx.createRadialGradient(
                planet.x, planet.y, 0,
                planet.x, planet.y, planet.radius * 1.5
            );
            gradient.addColorStop(0, planet.color);
            gradient.addColorStop(0.7, planet.color + '40');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.radius * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Planet body
            this.ctx.fillStyle = planet.color;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Planet highlight
            const highlightGradient = this.ctx.createRadialGradient(
                planet.x - planet.radius * 0.3,
                planet.y - planet.radius * 0.3,
                0,
                planet.x,
                planet.y,
                planet.radius
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            highlightGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = highlightGradient;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw goal
        this.ctx.save();
        this.ctx.shadowColor = '#4a90ff';
        this.ctx.shadowBlur = 20;
        
        // Goal flag pole
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.goal.x, this.goal.y - this.goal.radius);
        this.ctx.lineTo(this.goal.x, this.goal.y + this.goal.radius);
        this.ctx.stroke();
        
        // Goal flag
        this.ctx.fillStyle = '#4a90ff';
        this.ctx.beginPath();
        this.ctx.moveTo(this.goal.x, this.goal.y - this.goal.radius);
        this.ctx.lineTo(this.goal.x + 25, this.goal.y - this.goal.radius + 8);
        this.ctx.lineTo(this.goal.x + 25, this.goal.y - this.goal.radius + 18);
        this.ctx.lineTo(this.goal.x, this.goal.y - this.goal.radius + 12);
        this.ctx.fill();
        
        // Goal area
        this.ctx.strokeStyle = '#4a90ff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(this.goal.x, this.goal.y, this.goal.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.restore();
        
        // Draw ball trail
        if (this.ball.trail.length > 1) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.ball.trail[0].x, this.ball.trail[0].y);
            
            for (let i = 1; i < this.ball.trail.length; i++) {
                const alpha = i / this.ball.trail.length;
                this.ctx.globalAlpha = alpha;
                this.ctx.lineTo(this.ball.trail[i].x, this.ball.trail[i].y);
            }
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
        
        // Draw ball
        this.ctx.save();
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 15;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball highlight
        const ballGradient = this.ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        ballGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        ballGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        
        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Draw aiming line
        if (this.isAiming) {
            this.ctx.strokeStyle = '#4a90ff';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.aimStart.x, this.aimStart.y);
            this.ctx.lineTo(this.aimEnd.x, this.aimEnd.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Power indicator
            this.ctx.fillStyle = '#4a90ff';
            this.ctx.beginPath();
            this.ctx.arc(this.aimEnd.x, this.aimEnd.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    resetLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    nextLevel() {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
    }
    
    replayLevelModal() {
        document.getElementById('levelComplete').classList.add('hidden');
        this.resetLevel();
    }
    
    nextLevelModal() {
        document.getElementById('levelComplete').classList.add('hidden');
        this.nextLevel();
    }
    
    showGameComplete() {
        alert('Congratulations! You\'ve completed all levels!\n\nThanks for playing Gravity Golf!');
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new GravityGolf();
});