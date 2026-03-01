// Predictive Maintenance Scheduler - JavaScript Implementation

class PredictiveMaintenanceScheduler {
    constructor() {
        this.equipment = this.initializeEquipment();
        this.predictionHistory = [];
        this.maintenanceSchedule = [];
        this.isRunning = false;

        this.initializeElements();
        this.bindEvents();
        this.initializeCharts();
        this.startMonitoring();
        this.updateUI();
    }

    initializeEquipment() {
        return {
            'pump-1': {
                name: 'Centrifugal Pump A1',
                type: 'pump',
                sensors: {
                    vibration: { current: 2.1, normal: [1.8, 2.5], critical: [4.0, 6.0] },
                    temperature: { current: 68, normal: [60, 75], critical: [85, 95] }
                },
                failureHistory: [
                    { date: '2024-01-15', type: 'bearing_failure', cost: 3200 },
                    { date: '2024-06-22', type: 'seal_leak', cost: 1800 }
                ],
                maintenanceCost: 1200,
                failureCost: 8500,
                status: 'healthy'
            },
            'motor-1': {
                name: 'Induction Motor M2',
                type: 'motor',
                sensors: {
                    current: { current: 18.5, normal: [16, 22], critical: [25, 30] },
                    rpm: { current: 1780, normal: [1750, 1800], critical: [1680, 1820] }
                },
                failureHistory: [
                    { date: '2024-03-10', type: 'winding_failure', cost: 4500 },
                    { date: '2024-08-05', type: 'bearing_wear', cost: 2200 }
                ],
                maintenanceCost: 800,
                failureCost: 6200,
                status: 'warning'
            },
            'conveyor-1': {
                name: 'Conveyor Belt C3',
                type: 'conveyor',
                sensors: {
                    tension: { current: 85, normal: [80, 95], critical: [70, 75] },
                    speed: { current: 2.1, normal: [1.8, 2.3], critical: [1.5, 2.5] }
                },
                failureHistory: [
                    { date: '2024-02-28', type: 'belt_breakage', cost: 3800 },
                    { date: '2024-07-14', type: 'motor_burnout', cost: 5200 },
                    { date: '2024-11-08', type: 'tension_failure', cost: 2900 }
                ],
                maintenanceCost: 650,
                failureCost: 4800,
                status: 'critical'
            },
            'server-1': {
                name: 'Database Server S4',
                type: 'server',
                sensors: {
                    cpu: { current: 45, normal: [20, 70], critical: [80, 100] },
                    memory: { current: 6.2, normal: [2, 12], critical: [14, 16] }
                },
                failureHistory: [
                    { date: '2024-04-18', type: 'disk_failure', cost: 1200 }
                ],
                maintenanceCost: 300,
                failureCost: 3500,
                status: 'healthy'
            }
        };
    }

    initializeElements() {
        // Equipment monitoring elements
        this.equipmentCards = document.querySelectorAll('.equipment-card');

        // Prediction elements
        this.predictionModelSelect = document.getElementById('predictionModel');
        this.timeHorizonSelect = document.getElementById('timeHorizon');
        this.runPredictionBtn = document.getElementById('runPrediction');
        this.predictionInsights = document.getElementById('predictionInsights');

        // Scheduling elements
        this.optimizationModeSelect = document.getElementById('optimizationMode');
        this.maintenanceBudgetInput = document.getElementById('maintenanceBudget');
        this.optimizeScheduleBtn = document.getElementById('optimizeSchedule');
        this.maintenanceTimeline = document.getElementById('maintenanceTimeline');

        // Cost analysis elements
        this.preventiveCostEl = document.getElementById('preventiveCost');
        this.reactiveCostEl = document.getElementById('reactiveCost');
        this.downtimeCostEl = document.getElementById('downtimeCost');
        this.totalPreventiveCostEl = document.getElementById('totalPreventiveCost');
        this.totalReactiveCostEl = document.getElementById('totalReactiveCost');
        this.projectedSavingsEl = document.getElementById('projectedSavings');
        this.roiValueEl = document.getElementById('roiValue');

        // Charts
        this.predictionChartCanvas = document.getElementById('predictionChart');
    }

