// Knowledge Prioritization Engine - Interactive JavaScript Implementation

class KnowledgePrioritizationEngine {
    constructor() {
        this.knowledgeItems = this.generateSampleData();
        this.scoringWeights = {
            recency: 0.30,
            usage: 0.25,
            relevance: 0.35,
            importance: 0.10
        };
        this.currentContext = 'development';
        this.analyticsHistory = [];
        this.charts = {};
        this.intervals = {};
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDisplay();
        this.startRealTimeUpdates();
    }

    generateSampleData() {
        const categories = ['technical', 'business', 'design', 'research', 'support'];
        const titles = [
            'React Component Best Practices',
            'Database Optimization Techniques',
            'User Experience Design Principles',
            'Machine Learning Fundamentals',
            'API Security Guidelines',
            'Agile Development Methodology',
            'Cloud Architecture Patterns',
            'Data Visualization Techniques',
            'Performance Monitoring Tools',
            'Code Review Standards',
            'Customer Support Workflows',
            'Project Management Strategies',
            'Testing Automation Frameworks',
            'DevOps Pipeline Setup',
            'Mobile App Development'
        ];

        return titles.map((title, index) => ({
            id: index + 1,
            title: title,
            content: `Comprehensive guide and best practices for ${title.toLowerCase()}. This knowledge item contains detailed information, examples, and practical applications.`,
            category: categories[Math.floor(Math.random() * categories.length)],
            importance: Math.floor(Math.random() * 10) + 1,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
            lastAccessed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random access within last 30 days
            accessCount: Math.floor(Math.random() * 50) + 1,
            tags: ['guide', 'best-practices', 'tutorial'],
            relevanceScore: 0,
            priority: 'medium'
        }));
    }

