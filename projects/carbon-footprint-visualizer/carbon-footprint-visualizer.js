// Carbon Footprint Visualizer JavaScript

class CarbonFootprintVisualizer {
    constructor() {
        this.emissionFactors = {
            // Energy (kg CO2 per kWh)
            electricity: 0.429, // US average
            naturalGas: 0.181, // per cubic meter
            heatingOil: 2.68, // per liter
            propane: 1.51, // per liter

            // Transportation (kg CO2 per km)
            car: 0.192, // average car
            bus: 0.089,
            train: 0.041,
            flight: 0.255, // domestic flight

            // Waste (kg CO2 per kg)
            waste: 0.57, // landfill
            recycling: 0.15, // recycled waste

            // Business travel (kg CO2 per km)
            businessCar: 0.192,
            businessFlight: 0.255,
            businessTrain: 0.041,

            // Water (kg CO2 per cubic meter)
            water: 0.344
        };

        this.emissionData = this.loadEmissionData();
        this.charts = {};
        this.currentPeriod = 'monthly';

        this.initializeEventListeners();
        this.updateDashboard();
        this.initializeCharts();
    }

    loadEmissionData() {
        const saved = localStorage.getItem('carbonFootprintData');
        return saved ? JSON.parse(saved) : {
            energy: { electricity: 0, naturalGas: 0, heatingOil: 0, propane: 0 },
            transportation: { car: 0, bus: 0, train: 0, flight: 0 },
            waste: { waste: 0, recycling: 0 },
            businessTravel: { car: 0, flight: 0, train: 0 },
            water: { consumption: 0 },
            history: []
        };
    }

    saveEmissionData() {
        localStorage.setItem('carbonFootprintData', JSON.stringify(this.emissionData));
    }

    initializeEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Input form submission
        document.getElementById('emission-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateEmissions();
        });

        // Analytics period selector
        document.getElementById('period-selector').addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.updateAnalytics();
        });

        // Report generation
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update specific tab content
        if (tabName === 'analytics') {
            this.updateAnalytics();
        } else if (tabName === 'reports') {
            this.updateReports();
        }
    }

    calculateEmissions() {
        const formData = new FormData(document.getElementById('emission-form'));

        // Energy emissions
        this.emissionData.energy.electricity = parseFloat(formData.get('electricity') || 0) * this.emissionFactors.electricity;
        this.emissionData.energy.naturalGas = parseFloat(formData.get('natural-gas') || 0) * this.emissionFactors.naturalGas;
        this.emissionData.energy.heatingOil = parseFloat(formData.get('heating-oil') || 0) * this.emissionFactors.heatingOil;
        this.emissionData.energy.propane = parseFloat(formData.get('propane') || 0) * this.emissionFactors.propane;

        // Transportation emissions
        this.emissionData.transportation.car = parseFloat(formData.get('car-km') || 0) * this.emissionFactors.car;
        this.emissionData.transportation.bus = parseFloat(formData.get('bus-km') || 0) * this.emissionFactors.bus;
        this.emissionData.transportation.train = parseFloat(formData.get('train-km') || 0) * this.emissionFactors.train;
        this.emissionData.transportation.flight = parseFloat(formData.get('flight-km') || 0) * this.emissionFactors.flight;

        // Waste emissions
        this.emissionData.waste.waste = parseFloat(formData.get('waste') || 0) * this.emissionFactors.waste;
        this.emissionData.waste.recycling = parseFloat(formData.get('recycling') || 0) * this.emissionFactors.recycling;

        // Business travel
        this.emissionData.businessTravel.car = parseFloat(formData.get('business-car') || 0) * this.emissionFactors.businessCar;
        this.emissionData.businessTravel.flight = parseFloat(formData.get('business-flight') || 0) * this.emissionFactors.businessFlight;
        this.emissionData.businessTravel.train = parseFloat(formData.get('business-train') || 0) * this.emissionFactors.businessTrain;

        // Water emissions
        this.emissionData.water.consumption = parseFloat(formData.get('water') || 0) * this.emissionFactors.water;

        // Add to history
        const timestamp = new Date().toISOString();
        const totalEmissions = this.calculateTotalEmissions();
        this.emissionData.history.push({
            timestamp,
            total: totalEmissions,
            breakdown: { ...this.emissionData }
        });

        // Keep only last 12 months
        if (this.emissionData.history.length > 12) {
            this.emissionData.history = this.emissionData.history.slice(-12);
        }

        this.saveEmissionData();
        this.updateDashboard();
        this.updateCharts();

        // Show success message
        this.showNotification('Emissions calculated successfully!', 'success');
    }

    calculateTotalEmissions() {
        const energy = Object.values(this.emissionData.energy).reduce((a, b) => a + b, 0);
        const transportation = Object.values(this.emissionData.transportation).reduce((a, b) => a + b, 0);
        const waste = Object.values(this.emissionData.waste).reduce((a, b) => a + b, 0);
        const businessTravel = Object.values(this.emissionData.businessTravel).reduce((a, b) => a + b, 0);
        const water = this.emissionData.water.consumption;

        return energy + transportation + waste + businessTravel + water;
    }

    calculateESGScore() {
        const totalEmissions = this.calculateTotalEmissions();
        const industryAverage = 1000; // tons CO2 per year (example)

        // ESG scoring based on emissions relative to industry average
        let score = 100 - (totalEmissions / industryAverage) * 100;
        score = Math.max(0, Math.min(100, score));

        return {
            score: Math.round(score),
            grade: this.getESGGrade(score),
            category: this.getESGCategory(score)
        };
    }

    getESGGrade(score) {
        if (score >= 90) return 'AAA';
        if (score >= 80) return 'AA';
        if (score >= 70) return 'A';
        if (score >= 60) return 'BBB';
        if (score >= 50) return 'BB';
        if (score >= 40) return 'B';
        if (score >= 30) return 'CCC';
        return 'CC';
    }

    getESGCategory(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Average';
        return 'Needs Improvement';
    }

    updateDashboard() {
        const totalEmissions = this.calculateTotalEmissions();
        const esgScore = this.calculateESGScore();

        // Update metrics
        document.getElementById('total-emissions').textContent = totalEmissions.toFixed(2);
        document.getElementById('esg-score').textContent = esgScore.score;
        document.getElementById('esg-grade').textContent = esgScore.grade;
        document.getElementById('esg-category').textContent = esgScore.category;

        // Update category breakdown
        this.updateCategoryBreakdown();
    }

    updateCategoryBreakdown() {
        const categories = {
            'Energy': Object.values(this.emissionData.energy).reduce((a, b) => a + b, 0),
            'Transportation': Object.values(this.emissionData.transportation).reduce((a, b) => a + b, 0),
            'Waste': Object.values(this.emissionData.waste).reduce((a, b) => a + b, 0),
            'Business Travel': Object.values(this.emissionData.businessTravel).reduce((a, b) => a + b, 0),
            'Water': this.emissionData.water.consumption
        };

        const breakdownHtml = Object.entries(categories)
            .filter(([_, value]) => value > 0)
            .map(([category, value]) => `
                <div class="metric-card">
                    <h3>${category}</h3>
                    <div class="metric-value">${value.toFixed(2)}</div>
                    <div class="metric-unit">tons CO₂</div>
                </div>
            `).join('');

        document.getElementById('category-breakdown').innerHTML = breakdownHtml;
    }

    initializeCharts() {
        this.createEmissionBreakdownChart();
        this.createTrendChart();
        this.createESGChart();
    }

    createEmissionBreakdownChart() {
        const ctx = document.getElementById('emission-breakdown-chart').getContext('2d');
        const categories = {
            'Energy': Object.values(this.emissionData.energy).reduce((a, b) => a + b, 0),
            'Transportation': Object.values(this.emissionData.transportation).reduce((a, b) => a + b, 0),
            'Waste': Object.values(this.emissionData.waste).reduce((a, b) => a + b, 0),
            'Business Travel': Object.values(this.emissionData.businessTravel).reduce((a, b) => a + b, 0),
            'Water': this.emissionData.water.consumption
        };

        this.charts.breakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#4a7c59',
                        '#2d5016',
                        '#6b8e4b',
                        '#8fa86b',
                        '#b5c28a'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.toFixed(2)} tons CO₂`;
                            }
                        }
                    }
                }
            }
        });
    }

    createTrendChart() {
        const ctx = document.getElementById('emission-trend-chart').getContext('2d');

        const history = this.emissionData.history.slice(-6); // Last 6 entries
        const labels = history.map(entry => new Date(entry.timestamp).toLocaleDateString());
        const data = history.map(entry => entry.total);

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Emissions (tons CO₂)',
                    data: data,
                    borderColor: '#4a7c59',
                    backgroundColor: 'rgba(74, 124, 89, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createESGChart() {
        const ctx = document.getElementById('esg-chart').getContext('2d');
        const esgScore = this.calculateESGScore();

        this.charts.esg = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Environmental Impact', 'Carbon Efficiency', 'Sustainability Score', 'ESG Rating', 'Climate Action'],
                datasets: [{
                    label: 'ESG Performance',
                    data: [esgScore.score, esgScore.score * 0.9, esgScore.score, esgScore.score * 0.95, esgScore.score * 0.85],
                    borderColor: '#2d5016',
                    backgroundColor: 'rgba(45, 80, 22, 0.2)',
                    pointBackgroundColor: '#4a7c59',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#4a7c59'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.charts.breakdown) {
            this.charts.breakdown.destroy();
            this.createEmissionBreakdownChart();
        }
        if (this.charts.trend) {
            this.charts.trend.destroy();
            this.createTrendChart();
        }
        if (this.charts.esg) {
            this.charts.esg.destroy();
            this.createESGChart();
        }
    }

    updateAnalytics() {
        // Update insights based on current period
        const insights = this.generateInsights();
        document.getElementById('analytics-insights').innerHTML = insights;
    }

    generateInsights() {
        const totalEmissions = this.calculateTotalEmissions();
        const history = this.emissionData.history;
        const insights = [];

        // Trend analysis
        if (history.length >= 2) {
            const recent = history.slice(-2);
            const trend = recent[1].total - recent[0].total;
            if (trend > 0) {
                insights.push(`📈 Emissions increased by ${trend.toFixed(2)} tons CO₂ compared to last period`);
            } else if (trend < 0) {
                insights.push(`📉 Emissions decreased by ${Math.abs(trend).toFixed(2)} tons CO₂ - great progress!`);
            } else {
                insights.push(`➡️ Emissions remained stable compared to last period`);
            }
        }

        // Category analysis
        const categories = {
            'Energy': Object.values(this.emissionData.energy).reduce((a, b) => a + b, 0),
            'Transportation': Object.values(this.emissionData.transportation).reduce((a, b) => a + b, 0),
            'Waste': Object.values(this.emissionData.waste).reduce((a, b) => a + b, 0),
            'Business Travel': Object.values(this.emissionData.businessTravel).reduce((a, b) => a + b, 0),
            'Water': this.emissionData.water.consumption
        };

        const maxCategory = Object.entries(categories).reduce((a, b) => a[1] > b[1] ? a : b);
        if (maxCategory[1] > 0) {
            insights.push(`🎯 ${maxCategory[0]} is your largest emission source (${((maxCategory[1] / totalEmissions) * 100).toFixed(1)}% of total)`);
        }

        // ESG insights
        const esgScore = this.calculateESGScore();
        insights.push(`🏆 Your ESG score is ${esgScore.score}/100 (${esgScore.category})`);

        // Recommendations
        if (totalEmissions > 500) {
            insights.push(`💡 Consider implementing energy efficiency measures to reduce your carbon footprint`);
        }
        if (categories.Transportation > totalEmissions * 0.3) {
            insights.push(`🚗 Transportation emissions are high - consider electric vehicles or public transit`);
        }

        return insights.map(insight => `<li>${insight}</li>`).join('');
    }

    updateReports() {
        // Update report preview with current data
        const reportContent = this.generateReportContent();
        document.getElementById('report-content').textContent = reportContent;
    }

    generateReport() {
        const includeESG = document.getElementById('include-esg').checked;
        const includeTrends = document.getElementById('include-trends').checked;
        const includeRecommendations = document.getElementById('include-recommendations').checked;

        let report = `CARBON FOOTPRINT REPORT