    bindEvents() {
        this.runPredictionBtn.addEventListener('click', () => this.runPrediction());
        this.optimizeScheduleBtn.addEventListener('click', () => this.optimizeSchedule());
    }

    initializeCharts() {
        // Prediction chart
        this.predictionChart = new Chart(this.predictionChartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Pump A1 Failure Risk',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Motor M2 Failure Risk',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Conveyor C3 Failure Risk',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Server S4 Failure Risk',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Failure Risk (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Days Ahead'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateSensorData();
            this.updateUI();
        }, 2000); // Update every 2 seconds
    }

    updateSensorData() {
        Object.keys(this.equipment).forEach(equipmentId => {
            const equipment = this.equipment[equipmentId];

            // Simulate sensor data changes
            Object.keys(equipment.sensors).forEach(sensorKey => {
                const sensor = equipment.sensors[sensorKey];
                const variation = (Math.random() - 0.5) * 0.1; // Small random variation
                sensor.current = Math.max(0, sensor.current * (1 + variation));

                // Keep within reasonable bounds
                if (sensorKey === 'rpm') {
                    sensor.current = Math.max(1600, Math.min(1900, sensor.current));
                } else if (sensorKey === 'tension') {
                    sensor.current = Math.max(60, Math.min(100, sensor.current));
                }
            });

            // Update failure risk based on sensor data
            this.updateFailureRisk(equipmentId);
        });
    }

    updateFailureRisk(equipmentId) {
        const equipment = this.equipment[equipmentId];
        let totalRisk = 0;
        let sensorCount = 0;

        Object.values(equipment.sensors).forEach(sensor => {
            const normalRange = sensor.normal[1] - sensor.normal[0];
            const currentDeviation = Math.abs(sensor.current - ((sensor.normal[0] + sensor.normal[1]) / 2));

            // Calculate risk based on deviation from normal range
            let sensorRisk = (currentDeviation / (normalRange / 2)) * 50; // Max 50% from this sensor

            // Additional risk if in critical range
            if (sensor.current < sensor.critical[0] || sensor.current > sensor.critical[1]) {
                sensorRisk += 30;
            }

            totalRisk += sensorRisk;
            sensorCount++;
        });

        // Factor in historical failure patterns
        const failureFrequency = equipment.failureHistory.length;
        const historicalRisk = Math.min(failureFrequency * 10, 20); // Max 20% from history

        equipment.failureRisk = Math.min(100, (totalRisk / sensorCount) + historicalRisk);

        // Update status based on risk
        if (equipment.failureRisk < 25) {
            equipment.status = 'healthy';
        } else if (equipment.failureRisk < 60) {
            equipment.status = 'warning';
        } else {
            equipment.status = 'critical';
        }
    }

    runPrediction() {
        const model = this.predictionModelSelect.value;
        const horizon = parseInt(this.timeHorizonSelect.value);

        this.runPredictionBtn.disabled = true;
        this.runPredictionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        setTimeout(() => {
            this.generatePredictions(model, horizon);
            this.updatePredictionChart(horizon);
            this.updatePredictionInsights();
            this.runPredictionBtn.disabled = false;
            this.runPredictionBtn.innerHTML = '<i class="fas fa-brain"></i> Run Prediction';
        }, 2000);
    }

    generatePredictions(model, horizon) {
        this.predictionHistory = [];

        for (let day = 0; day <= horizon; day++) {
            const prediction = {
                day: day,
                equipment: {}
            };

            Object.keys(this.equipment).forEach(equipmentId => {
                const equipment = this.equipment[equipmentId];
                let predictedRisk = equipment.failureRisk;

                // Different prediction models
                switch (model) {
                    case 'statistical':
                        // Simple trend-based prediction
                        predictedRisk = this.predictStatistical(equipment, day);
                        break;
                    case 'machine-learning':
                        // ML-based prediction with more complexity
                        predictedRisk = this.predictML(equipment, day);
                        break;
                    case 'hybrid':
                        // Combination of statistical and ML approaches
                        predictedRisk = this.predictHybrid(equipment, day);
                        break;
                }

                prediction.equipment[equipmentId] = Math.min(100, Math.max(0, predictedRisk));
            });

            this.predictionHistory.push(prediction);
        }
    }

