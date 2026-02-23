/**
 * Semantic Search Accelerator
 * Enterprise-grade semantic search platform with advanced AI capabilities
 * Version 1.0.0
 */

class SemanticSearchAccelerator {
    constructor() {
        this.documents = new Map();
        this.index = new SearchIndex();
        this.vectorStore = new VectorStore();
        this.queryProcessor = new QueryProcessor();
        this.analytics = new SearchAnalytics();
        this.settings = this.loadSettings();
        this.currentUser = null;
        this.searchHistory = [];
        this.systemStatus = 'initializing';

        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.initializeCharts();
        this.loadData();
        this.startSystem();
        this.updateUI();
        this.startPeriodicUpdates();
        this.logSystemEvent('system', 'startup', 'Semantic Search Accelerator initialized');
        console.log('Semantic Search Accelerator initialized');
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.navigateToSection(e.target.dataset.section));
        });

        // Dashboard
        document.getElementById('refreshDashboardBtn').addEventListener('click', () => this.refreshDashboard());
        document.getElementById('exportDashboardBtn').addEventListener('click', () => this.exportDashboard());

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('advancedSearchBtn').addEventListener('click', () => this.showAdvancedSearch());
        document.getElementById('saveSearchBtn').addEventListener('click', () => this.saveSearch());
        document.getElementById('resultLimit').addEventListener('change', () => this.updateSearchResults());
        document.getElementById('sortBy').addEventListener('change', () => this.sortResults());
        document.getElementById('relevanceThreshold').addEventListener('input', (e) => {
            document.getElementById('thresholdValue').textContent = e.target.value;
        });

        // Pagination
        document.getElementById('prevPageBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPageBtn').addEventListener('click', () => this.nextPage());

        // Documents
        document.getElementById('uploadDocumentBtn').addEventListener('click', () => this.showUploadModal());
        document.getElementById('bulkImportBtn').addEventListener('click', () => this.bulkImport());
        document.getElementById('exportDocumentsBtn').addEventListener('click', () => this.exportDocuments());
        document.getElementById('applyDocumentFiltersBtn').addEventListener('click', () => this.applyDocumentFilters());

        // Index Management
        document.getElementById('createIndexBtn').addEventListener('click', () => this.createIndex());
        document.getElementById('rebuildIndexBtn').addEventListener('click', () => this.rebuildIndex());
        document.getElementById('optimizeIndexBtn').addEventListener('click', () => this.optimizeIndex());
        document.getElementById('saveIndexConfigBtn').addEventListener('click', () => this.saveIndexConfig());
        document.getElementById('resetIndexConfigBtn').addEventListener('click', () => this.resetIndexConfig());
        document.getElementById('startRebuildBtn').addEventListener('click', () => this.startRebuild());
        document.getElementById('startOptimizeBtn').addEventListener('click', () => this.startOptimize());
        document.getElementById('startBackupBtn').addEventListener('click', () => this.startBackup());
        document.getElementById('viewStatsBtn').addEventListener('click', () => this.viewIndexStats());

        // Analytics
        document.getElementById('analyticsTimeRange').addEventListener('change', () => this.updateAnalytics());
        document.getElementById('generateAnalyticsReportBtn').addEventListener('click', () => this.generateAnalyticsReport());
        document.getElementById('exportAnalyticsBtn').addEventListener('click', () => this.exportAnalytics());

        // Settings
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSettingsTab(e.target));
        });
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettings());
        document.getElementById('exportSettingsBtn').addEventListener('click', () => this.exportSettings());
        document.getElementById('importSettingsBtn').addEventListener('click', () => this.importSettings());
        document.getElementById('defaultRelevanceThreshold').addEventListener('input', (e) => {
            document.getElementById('thresholdDisplay').textContent = e.target.value;
        });

        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.showLogin());

        // Modals
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });
        document.getElementById('cancelUploadBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('startUploadBtn').addEventListener('click', () => this.uploadDocuments());
        document.getElementById('resetAdvancedSearchBtn').addEventListener('click', () => this.resetAdvancedSearch());
        document.getElementById('applyAdvancedSearchBtn').addEventListener('click', () => this.applyAdvancedSearch());

        // File inputs
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelection(e));
        document.getElementById('settingsFileInput').addEventListener('change', (e) => this.handleSettingsImport(e));
    }

    initializeCharts() {
        // Query Performance Chart
        const queryCtx = document.getElementById('queryPerformanceChart').getContext('2d');
        this.charts = {
            queryPerformance: new Chart(queryCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Query Response Time (ms)',
                        data: [],
                        borderColor: 'rgba(30, 64, 175, 1)',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }),

            // Search Volume Chart
            searchVolume: new Chart(document.getElementById('searchVolumeChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Search Queries',
                        data: [],
                        backgroundColor: 'rgba(5, 150, 105, 0.8)',
                        borderColor: 'rgba(5, 150, 105, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }),

            // Content Type Chart
            contentType: new Chart(document.getElementById('contentTypeChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Documents', 'Web Pages', 'Emails', 'Code Files', 'Other'],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgba(30, 64, 175, 0.8)',
                            'rgba(5, 150, 105, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(139, 69, 19, 0.8)',
                            'rgba(75, 85, 99, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Top Terms Chart
            topTerms: new Chart(document.getElementById('topTermsChart').getContext('2d'), {
                type: 'horizontalBar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Search Frequency',
                        data: [],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            }),

            // User Engagement Chart
            userEngagement: new Chart(document.getElementById('userEngagementChart').getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Click-through Rate', 'Session Duration', 'Query Refinement', 'Result Satisfaction', 'Return Visits'],
                    datasets: [{
                        label: 'Engagement Score',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderColor: 'rgba(245, 158, 11, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Accuracy Trends Chart
            accuracyTrends: new Chart(document.getElementById('accuracyTrendsChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Search Accuracy (%)',
                        data: [],
                        borderColor: 'rgba(5, 150, 105, 1)',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            }),

            // Resource Usage Chart
            resourceUsage: new Chart(document.getElementById('resourceUsageChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['CPU', 'Memory', 'Disk I/O', 'Network', 'GPU'],
                    datasets: [{
                        label: 'Usage (%)',
                        data: [],
                        backgroundColor: 'rgba(139, 69, 19, 0.8)',
                        borderColor: 'rgba(139, 69, 19, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            }),

            // Query Volume Over Time Chart
            queryVolumeOverTime: new Chart(document.getElementById('queryVolumeChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Queries per Hour',
                        data: [],
                        borderColor: 'rgba(30, 64, 175, 1)',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Search Performance Chart
            searchPerformance: new Chart(document.getElementById('searchPerformanceChart').getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Speed', 'Accuracy', 'Relevance', 'Completeness', 'User Satisfaction'],
                    datasets: [{
                        label: 'Performance Score',
                        data: [],
                        backgroundColor: 'rgba(5, 150, 105, 0.2)',
                        borderColor: 'rgba(5, 150, 105, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            })
        };
    }

    loadData() {
        // Load sample documents
        this.loadSampleDocuments();
        this.loadSavedData();
    }

    loadSampleDocuments() {
        const sampleDocs = [
            {
                id: 'doc_001',
                name: 'Machine Learning Fundamentals.pdf',
                type: 'pdf',
                size: 2457600,
                content: 'Machine learning is a subset of artificial intelligence that enables computers to learn without being explicitly programmed. It involves algorithms that can identify patterns in data and make predictions or decisions based on those patterns.',
                vector: this.generateRandomVector(768),
                metadata: {
                    author: 'Dr. Sarah Johnson',
                    created: '2024-01-15',
                    language: 'en',
                    tags: ['machine learning', 'AI', 'algorithms']
                },
                status: 'indexed',
                indexedAt: new Date('2024-01-15T10:30:00Z')
            },
            {
                id: 'doc_002',
                name: 'Natural Language Processing Guide.html',
                type: 'html',
                size: 1843200,
                content: 'Natural Language Processing (NLP) is a field of AI that focuses on the interaction between computers and human language. It involves techniques for understanding, interpreting, and generating human language.',
                vector: this.generateRandomVector(768),
                metadata: {
                    author: 'Prof. Michael Chen',
                    created: '2024-01-20',
                    language: 'en',
                    tags: ['NLP', 'AI', 'language processing']
                },
                status: 'indexed',
                indexedAt: new Date('2024-01-20T14:15:00Z')
            },
            {
                id: 'doc_003',
                name: 'Vector Databases Explained.md',
                type: 'md',
                size: 512000,
                content: 'Vector databases are specialized databases designed to store and query high-dimensional vectors efficiently. They are essential for modern AI applications including semantic search, recommendation systems, and similarity matching.',
                vector: this.generateRandomVector(768),
                metadata: {
                    author: 'Alex Rodriguez',
                    created: '2024-01-25',
                    language: 'en',
                    tags: ['vector database', 'AI', 'search']
                },
                status: 'indexed',
                indexedAt: new Date('2024-01-25T09:45:00Z')
            },
            {
                id: 'doc_004',
                name: 'Enterprise Search Solutions.docx',
                type: 'docx',
                size: 3145728,
                content: 'Enterprise search solutions provide organizations with powerful tools to find information across vast amounts of structured and unstructured data. Modern solutions incorporate AI and machine learning to deliver relevant results.',
                vector: this.generateRandomVector(768),
                metadata: {
                    author: 'Enterprise Solutions Inc.',
                    created: '2024-02-01',
                    language: 'en',
                    tags: ['enterprise search', 'business intelligence', 'AI']
                },
                status: 'processing',
                indexedAt: null
            },
            {
                id: 'doc_005',
                name: 'API Documentation.json',
                type: 'json',
                size: 102400,
                content: 'This API provides endpoints for semantic search functionality including document indexing, vector similarity search, and query processing with advanced filtering options.',
                vector: this.generateRandomVector(768),
                metadata: {
                    author: 'Dev Team',
                    created: '2024-02-05',
                    language: 'en',
                    tags: ['API', 'documentation', 'search']
                },
                status: 'indexed',
                indexedAt: new Date('2024-02-05T16:20:00Z')
            }
        ];

        sampleDocs.forEach(doc => {
            this.documents.set(doc.id, doc);
            if (doc.status === 'indexed') {
                this.index.addDocument(doc);
                this.vectorStore.store(doc.id, doc.vector);
            }
        });
    }

    generateRandomVector(dimensions) {
        return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
    }

    loadSavedData() {
        const savedData = localStorage.getItem('searchAcceleratorData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.searchHistory = data.searchHistory || [];
            this.currentUser = data.currentUser || null;
        }
    }

    saveData() {
        const dataToSave = {
            documents: Array.from(this.documents.entries()),
            searchHistory: this.searchHistory.slice(-100), // Keep last 100 searches
            currentUser: this.currentUser,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('searchAcceleratorData', JSON.stringify(dataToSave));
    }

    loadSettings() {
        const defaultSettings = {
            systemName: 'Semantic Search Accelerator',
            defaultLanguage: 'en',
            timezone: 'UTC',
            enableLogging: true,
            defaultSearchMode: 'semantic',
            maxResultsPerPage: 25,
            defaultRelevanceThreshold: 0.7,
            enableFuzzyMatching: true,
            enableAutocomplete: true,
            autoIndexUpdates: true,
            indexUpdateFrequency: 'hourly',
            maxIndexSize: 100,
            enableCompression: true,
            enableAuth: true,
            sessionTimeout: 60,
            enableEncryption: true,
            enableRateLimiting: true,
            enableCache: true,
            cacheSize: 512,
            maxConcurrentSearches: 100,
            queryTimeout: 30
        };

        const saved = localStorage.getItem('searchAcceleratorSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    startSystem() {
        this.systemStatus = 'running';
        this.index.initialize();
        this.vectorStore.initialize();
        this.queryProcessor.initialize();
        this.analytics.initialize();

        // Start periodic health checks
        setInterval(() => this.performHealthCheck(), 30000);
    }

    performHealthCheck() {
        // Update system metrics
        this.updateSystemMetrics();

        // Check index health
        const indexHealth = this.index.getHealthStatus();
        if (indexHealth.status !== 'healthy') {
            this.logSystemEvent('system', 'health_warning', `Index health: ${indexHealth.status}`);
        }

        this.updateUI();
    }

    updateSystemMetrics() {
        // Simulate system metrics
        this.systemMetrics = {
            cpuUsage: Math.floor(Math.random() * 30) + 40,
            memoryUsage: Math.floor(Math.random() * 25) + 50,
            diskUsage: Math.floor(Math.random() * 20) + 60,
            networkUsage: Math.floor(Math.random() * 15) + 25,
            queryRate: Math.floor(Math.random() * 50) + 100,
            avgResponseTime: Math.floor(Math.random() * 20) + 35,
            indexSize: this.documents.size * 1000000, // Simulate size
            searchAccuracy: Math.floor(Math.random() * 10) + 85
        };
    }

    updateUI() {
        this.updateDashboard();
        this.updateNavigation();
        this.updateCurrentUserDisplay();
        this.refreshAllViews();
        this.updateCharts();
        this.updateSystemStatus();
    }

    updateDashboard() {
        // Update metrics
        document.getElementById('totalQueries').textContent = this.analytics.getTotalQueries().toLocaleString();
        document.getElementById('avgQueryTime').textContent = `${this.analytics.getAverageQueryTime()}ms`;
        document.getElementById('indexedDocuments').textContent = Array.from(this.documents.values()).filter(d => d.status === 'indexed').length.toLocaleString();
        document.getElementById('searchAccuracy').textContent = `${this.analytics.getSearchAccuracy()}%`;

        // Update status bar
        document.getElementById('indexSize').textContent = this.formatBytes(this.systemMetrics?.indexSize || 0);
        document.getElementById('queryRate').textContent = `${this.systemMetrics?.queryRate || 0}/min`;
        document.getElementById('avgResponse').textContent = `${this.systemMetrics?.avgResponseTime || 0}ms`;

        // Update health metrics
        if (this.systemMetrics) {
            document.getElementById('cpuUsage').style.width = `${this.systemMetrics.cpuUsage}%`;
            document.getElementById('cpuUsageValue').textContent = `${this.systemMetrics.cpuUsage}%`;

            document.getElementById('memoryUsage').style.width = `${this.systemMetrics.memoryUsage}%`;
            document.getElementById('memoryUsageValue').textContent = `${this.systemMetrics.memoryUsage}%`;

            document.getElementById('diskUsage').style.width = `${this.systemMetrics.diskUsage}%`;
            document.getElementById('diskUsageValue').textContent = `${this.systemMetrics.diskUsage}%`;

            document.getElementById('networkUsage').style.width = `${this.systemMetrics.networkUsage}%`;
            document.getElementById('networkUsageValue').textContent = `${this.systemMetrics.networkUsage}%`;
        }

        // Update recent activity
        this.updateRecentActivity();

        // Update top queries
        this.updateTopQueries();
    }

    updateRecentActivity() {
        const activityFeed = document.getElementById('recentActivity');
        activityFeed.innerHTML = '';

        // Get recent search activity
        const recentSearches = this.searchHistory.slice(-5).reverse();

        recentSearches.forEach(search => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-search"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-message">Search: "${search.query}"</div>
                    <div class="activity-time">${new Date(search.timestamp).toLocaleTimeString()} - ${search.resultsCount} results</div>
                </div>
            `;

            activityFeed.appendChild(activityItem);
        });
    }

    updateTopQueries() {
        const topQueries = document.getElementById('topQueries');
        topQueries.innerHTML = '';

        // Get top search queries
        const queryCounts = {};
        this.searchHistory.forEach(search => {
            queryCounts[search.query] = (queryCounts[search.query] || 0) + 1;
        });

        const sortedQueries = Object.entries(queryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        sortedQueries.forEach(([query, count]) => {
            const queryItem = document.createElement('div');
            queryItem.className = 'query-item';

            queryItem.innerHTML = `
                <div class="query-text">${query}</div>
                <div class="query-count">${count}</div>
            `;

            topQueries.appendChild(queryItem);
        });
    }

    updateNavigation() {
        // Update navigation based on system status
    }

    updateCurrentUserDisplay() {
        const currentUserElement = document.getElementById('currentUser');
        const loginBtn = document.getElementById('loginBtn');

        if (this.currentUser) {
            currentUserElement.textContent = this.currentUser;
            loginBtn.style.display = 'none';
        } else {
            currentUserElement.textContent = 'Not logged in';
            loginBtn.style.display = 'inline-block';
        }
    }

    updateSystemStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');

        statusIndicator.classList.remove('active', 'inactive');
        statusIndicator.classList.add(this.systemStatus === 'running' ? 'active' : 'inactive');
        statusText.textContent = `System ${this.systemStatus}`;
    }

    refreshAllViews() {
        this.refreshDocumentsView();
        this.refreshIndexView();
        this.refreshAnalyticsView();
    }

    refreshDocumentsView() {
        this.displayDocuments();
    }

    refreshIndexView() {
        this.updateIndexStats();
    }

    refreshAnalyticsView() {
        this.updateAnalyticsCharts();
    }

    updateCharts() {
        this.updateQueryPerformanceChart();
        this.updateSearchVolumeChart();
        this.updateAnalyticsCharts();
    }

    updateQueryPerformanceChart() {
        // Simulate query performance data
        const labels = [];
        const data = [];

        for (let i = 9; i >= 0; i--) {
            const time = new Date(Date.now() - i * 60000);
            labels.push(time.toLocaleTimeString());
            data.push(Math.floor(Math.random() * 50) + 30);
        }

        this.charts.queryPerformance.data.labels = labels;
        this.charts.queryPerformance.data.datasets[0].data = data;
        this.charts.queryPerformance.update();
    }

    updateSearchVolumeChart() {
        // Simulate search volume data
        const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        const data = labels.map(() => Math.floor(Math.random() * 100) + 50);

        this.charts.searchVolume.data.labels = labels;
        this.charts.searchVolume.data.datasets[0].data = data;
        this.charts.searchVolume.update();
    }

    updateAnalyticsCharts() {
        // Update content type distribution
        const contentTypes = this.getContentTypeDistribution();
        this.charts.contentType.data.datasets[0].data = Object.values(contentTypes);
        this.charts.contentType.update();

        // Update top terms
        const topTerms = this.getTopSearchTerms();
        this.charts.topTerms.data.labels = topTerms.labels;
        this.charts.topTerms.data.datasets[0].data = topTerms.data;
        this.charts.topTerms.update();

        // Update user engagement
        const engagementData = [
            Math.floor(Math.random() * 20) + 70,
            Math.floor(Math.random() * 15) + 75,
            Math.floor(Math.random() * 25) + 60,
            Math.floor(Math.random() * 30) + 65,
            Math.floor(Math.random() * 20) + 70
        ];
        this.charts.userEngagement.data.datasets[0].data = engagementData;
        this.charts.userEngagement.update();

        // Update accuracy trends
        const accuracyData = this.getAccuracyTrendsData();
        this.charts.accuracyTrends.data.labels = accuracyData.labels;
        this.charts.accuracyTrends.data.datasets[0].data = accuracyData.data;
        this.charts.accuracyTrends.update();

        // Update resource usage
        const resourceData = [
            this.systemMetrics?.cpuUsage || 45,
            this.systemMetrics?.memoryUsage || 62,
            this.systemMetrics?.diskUsage || 78,
            this.systemMetrics?.networkUsage || 34,
            Math.floor(Math.random() * 20) + 20
        ];
        this.charts.resourceUsage.data.datasets[0].data = resourceData;
        this.charts.resourceUsage.update();

        // Update query volume over time
        const queryVolumeData = this.getQueryVolumeData();
        this.charts.queryVolumeOverTime.data.labels = queryVolumeData.labels;
        this.charts.queryVolumeOverTime.data.datasets[0].data = queryVolumeData.data;
        this.charts.queryVolumeOverTime.update();

        // Update search performance
        const performanceData = [
            Math.floor(Math.random() * 10) + 85,
            Math.floor(Math.random() * 10) + 88,
            Math.floor(Math.random() * 10) + 82,
            Math.floor(Math.random() * 10) + 90,
            Math.floor(Math.random() * 10) + 86
        ];
        this.charts.searchPerformance.data.datasets[0].data = performanceData;
        this.charts.searchPerformance.update();

        // Update insights
        this.updateKeyInsights();
    }

    getContentTypeDistribution() {
        const types = {};
        this.documents.forEach(doc => {
            const type = doc.type.toLowerCase();
            types[type] = (types[type] || 0) + 1;
        });
        return types;
    }

    getTopSearchTerms() {
        const terms = {};
        this.searchHistory.forEach(search => {
            const words = search.query.toLowerCase().split(' ');
            words.forEach(word => {
                if (word.length > 3) {
                    terms[word] = (terms[word] || 0) + 1;
                }
            });
        });

        const sorted = Object.entries(terms).sort(([,a], [,b]) => b - a).slice(0, 10);
        return {
            labels: sorted.map(([term]) => term),
            data: sorted.map(([,count]) => count)
        };
    }

    getAccuracyTrendsData() {
        const labels = [];
        const data = [];

        for (let i = 9; i >= 0; i--) {
            const time = new Date(Date.now() - i * 3600000);
            labels.push(time.toLocaleTimeString());
            data.push(Math.floor(Math.random() * 5) + 90);
        }

        return { labels, data };
    }

    getQueryVolumeData() {
        const labels = [];
        const data = [];

        for (let i = 23; i >= 0; i--) {
            const time = new Date(Date.now() - i * 3600000);
            labels.push(time.getHours() + ':00');
            data.push(Math.floor(Math.random() * 50) + 20);
        }

        return { labels, data };
    }

    updateKeyInsights() {
        const insightsList = document.getElementById('keyInsights');
        insightsList.innerHTML = '';

        const insights = [
            {
                title: 'Query Performance',
                description: 'Average query response time improved by 15% this week',
                metric: '42ms'
            },
            {
                title: 'Search Accuracy',
                description: 'Semantic search accuracy reached 94.7% with new embeddings',
                metric: '94.7%'
            },
            {
                title: 'User Engagement',
                description: 'Click-through rate increased by 22% after UI improvements',
                metric: '68%'
            },
            {
                title: 'Index Efficiency',
                description: 'Index size optimized, reducing storage by 30%',
                metric: '2.1GB'
            }
        ];

        insights.forEach(insight => {
            const insightElement = document.createElement('div');
            insightElement.className = 'insight-item';

            insightElement.innerHTML = `
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
                <div class="insight-metric">${insight.metric}</div>
            `;

            insightsList.appendChild(insightElement);
        });
    }

    // Search Functionality
    async performSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        if (!query) {
            alert('Please enter a search query');
            return;
        }

        const searchMode = document.getElementById('searchMode').value;
        const resultLimit = parseInt(document.getElementById('resultLimit').value);
        const relevanceThreshold = parseFloat(document.getElementById('relevanceThreshold').value);

        // Show loading state
        this.showSearchLoading();

        try {
            const startTime = Date.now();
            let results = [];

            switch (searchMode) {
                case 'semantic':
                    results = await this.performSemanticSearch(query, resultLimit, relevanceThreshold);
                    break;
                case 'keyword':
                    results = await this.performKeywordSearch(query, resultLimit);
                    break;
                case 'hybrid':
                    results = await this.performHybridSearch(query, resultLimit, relevanceThreshold);
                    break;
                case 'vector':
                    results = await this.performVectorSearch(query, resultLimit, relevanceThreshold);
                    break;
            }

            const searchTime = Date.now() - startTime;

            // Record search in history
            this.recordSearch(query, results.length, searchTime);

            // Display results
            this.displaySearchResults(results, searchTime);

            // Update analytics
            this.analytics.recordSearch(query, results.length, searchTime);

        } catch (error) {
            console.error('Search error:', error);
            this.showSearchError('An error occurred during search. Please try again.');
        } finally {
            this.hideSearchLoading();
        }
    }

    async performSemanticSearch(query, limit, threshold) {
        // Generate query embedding
        const queryVector = await this.generateEmbedding(query);

        // Find similar documents using vector similarity
        const similarities = [];
        for (const [docId, doc] of this.documents) {
            if (doc.status === 'indexed' && doc.vector) {
                const similarity = this.cosineSimilarity(queryVector, doc.vector);
                if (similarity >= threshold) {
                    similarities.push({
                        document: doc,
                        similarity: similarity,
                        score: similarity * 100
                    });
                }
            }
        }

        // Sort by similarity and return top results
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => ({
                id: item.document.id,
                title: item.document.name,
                content: item.document.content,
                similarity: item.similarity,
                score: item.score,
                metadata: item.document.metadata,
                type: item.document.type
            }));
    }

    async performKeywordSearch(query, limit) {
        const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
        const results = [];

        for (const [docId, doc] of this.documents) {
            if (doc.status === 'indexed') {
                const content = doc.content.toLowerCase();
                const title = doc.name.toLowerCase();

                let score = 0;
                keywords.forEach(keyword => {
                    // Title matches have higher weight
                    const titleMatches = (title.match(new RegExp(keyword, 'g')) || []).length;
                    const contentMatches = (content.match(new RegExp(keyword, 'g')) || []).length;

                    score += titleMatches * 10 + contentMatches;
                });

                if (score > 0) {
                    results.push({
                        id: doc.id,
                        title: doc.name,
                        content: doc.content,
                        score: score,
                        metadata: doc.metadata,
                        type: doc.type
                    });
                }
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    async performHybridSearch(query, limit, threshold) {
        const semanticResults = await this.performSemanticSearch(query, limit * 2, threshold * 0.8);
        const keywordResults = await this.performKeywordSearch(query, limit * 2);

        // Combine and deduplicate results
        const combined = new Map();

        // Add semantic results with higher weight
        semanticResults.forEach(result => {
            combined.set(result.id, {
                ...result,
                combinedScore: result.score * 0.7 + (result.similarity * 100) * 0.3
            });
        });

        // Add keyword results
        keywordResults.forEach(result => {
            if (combined.has(result.id)) {
                // Boost existing result
                const existing = combined.get(result.id);
                existing.combinedScore = (existing.combinedScore + result.score * 0.5) / 1.5;
            } else {
                combined.set(result.id, {
                    ...result,
                    combinedScore: result.score * 0.5
                });
            }
        });

        return Array.from(combined.values())
            .sort((a, b) => b.combinedScore - a.combinedScore)
            .slice(0, limit);
    }

    async performVectorSearch(query, limit, threshold) {
        // Pure vector similarity search
        return await this.performSemanticSearch(query, limit, threshold);
    }

    async generateEmbedding(text) {
        // Simulate embedding generation (in real implementation, this would call an ML model)
        const words = text.toLowerCase().split(' ');
        const vector = new Array(768).fill(0);

        words.forEach((word, index) => {
            const hash = this.simpleHash(word);
            for (let i = 0; i < 768; i++) {
                vector[i] += Math.sin(hash + i) * 0.1;
            }
        });

        // Normalize vector
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map(val => val / magnitude);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    showSearchLoading() {
        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = `
            <div class="loading-results">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching...</p>
            </div>
        `;
        document.getElementById('resultsCount').textContent = 'Searching...';
        document.getElementById('searchTime').textContent = '';
    }

    hideSearchLoading() {
        // Loading state is cleared when results are displayed
    }

    showSearchError(message) {
        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = `
            <div class="error-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
        document.getElementById('resultsCount').textContent = 'Error';
        document.getElementById('searchTime').textContent = '';
    }

    recordSearch(query, resultsCount, searchTime) {
        this.searchHistory.push({
            query,
            resultsCount,
            searchTime,
            timestamp: new Date().toISOString(),
            user: this.currentUser || 'anonymous'
        });

        // Keep only last 1000 searches
        if (this.searchHistory.length > 1000) {
            this.searchHistory = this.searchHistory.slice(-1000);
        }
    }

    displaySearchResults(results, searchTime) {
        const resultsList = document.getElementById('resultsList');
        const resultsCount = document.getElementById('resultsCount');
        const searchTimeElement = document.getElementById('searchTime');

        resultsCount.textContent = `${results.length} results found`;
        searchTimeElement.textContent = `(${searchTime}ms)`;

        if (results.length === 0) {
            resultsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try adjusting your search query or filters</p>
                </div>
            `;
            return;
        }

        resultsList.innerHTML = '';

        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const relevanceClass = result.score > 80 ? 'high' : result.score > 60 ? 'medium' : 'low';

            resultItem.innerHTML = `
                <div class="result-title">
                    <a href="#" onclick="accelerator.showDocumentDetails('${result.id}')">${this.highlightQuery(result.title, this.getCurrentQuery())}</a>
                </div>
                <div class="result-snippet">${this.highlightQuery(this.truncateText(result.content, 200), this.getCurrentQuery())}</div>
                <div class="result-meta">
                    <span class="result-type">${result.type.toUpperCase()}</span>
                    <span class="result-relevance">
                        <i class="fas fa-star"></i>
                        Relevance: ${result.score ? result.score.toFixed(1) : 'N/A'}%
                    </span>
                    <span class="result-date">${result.metadata?.created ? new Date(result.metadata.created).toLocaleDateString() : 'Unknown'}</span>
                </div>
            `;

            resultsList.appendChild(resultItem);
        });

        // Update pagination
        this.updatePagination(results.length);
    }

    getCurrentQuery() {
        return document.getElementById('searchQuery').value.trim();
    }

    highlightQuery(text, query) {
        if (!query) return text;

        const words = query.split(' ').filter(word => word.length > 2);
        let highlighted = text;

        words.forEach(word => {
            const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });

        return highlighted;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    updatePagination(totalResults) {
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');

        // Simple pagination logic
        pageInfo.textContent = 'Page 1 of 1';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }

    previousPage() {
        // Implement pagination
    }

    nextPage() {
        // Implement pagination
    }

    sortResults() {
        // Implement result sorting
        this.performSearch();
    }

    updateSearchResults() {
        // Re-run search with new limit
        this.performSearch();
    }

    // Document Management
    displayDocuments() {
        const documentGrid = document.getElementById('documentGrid');
        documentGrid.innerHTML = '';

        this.documents.forEach(doc => {
            const documentCard = document.createElement('div');
            documentCard.className = 'document-card';
            documentCard.onclick = () => this.showDocumentDetails(doc.id);

            const iconClass = this.getDocumentIcon(doc.type);
            const statusClass = `document-status ${doc.status}`;

            documentCard.innerHTML = `
                <div class="document-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">
                    ${this.formatBytes(doc.size)} • ${doc.metadata?.created ? new Date(doc.metadata.created).toLocaleDateString() : 'Unknown'}
                </div>
                <div class="${statusClass}">${doc.status}</div>
            `;

            documentGrid.appendChild(documentCard);
        });
    }

    getDocumentIcon(type) {
        const icons = {
            'pdf': 'fa-file-pdf',
            'docx': 'fa-file-word',
            'txt': 'fa-file-alt',
            'html': 'fa-file-code',
            'json': 'fa-file-code',
            'md': 'fa-file-alt'
        };
        return icons[type] || 'fa-file';
    }

    showDocumentDetails(docId) {
        const doc = this.documents.get(docId);
        if (!doc) return;

        const panel = document.getElementById('documentDetailsPanel');
        const title = document.getElementById('documentDetailsTitle');
        const content = document.getElementById('documentDetailsContent');

        title.textContent = doc.name;
        content.innerHTML = `
            <div class="document-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <p><strong>Type:</strong> ${doc.type.toUpperCase()}</p>
                    <p><strong>Size:</strong> ${this.formatBytes(doc.size)}</p>
                    <p><strong>Status:</strong> ${doc.status}</p>
                    <p><strong>Created:</strong> ${doc.metadata?.created ? new Date(doc.metadata.created).toLocaleString() : 'Unknown'}</p>
                    <p><strong>Indexed:</strong> ${doc.indexedAt ? new Date(doc.indexedAt).toLocaleString() : 'Not indexed'}</p>
                </div>
                <div class="detail-section">
                    <h4>Metadata</h4>
                    <p><strong>Author:</strong> ${doc.metadata?.author || 'Unknown'}</p>
                    <p><strong>Language:</strong> ${doc.metadata?.language || 'Unknown'}</p>
                    <p><strong>Tags:</strong> ${doc.metadata?.tags ? doc.metadata.tags.join(', ') : 'None'}</p>
                </div>
                <div class="detail-section">
                    <h4>Content Preview</h4>
                    <div class="content-preview">${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}</div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="accelerator.reindexDocument('${doc.id}')">Re-index</button>
                    <button class="btn btn-secondary" onclick="accelerator.downloadDocument('${doc.id}')">Download</button>
                    <button class="btn btn-danger" onclick="accelerator.deleteDocument('${doc.id}')">Delete</button>
                </div>
            </div>
        `;

        panel.classList.add('open');
    }

    closeDocumentDetails() {
        document.getElementById('documentDetailsPanel').classList.remove('open');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Index Management
    updateIndexStats() {
        const indexedDocs = Array.from(this.documents.values()).filter(d => d.status === 'indexed').length;
        const totalSize = Array.from(this.documents.values()).reduce((sum, doc) => sum + doc.size, 0);

        document.getElementById('totalDocs').textContent = indexedDocs.toLocaleString();
        document.getElementById('indexSizeStat').textContent = this.formatBytes(totalSize);
        document.getElementById('lastUpdate').textContent = '2 minutes ago';
        document.getElementById('indexHealth').textContent = 'Excellent';
    }

    createIndex() {
        alert('Index creation initiated. This would create a new search index.');
        this.logSystemEvent('index', 'create', 'New index creation started');
    }

    rebuildIndex() {
        alert('Index rebuild initiated. This would rebuild the entire search index.');
        this.logSystemEvent('index', 'rebuild', 'Index rebuild started');
    }

    optimizeIndex() {
        alert('Index optimization initiated. This would optimize the search index for better performance.');
        this.logSystemEvent('index', 'optimize', 'Index optimization started');
    }

    saveIndexConfig() {
        // Save index configuration
        const config = {
            name: document.getElementById('indexName').value,
            vectorDimensions: parseInt(document.getElementById('vectorDimensions').value),
            similarityMetric: document.getElementById('similarityMetric').value,
            chunkSize: parseInt(document.getElementById('chunkSize').value),
            overlapSize: parseInt(document.getElementById('overlapSize').value),
            maxResults: parseInt(document.getElementById('maxResults').value)
        };

        localStorage.setItem('indexConfig', JSON.stringify(config));
        alert('Index configuration saved successfully');
        this.logSystemEvent('index', 'config_save', 'Index configuration updated');
    }

    startRebuild() {
        // Simulate index rebuild
        const progressFill = document.getElementById('rebuildProgressFill');
        const progressStatus = document.getElementById('rebuildStatus');
        const progressDiv = document.getElementById('rebuildProgress');

        progressDiv.style.display = 'block';
        progressStatus.textContent = 'Initializing...';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                progressStatus.textContent = 'Complete';
                clearInterval(interval);
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    alert('Index rebuild completed successfully');
                }, 1000);
            } else {
                progressStatus.textContent = `Processing... ${Math.round(progress)}%`;
            }
            progressFill.style.width = `${progress}%`;
        }, 500);
    }

    startOptimize() {
        // Simulate index optimization
        const progressFill = document.getElementById('optimizeProgressFill');
        const progressStatus = document.getElementById('optimizeStatus');
        const progressDiv = document.getElementById('optimizeProgress');

        progressDiv.style.display = 'block';
        progressStatus.textContent = 'Analyzing...';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                progressStatus.textContent = 'Complete';
                clearInterval(interval);
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    alert('Index optimization completed successfully');
                }, 1000);
            } else {
                progressStatus.textContent = `Optimizing... ${Math.round(progress)}%`;
            }
            progressFill.style.width = `${progress}%`;
        }, 300);
    }

    startBackup() {
        // Simulate index backup
        const progressFill = document.getElementById('backupProgressFill');
        const progressStatus = document.getElementById('backupStatus');
        const progressDiv = document.getElementById('backupProgress');

        progressDiv.style.display = 'block';
        progressStatus.textContent = 'Creating backup...';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress >= 100) {
                progress = 100;
                progressStatus.textContent = 'Complete';
                clearInterval(interval);
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    alert('Index backup completed successfully');
                }, 1000);
            } else {
                progressStatus.textContent = `Backing up... ${Math.round(progress)}%`;
            }
            progressFill.style.width = `${progress}%`;
        }, 400);
    }

    viewIndexStats() {
        alert('Index statistics would be displayed here with detailed performance metrics.');
    }

    // Analytics
    generateAnalyticsReport() {
        alert('Analytics report generation initiated. This would create a comprehensive report.');
        this.logSystemEvent('analytics', 'report', 'Analytics report generated');
    }

    exportAnalytics() {
        const data = {
            searchHistory: this.searchHistory,
            performanceMetrics: this.analytics.getMetrics(),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Settings
    switchSettingsTab(tab) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        // Add active class to selected tab
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Tab`).classList.add('active');
    }

    saveSettings() {
        // Save all settings
        this.settings.systemName = document.getElementById('systemName').value;
        this.settings.defaultLanguage = document.getElementById('defaultLanguage').value;
        this.settings.timezone = document.getElementById('timezone').value;
        this.settings.enableLogging = document.getElementById('enableLogging').checked;
        this.settings.defaultSearchMode = document.getElementById('defaultSearchMode').value;
        this.settings.maxResultsPerPage = parseInt(document.getElementById('maxResultsPerPage').value);
        this.settings.defaultRelevanceThreshold = parseFloat(document.getElementById('defaultRelevanceThreshold').value);
        this.settings.enableFuzzyMatching = document.getElementById('enableFuzzyMatching').checked;
        this.settings.enableAutocomplete = document.getElementById('enableAutocomplete').checked;
        this.settings.autoIndexUpdates = document.getElementById('autoIndexUpdates').checked;
        this.settings.indexUpdateFrequency = document.getElementById('indexUpdateFrequency').value;
        this.settings.maxIndexSize = parseInt(document.getElementById('maxIndexSize').value);
        this.settings.enableCompression = document.getElementById('enableCompression').checked;
        this.settings.enableAuth = document.getElementById('enableAuth').checked;
        this.settings.sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
        this.settings.enableEncryption = document.getElementById('enableEncryption').checked;
        this.settings.enableRateLimiting = document.getElementById('enableRateLimiting').checked;
        this.settings.enableCache = document.getElementById('enableCache').checked;
        this.settings.cacheSize = parseInt(document.getElementById('cacheSize').value);
        this.settings.maxConcurrentSearches = parseInt(document.getElementById('maxConcurrentSearches').value);
        this.settings.queryTimeout = parseInt(document.getElementById('queryTimeout').value);

        localStorage.setItem('searchAcceleratorSettings', JSON.stringify(this.settings));
        this.closeModal();
        this.logSystemEvent('settings', 'update', 'System settings updated');
        alert('Settings saved successfully');
    }

    resetSettings() {
        localStorage.removeItem('searchAcceleratorSettings');
        this.settings = this.loadSettings();
        this.applySettingsToUI();
        this.closeModal();
        this.logSystemEvent('settings', 'reset', 'Settings reset to defaults');
    }

    applySettingsToUI() {
        document.getElementById('systemName').value = this.settings.systemName;
        document.getElementById('defaultLanguage').value = this.settings.defaultLanguage;
        document.getElementById('timezone').value = this.settings.timezone;
        document.getElementById('enableLogging').checked = this.settings.enableLogging;
        document.getElementById('defaultSearchMode').value = this.settings.defaultSearchMode;
        document.getElementById('maxResultsPerPage').value = this.settings.maxResultsPerPage;
        document.getElementById('defaultRelevanceThreshold').value = this.settings.defaultRelevanceThreshold;
        document.getElementById('enableFuzzyMatching').checked = this.settings.enableFuzzyMatching;
        document.getElementById('enableAutocomplete').checked = this.settings.enableAutocomplete;
        document.getElementById('autoIndexUpdates').checked = this.settings.autoIndexUpdates;
        document.getElementById('indexUpdateFrequency').value = this.settings.indexUpdateFrequency;
        document.getElementById('maxIndexSize').value = this.settings.maxIndexSize;
        document.getElementById('enableCompression').checked = this.settings.enableCompression;
        document.getElementById('enableAuth').checked = this.settings.enableAuth;
        document.getElementById('sessionTimeout').value = this.settings.sessionTimeout;
        document.getElementById('enableEncryption').checked = this.settings.enableEncryption;
        document.getElementById('enableRateLimiting').checked = this.settings.enableRateLimiting;
        document.getElementById('enableCache').checked = this.settings.enableCache;
        document.getElementById('cacheSize').value = this.settings.cacheSize;
        document.getElementById('maxConcurrentSearches').value = this.settings.maxConcurrentSearches;
        document.getElementById('queryTimeout').value = this.settings.queryTimeout;
    }

    exportSettings() {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importSettings() {
        document.getElementById('settingsFileInput').click();
    }

    handleSettingsImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('This will replace current settings. Continue?')) {
                    this.settings = { ...this.settings, ...data };
                    this.applySettingsToUI();
                    this.saveSettings();
                    alert('Settings imported successfully');
                    this.logSystemEvent('settings', 'import', 'Settings imported from file');
                }
            } catch (error) {
                alert('Error importing settings: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Modal Management
    showUploadModal() {
        document.getElementById('uploadModal').classList.add('show');
    }

    showAdvancedSearch() {
        document.getElementById('advancedSearchModal').classList.add('show');
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
    }

    // Utility Methods
    navigateToSection(section) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));

        // Add active class to selected nav link and section
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        document.getElementById(`${section}Section`).classList.add('active');
    }

    showLogin() {
        const username = prompt('Enter username:');
        if (username) {
            this.currentUser = username;
            this.logSystemEvent('authentication', 'login', `User logged in: ${username}`);
            this.updateUI();
            this.saveData();
            alert(`Welcome, ${username}!`);
        }
    }

    logSystemEvent(component, event, details) {
        const message = {
            id: 'msg_' + Date.now(),
            timestamp: new Date().toISOString(),
            sender: component,
            type: event,
            content: details
        };

        // In a real implementation, this would be sent to a logging service
        console.log(`[${component}] ${event}: ${details}`);
    }

    refreshDashboard() {
        this.updateUI();
        this.logSystemEvent('system', 'refresh', 'Dashboard refreshed');
    }

    exportDashboard() {
        alert('Dashboard export feature - Coming soon!');
    }

    saveSearch() {
        alert('Search save feature - Coming soon!');
    }

    bulkImport() {
        alert('Bulk import feature - Coming soon!');
    }

    exportDocuments() {
        alert('Document export feature - Coming soon!');
    }

    applyDocumentFilters() {
        this.displayDocuments();
    }

    showTaskModal() {
        alert('Task modal - Coming soon!');
    }

    handleFileSelection(event) {
        const files = event.target.files;
        if (files.length > 0) {
            // Process selected files
            console.log('Files selected:', files);
        }
    }

    uploadDocuments() {
        alert('Document upload initiated. This would process and index the uploaded documents.');
        this.closeModal();
    }

    resetAdvancedSearch() {
        document.getElementById('advancedSearchForm').reset();
    }

    applyAdvancedSearch() {
        // Apply advanced search filters
        const query = document.getElementById('advancedQuery').value;
        if (query) {
            document.getElementById('searchQuery').value = query;
            this.closeModal();
            this.performSearch();
        }
    }

    startPeriodicUpdates() {
        // Update UI every 30 seconds
        setInterval(() => {
            this.updateUI();
        }, 30000);

        // Save data every 60 seconds
        setInterval(() => {
            this.saveData();
        }, 60000);
    }
}

// Core System Components
class SearchIndex {
    constructor() {
        this.index = new Map();
        this.metadata = new Map();
    }

    initialize() {
        console.log('Search Index initialized');
    }

    addDocument(document) {
        this.index.set(document.id, {
            id: document.id,
            content: document.content.toLowerCase(),
            metadata: document.metadata
        });
        this.metadata.set(document.id, document.metadata);
    }

    search(query, options = {}) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [docId, doc] of this.index) {
            if (doc.content.includes(searchTerm)) {
                results.push({
                    id: docId,
                    score: this.calculateRelevance(doc.content, searchTerm),
                    metadata: doc.metadata
                });
            }
        }

        return results.sort((a, b) => b.score - a.score);
    }

    calculateRelevance(content, query) {
        // Simple relevance calculation
        const words = query.split(' ');
        let score = 0;

        words.forEach(word => {
            const matches = (content.match(new RegExp(word, 'g')) || []).length;
            score += matches;
        });

        return score;
    }

    getHealthStatus() {
        return {
            status: 'healthy',
            documentCount: this.index.size,
            lastUpdate: new Date()
        };
    }
}

class VectorStore {
    constructor() {
        this.vectors = new Map();
        this.dimensions = 768;
    }

    initialize() {
        console.log('Vector Store initialized');
    }

    store(documentId, vector) {
        this.vectors.set(documentId, vector);
    }

    retrieve(documentId) {
        return this.vectors.get(documentId);
    }

    search(queryVector, limit = 10, threshold = 0.7) {
        const results = [];

        for (const [docId, vector] of this.vectors) {
            const similarity = this.cosineSimilarity(queryVector, vector);
            if (similarity >= threshold) {
                results.push({
                    id: docId,
                    similarity: similarity
                });
            }
        }

        return results
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

class QueryProcessor {
    constructor() {
        this.cache = new Map();
        this.processingQueue = [];
    }

    initialize() {
        console.log('Query Processor initialized');
    }

    async process(query, options = {}) {
        // Check cache first
        const cacheKey = JSON.stringify({ query, options });
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Process query
        const result = await this.executeQuery(query, options);

        // Cache result
        this.cache.set(cacheKey, result);

        return result;
    }

    async executeQuery(query, options) {
        // Simulate query processing
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    query,
                    results: [],
                    processingTime: Math.random() * 100 + 20,
                    timestamp: new Date()
                });
            }, Math.random() * 200 + 50);
        });
    }
}

class SearchAnalytics {
    constructor() {
        this.metrics = {
            totalQueries: 0,
            averageResponseTime: 0,
            searchAccuracy: 94.7,
            topQueries: new Map(),
            hourlyStats: new Array(24).fill(0),
            dailyStats: []
        };
    }

    initialize() {
        console.log('Search Analytics initialized');
    }

    recordSearch(query, resultsCount, responseTime) {
        this.metrics.totalQueries++;
        this.metrics.averageResponseTime =
            (this.metrics.averageResponseTime * (this.metrics.totalQueries - 1) + responseTime) / this.metrics.totalQueries;

        // Update top queries
        const current = this.metrics.topQueries.get(query) || 0;
        this.metrics.topQueries.set(query, current + 1);

        // Update hourly stats
        const hour = new Date().getHours();
        this.metrics.hourlyStats[hour]++;
    }

    getTotalQueries() {
        return this.metrics.totalQueries;
    }

    getAverageQueryTime() {
        return Math.round(this.metrics.averageResponseTime);
    }

    getSearchAccuracy() {
        return this.metrics.searchAccuracy;
    }

    getMetrics() {
        return { ...this.metrics };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accelerator = new SemanticSearchAccelerator();
});