    setupEventListeners() {
        // Parameter sliders
        ['recency', 'usage', 'relevance', 'importance'].forEach(param => {
            const slider = document.getElementById(`${param}-weight`);
            const value = document.getElementById(`${param}-value`);

            slider.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value);
                value.textContent = `${newValue}%`;
                this.scoringWeights[param] = newValue / 100;
                this.updateWeightsDisplay();
                this.recalculateScores();
            });
        });

        // Context selector
        document.getElementById('current-context').addEventListener('change', (e) => {
            this.currentContext = e.target.value;
            this.recalculateScores();
        });

        // Sort selector
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortItems(e.target.value);
        });

        // Time range buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateAnalytics(e.target.dataset.range);
            });
        });

        // Control buttons
        document.getElementById('run-prioritization').addEventListener('click', () => {
            this.runPrioritization();
        });

        document.getElementById('optimize-scores').addEventListener('click', () => {
            this.optimizeScores();
        });

        document.getElementById('export-knowledge').addEventListener('click', () => {
            this.exportKnowledge();
        });

        document.getElementById('reset-parameters').addEventListener('click', () => {
            this.resetParameters();
        });

        document.getElementById('refresh-insights').addEventListener('click', () => {
            this.refreshInsights();
        });

        // Add item modal
        document.getElementById('add-item').addEventListener('click', () => {
            this.showAddItemModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideAddItemModal();
        });

        document.getElementById('cancel-add').addEventListener('click', () => {
            this.hideAddItemModal();
        });

        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addKnowledgeItem();
        });

        // Category search
        document.getElementById('category-search').addEventListener('input', (e) => {
            this.filterCategories(e.target.value);
        });

        // Category selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-item')) {
                const categoryItem = e.target.closest('.category-item');
                const category = categoryItem.dataset.category;
                this.filterItemsByCategory(category);
                document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
                categoryItem.classList.add('active');
            }
        });
    }

    initializeCharts() {
        this.initializeRelevanceTrendChart();
    }

    initializeRelevanceTrendChart() {
        const canvas = document.getElementById('relevance-trend');
        const ctx = canvas.getContext('2d');
        this.charts.relevance = { canvas, ctx };

        this.drawRelevanceTrendChart();
    }

    drawRelevanceTrendChart() {
        const { ctx, canvas } = this.charts.relevance;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Generate trend data
        const dataPoints = 30;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (Math.random() * 0.6 + 0.2) * height // Random values between 20-80%
            });
        }

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);

        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#6366f1';
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    calculateRelevanceScore(item) {
        const now = new Date();
        const daysSinceCreation = (now - item.createdAt) / (1000 * 60 * 60 * 24);
        const daysSinceAccess = (now - item.lastAccessed) / (1000 * 60 * 60 * 24);

        // Recency score (newer items get higher scores)
        const recencyScore = Math.max(0, 1 - (daysSinceCreation / 365));

        // Usage score (more frequently accessed items get higher scores)
        const usageScore = Math.min(1, item.accessCount / 100);

        // Contextual relevance (based on current context and category match)
        const contextMatch = this.getContextRelevance(item.category, this.currentContext);
        const relevanceScore = contextMatch;

        // Importance score (user-defined importance)
        const importanceScore = item.importance / 10;

        // Calculate weighted score
        const totalScore = (
            this.scoringWeights.recency * recencyScore +
            this.scoringWeights.usage * usageScore +
            this.scoringWeights.relevance * relevanceScore +
            this.scoringWeights.importance * importanceScore
        );

        return totalScore;
    }

    getContextRelevance(category, context) {
        const relevanceMatrix = {
            development: { technical: 1.0, business: 0.3, design: 0.5, research: 0.4, support: 0.2 },
            design: { technical: 0.4, business: 0.6, design: 1.0, research: 0.5, support: 0.3 },
            business: { technical: 0.2, business: 1.0, design: 0.4, research: 0.7, support: 0.8 },
            research: { technical: 0.6, business: 0.5, design: 0.3, research: 1.0, support: 0.4 },
            support: { technical: 0.5, business: 0.8, design: 0.2, research: 0.3, support: 1.0 }
        };

        return relevanceMatrix[context]?.[category] || 0.1;
    }

    determinePriority(score) {
        if (score >= 0.8) return 'critical';
        if (score >= 0.6) return 'high';
        if (score >= 0.4) return 'medium';
        return 'low';
    }

    recalculateScores() {
        this.knowledgeItems.forEach(item => {
            item.relevanceScore = this.calculateRelevanceScore(item);
            item.priority = this.determinePriority(item.relevanceScore);
        });

        this.updateDisplay();
        this.updateAnalytics('7d');
    }

    updateDisplay() {
        this.updateOverviewStats();
        this.updatePriorityDistribution();
        this.updateItemsList();
        this.updateCategories();
        this.updateInsights();
    }

    updateOverviewStats() {
        const totalItems = this.knowledgeItems.length;
        const highPriority = this.knowledgeItems.filter(item => item.priority === 'critical' || item.priority === 'high').length;
        const avgRelevance = this.knowledgeItems.reduce((sum, item) => sum + item.relevanceScore, 0) / totalItems;

        document.getElementById('total-items').textContent = totalItems;
        document.getElementById('high-priority').textContent = highPriority;
        document.getElementById('avg-relevance').textContent = `${(avgRelevance * 100).toFixed(1)}%`;
    }

    updatePriorityDistribution() {
        const priorities = {
            critical: this.knowledgeItems.filter(item => item.priority === 'critical').length,
            high: this.knowledgeItems.filter(item => item.priority === 'high').length,
            medium: this.knowledgeItems.filter(item => item.priority === 'medium').length,
            low: this.knowledgeItems.filter(item => item.priority === 'low').length
        };

        const total = this.knowledgeItems.length;

        Object.keys(priorities).forEach(priority => {
            const count = priorities[priority];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            document.getElementById(`${priority}-count`).textContent = count;
            document.getElementById(`${priority}-fill`).style.width = `${percentage}%`;
        });
    }

    updateItemsList() {
        const container = document.getElementById('items-container');
        container.innerHTML = '';

        // Sort items based on current sort setting
        const sortBy = document.getElementById('sort-by').value;
        const sortedItems = [...this.knowledgeItems].sort((a, b) => {
            switch (sortBy) {
                case 'relevance':
                    return b.relevanceScore - a.relevanceScore;
                case 'recency':
                    return b.lastAccessed - a.lastAccessed;
                case 'usage':
                    return b.accessCount - a.accessCount;
                case 'priority':
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                default:
                    return 0;
            }
        });

        sortedItems.forEach(item => {
            const itemElement = this.createItemElement(item);
            container.appendChild(itemElement);
        });
    }

    createItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `knowledge-item ${item.priority}`;
        itemDiv.innerHTML = `
            <div class="item-header">
                <div>
                    <div class="item-title">${item.title}</div>
                    <div class="item-meta">
                        <span class="item-score">${(item.relevanceScore * 100).toFixed(1)}%</span>
                        <span class="item-category">${item.category}</span>
                        <span>Accessed ${item.accessCount} times</span>
                    </div>
                </div>
            </div>
            <div class="item-content">${item.content.substring(0, 150)}...</div>
        `;

        // Add click handler to simulate access
        itemDiv.addEventListener('click', () => {
            item.lastAccessed = new Date();
            item.accessCount++;
            this.recalculateScores();
        });

        return itemDiv;
    }

    updateCategories() {
        const categories = {};
        this.knowledgeItems.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });

        const grid = document.getElementById('categories-grid');
        grid.innerHTML = '';

        Object.entries(categories).forEach(([category, count]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-item';
            categoryDiv.dataset.category = category;
            categoryDiv.innerHTML = `
                <div class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                <div class="category-count">${count} items</div>
            `;
            grid.appendChild(categoryDiv);
        });
    }

    updateInsights() {
        // Update trending topics
        const categoryCounts = {};
        this.knowledgeItems.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });

        const trendingCategory = Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

        document.getElementById('trending-topics').textContent =
            trendingCategory !== 'None' ? `${trendingCategory} knowledge` : 'No trending topics';

        // Update freshness score
        const avgDaysSinceUpdate = this.knowledgeItems.reduce((sum, item) => {
            return sum + (new Date() - item.lastAccessed) / (1000 * 60 * 60 * 24);
        }, 0) / this.knowledgeItems.length;

        const freshness = avgDaysSinceUpdate < 7 ? 'Very fresh' :
                         avgDaysSinceUpdate < 30 ? 'Moderately fresh' : 'Needs updating';

        document.getElementById('freshness-score').textContent = freshness;

        // Update usage patterns
        const highUsageItems = this.knowledgeItems.filter(item => item.accessCount > 20).length;
        const usagePattern = highUsageItems > this.knowledgeItems.length * 0.3 ?
                           'High engagement detected' : 'Normal usage patterns';

        document.getElementById('usage-patterns').textContent = usagePattern;

        // Update attention items
        const needsAttention = this.knowledgeItems.filter(item =>
            item.relevanceScore < 0.3 || (new Date() - item.lastAccessed) > 60 * 24 * 60 * 60 * 1000
        ).length;

        document.getElementById('attention-items').textContent =
            needsAttention > 0 ? `${needsAttention} items need attention` : 'All items are current';
    }

    updateAnalytics(timeRange) {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const avgScore = this.knowledgeItems.reduce((sum, item) => sum + item.relevanceScore, 0) / this.knowledgeItems.length;
        const topItem = this.knowledgeItems.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];

        document.getElementById('avg-score').textContent = (avgScore * 100).toFixed(1);
        document.getElementById('top-item').textContent = topItem?.title.substring(0, 20) + '...' || 'N/A';
        document.getElementById('top-score').textContent = topItem ? (topItem.relevanceScore * 100).toFixed(1) + '%' : '0%';

        // Simulate access rate
        const accessRate = Math.floor(Math.random() * 50) + 10;
        document.getElementById('access-rate').textContent = accessRate;

        this.drawRelevanceTrendChart();
    }

    updateWeightsDisplay() {
        ['recency', 'usage', 'relevance', 'importance'].forEach(param => {
            const value = this.scoringWeights[param] * 100;
            document.getElementById(`${param}-value`).textContent = `${value.toFixed(0)}%`;
        });
    }

    sortItems(criteria) {
        this.updateItemsList();
    }

    filterItemsByCategory(category) {
        const filteredItems = category === 'all' ?
            this.knowledgeItems :
            this.knowledgeItems.filter(item => item.category === category);

        // Update display with filtered items
        const container = document.getElementById('items-container');
        container.innerHTML = '';

        filteredItems.forEach(item => {
            const itemElement = this.createItemElement(item);
            container.appendChild(itemElement);
        });
    }

    filterCategories(searchTerm) {
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            const categoryName = item.querySelector('.category-name').textContent.toLowerCase();
            if (categoryName.includes(searchTerm.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    runPrioritization() {
        const btn = document.getElementById('run-prioritization');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
        btn.disabled = true;

        setTimeout(() => {
            this.recalculateScores();
            btn.innerHTML = originalText;
            btn.disabled = false;
            this.showNotification('Prioritization completed successfully!', 'success');
        }, 2000);
    }

    optimizeScores() {
        // Auto-adjust weights based on current data patterns
        const highRelevanceItems = this.knowledgeItems.filter(item => item.relevanceScore > 0.7).length;
        const lowRelevanceItems = this.knowledgeItems.filter(item => item.relevanceScore < 0.3).length;

        if (highRelevanceItems > lowRelevanceItems) {
            // Increase recency and usage weights
            this.scoringWeights.recency = Math.min(0.4, this.scoringWeights.recency + 0.05);
            this.scoringWeights.usage = Math.min(0.35, this.scoringWeights.usage + 0.05);
            this.scoringWeights.relevance -= 0.05;
            this.scoringWeights.importance -= 0.05;
        } else {
            // Increase relevance and importance weights
            this.scoringWeights.relevance = Math.min(0.45, this.scoringWeights.relevance + 0.05);
            this.scoringWeights.importance = Math.min(0.2, this.scoringWeights.importance + 0.05);
            this.scoringWeights.recency -= 0.025;
            this.scoringWeights.usage -= 0.025;
        }

        this.updateWeightsDisplay();
        this.recalculateScores();
        this.showNotification('Scores optimized based on current patterns!', 'success');
    }

    exportKnowledge() {
        const data = {
            timestamp: new Date().toISOString(),
            parameters: this.scoringWeights,
            context: this.currentContext,
            items: this.knowledgeItems.map(item => ({
                ...item,
                relevanceScore: item.relevanceScore,
                priority: item.priority
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-prioritization-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Knowledge data exported successfully!', 'success');
    }

    resetParameters() {
        if (confirm('Reset all scoring parameters to default values?')) {
            this.scoringWeights = {
                recency: 0.30,
                usage: 0.25,
                relevance: 0.35,
                importance: 0.10
            };

            document.getElementById('current-context').value = 'development';
            this.currentContext = 'development';

            this.updateWeightsDisplay();
            this.recalculateScores();
            this.showNotification('Parameters reset to defaults!', 'info');
        }
    }

    refreshInsights() {
        const btn = document.getElementById('refresh-insights');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

        setTimeout(() => {
            this.updateInsights();
            btn.innerHTML = originalText;
            this.showNotification('Insights refreshed!', 'success');
        }, 1500);
    }

    showAddItemModal() {
        document.getElementById('add-item-modal').classList.add('show');
    }

    hideAddItemModal() {
        document.getElementById('add-item-modal').classList.remove('show');
        document.getElementById('add-item-form').reset();
    }

    addKnowledgeItem() {
        const formData = new FormData(document.getElementById('add-item-form'));
        const newItem = {
            id: this.knowledgeItems.length + 1,
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category'),
            importance: parseInt(formData.get('importance')),
            createdAt: new Date(),
            lastAccessed: new Date(),
            accessCount: 0,
            tags: ['user-added'],
            relevanceScore: 0,
            priority: 'medium'
        };

        this.knowledgeItems.push(newItem);
        this.hideAddItemModal();
        this.recalculateScores();
        this.showNotification('Knowledge item added successfully!', 'success');
    }

    startRealTimeUpdates() {
        // Update last update time
        this.intervals.updateTime = setInterval(() => {
            document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
        }, 60000);

        // Simulate real-time score adjustments
        this.intervals.scoreUpdate = setInterval(() => {
            // Randomly update access counts for some items
            const randomItems = this.knowledgeItems
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 3) + 1);

            randomItems.forEach(item => {
                if (Math.random() > 0.7) {
                    item.accessCount++;
                    item.lastAccessed = new Date();
                }
            });

            if (randomItems.length > 0) {
                this.recalculateScores();
            }
        }, 10000); // Update every 10 seconds
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    destroy() {
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Initialize the engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.knowledgeEngine = new KnowledgePrioritizationEngine();
});

// Add notification styles dynamically
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    background: #10b981;
}

.notification.error {
    background: #ef4444;
}

.notification.info {
    background: #06b6d4;
}
`;

const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);