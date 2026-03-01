// URBAN FLOW OPTIMIZER - Smart Traffic Harmonizer #6248

class UrbanFlowOptimizer {
    constructor() {
        this.canvas = document.getElementById('trafficCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.intersections = this.initializeIntersections();
        this.vehicles = [];
        this.time = 0;
        this.sensorData = {
            1: { count: 0, speed: 0, history: [] },
            2: { count: 0, speed: 0, history: [] },
            3: { count: 0, speed: 0, history: [] }
        };

        this.bindEvents();
        this.drawStaticMap();
    }

    initializeIntersections() {
        return [
            { id: 1, x: 200, y: 300, signals: { ns: 'green', ew: 'red' }, timing: 'standard' },
            { id: 2, x: 400, y: 300, signals: { ns: 'red', ew: 'green' }, timing: 'standard' },
            { id: 3, x: 600, y: 300, signals: { ns: 'green', ew: 'red' }, timing: 'standard' }
        ];
    }

    bindEvents() {
        document.getElementById('simulateBtn').addEventListener('click', () => {
            this.isRunning ? this.stopSimulation() : this.startSimulation();
        });
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    startSimulation() {
        this.isRunning = true;
        document.getElementById('simulateBtn').textContent = 'Stop Simulation';
        this.animate();
    }

    stopSimulation() {
        this.isRunning = false;
        document.getElementById('simulateBtn').textContent = 'Start Simulation';
    }

    reset() {
        this.stopSimulation();
        this.vehicles = [];
        this.time = 0;
        Object.keys(this.sensorData).forEach(id => {
            this.sensorData[id] = { count: 0, speed: 0, history: [] };
        });
        this.updateUI();
        this.drawStaticMap();
    }

    animate() {
        if (!this.isRunning) return;

        this.time++;
        this.updateTraffic();
        this.updateSensors();
        this.predictCongestion();
        this.recommendSignals();
        this.draw();
        this.updateUI();

        requestAnimationFrame(() => this.animate());
    }

    updateTraffic() {
        // Add new vehicles randomly
        if (Math.random() < 0.1) {
            this.addVehicle();
        }

        // Update existing vehicles
        this.vehicles.forEach(vehicle => {
            vehicle.update();
            if (vehicle.x > this.canvas.width + 50) {
                this.removeVehicle(vehicle);
            }
        });
    }

    addVehicle() {
        const lanes = [250, 350, 450]; // Different lanes
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        this.vehicles.push(new Vehicle(this.canvas.width - 50, lane, Math.random() * 2 + 1));
    }

    removeVehicle(vehicle) {
        const index = this.vehicles.indexOf(vehicle);
        if (index > -1) {
            this.vehicles.splice(index, 1);
        }
    }

    updateSensors() {
        // Reset counts
        Object.keys(this.sensorData).forEach(id => {
            this.sensorData[id].count = 0;
            this.sensorData[id].speed = 0;
        });

        // Count vehicles at each intersection
        this.vehicles.forEach(vehicle => {
            this.intersections.forEach(intersection => {
                if (Math.abs(vehicle.x - intersection.x) < 100 && Math.abs(vehicle.y - intersection.y) < 50) {
                    this.sensorData[intersection.id].count++;
                    this.sensorData[intersection.id].speed += vehicle.speed;
                }
            });
        });

        // Calculate average speed
        Object.keys(this.sensorData).forEach(id => {
            if (this.sensorData[id].count > 0) {
                this.sensorData[id].speed /= this.sensorData[id].count;
            }
            this.sensorData[id].history.push({
                time: this.time,
                count: this.sensorData[id].count,
                speed: this.sensorData[id].speed
            });
            // Keep only last 100 readings
            if (this.sensorData[id].history.length > 100) {
                this.sensorData[id].history.shift();
            }
        });
    }

    predictCongestion() {
        // Simple prediction based on recent trends
        const predictions = {};

        Object.keys(this.sensorData).forEach(id => {
            const history = this.sensorData[id].history;
            if (history.length < 10) return;

            const recent = history.slice(-10);
            const trend = recent.reduce((acc, curr, i) => {
                if (i === 0) return acc;
                return acc + (curr.count - recent[i-1].count);
            }, 0) / 9;

            predictions[id] = {
                '30min': Math.max(0, recent[recent.length-1].count + trend * 30),
                '60min': Math.max(0, recent[recent.length-1].count + trend * 60)
            };
        });

        // Update predictions display
        const total30 = Object.values(predictions).reduce((sum, p) => sum + (p['30min'] || 0), 0);
        const total60 = Object.values(predictions).reduce((sum, p) => sum + (p['60min'] || 0), 0);

        document.getElementById('prediction-30').textContent =
            total30 > 15 ? 'High congestion expected' :
            total30 > 8 ? 'Moderate congestion expected' : 'Light traffic expected';

        document.getElementById('prediction-60').textContent =
            total60 > 20 ? 'Severe congestion expected' :
            total60 > 12 ? 'High congestion expected' : 'Manageable traffic expected';

        // Calculate peak time (simplified)
        const currentHour = (new Date().getHours() + Math.floor(this.time / 60)) % 24;
        document.getElementById('peak-time').textContent = `${currentHour + 1}:00 - ${currentHour + 2}:00`;
    }

    recommendSignals() {
        this.intersections.forEach(intersection => {
            const data = this.sensorData[intersection.id];
            let recommendation = 'Standard';

            if (data.count > 10) {
                recommendation = 'Extended Green';
            } else if (data.count > 5) {
                recommendation = 'Optimized';
            } else if (data.count < 2) {
                recommendation = 'Quick Cycle';
            }

            intersection.timing = recommendation;
        });

        // Update rerouting advice
        const totalCongestion = Object.values(this.sensorData).reduce((sum, data) => sum + data.count, 0);
        const rerouteElement = document.getElementById('reroute-advice');
        if (totalCongestion > 20) {
            rerouteElement.textContent = 'Recommend alternative routes for vehicles approaching from north.';
        } else if (totalCongestion > 10) {
            rerouteElement.textContent = 'Monitor traffic flow, prepare contingency routes.';
        } else {
            rerouteElement.textContent = 'No rerouting needed at this time.';
        }
    }

    drawStaticMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw roads
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 40;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 300);
        this.ctx.lineTo(this.canvas.width, 300);
        this.ctx.stroke();

        // Draw lane dividers
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 280);
        this.ctx.lineTo(this.canvas.width, 280);
        this.ctx.moveTo(0, 320);
        this.ctx.lineTo(this.canvas.width, 320);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw intersections
        this.intersections.forEach(intersection => {
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(intersection.x - 20, intersection.y - 20, 40, 40);

            // Draw signals
            this.drawSignals(intersection);
        });
    }

    drawSignals(intersection) {
        const signalSize = 15;
        const offset = 25;

        // North-South signal
        this.ctx.fillStyle = intersection.signals.ns === 'green' ? '#0f0' : '#f00';
        this.ctx.fillRect(intersection.x - offset, intersection.y - offset, signalSize, signalSize);

        // East-West signal
        this.ctx.fillStyle = intersection.signals.ew === 'green' ? '#0f0' : '#f00';
        this.ctx.fillRect(intersection.x + offset - signalSize, intersection.y + offset - signalSize, signalSize, signalSize);
    }

    draw() {
        this.drawStaticMap();

        // Draw vehicles
        this.vehicles.forEach(vehicle => {
            vehicle.draw(this.ctx);
        });
    }

    updateUI() {
        // Update sensor displays
        Object.keys(this.sensorData).forEach(id => {
            document.getElementById(`count-${id}`).textContent = this.sensorData[id].count;
            document.getElementById(`speed-${id}`).textContent = Math.round(this.sensorData[id].speed * 10);
        });

        // Update signal recommendations
        const timingElements = ['timing-a', 'timing-b', 'timing-c'];
        this.intersections.forEach((intersection, index) => {
            document.getElementById(timingElements[index]).textContent = intersection.timing;
        });
    }
}

class Vehicle {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = 20;
        this.height = 10;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new UrbanFlowOptimizer();
});