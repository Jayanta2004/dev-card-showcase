// Liver Function Tracker JavaScript

class LiverFunctionTracker {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('liverFunctionEntries')) || [];
        this.currentFilter = 'all';
        this.initializeEventListeners();
        this.renderDashboard();
        this.renderHistory();
        this.renderInsights();
    }

    initializeEventListeners() {
        // Form submission
        const form = document.getElementById('liverForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Input validation
        const altInput = document.getElementById('alt');
        const astInput = document.getElementById('ast');

        if (altInput) {
            altInput.addEventListener('input', (e) => this.validateEnzymeInput(e.target, 'ALT'));
        }
        if (astInput) {
            astInput.addEventListener('input', (e) => this.validateEnzymeInput(e.target, 'AST'));
        }
    }

    validateEnzymeInput(input, enzyme) {
        const value = parseFloat(input.value);
        const statusElement = input.closest('.enzyme-group').querySelector('.status-indicator');

        if (!value || value < 0) {
            statusElement.className = 'status-indicator';
            statusElement.textContent = 'Enter a valid value';
            return;
        }

        const ranges = {
            'ALT': { normal: [7, 56], elevated: [57, 200], high: [201, Infinity] },
            'AST': { normal: [10, 40], elevated: [41, 200], high: [201, Infinity] }
        };

        const range = ranges[enzyme];
        let status = 'normal';
        let message = 'Normal';

        if (value >= range.high[0]) {
            status = 'high';
            message = 'High - Seek medical attention';
        } else if (value >= range.elevated[0]) {
            status = 'elevated';
            message = 'Elevated - Monitor closely';
        }

        statusElement.className = `status-indicator status-${status}`;
        statusElement.textContent = message;
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const entry = {
            id: Date.now(),
            date: formData.get('date'),
            alt: parseFloat(formData.get('alt')),
            ast: parseFloat(formData.get('ast')),
            bilirubin: parseFloat(formData.get('bilirubin')) || null,
            alp: parseFloat(formData.get('alp')) || null,
            notes: formData.get('notes') || '',
            timestamp: new Date().toISOString()
        };

        // Validate required fields
        if (!entry.date || !entry.alt || !entry.ast) {
            alert('Please fill in all required fields (Date, ALT, AST)');
            return;
        }

        this.entries.unshift(entry);
        this.saveEntries();
        this.renderDashboard();
        this.renderHistory();
        this.renderInsights();

        // Reset form
        e.target.reset();
        document.querySelectorAll('.status-indicator').forEach(el => {
            el.className = 'status-indicator';
            el.textContent = '';
        });

        // Show success message
        this.showNotification('Liver function test recorded successfully!', 'success');
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.renderHistory();
    }

    saveEntries() {
        localStorage.setItem('liverFunctionEntries', JSON.stringify(this.entries));
    }

    getFilteredEntries() {
        if (this.currentFilter === 'all') return this.entries;

        const days = {
            '7': 7,
            '30': 30,
            '90': 90
        }[this.currentFilter];

        if (!days) return this.entries;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.entries.filter(entry => new Date(entry.date) >= cutoffDate);
    }

    calculateStatus(alt, ast) {
        const altRanges = { normal: [7, 56], elevated: [57, 200], high: [201, Infinity] };
        const astRanges = { normal: [10, 40], elevated: [41, 200], high: [201, Infinity] };

        const altStatus = this.getRangeStatus(alt, altRanges);
        const astStatus = this.getRangeStatus(ast, astRanges);

        // Return the more severe status
        const statusOrder = { normal: 0, elevated: 1, high: 2 };
        return statusOrder[altStatus] > statusOrder[astStatus] ? altStatus : astStatus;
    }

    getRangeStatus(value, ranges) {
        if (value >= ranges.high[0]) return 'high';
        if (value >= ranges.elevated[0]) return 'elevated';
        return 'normal';
    }

    getStatusIcon(status) {
        const icons = {
            normal: 'activity',
            elevated: 'alert-triangle',
            high: 'alert-circle'
        };
        return icons[status] || 'activity';
    }

    getStatusColor(status) {
        const colors = {
            normal: '#38a169',
            elevated: '#d69e2e',
            high: '#e53e3e'
        };
        return colors[status] || '#38a169';
    }

    renderDashboard() {
        const dashboard = document.getElementById('healthDashboard');
        if (!dashboard) return;

        if (this.entries.length === 0) {
            dashboard.innerHTML = '<p>No liver function tests recorded yet. Add your first test above.</p>';
            return;
        }

        const latest = this.entries[0];
        const status = this.calculateStatus(latest.alt, latest.ast);
        const statusIcon = this.getStatusIcon(status);
        const statusColor = this.getStatusColor(status);

        const statusText = {
            normal: 'Normal',
            elevated: 'Elevated',
            high: 'High Risk'
        }[status];

        dashboard.innerHTML = `
            <div class="status-overview">
                <div class="status-card">
                    <i class="lucide-${statusIcon}" style="color: ${statusColor}"></i>
                    <div class="status-info">
                        <div class="status-label">Current Liver Health Status</div>
                        <div class="status-value">${statusText}</div>
                    </div>
                </div>

                <div class="enzyme-summary">
                    <div class="summary-item">
                        <div class="enzyme-name">ALT</div>
                        <div class="current-value">${latest.alt} IU/L</div>
                        <div class="trend">${this.getTrend('alt')} from last test</div>
                    </div>
                    <div class="summary-item">
                        <div class="enzyme-name">AST</div>
                        <div class="current-value">${latest.ast} IU/L</div>
                        <div class="trend">${this.getTrend('ast')} from last test</div>
                    </div>
                    ${latest.bilirubin ? `
                        <div class="summary-item">
                            <div class="enzyme-name">Bilirubin</div>
                            <div class="current-value">${latest.bilirubin} mg/dL</div>
                        </div>
                    ` : ''}
                    ${latest.alp ? `
                        <div class="summary-item">
                            <div class="enzyme-name">ALP</div>
                            <div class="current-value">${latest.alp} IU/L</div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="liver-section">
                <h2><i class="lucide-trending-up"></i> Liver Function Trends</h2>
                <div class="liver-chart">
                    <canvas id="liverChart"></canvas>
                </div>
            </div>
        `;

        this.renderChart();
    }

    getTrend(enzyme) {
        if (this.entries.length < 2) return 'No previous data';

        const current = this.entries[0][enzyme];
        const previous = this.entries[1][enzyme];
        const change = ((current - previous) / previous * 100).toFixed(1);

        if (change > 0) return `↑ ${change}%`;
        if (change < 0) return `↓ ${Math.abs(change)}%`;
        return '→ No change';
    }

    renderChart() {
        const ctx = document.getElementById('liverChart');
        if (!ctx) return;

        const filteredEntries = this.getFilteredEntries().slice().reverse();
        const labels = filteredEntries.map(entry => new Date(entry.date).toLocaleDateString());
        const altData = filteredEntries.map(entry => entry.alt);
        const astData = filteredEntries.map(entry => entry.ast);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ALT (IU/L)',
                    data: altData,
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    tension: 0.4
                }, {
                    label: 'AST (IU/L)',
                    data: astData,
                    borderColor: '#3182ce',
                    backgroundColor: 'rgba(49, 130, 206, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
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

    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        const filteredEntries = this.getFilteredEntries();

        if (filteredEntries.length === 0) {
            historyList.innerHTML = '<p>No entries found for the selected period.</p>';
            return;
        }

        historyList.innerHTML = filteredEntries.map(entry => {
            const altStatus = this.getRangeStatus(entry.alt, { normal: [7, 56], elevated: [57, 200], high: [201, Infinity] });
            const astStatus = this.getRangeStatus(entry.ast, { normal: [10, 40], elevated: [41, 200], high: [201, Infinity] });

            return `
                <div class="history-item">
                    <div class="history-date">${new Date(entry.date).toLocaleDateString()}</div>
                    <div class="history-details">
                        <div class="history-enzymes">
                            <div class="history-alt">
                                <div class="history-label">ALT</div>
                                <div class="history-value" style="color: ${this.getStatusColor(altStatus)}">${entry.alt}</div>
                            </div>
                            <div class="history-ast">
                                <div class="history-label">AST</div>
                                <div class="history-value" style="color: ${this.getStatusColor(astStatus)}">${entry.ast}</div>
                            </div>
                        </div>
                        ${entry.notes ? `<div class="history-notes">${entry.notes}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderInsights() {
        const insights = document.getElementById('healthInsights');
        if (!insights) return;

        if (this.entries.length < 2) {
            insights.innerHTML = '<p>Add more liver function tests to see health insights and trends.</p>';
            return;
        }

        const insightsData = this.generateInsights();

        insights.innerHTML = `
            <div class="insights-grid">
                ${insightsData.map(insight => `
                    <div class="insight-card">
                        <h3><i class="lucide-${insight.icon}"></i> ${insight.title}</h3>
                        <div class="insight-content">${insight.content}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateInsights() {
        const insights = [];
        const latest = this.entries[0];
        const previous = this.entries[1];

        // ALT/AST ratio insight
        const ratio = latest.ast / latest.alt;
        if (ratio > 2) {
            insights.push({
                icon: 'alert-triangle',
                title: 'ALT/AST Ratio',
                content: 'Your AST/ALT ratio is elevated (>2:1), which may indicate alcoholic liver disease or other conditions. Consult your healthcare provider.'
            });
        } else if (ratio < 1) {
            insights.push({
                icon: 'check-circle',
                title: 'ALT/AST Ratio',
                content: 'Your ALT/AST ratio is within normal range (<1:1), suggesting good liver health.'
            });
        }

        // Trend analysis
        const altChange = ((latest.alt - previous.alt) / previous.alt * 100);
        const astChange = ((latest.ast - previous.ast) / previous.ast * 100);

        if (altChange > 20 || astChange > 20) {
            insights.push({
                icon: 'trending-up',
                title: 'Rising Enzymes',
                content: 'Your liver enzymes have increased significantly. Monitor closely and consider lifestyle adjustments or medical consultation.'
            });
        } else if (altChange < -20 || astChange < -20) {
            insights.push({
                icon: 'trending-down',
                title: 'Improving Enzymes',
                content: 'Great progress! Your liver enzymes are decreasing, indicating positive changes in liver health.'
            });
        }

        // Overall status
        const status = this.calculateStatus(latest.alt, latest.ast);
        if (status === 'high') {
            insights.push({
                icon: 'alert-circle',
                title: 'Medical Attention Needed',
                content: 'Your liver enzyme levels are in the high-risk range. Please consult a healthcare professional immediately for proper evaluation.'
            });
        } else if (status === 'elevated') {
            insights.push({
                icon: 'clock',
                title: 'Monitor Closely',
                content: 'Your enzyme levels are elevated. Continue monitoring and consider discussing with your healthcare provider at your next visit.'
            });
        }

        // Default insight if none generated
        if (insights.length === 0) {
            insights.push({
                icon: 'activity',
                title: 'Liver Health Status',
                content: 'Your liver function tests are within normal ranges. Continue maintaining healthy lifestyle habits.'
            });
        }

        return insights;
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        alert(message);
    }
}

// Initialize the tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LiverFunctionTracker();
});