    predictStatistical(equipment, daysAhead) {
        // Simple linear trend based on current risk and historical patterns
        const baseRisk = equipment.failureRisk;
        const trend = this.calculateRiskTrend(equipment);
        const seasonalFactor = Math.sin(daysAhead * 0.1) * 5; // Seasonal variation

        return baseRisk + (trend * daysAhead) + seasonalFactor;
    }

    predictML(equipment, daysAhead) {
        // More sophisticated prediction with multiple factors
        const baseRisk = equipment.failureRisk;
        const sensorDeviations = this.calculateSensorDeviations(equipment);
        const historicalPatterns = this.analyzeHistoricalPatterns(equipment);
        const timeFactor = Math.pow(daysAhead, 0.3); // Diminishing risk over time

        return baseRisk * (1 + sensorDeviations) * (1 + historicalPatterns) * timeFactor;
    }

    predictHybrid(equipment, daysAhead) {
        // Combine statistical and ML approaches
        const statistical = this.predictStatistical(equipment, daysAhead);
        const ml = this.predictML(equipment, daysAhead);

        // Weighted average favoring ML for short-term, statistical for long-term
        const weight = Math.max(0.3, 1 - (daysAhead / 90)); // ML weight decreases over time
        return (statistical * (1 - weight)) + (ml * weight);
    }

    calculateRiskTrend(equipment) {
        // Calculate trend based on recent sensor changes
        // Simplified implementation
        return (Math.random() - 0.5) * 0.1; // Small random trend
    }

    calculateSensorDeviations(equipment) {
        let totalDeviation = 0;
        let sensorCount = 0;

        Object.values(equipment.sensors).forEach(sensor => {
            const center = (sensor.normal[0] + sensor.normal[1]) / 2;
            const deviation = Math.abs(sensor.current - center) / center;
            totalDeviation += deviation;
            sensorCount++;
        });

        return totalDeviation / sensorCount;
    }

    analyzeHistoricalPatterns(equipment) {
        // Analyze failure patterns
        const failureCount = equipment.failureHistory.length;
        const timeSpan = 365; // days in a year
        const failureRate = failureCount / timeSpan;

        return Math.min(failureRate * 10, 0.5); // Max 50% additional risk
    }

    updatePredictionChart(horizon) {
        const labels = [];
        const datasets = [[], [], [], []]; // One for each equipment

        this.predictionHistory.forEach(prediction => {
            labels.push(prediction.day === 0 ? 'Today' : `Day ${prediction.day}`);
            datasets[0].push(prediction.equipment['pump-1']);
            datasets[1].push(prediction.equipment['motor-1']);
            datasets[2].push(prediction.equipment['conveyor-1']);
            datasets[3].push(prediction.equipment['server-1']);
        });

        this.predictionChart.data.labels = labels;
        this.predictionChart.data.datasets.forEach((dataset, index) => {
            dataset.data = datasets[index];
        });
        this.predictionChart.update();
    }

