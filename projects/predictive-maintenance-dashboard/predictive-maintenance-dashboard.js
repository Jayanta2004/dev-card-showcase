// Predictive Maintenance Dashboard JavaScript #5003

class PredictiveMaintenanceDashboard {
    constructor() {
        this.equipment = [];
        this.sensors = [];
        this.maintenance = [];
        this.alerts = [];
        this.reports = [];
        this.predictionModels = [];
        this.currentSection = 'dashboard';
        this.charts = {};
        this.intervals = {};

        this.initializeData();
        this.initializeEventListeners();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.loadFromStorage();
    }

    // Initialize sample data
    initializeData() {
        // Sample Equipment
        this.equipment = [
            {
                id: 'eq-001',
                name: 'Pump Station A1',
                type: 'pump',
                location: 'factory-a',
                model: 'XYZ-2000',
                installDate: '2020-03-15',
                expectedLifespan: 10,
                health: 87,
                status: 'healthy',
                lastMaintenance: '2024-01-15',
                sensors: ['temp-001', 'vib-001', 'press-001']
            },
            {
                id: 'eq-002',
                name: 'Conveyor Belt B2',
                type: 'conveyor',
                location: 'factory-b',
                model: 'ABC-1500',
                installDate: '2019-08-22',
                expectedLifespan: 8,
                health: 45,
                status: 'warning',
                lastMaintenance: '2023-11-10',
                sensors: ['temp-002', 'vib-002']
            },
            {
                id: 'eq-003',
                name: 'Motor Assembly C1',
                type: 'motor',
                location: 'warehouse-1',
                model: 'MTR-5000',
                installDate: '2021-01-10',
                expectedLifespan: 12,
                health: 23,
                status: 'critical',
                lastMaintenance: '2023-09-05',
                sensors: ['temp-003', 'curr-003', 'vib-003']
            }
        ];

        // Sample Sensors
        this.sensors = [
            { id: 'temp-001', type: 'temperature', equipmentId: 'eq-001', value: 68.5, unit: '°C', status: 'active' },
            { id: 'vib-001', type: 'vibration', equipmentId: 'eq-001', value: 2.1, unit: 'mm/s', status: 'active' },
            { id: 'press-001', type: 'pressure', equipmentId: 'eq-001', value: 45.2, unit: 'PSI', status: 'active' },
            { id: 'temp-002', type: 'temperature', equipmentId: 'eq-002', value: 75.8, unit: '°C', status: 'active' },
            { id: 'vib-002', type: 'vibration', equipmentId: 'eq-002', value: 4.5, unit: 'mm/s', status: 'faulty' },
            { id: 'temp-003', type: 'temperature', equipmentId: 'eq-003', value: 82.3, unit: '°C', status: 'active' },
            { id: 'curr-003', type: 'current', equipmentId: 'eq-003', value: 15.7, unit: 'A', status: 'active' },
            { id: 'vib-003', type: 'vibration', equipmentId: 'eq-003', value: 6.8, unit: 'mm/s', status: 'active' }
        ];

        // Sample Maintenance
        this.maintenance = [
            {
                id: 'maint-001',
                equipmentId: 'eq-002',
                type: 'preventive',
                priority: 'high',
                scheduledDate: '2026-02-28T10:00',
                estimatedDuration: 4,
                technician: 'John Smith',
                description: 'Regular maintenance and vibration analysis',
                status: 'scheduled'
            },
            {
                id: 'maint-002',
                equipmentId: 'eq-003',
                type: 'corrective',
                priority: 'critical',
                scheduledDate: '2026-02-25T14:00',
                estimatedDuration: 8,
                technician: 'Sarah Johnson',
                description: 'Emergency repair of motor bearings',
                status: 'scheduled'
            }
        ];

        // Sample Alerts
        this.alerts = [
            {
                id: 'alert-001',
                equipmentId: 'eq-002',
                type: 'warning',
                severity: 'warning',
                message: 'High vibration detected on Conveyor Belt B2',
                timestamp: '2026-02-23T08:30:00',
                acknowledged: false,
                resolved: false
            },
            {
                id: 'alert-002',
                equipmentId: 'eq-003',
                type: 'critical',
                severity: 'critical',
                message: 'Critical temperature threshold exceeded on Motor Assembly C1',
                timestamp: '2026-02-23T07:15:00',
                acknowledged: true,
                resolved: false
            }
        ];

        // Sample Prediction Models
        this.predictionModels = [
            {
                id: 'model-001',
                name: 'Pump Failure Prediction',
                type: 'regression',
                accuracy: 94.2,
                lastTrained: '2026-02-20T15:30:00',
                features: ['temperature', 'vibration', 'pressure', 'runtime']
            },
            {
                id: 'model-002',
                name: 'Motor Degradation Model',
                type: 'classification',
                accuracy: 89.7,
                lastTrained: '2026-02-19T12:00:00',
                features: ['temperature', 'current', 'vibration', 'torque']
            }
        ];
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.closest('.nav-link').getAttribute('href').substring(1));
            });
        });

        // Dashboard actions
        document.getElementById('refreshDashboardBtn')?.addEventListener('click', () => this.refreshDashboard());
        document.getElementById('exportDashboardBtn')?.addEventListener('click', () => this.exportDashboard());

        // Equipment actions
        document.getElementById('addEquipmentBtn')?.addEventListener('click', () => this.showAddEquipmentModal());
        document.getElementById('applyFiltersBtn')?.addEventListener('click', () => this.applyEquipmentFilters());

        // Maintenance actions
        document.getElementById('scheduleMaintenanceBtn')?.addEventListener('click', () => this.showScheduleMaintenanceModal());
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => this.changeCalendarMonth(-1));
        document.getElementById('nextMonthBtn')?.addEventListener('click', () => this.changeCalendarMonth(1));

        // Analytics actions
        document.getElementById('runPredictionBtn')?.addEventListener('click', () => this.runPrediction());

        // Alert actions
        document.getElementById('acknowledgeAllBtn')?.addEventListener('click', () => this.acknowledgeAllAlerts());

        // Report actions
        document.getElementById('generateReportBtn')?.addEventListener('click', () => this.generateReport());

        // Settings actions
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => this.resetSettings());

        // Modal actions
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });

        document.getElementById('confirmAddEquipmentBtn')?.addEventListener('click', () => this.addEquipment());
        document.getElementById('confirmScheduleBtn')?.addEventListener('click', () => this.scheduleMaintenance());
        document.getElementById('alertOkBtn')?.addEventListener('click', () => this.closeModal());

        // Emergency shutdown
        document.getElementById('emergencyShutdownBtn')?.addEventListener('click', () => this.emergencyShutdown());

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    // Initialize charts
    initializeCharts() {
        this.initializeHealthTrendsChart();
        this.initializeFailurePredictionsChart();
        this.initializeLifespanChart();
        this.initializeCostBenefitChart();
        this.initializeFailureProbabilityChart();
    }

    initializeHealthTrendsChart() {
        const ctx = document.getElementById('healthTrendsChart')?.getContext('2d');
        if (!ctx) return;

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Overall Health',
                data: [82, 85, 83, 87, 89, 87],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }, {
                label: 'Critical Equipment',
                data: [75, 78, 76, 79, 81, 78],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }]
        };

        this.charts.healthTrends = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: false, min: 0, max: 100 }
                }
            }
        });
    }

    initializeFailurePredictionsChart() {
        const ctx = document.getElementById('failurePredictionsChart')?.getContext('2d');
        if (!ctx) return;

        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Predicted Failures',
                data: [2, 3, 1, 4],
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: '#f59e0b',
                borderWidth: 1
            }]
        };

        this.charts.failurePredictions = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    initializeLifespanChart() {
        const ctx = document.getElementById('lifespanChart')?.getContext('2d');
        if (!ctx) return;

        const data = {
            labels: ['Pumps', 'Motors', 'Conveyors', 'Compressors', 'Generators'],
            datasets: [{
                label: 'Current Lifespan',
                data: [7.2, 4.8, 5.1, 6.3, 8.9],
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                borderColor: '#2563eb',
                borderWidth: 1
            }, {
                label: 'Expected Lifespan',
                data: [10, 12, 8, 15, 20],
                backgroundColor: 'rgba(156, 163, 175, 0.8)',
                borderColor: '#6b7280',
                borderWidth: 1
            }]
        };

        this.charts.lifespan = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    initializeCostBenefitChart() {
        const ctx = document.getElementById('costBenefitChart')?.getContext('2d');
        if (!ctx) return;

        const data = {
            labels: ['Preventive', 'Predictive', 'Corrective'],
            datasets: [{
                label: 'Cost ($)',
                data: [45000, 32000, 125000],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 1
            }]
        };

        this.charts.costBenefit = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    initializeFailureProbabilityChart() {
        const ctx = document.getElementById('failureProbabilityChart')?.getContext('2d');
        if (!ctx) return;

        const data = {
            labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
            datasets: [{
                label: 'Failure Probability',
                data: Array.from({length: 30}, () => Math.random() * 100),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        this.charts.failureProbability = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

    // Navigation
    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionId;

        // Load section data
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'equipment':
                this.loadEquipmentData();
                break;
            case 'maintenance':
                this.loadMaintenanceData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'sensors':
                this.loadSensorsData();
                break;
            case 'alerts':
                this.loadAlertsData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
        }
    }

    // Dashboard functions
    loadDashboardData() {
        this.updateMetrics();
        this.updateCriticalEquipment();
        this.updateActivityList();
    }

    updateMetrics() {
        const healthyCount = this.equipment.filter(eq => eq.status === 'healthy').length;
        const warningCount = this.equipment.filter(eq => eq.status === 'warning').length;
        const criticalCount = this.equipment.filter(eq => eq.status === 'critical').length;

        // Calculate overall health
        const totalHealth = this.equipment.reduce((sum, eq) => sum + eq.health, 0);
        const avgHealth = Math.round(totalHealth / this.equipment.length);

        document.getElementById('equipmentHealthValue').textContent = `${avgHealth}%`;
        document.getElementById('activeAlertsValue').textContent = this.alerts.filter(a => !a.resolved).length;
        document.getElementById('mtbfValue').textContent = '1,247h';
        document.getElementById('maintenanceCostValue').textContent = '$45.2K';
        document.getElementById('downtimeValue').textContent = '2.3h';
        document.getElementById('predictionsValue').textContent = '98.7%';
    }

    updateCriticalEquipment() {
        const criticalList = document.getElementById('criticalEquipmentList');
        if (!criticalList) return;

        const criticalEquipment = this.equipment.filter(eq => eq.status === 'critical' || eq.status === 'warning');

        criticalList.innerHTML = criticalEquipment.map(eq => `
            <div class="equipment-status-item ${eq.status}">
                <div>
                    <h4>${eq.name}</h4>
                    <p>Health: ${eq.health}% • ${eq.location} • ${eq.type}</p>
                </div>
                <div class="health-score">${eq.health}%</div>
            </div>
        `).join('');
    }

    updateActivityList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [
            { icon: 'fas fa-exclamation-triangle', title: 'Critical Alert', desc: 'Motor Assembly C1 temperature exceeded threshold', time: '2 min ago' },
            { icon: 'fas fa-wrench', title: 'Maintenance Scheduled', desc: 'Preventive maintenance for Pump Station A1', time: '15 min ago' },
            { icon: 'fas fa-brain', title: 'Prediction Updated', desc: 'New failure prediction model trained', time: '1 hour ago' },
            { icon: 'fas fa-check-circle', title: 'Maintenance Completed', desc: 'Conveyor Belt B2 lubrication completed', time: '2 hours ago' }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="${activity.icon}"></i>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.desc}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    // Equipment functions
    loadEquipmentData() {
        this.renderEquipmentGrid();
        this.updateEquipmentStats();
    }

    renderEquipmentGrid() {
        const grid = document.getElementById('equipmentGrid');
        if (!grid) return;

        grid.innerHTML = this.equipment.map(eq => `
            <div class="equipment-card">
                <div class="equipment-header">
                    <div>
                        <h3>${eq.name}</h3>
                        <p>${eq.model} • ${eq.location}</p>
                    </div>
                </div>
                <div class="equipment-body">
                    <div class="equipment-metrics">
                        <div class="equipment-metric">
                            <div class="value">${eq.health}%</div>
                            <div class="label">Health</div>
                        </div>
                        <div class="equipment-metric">
                            <div class="value">${Math.round((new Date() - new Date(eq.lastMaintenance)) / (1000 * 60 * 60 * 24))}</div>
                            <div class="label">Days Since Maint</div>
                        </div>
                    </div>
                    <div class="equipment-status">
                        <div class="status ${eq.status}">
                            <i class="fas fa-circle"></i>
                            ${eq.status.charAt(0).toUpperCase() + eq.status.slice(1)}
                        </div>
                        <div class="equipment-actions">
                            <button class="btn" onclick="dashboard.viewEquipment('${eq.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn" onclick="dashboard.editEquipment('${eq.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateEquipmentStats() {
        const total = this.equipment.length;
        const healthy = this.equipment.filter(eq => eq.status === 'healthy').length;
        const warning = this.equipment.filter(eq => eq.status === 'warning').length;
        const critical = this.equipment.filter(eq => eq.status === 'critical').length;

        document.getElementById('totalEquipment').textContent = total;
        document.getElementById('healthyEquipment').textContent = healthy;
        document.getElementById('warningEquipment').textContent = warning;
        document.getElementById('criticalEquipment').textContent = critical;
    }

    // Maintenance functions
    loadMaintenanceData() {
        this.renderCalendar();
        this.renderUpcomingMaintenance();
        this.renderMaintenanceHistory();
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        document.getElementById('currentMonth').textContent = 
            new Date(year, month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '';

        // Day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day calendar-day-name">${day}</div>`;
        });

        // Calendar days
        const currentDate = new Date(startDate);
        for (let i = 0; i < 42; i++) {
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.toDateString() === now.toDateString();
            const hasMaintenance = this.maintenance.some(m => {
                const maintDate = new Date(m.scheduledDate);
                return maintDate.toDateString() === currentDate.toDateString();
            });

            let classes = 'calendar-day';
            if (!isCurrentMonth) classes += ' other-month';
            if (isToday) classes += ' today';
            if (hasMaintenance) classes += ' has-maintenance';

            html += `<div class="${classes}">${currentDate.getDate()}</div>`;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        calendarGrid.innerHTML = html;
    }

    renderUpcomingMaintenance() {
        const list = document.getElementById('upcomingMaintenanceList');
        if (!list) return;

        const upcoming = this.maintenance.filter(m => new Date(m.scheduledDate) > new Date());

        list.innerHTML = upcoming.map(m => {
            const equipment = this.equipment.find(eq => eq.id === m.equipmentId);
            return `
                <div class="maintenance-item priority-${m.priority}">
                    <div class="maintenance-info">
                        <h4>${equipment ? equipment.name : 'Unknown Equipment'}</h4>
                        <p>${m.description}</p>
                    </div>
                    <div class="maintenance-meta">
                        <span>${new Date(m.scheduledDate).toLocaleDateString()}</span>
                        <span>${m.estimatedDuration}h</span>
                        <span>${m.priority}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMaintenanceHistory() {
        const list = document.getElementById('maintenanceHistoryList');
        if (!list) return;

        const history = this.maintenance.filter(m => m.status === 'completed');

        list.innerHTML = history.map(m => {
            const equipment = this.equipment.find(eq => eq.id === m.equipmentId);
            return `
                <div class="maintenance-item">
                    <div class="maintenance-info">
                        <h4>${equipment ? equipment.name : 'Unknown Equipment'}</h4>
                        <p>${m.description}</p>
                    </div>
                    <div class="maintenance-meta">
                        <span>Completed</span>
                        <span>${m.estimatedDuration}h</span>
                        <span>${m.technician}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Analytics functions
    loadAnalyticsData() {
        this.renderPredictionModels();
    }

    renderPredictionModels() {
        const list = document.getElementById('predictionModelsList');
        if (!list) return;

        list.innerHTML = this.predictionModels.map(model => `
            <div class="model-card">
                <h4>${model.name}</h4>
                <div class="accuracy">${model.accuracy}% accuracy</div>
                <div class="last-updated">Last trained: ${new Date(model.lastTrained).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    // Sensors functions
    loadSensorsData() {
        this.renderSensorGrid();
        this.updateSensorStats();
        this.startSensorDataStream();
    }

    renderSensorGrid() {
        const grid = document.getElementById('sensorGrid');
        if (!grid) return;

        grid.innerHTML = this.sensors.map(sensor => `
            <div class="sensor-card">
                <h4>${sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} Sensor</h4>
                <div class="sensor-type">ID: ${sensor.id}</div>
                <div class="sensor-reading">
                    <div class="value">${sensor.value}</div>
                    <div class="unit">${sensor.unit}</div>
                </div>
                <div class="sensor-status">
                    <div class="status ${sensor.status}">
                        <i class="fas fa-circle"></i>
                        ${sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateSensorStats() {
        const total = this.sensors.length;
        const active = this.sensors.filter(s => s.status === 'active').length;
        const faulty = this.sensors.filter(s => s.status === 'faulty').length;

        document.getElementById('totalSensors').textContent = total;
        document.getElementById('activeSensors').textContent = active;
        document.getElementById('faultySensors').textContent = faulty;
        document.getElementById('dataPointsHour').textContent = '2.1M';
    }

    startSensorDataStream() {
        const stream = document.getElementById('sensorDataStream');
        if (!stream) return;

        // Clear existing interval
        if (this.intervals.sensorStream) {
            clearInterval(this.intervals.sensorStream);
        }

        this.intervals.sensorStream = setInterval(() => {
            const sensor = this.sensors[Math.floor(Math.random() * this.sensors.length)];
            const timestamp = new Date().toLocaleTimeString();
            const entry = document.createElement('div');
            entry.className = 'data-entry';
            entry.textContent = `[${timestamp}] ${sensor.id}: ${sensor.value} ${sensor.unit}`;
            stream.appendChild(entry);

            // Keep only last 20 entries
            while (stream.children.length > 20) {
                stream.removeChild(stream.firstChild);
            }

            // Update sensor value slightly
            sensor.value += (Math.random() - 0.5) * 0.1;
            sensor.value = Math.max(0, Math.min(sensor.value, 100));
        }, 2000);
    }

    // Alerts functions
    loadAlertsData() {
        this.renderActiveAlerts();
        this.renderAlertHistory();
    }

    renderActiveAlerts() {
        const list = document.getElementById('activeAlertsList');
        if (!list) return;

        const activeAlerts = this.alerts.filter(a => !a.resolved);

        list.innerHTML = activeAlerts.map(alert => {
            const equipment = this.equipment.find(eq => eq.id === alert.equipmentId);
            return `
                <div class="alert-item severity-${alert.severity}">
                    <div class="alert-content">
                        <h4>${equipment ? equipment.name : 'Unknown Equipment'}</h4>
                        <p>${alert.message}</p>
                    </div>
                    <div class="alert-meta">
                        <span>${new Date(alert.timestamp).toLocaleString()}</span>
                        <span class="severity">${alert.severity}</span>
                    </div>
                    <div class="alert-actions">
                        <button class="btn" onclick="dashboard.acknowledgeAlert('${alert.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAlertHistory() {
        const list = document.getElementById('alertHistoryList');
        if (!list) return;

        const history = this.alerts.filter(a => a.resolved);

        list.innerHTML = history.map(alert => {
            const equipment = this.equipment.find(eq => eq.id === alert.equipmentId);
            return `
                <div class="alert-item">
                    <div class="alert-content">
                        <h4>${equipment ? equipment.name : 'Unknown Equipment'}</h4>
                        <p>${alert.message}</p>
                    </div>
                    <div class="alert-meta">
                        <span>Resolved</span>
                        <span>${new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Reports functions
    loadReportsData() {
        this.renderReportsList();
    }

    renderReportsList() {
        const list = document.getElementById('reportsList');
        if (!list) return;

        const reports = [
            { name: 'Monthly Health Report', type: 'Health', date: '2026-02-01', size: '2.3 MB' },
            { name: 'Maintenance Cost Analysis', type: 'Financial', date: '2026-01-28', size: '1.8 MB' },
            { name: 'Failure Prediction Report', type: 'Analytics', date: '2026-01-25', size: '3.1 MB' }
        ];

        list.innerHTML = reports.map(report => `
            <div class="report-item">
                <div class="report-info">
                    <h4>${report.name}</h4>
                    <p>${report.type} Report • Generated on ${report.date}</p>
                </div>
                <div class="report-meta">
                    <span>${report.size}</span>
                </div>
                <div class="report-actions">
                    <button class="btn" onclick="dashboard.downloadReport('${report.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn" onclick="dashboard.viewReport('${report.name}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Modal functions
    showAddEquipmentModal() {
        const modal = document.getElementById('addEquipmentModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    showScheduleMaintenanceModal() {
        const modal = document.getElementById('scheduleMaintenanceModal');
        if (modal) {
            // Populate equipment options
            const select = document.getElementById('maintenanceEquipment');
            if (select) {
                select.innerHTML = '<option value="">Select Equipment</option>' +
                    this.equipment.map(eq => `<option value="${eq.id}">${eq.name}</option>`).join('');
            }
            modal.classList.add('show');
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    addEquipment() {
        const form = document.getElementById('addEquipmentForm');
        if (!form) return;

        const formData = new FormData(form);
        const equipment = {
            id: 'eq-' + Date.now(),
            name: formData.get('equipmentName'),
            type: formData.get('equipmentType'),
            location: formData.get('equipmentLocation'),
            model: formData.get('equipmentModel'),
            installDate: formData.get('installDate'),
            expectedLifespan: parseInt(formData.get('expectedLifespan')),
            health: 100,
            status: 'healthy',
            lastMaintenance: new Date().toISOString().split('T')[0],
            sensors: []
        };

        this.equipment.push(equipment);
        this.saveToStorage();
        this.loadEquipmentData();
        this.closeModal();
        form.reset();
    }

    scheduleMaintenance() {
        const form = document.getElementById('scheduleMaintenanceForm');
        if (!form) return;

        const formData = new FormData(form);
        const maintenance = {
            id: 'maint-' + Date.now(),
            equipmentId: formData.get('maintenanceEquipment'),
            type: formData.get('maintenanceType'),
            priority: formData.get('maintenancePriority'),
            scheduledDate: formData.get('scheduledDate'),
            estimatedDuration: parseFloat(formData.get('estimatedDuration')),
            technician: formData.get('assignedTechnician'),
            description: formData.get('maintenanceDescription'),
            status: 'scheduled'
        };

        this.maintenance.push(maintenance);
        this.saveToStorage();
        this.loadMaintenanceData();
        this.closeModal();
        form.reset();
    }

    // Action functions
    refreshDashboard() {
        this.loadDashboardData();
        this.showAlert('Dashboard refreshed successfully', 'info');
    }

    exportDashboard() {
        // Simulate export
        this.showAlert('Dashboard data exported successfully', 'success');
    }

    applyEquipmentFilters() {
        // Apply filters logic would go here
        this.loadEquipmentData();
    }

    changeCalendarMonth(delta) {
        // Calendar month change logic would go here
        this.renderCalendar();
    }

    runPrediction() {
        // Simulate prediction run
        this.showAlert('Prediction models updated successfully', 'success');
    }

    acknowledgeAllAlerts() {
        this.alerts.forEach(alert => {
            if (!alert.resolved) {
                alert.acknowledged = true;
            }
        });
        this.saveToStorage();
        this.loadAlertsData();
    }

    generateReport() {
        // Simulate report generation
        this.showAlert('Report generated successfully', 'success');
    }

    saveSettings() {
        // Save settings logic would go here
        this.showAlert('Settings saved successfully', 'success');
    }

    resetSettings() {
        // Reset settings logic would go here
        this.showAlert('Settings reset to defaults', 'warning');
    }

    emergencyShutdown() {
        if (confirm('Are you sure you want to initiate emergency shutdown? This will stop all equipment.')) {
            // Simulate emergency shutdown
            this.equipment.forEach(eq => eq.status = 'maintenance');
            this.saveToStorage();
            this.loadDashboardData();
            this.showAlert('Emergency shutdown initiated', 'critical');
        }
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.saveToStorage();
            this.loadAlertsData();
        }
    }

    downloadReport(reportName) {
        // Simulate download
        this.showAlert(`${reportName} downloaded successfully`, 'success');
    }

    viewReport(reportName) {
        // Simulate view
        this.showAlert(`Opening ${reportName}`, 'info');
    }

    // Utility functions
    showAlert(message, type = 'info') {
        const modal = document.getElementById('alertModal');
        const title = document.getElementById('alertTitle');
        const msg = document.getElementById('alertMessage');

        if (modal && title && msg) {
            title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            msg.textContent = message;
            modal.classList.add('show');
        }
    }

    startRealTimeUpdates() {
        // Update metrics every 30 seconds
        this.intervals.metrics = setInterval(() => {
            this.updateMetrics();
            this.updateSensorReadings();
        }, 30000);

        // Update charts every minute
        this.intervals.charts = setInterval(() => {
            this.updateCharts();
        }, 60000);
    }

    updateSensorReadings() {
        this.sensors.forEach(sensor => {
            // Simulate sensor value changes
            sensor.value += (Math.random() - 0.5) * 2;
            sensor.value = Math.max(0, Math.min(sensor.value, 100));

            // Update equipment health based on sensor readings
            const equipment = this.equipment.find(eq => eq.sensors.includes(sensor.id));
            if (equipment) {
                this.updateEquipmentHealth(equipment);
            }
        });
    }

    updateEquipmentHealth(equipment) {
        const sensors = this.sensors.filter(s => equipment.sensors.includes(s.id));
        let healthScore = 100;

        sensors.forEach(sensor => {
            // Simple health calculation based on sensor values
            if (sensor.type === 'temperature' && sensor.value > 80) healthScore -= 20;
            if (sensor.type === 'vibration' && sensor.value > 5) healthScore -= 15;
            if (sensor.type === 'pressure' && (sensor.value < 30 || sensor.value > 60)) healthScore -= 10;
        });

        equipment.health = Math.max(0, Math.min(100, healthScore));

        // Update status based on health
        if (equipment.health < 30) {
            equipment.status = 'critical';
        } else if (equipment.health < 60) {
            equipment.status = 'warning';
        } else {
            equipment.status = 'healthy';
        }
    }

    updateCharts() {
        // Update chart data with new values
        if (this.charts.healthTrends) {
            const newData = this.charts.healthTrends.data.datasets[0].data;
            newData.shift();
            newData.push(Math.round(Math.random() * 20 + 80));
            this.charts.healthTrends.update();
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('pmd_equipment', JSON.stringify(this.equipment));
            localStorage.setItem('pmd_sensors', JSON.stringify(this.sensors));
            localStorage.setItem('pmd_maintenance', JSON.stringify(this.maintenance));
            localStorage.setItem('pmd_alerts', JSON.stringify(this.alerts));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }

    loadFromStorage() {
        try {
            const equipment = localStorage.getItem('pmd_equipment');
            const sensors = localStorage.getItem('pmd_sensors');
            const maintenance = localStorage.getItem('pmd_maintenance');
            const alerts = localStorage.getItem('pmd_alerts');

            if (equipment) this.equipment = JSON.parse(equipment);
            if (sensors) this.sensors = JSON.parse(sensors);
            if (maintenance) this.maintenance = JSON.parse(maintenance);
            if (alerts) this.alerts = JSON.parse(alerts);
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    }

    handleResize() {
        // Handle responsive layout changes
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.resize();
        });
    }

    // Cleanup
    destroy() {
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });

        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new PredictiveMaintenanceDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboard) {
        window.dashboard.destroy();
    }
});