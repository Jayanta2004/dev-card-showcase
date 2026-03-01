document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sim-canvas');
    const ctx = canvas.getContext('2d');

    // Telemetry UI
    const statusText = document.getElementById('status-text');
    const sensorLText = document.getElementById('sensor-l');
    const sensorCText = document.getElementById('sensor-c');
    const sensorRText = document.getElementById('sensor-r');

    // Setup Canvas Size
    canvas.width = 800;
    canvas.height = 600;

    let isRunning = false;

    // --- MAZE GENERATION (Wall Segments) ---
    const boundaries = [
        { x1: 0, y1: 0, x2: 800, y2: 0 },
        { x1: 800, y1: 0, x2: 800, y2: 600 },
        { x1: 800, y1: 600, x2: 0, y2: 600 },
        { x1: 0, y1: 600, x2: 0, y2: 0 },
        { x1: 150, y1: 150, x2: 150, y2: 450 },
        { x1: 150, y1: 450, x2: 400, y2: 450 },
        { x1: 400, y1: 150, x2: 650, y2: 150 },
        { x1: 650, y1: 150, x2: 650, y2: 400 }
    ];

    // --- ROVER CLASS ---
    class Rover {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 30;
            this.height = 40;
            this.angle = 0; // Radians
            this.speed = 0;
            this.maxSpeed = 3;
            this.turnSpeed = 0.05;
            this.sensorData = { left: 100, center: 100, right: 100 };
        }

        update() {
            if (!isRunning) return;

            // Simple Autonomous Logic (Obstacle Avoidance)
            this.speed = this.maxSpeed;

            if (this.sensorData.center < 60) {
                this.speed = 0.5; // Slow down
                if (this.sensorData.left > this.sensorData.right) {
                    this.angle -= this.turnSpeed * 2; // Turn Left
                } else {
                    this.angle += this.turnSpeed * 2; // Turn Right
                }
            } else if (this.sensorData.left < 40) {
                this.angle += this.turnSpeed; // Drift Right
            } else if (this.sensorData.right < 40) {
                this.angle -= this.turnSpeed; // Drift Left
            }

            // Kinematics
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Draw Rover Body
            ctx.fillStyle = '#007acc';
            ctx.fillRect(-this.height / 2, -this.width / 2, this.height, this.width);
            
            // Direction Indicator
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.height / 2 - 5, -5, 10, 10);

            ctx.restore();
        }

        // Raycasting for Sensors
        castSensors(boundaries, ctx) {
            const sensorAngles = [
                { id: 'left', offset: -Math.PI / 4 },
                { id: 'center', offset: 0 },
                { id: 'right', offset: Math.PI / 4 }
            ];

            const rayLength = 150;

            sensorAngles.forEach(sensor => {
                const rayAngle = this.angle + sensor.offset;
                const endX = this.x + Math.cos(rayAngle) * rayLength;
                const endY = this.y + Math.sin(rayAngle) * rayLength;

                let closestIntersect = null;
                let minDistance = rayLength;

                boundaries.forEach(wall => {
                    const intersect = getIntersection(
                        this.x, this.y, endX, endY,
                        wall.x1, wall.y1, wall.x2, wall.y2
                    );

                    if (intersect) {
                        const dist = Math.hypot(intersect.x - this.x, intersect.y - this.y);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestIntersect = intersect;
                        }
                    }
                });

                this.sensorData[sensor.id] = minDistance;

                // Draw Rays
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                if (closestIntersect) {
                    ctx.lineTo(closestIntersect.x, closestIntersect.y);
                    ctx.strokeStyle = minDistance < 50 ? '#f44336' : '#ffeb3b';
                } else {
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = '#4caf50';
                }
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Update UI
            sensorLText.innerText = Math.round(this.sensorData.left);
            sensorCText.innerText = Math.round(this.sensorData.center);
            sensorRText.innerText = Math.round(this.sensorData.right);
        }
    }

    // Line-Line Intersection Math
    function getIntersection(A,B,C,D,E,F,G,H) {
        const denominator = (A-C)*(F-H) - (B-D)*(E-G);
        if (denominator === 0) return null;

        const t = ((A-E)*(F-H) - (B-F)*(E-G)) / denominator;
        const u = -((A-C)*(B-F) - (B-D)*(A-E)) / denominator;

        if (t > 0 && t < 1 && u > 0 && u < 1) {
            return {
                x: A + t * (C - A),
                y: B + t * (D - B)
            };
        }
        return null;
    }

    const rover = new Rover(70, 70);

    // --- GAME LOOP ---
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Walls
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        boundaries.forEach(wall => {
            ctx.beginPath();
            ctx.moveTo(wall.x1, wall.y1);
            ctx.lineTo(wall.x2, wall.y2);
            ctx.stroke();
        });

        rover.update();
        rover.castSensors(boundaries, ctx);
        rover.draw(ctx);

        // Keep the loop running continuously
        requestAnimationFrame(animate);
    }

    // --- CONTROLS ---
    document.getElementById('toggle-sim-btn').addEventListener('click', (e) => {
        isRunning = !isRunning;
        e.target.innerText = isRunning ? '⏸ Pause Rover' : '▶ Start Rover';
        statusText.innerText = isRunning ? 'Navigating...' : 'Idle';
        statusText.style.color = isRunning ? '#4caf50' : '#ccc';
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        rover.x = 70;
        rover.y = 70;
        rover.angle = 0;
    });

    
    const guideModal = document.getElementById('guide-modal');
    const guideBtn = document.getElementById('guide-btn');
    const closeBtn = document.querySelector('.close-btn');

    guideBtn.addEventListener('click', () => {
        guideModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        guideModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === guideModal) {
            guideModal.style.display = 'none';
        }
    });

    // Start the engine loop!
    animate(); 
});