Generated on: ${new Date().toLocaleDateString()}

`;

        const totalEmissions = this.calculateTotalEmissions();
        report += `TOTAL EMISSIONS: ${totalEmissions.toFixed(2)} tons CO₂ per year

`;

        if (includeESG) {
            const esgScore = this.calculateESGScore();
            report += `ESG SCORE: ${esgScore.score}/100 (${esgScore.grade} - ${esgScore.category})

`;
        }

        report += `EMISSION BREAKDOWN:
`;

        const categories = {
            'Energy': Object.values(this.emissionData.energy).reduce((a, b) => a + b, 0),
            'Transportation': Object.values(this.emissionData.transportation).reduce((a, b) => a + b, 0),
            'Waste': Object.values(this.emissionData.waste).reduce((a, b) => a + b, 0),
            'Business Travel': Object.values(this.emissionData.businessTravel).reduce((a, b) => a + b, 0),
            'Water': this.emissionData.water.consumption
        };

        Object.entries(categories).forEach(([category, value]) => {
            if (value > 0) {
                report += `  ${category}: ${value.toFixed(2)} tons CO₂ (${((value / totalEmissions) * 100).toFixed(1)}%)
`;
            }
        });

        if (includeTrends && this.emissionData.history.length > 1) {
            report += `
TREND ANALYSIS:
`;
            const history = this.emissionData.history.slice(-3);
            history.forEach(entry => {
                const date = new Date(entry.timestamp).toLocaleDateString();
                report += `  ${date}: ${entry.total.toFixed(2)} tons CO₂
`;
            });
        }

        if (includeRecommendations) {
            report += `
RECOMMENDATIONS:
- Implement energy efficiency measures
- Reduce business travel through virtual meetings
- Increase recycling and waste reduction programs
- Consider renewable energy sources
- Optimize transportation methods
`;
        }

        document.getElementById('report-content').textContent = report;
        this.showNotification('Report generated successfully!', 'success');
    }

    generateReportContent() {
        return `CARBON FOOTPRINT REPORT
Generated on: ${new Date().toLocaleDateString()}

TOTAL EMISSIONS: ${this.calculateTotalEmissions().toFixed(2)} tons CO₂ per year

ESG SCORE: ${this.calculateESGScore().score}/100

Please use the Generate Report button to create a detailed report with selected options.`;
    }

    exportData() {
        const data = {
            emissionData: this.emissionData,
            totalEmissions: this.calculateTotalEmissions(),
            esgScore: this.calculateESGScore(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carbon-footprint-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4a7c59' : '#e53e3e'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarbonFootprintVisualizer();
});

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);