    updatePredictionInsights() {
        const insights = [];

        // Analyze predictions for key insights
        const todayPredictions = this.predictionHistory[0];
        const weekPredictions = this.predictionHistory.find(p => p.day === 7) || this.predictionHistory[this.predictionHistory.length - 1];

        Object.keys(todayPredictions.equipment).forEach(equipmentId => {
            const equipment = this.equipment[equipmentId];
            const currentRisk = todayPredictions.equipment[equipmentId];
            const futureRisk = weekPredictions.equipment[equipmentId];

            if (currentRisk > 70) {
                insights.push({
                    type: 'critical',
                    message: `${equipment.name} shows critical failure risk (${Math.round(currentRisk)}%)`,
                    icon: 'exclamation-triangle'
                });
            } else if (futureRisk > currentRisk + 20) {
                insights.push({
                    type: 'warning',
                    message: `${equipment.name} risk increasing rapidly`,
                    icon: 'chart-line'
                });
            } else if (currentRisk < 20) {
                insights.push({
                    type: 'success',
                    message: `${equipment.name} operating within normal parameters`,
                    icon: 'check-circle'
                });
            }
        });

        // Sort by priority
        insights.sort((a, b) => {
            const priority = { critical: 3, warning: 2, success: 1 };
            return priority[b.type] - priority[a.type];
        });

        this.predictionInsights.innerHTML = insights.slice(0, 5).map(insight => `
            <div class="insight-item">
                <i class="fas fa-${insight.icon}"></i>
                <span>${insight.message}</span>
            </div>
        `).join('');
    }

    optimizeSchedule() {
        const mode = this.optimizationModeSelect.value;
        const budget = parseInt(this.maintenanceBudgetInput.value);

        this.optimizeScheduleBtn.disabled = true;
        this.optimizeScheduleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';

        setTimeout(() => {
            this.generateOptimizedSchedule(mode, budget);
            this.updateScheduleDisplay();
            this.updateCostAnalysis();
            this.optimizeScheduleBtn.disabled = false;
            this.optimizeScheduleBtn.innerHTML = '<i class="fas fa-magic"></i> Optimize Schedule';
        }, 1500);
    }

    generateOptimizedSchedule(mode, budget) {
        this.maintenanceSchedule = [];
        let remainingBudget = budget;

        // Sort equipment by priority based on optimization mode
        const equipmentList = Object.keys(this.equipment).map(id => ({
            id,
            ...this.equipment[id]
        }));

        equipmentList.sort((a, b) => {
            switch (mode) {
                case 'cost':
                    return a.maintenanceCost - b.maintenanceCost;
                case 'risk':
                    return b.failureRisk - a.failureRisk;
                case 'balanced':
                    return (b.failureRisk * 0.7) - (a.maintenanceCost * 0.3) -
                           ((a.failureRisk * 0.7) - (b.maintenanceCost * 0.3));
                default:
                    return 0;
            }
        });

        // Schedule maintenance within budget
        equipmentList.forEach(equipment => {
            if (remainingBudget >= equipment.maintenanceCost) {
                const scheduleDate = this.calculateOptimalDate(equipment, mode);
                this.maintenanceSchedule.push({
                    equipment: equipment.id,
                    name: equipment.name,
                    date: scheduleDate,
                    cost: equipment.maintenanceCost,
                    riskReduction: Math.min(80, equipment.failureRisk * 0.8),
                    type: equipment.status === 'critical' ? 'urgent' : 'scheduled'
                });
                remainingBudget -= equipment.maintenanceCost;
            }
        });
    }

    calculateOptimalDate(equipment, mode) {
        const baseDays = equipment.status === 'critical' ? 0 :
                        equipment.status === 'warning' ? 7 : 30;

        switch (mode) {
            case 'cost':
                return baseDays + Math.floor(Math.random() * 14); // Spread out for cost optimization
            case 'risk':
                return Math.max(0, baseDays - Math.floor(equipment.failureRisk / 10)); // Earlier for high risk
            case 'balanced':
                return baseDays + Math.floor(Math.random() * 7); // Moderate spreading
            default:
                return baseDays;
        }
    }

