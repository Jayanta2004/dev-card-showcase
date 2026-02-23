// Blood Pressure Monitor JavaScript
class BloodPressureMonitor {
    constructor() {
        this.readings = this.loadReadings();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDateTime();
        this.updateUI();
        this.updateCharts();
    }

    setupEventListeners() {
        // BP Form submission
        document.getElementById('bpForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addReading();
        });
    }

    setDefaultDateTime() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('readingDate').value = localDateTime;
    }

    addReading() {
        const systolic = parseInt(document.getElementById('systolic').value);
        const diastolic = parseInt(document.getElementById('diastolic').value);
        const heartRate = parseInt(document.getElementById('heartRate').value) || null;
        const dateTime = document.getElementById('readingDate').value;
        const notes = document.getElementById('notes').value.trim();

        if (!systolic || !diastolic || !dateTime) {
            alert('Please fill in all required fields.');
            return;
        }

        // Validate BP ranges
        if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
            alert('Please enter valid blood pressure values.');
            return;
        }

        if (heartRate && (heartRate < 40 || heartRate > 200)) {
            alert('Please enter a valid heart rate (40-200 BPM).');
            return;
        }

        const reading = {
            id: Date.now(),
            systolic: systolic,
            diastolic: diastolic,
            heartRate: heartRate,
            dateTime: new Date(dateTime).toISOString(),
            notes: notes,
            risk: this.calculateRisk(systolic, diastolic)
        };

        this.readings.unshift(reading); // Add to beginning for most recent first
        this.saveReadings();
        this.updateUI();
        this.updateCharts();

        // Reset form
        document.getElementById('bpForm').reset();
        this.setDefaultDateTime();

        alert('Reading recorded successfully!');
    }

    calculateRisk(systolic, diastolic) {
        // Based on American Heart Association guidelines
        if (systolic >= 180 || diastolic >= 120) {
            return 'crisis';
        } else if (systolic >= 140 || diastolic >= 90) {
            return 'high';
        } else if (systolic >= 120 || diastolic >= 80) {
            return 'elevated';
        } else {
            return 'normal';
        }
    }

    getRiskDescription(risk) {
        const descriptions = {
            'normal': {
                status: 'Normal',
                description: 'Your blood pressure is in the normal range. Keep up the good work!'
            },
            'elevated': {
                status: 'Elevated',
                description: 'Your blood pressure is slightly elevated. Consider lifestyle changes.'
            },
            'high': {
                status: 'High Blood Pressure (Stage 1)',
                description: 'Your blood pressure is high. Consult with a healthcare provider.'
            },
            'crisis': {
                status: 'Hypertensive Crisis',
                description: 'This is a medical emergency. Seek immediate medical attention!'
            }
        };
        return descriptions[risk] || descriptions['normal'];
    }

    updateUI() {
        this.updateRiskAssessment();
        this.updateStatistics();
        this.displayReadings();
    }

    updateRiskAssessment() {
        const riskDisplay = document.getElementById('riskDisplay');

        if (this.readings.length === 0) {
            riskDisplay.innerHTML = `
                <div class="risk-indicator">
                    <div class="risk-status">No Data</div>
                    <div class="risk-description">Add your first reading to see your risk assessment</div>
                </div>
            `;
            return;
        }

        // Use the most recent reading for current risk
        const latestReading = this.readings[0];
        const riskInfo = this.getRiskDescription(latestReading.risk);

        riskDisplay.innerHTML = `
            <div class="risk-indicator risk-${latestReading.risk}">
                <div class="risk-status">${riskInfo.status}</div>
                <div class="risk-description">${riskInfo.description}</div>
            </div>
        `;
    }

    updateStatistics() {
        if (this.readings.length === 0) {
            document.getElementById('avgSystolic').textContent = '--';
            document.getElementById('avgDiastolic').textContent = '--';
            document.getElementById('totalReadings').textContent = '--';
            document.getElementById('highReadings').textContent = '--';
            return;
        }

        // Calculate averages
        const avgSystolic = Math.round(this.readings.reduce((sum, r) => sum + r.systolic, 0) / this.readings.length);
        const avgDiastolic = Math.round(this.readings.reduce((sum, r) => sum + r.diastolic, 0) / this.readings.length);

        // Count high readings (Stage 1 hypertension or higher)
        const highReadings = this.readings.filter(r => r.risk === 'high' || r.risk === 'crisis').length;

        document.getElementById('avgSystolic').textContent = avgSystolic;
        document.getElementById('avgDiastolic').textContent = avgDiastolic;
        document.getElementById('totalReadings').textContent = this.readings.length;
        document.getElementById('highReadings').textContent = highReadings;
    }

    displayReadings() {
        const readingsList = document.getElementById('readingsList');

        if (this.readings.length === 0) {
            readingsList.innerHTML = '<p class="no-data">No readings recorded yet. Add your first reading above!</p>';
            return;
        }

        readingsList.innerHTML = this.readings.slice(0, 20).map(reading => {
            const date = new Date(reading.dateTime);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="reading-item">
                    <div class="reading-values">
                        <div class="reading-bp">${reading.systolic}/${reading.diastolic} mmHg</div>
                        ${reading.heartRate ? `<div class="reading-hr">${reading.heartRate} BPM</div>` : ''}
                        <span class="reading-risk ${reading.risk}">${reading.risk}</span>
                    </div>
                    <div class="reading-meta">
                        <div>${formattedDate} ${formattedTime}</div>
                        ${reading.notes ? `<div style="margin-top: 5px; font-style: italic;">${reading.notes}</div>` : ''}
                        <button class="delete-btn" onclick="bpMonitor.deleteReading(${reading.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    deleteReading(readingId) {
        if (confirm('Are you sure you want to delete this reading?')) {
            this.readings = this.readings.filter(r => r.id !== readingId);
            this.saveReadings();
            this.updateUI();
            this.updateCharts();
        }
    }

    updateCharts() {
        this.updateBPChart();
        this.updateHRChart();
    }

    updateBPChart() {
        const ctx = document.getElementById('bpChart').getContext('2d');

        if (this.charts.bpChart) {
            this.charts.bpChart.destroy();
        }

        if (this.readings.length === 0) {
            return;
        }

        // Get last 30 readings for the chart
        const recentReadings = this.readings.slice(0, 30).reverse();
        const labels = recentReadings.map(r => {
            const date = new Date(r.dateTime);
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });

        this.charts.bpChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Systolic',
                    data: recentReadings.map(r => r.systolic),
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#FF6B6B',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }, {
                    label: 'Diastolic',
                    data: recentReadings.map(r => r.diastolic),
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#4ECDC4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 60,
                        max: 200,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value + ' mmHg';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    updateHRChart() {
        const ctx = document.getElementById('hrChart').getContext('2d');

        if (this.charts.hrChart) {
            this.charts.hrChart.destroy();
        }

        // Filter readings that have heart rate data
        const hrReadings = this.readings.filter(r => r.heartRate).slice(0, 30).reverse();

        if (hrReadings.length === 0) {
            return;
        }

        const labels = hrReadings.map(r => {
            const date = new Date(r.dateTime);
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });

        this.charts.hrChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Heart Rate',
                    data: hrReadings.map(r => r.heartRate),
                    borderColor: '#FFE66D',
                    backgroundColor: 'rgba(255, 230, 109, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FFE66D',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 40,
                        max: 120,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value + ' BPM';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    saveReadings() {
        localStorage.setItem('bpMonitorReadings', JSON.stringify(this.readings));
    }

    loadReadings() {
        const saved = localStorage.getItem('bpMonitorReadings');
        return saved ? JSON.parse(saved) : [];
    }

    // Export data functionality (for future enhancement)
    exportData() {
        const dataStr = JSON.stringify(this.readings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `blood-pressure-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Import data functionality (for future enhancement)
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    this.readings = [...importedData, ...this.readings];
                    this.saveReadings();
                    this.updateUI();
                    this.updateCharts();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid file format.');
                }
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app
const bpMonitor = new BloodPressureMonitor();