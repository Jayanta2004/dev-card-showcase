// Intelligent Query Acceleration Framework JavaScript

class QueryAccelerationFramework {
    constructor() {
        this.queries = [];
        this.charts = {};
        this.currentSort = { column: 'executionTime', direction: 'desc' };
        this.filters = {
            status: 'all',
            type: 'all',
            timeRange: '24h'
        };
        this.init();
    }

    init() {
        this.generateMockData();
        this.setupEventListeners();
        this.renderMetrics();
        this.renderCharts();
        this.renderQueryTable();
        this.renderSuggestions();
        this.renderInsights();
        this.startRealTimeUpdates();
    }

    generateMockData() {
        const queryTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'AGGREGATE'];
        const statuses = ['fast', 'medium', 'slow'];
        const tables = ['users', 'orders', 'products', 'analytics', 'logs', 'transactions'];

        for (let i = 0; i < 50; i++) {
            const executionTime = Math.random() * 5000 + 100; // 100ms to 5100ms
            const status = executionTime < 500 ? 'fast' : executionTime < 2000 ? 'medium' : 'slow';

            this.queries.push({
                id: i + 1,
                sql: this.generateRandomSQL(queryTypes[Math.floor(Math.random() * queryTypes.length)], tables),
                type: queryTypes[Math.floor(Math.random() * queryTypes.length)],
                executionTime: executionTime,
                status: status,
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                rowsAffected: Math.floor(Math.random() * 10000),
                optimizationScore: Math.floor(Math.random() * 100),
                cacheHit: Math.random() > 0.3,
                indexesUsed: Math.random() > 0.4,
                table: tables[Math.floor(Math.random() * tables.length)]
            });
        }
    }

    generateRandomSQL(type, tables) {
        const table = tables[Math.floor(Math.random() * tables.length)];
        switch (type) {
            case 'SELECT':
                return `SELECT * FROM ${table} WHERE id = ${Math.floor(Math.random() * 1000)}`;
            case 'INSERT':
                return `INSERT INTO ${table} VALUES (${Math.floor(Math.random() * 1000)}, 'value')`;
            case 'UPDATE':
                return `UPDATE ${table} SET status = 'active' WHERE id = ${Math.floor(Math.random() * 1000)}`;
            case 'DELETE':
                return `DELETE FROM ${table} WHERE created_at < '2023-01-01'`;
            case 'JOIN':
                const table2 = tables[Math.floor(Math.random() * tables.length)];
                return `SELECT * FROM ${table} t1 JOIN ${table2} t2 ON t1.id = t2.user_id`;
            case 'AGGREGATE':
                return `SELECT COUNT(*) as total, AVG(price) as avg_price FROM ${table} GROUP BY category`;
            default:
                return `SELECT * FROM ${table}`;
        }
    }

    setupEventListeners() {
        // Table sorting
        document.querySelectorAll('.query-table th[data-sort]').forEach(header => {
            header.addEventListener('click', () => this.sortTable(header.dataset.sort));
        });

        // Filters
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderQueryTable();
        });

        document.getElementById('type-filter').addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.renderQueryTable();
        });

        document.getElementById('time-filter').addEventListener('change', (e) => {
            this.filters.timeRange = e.target.value;
            this.renderQueryTable();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('query-details-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view')) {
                const queryId = parseInt(e.target.dataset.queryId);
                this.showQueryDetails(queryId);
            } else if (e.target.classList.contains('btn-optimize')) {
                const queryId = parseInt(e.target.dataset.queryId);
                this.optimizeQuery(queryId);
            }
        });
    }

    renderMetrics() {
        const totalQueries = this.queries.length;
        const avgExecutionTime = this.queries.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries;
        const slowQueries = this.queries.filter(q => q.status === 'slow').length;
        const cacheHitRate = (this.queries.filter(q => q.cacheHit).length / totalQueries) * 100;

        document.getElementById('total-queries').textContent = totalQueries.toLocaleString();
        document.getElementById('avg-execution-time').textContent = `${avgExecutionTime.toFixed(1)}ms`;
        document.getElementById('slow-queries').textContent = slowQueries;
        document.getElementById('cache-hit-rate').textContent = `${cacheHitRate.toFixed(1)}%`;

        // Update trends (mock data)
        this.updateTrends();
    }

    updateTrends() {
        const trends = document.querySelectorAll('.metric-trend');
        trends.forEach(trend => {
            const isPositive = Math.random() > 0.5;
            const change = (Math.random() * 10).toFixed(1);
            trend.textContent = `${isPositive ? '+' : '-'}${change}%`;
            trend.className = `metric-trend ${isPositive ? 'positive' : 'negative'}`;
        });
    }

    renderCharts() {
        this.renderExecutionTimeChart();
        this.renderQueryTypeChart();
        this.renderPerformanceTrendChart();
    }

    renderExecutionTimeChart() {
        const ctx = document.getElementById('execution-time-chart').getContext('2d');
        const data = this.queries.map(q => q.executionTime);

        this.charts.executionTime = new Chart(ctx, {
            type: 'histogram',
            data: {
                labels: Array.from({length: 10}, (_, i) => `${i * 500}ms`),
                datasets: [{
                    label: 'Query Count',
                    data: this.createHistogram(data, 10, 0, 5000),
                    backgroundColor: 'rgba(255, 111, 0, 0.6)',
                    borderColor: 'rgba(255, 111, 0, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#b0b0b0' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#b0b0b0' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#ffffff' } }
                }
            }
        });
    }

    renderQueryTypeChart() {
        const ctx = document.getElementById('query-type-chart').getContext('2d');
        const typeCounts = {};

        this.queries.forEach(q => {
            typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
        });

        this.charts.queryType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: [
                        '#FF6F00', '#2196F3', '#4CAF50', '#F44336',
                        '#FF9800', '#9C27B0', '#00BCD4', '#8BC34A'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' },
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderPerformanceTrendChart() {
        const ctx = document.getElementById('performance-trend-chart').getContext('2d');

        // Generate trend data for last 24 hours
        const hours = Array.from({length: 24}, (_, i) => i);
        const avgTimes = hours.map(() => Math.random() * 2000 + 500);

        this.charts.performanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours.map(h => `${h}:00`),
                datasets: [{
                    label: 'Avg Execution Time (ms)',
                    data: avgTimes,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#b0b0b0' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#b0b0b0' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#ffffff' } }
                }
            }
        });
    }

    createHistogram(data, bins, min, max) {
        const histogram = new Array(bins).fill(0);
        const binSize = (max - min) / bins;

        data.forEach(value => {
            const bin = Math.min(Math.floor((value - min) / binSize), bins - 1);
            histogram[bin]++;
        });

        return histogram;
    }

    renderQueryTable() {
        const filteredQueries = this.filterQueries();
        const sortedQueries = this.sortQueries(filteredQueries);

        const tbody = document.querySelector('.query-table tbody');
        tbody.innerHTML = '';

        sortedQueries.forEach(query => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${query.id}</td>
                <td>${query.type}</td>
                <td>${query.table}</td>
                <td>${query.executionTime.toFixed(1)}ms</td>
                <td><span class="query-status status-${query.status}">${query.status}</span></td>
                <td>${query.rowsAffected.toLocaleString()}</td>
                <td>${query.optimizationScore}%</td>
                <td>
                    <button class="btn-action btn-view" data-query-id="${query.id}">View</button>
                    <button class="btn-action btn-optimize" data-query-id="${query.id}">Optimize</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterQueries() {
        return this.queries.filter(query => {
            const statusMatch = this.filters.status === 'all' || query.status === this.filters.status;
            const typeMatch = this.filters.type === 'all' || query.type === this.filters.type;

            let timeMatch = true;
            if (this.filters.timeRange !== 'all') {
                const hours = parseInt(this.filters.timeRange);
                const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
                timeMatch = query.timestamp >= cutoff;
            }

            return statusMatch && typeMatch && timeMatch;
        });
    }

    sortQueries(queries) {
        return [...queries].sort((a, b) => {
            let aVal = a[this.currentSort.column];
            let bVal = b[this.currentSort.column];

            if (this.currentSort.column === 'timestamp') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'desc';
        }

        // Update sort indicators
        document.querySelectorAll('.query-table th i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        const currentHeader = document.querySelector(`[data-sort="${column}"] i`);
        currentHeader.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'}`;

        this.renderQueryTable();
    }

    renderSuggestions() {
        const suggestions = [
            {
                title: 'Add Index on users.email',
                impact: 'high',
                description: 'Queries filtering by email are running slow. Adding an index would improve performance by 70%.',
                details: 'Estimated improvement: 500ms → 150ms per query'
            },
            {
                title: 'Optimize JOIN Query',
                impact: 'medium',
                description: 'Complex JOIN operations are consuming excessive resources. Consider query restructuring.',
                details: 'Potential optimization: Use EXISTS instead of IN for better performance'
            },
            {
                title: 'Enable Query Caching',
                impact: 'high',
                description: 'Frequently executed queries would benefit from caching to reduce database load.',
                details: 'Cache hit rate could increase from 45% to 85%'
            },
            {
                title: 'Partition Large Tables',
                impact: 'low',
                description: 'Large tables are causing slow queries. Consider table partitioning.',
                details: 'Monthly partitioning could reduce query time by 30%'
            }
        ];

        const container = document.querySelector('.suggestions-grid');
        container.innerHTML = '';

        suggestions.forEach(suggestion => {
            const card = document.createElement('div');
            card.className = 'suggestion-card';
            card.innerHTML = `
                <div class="suggestion-header">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-impact impact-${suggestion.impact}">${suggestion.impact}</div>
                </div>
                <div class="suggestion-description">${suggestion.description}</div>
                <div class="suggestion-details">${suggestion.details}</div>
            `;
            container.appendChild(card);
        });
    }

    renderInsights() {
        const insights = [
            {
                title: 'Peak Hours Analysis',
                content: 'Query performance degrades significantly between 2-4 PM. Consider scaling resources during peak hours.'
            },
            {
                title: 'Index Utilization',
                content: 'Only 35% of queries are using available indexes. Review index strategy and query patterns.'
            },
            {
                title: 'Cache Efficiency',
                content: 'Cache hit rate has improved by 15% this week. Continue monitoring for optimal cache size.'
            },
            {
                title: 'Query Pattern Trends',
                content: 'SELECT queries have increased by 25% while UPDATE queries decreased by 10% this month.'
            }
        ];

        const container = document.querySelector('.insights-container');
        container.innerHTML = '';

        insights.forEach(insight => {
            const card = document.createElement('div');
            card.className = 'insight-card';
            card.innerHTML = `
                <h3><i class="fas fa-lightbulb"></i> ${insight.title}</h3>
                <p>${insight.content}</p>
            `;
            container.appendChild(card);
        });
    }

    showQueryDetails(queryId) {
        const query = this.queries.find(q => q.id === queryId);
        if (!query) return;

        const modal = document.getElementById('query-details-modal');
        const content = document.getElementById('query-details-content');

        content.innerHTML = `
            <div class="query-detail-section">
                <h4>Query Information</h4>
                <div class="query-sql">${query.sql}</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="label">Query ID</div>
                        <div class="value">${query.id}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Type</div>
                        <div class="value">${query.type}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Table</div>
                        <div class="value">${query.table}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Execution Time</div>
                        <div class="value">${query.executionTime.toFixed(1)}ms</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Status</div>
                        <div class="value"><span class="query-status status-${query.status}">${query.status}</span></div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Rows Affected</div>
                        <div class="value">${query.rowsAffected.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Optimization Score</div>
                        <div class="value">${query.optimizationScore}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Cache Hit</div>
                        <div class="value">${query.cacheHit ? 'Yes' : 'No'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Indexes Used</div>
                        <div class="value">${query.indexesUsed ? 'Yes' : 'No'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Timestamp</div>
                        <div class="value">${query.timestamp.toLocaleString()}</div>
                    </div>
                </div>
            </div>
            <div class="query-detail-section">
                <h4>Optimization Actions</h4>
                <div class="optimization-actions">
                    <button class="btn-primary">Apply Index</button>
                    <button class="btn-primary">Rewrite Query</button>
                    <button class="btn-secondary">Add to Watchlist</button>
                    <button class="btn-secondary">Export Report</button>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('query-details-modal').style.display = 'none';
    }

    optimizeQuery(queryId) {
        // Mock optimization action
        const query = this.queries.find(q => q.id === queryId);
        if (query) {
            query.optimizationScore = Math.min(100, query.optimizationScore + 20);
            query.executionTime *= 0.7; // Simulate 30% improvement
            query.status = query.executionTime < 500 ? 'fast' : query.executionTime < 2000 ? 'medium' : 'slow';

            this.renderQueryTable();
            this.renderMetrics();
            this.updateCharts();

            // Show success message
            this.showNotification('Query optimized successfully!', 'success');
        }
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => chart.update());
    }

    showNotification(message, type) {
        // Simple notification - in a real app, you'd use a proper notification system
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#F44336'};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    startRealTimeUpdates() {
        setInterval(() => {
            // Simulate new queries
            if (Math.random() > 0.7) {
                const newQuery = {
                    id: this.queries.length + 1,
                    sql: this.generateRandomSQL('SELECT', ['users', 'orders', 'products']),
                    type: 'SELECT',
                    executionTime: Math.random() * 3000 + 100,
                    status: 'fast',
                    timestamp: new Date(),
                    rowsAffected: Math.floor(Math.random() * 1000),
                    optimizationScore: Math.floor(Math.random() * 100),
                    cacheHit: Math.random() > 0.3,
                    indexesUsed: Math.random() > 0.4,
                    table: 'users'
                };

                newQuery.status = newQuery.executionTime < 500 ? 'fast' : newQuery.executionTime < 2000 ? 'medium' : 'slow';

                this.queries.unshift(newQuery);
                this.renderMetrics();
                this.updateCharts();
                this.renderQueryTable();
            }

            // Update trends
            this.updateTrends();
        }, 5000);
    }
}

// Initialize the framework when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QueryAccelerationFramework();
});