    updateScheduleDisplay() {
        this.maintenanceTimeline.innerHTML = this.maintenanceSchedule.map(item => `
            <div class="timeline-item ${item.type}">
                <div class="timeline-date">${this.formatScheduleDate(item.date)}</div>
                <div class="timeline-content">
                    <strong>${item.name} - ${item.type === 'urgent' ? 'Emergency' : 'Preventive'} Maintenance</strong>
                    <p>Risk reduction: ${Math.round(item.riskReduction)}% | Cost savings: $${Math.round(item.riskReduction * item.cost / 10)}</p>
                    <span class="cost">$${item.cost.toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }

    formatScheduleDate(days) {
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days < 7) return `Day ${days}`;
        if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
        return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
    }

    updateCostAnalysis() {
        const preventiveCosts = this.maintenanceSchedule.reduce((sum, item) => sum + item.cost, 0);
        const reactiveCosts = Object.values(this.equipment).reduce((sum, eq) => sum + eq.failureCost, 0);
        const downtimeCosts = reactiveCosts * 1.5; // Estimated downtime costs

        this.preventiveCostEl.textContent = `$${preventiveCosts.toLocaleString()}`;
        this.reactiveCostEl.textContent = `$${reactiveCosts.toLocaleString()}`;
        this.downtimeCostEl.textContent = `$${downtimeCosts.toLocaleString()}`;

        const totalPreventive = preventiveCosts;
        const totalReactive = reactiveCosts + downtimeCosts;

        this.totalPreventiveCostEl.textContent = `$${totalPreventive.toLocaleString()}`;
        this.totalReactiveCostEl.textContent = `$${totalReactive.toLocaleString()}`;

        const savings = totalReactive - totalPreventive;
        this.projectedSavingsEl.textContent = `$${savings.toLocaleString()}`;

        const roi = totalReactive > 0 ? ((savings / totalPreventive) * 100) : 0;
        this.roiValueEl.textContent = `${Math.round(roi)}%`;
    }

    updateUI() {
        // Update equipment cards
        this.equipmentCards.forEach(card => {
            const equipmentId = card.dataset.equipment;
            const equipment = this.equipment[equipmentId];

            if (!equipment) return;

            // Update status indicator
            const statusIndicator = card.querySelector('.status-indicator');
            statusIndicator.className = `status-indicator status-${equipment.status}`;

            // Update sensor values
            Object.keys(equipment.sensors).forEach(sensorKey => {
                const sensor = equipment.sensors[sensorKey];
                const element = card.querySelector(`#${equipmentId.replace('-', '')}-${sensorKey}`);

                if (element) {
                    let value = sensor.current;
                    let unit = '';

                    // Format values with appropriate units
                    switch (sensorKey) {
                        case 'vibration':
                            unit = ' mm/s';
                            value = value.toFixed(1);
                            break;
                        case 'temperature':
                            unit = '°C';
                            value = Math.round(value);
                            break;
                        case 'current':
                            unit = ' A';
                            value = value.toFixed(1);
                            break;
                        case 'rpm':
                            value = Math.round(value);
                            break;
                        case 'tension':
                            unit = '%';
                            value = Math.round(value);
                            break;
                        case 'speed':
                            unit = ' m/s';
                            value = value.toFixed(1);
                            break;
                        case 'cpu':
                            unit = '%';
                            value = Math.round(value);
                            break;
                        case 'memory':
                            unit = ' GB';
                            value = value.toFixed(1);
                            break;
                    }

                    element.textContent = value + unit;
                }
            });

            // Update failure risk
            const riskElement = card.querySelector(`#${equipmentId.replace('-', '')}-risk`);
            if (riskElement) {
                const risk = Math.round(equipment.failureRisk);
                riskElement.textContent = `${risk}%`;
                riskElement.className = risk < 25 ? 'risk-low' :
                                      risk < 60 ? 'risk-medium' : 'risk-high';
            }

            // Add critical animation
            card.classList.toggle('critical', equipment.status === 'critical');
        });
    }
}

// Initialize Chart.js library if not already loaded
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
        // Initialize the scheduler after Chart.js loads
        document.addEventListener('DOMContentLoaded', () => {
            new PredictiveMaintenanceScheduler();
        });
    };
    document.head.appendChild(script);
} else {
    // Chart.js already loaded
    document.addEventListener('DOMContentLoaded', () => {
        new PredictiveMaintenanceScheduler();
    });
}