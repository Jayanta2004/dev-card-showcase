// Multilingual Sentiment Calibration - JavaScript Implementation
// Author: AI Assistant
// Date: 2026
// Description: Advanced multilingual sentiment analysis with real-time calibration

// Global variables and state management
let languages = [];
let trainingData = { positive: [], negative: [], neutral: [] };
let sentimentModels = new Map();
let calibrationHistory = [];
let analyticsData = [];
let settings = {};
let currentAnalysis = null;
let isCalibrating = false;
let charts = {};

// Default settings
const defaultSettings = {
    autoCalibration: true,
    realTimeAnalysis: true,
    globalConfidenceThreshold: 0.7,
    batchSize: 32,
    learningRate: 0.001,
    epochs: 10,
    dataRetention: 365,
    maxSamples: 10000,
    defaultLanguage: 'en'
};

// Language configurations
const languageConfigs = {
    en: { name: 'English', family: 'Indo-European', accuracy: 94.2, samples: 45230 },
    es: { name: 'Spanish', family: 'Indo-European', accuracy: 91.8, samples: 38750 },
    fr: { name: 'French', family: 'Indo-European', accuracy: 90.5, samples: 32100 },
    de: { name: 'German', family: 'Indo-European', accuracy: 89.7, samples: 28900 },
    zh: { name: 'Chinese', family: 'Sino-Tibetan', accuracy: 87.3, samples: 25600 },
    ja: { name: 'Japanese', family: 'Japonic', accuracy: 85.9, samples: 23400 },
    ar: { name: 'Arabic', family: 'Afro-Asiatic', accuracy: 83.4, samples: 19800 },
    hi: { name: 'Hindi', family: 'Indo-European', accuracy: 82.1, samples: 17600 },
    pt: { name: 'Portuguese', family: 'Indo-European', accuracy: 88.9, samples: 31200 },
    ru: { name: 'Russian', family: 'Indo-European', accuracy: 86.7, samples: 24500 },
    ko: { name: 'Korean', family: 'Koreanic', accuracy: 84.5, samples: 22100 },
    it: { name: 'Italian', family: 'Indo-European', accuracy: 89.2, samples: 29800 },
    nl: { name: 'Dutch', family: 'Indo-European', accuracy: 87.8, samples: 26700 },
    sv: { name: 'Swedish', family: 'Indo-European', accuracy: 85.6, samples: 23800 },
    da: { name: 'Danish', family: 'Indo-European', accuracy: 84.9, samples: 22900 },
    no: { name: 'Norwegian', family: 'Indo-European', accuracy: 86.1, samples: 24100 },
    fi: { name: 'Finnish', family: 'Uralic', accuracy: 83.7, samples: 21300 },
    pl: { name: 'Polish', family: 'Indo-European', accuracy: 85.3, samples: 23500 },
    tr: { name: 'Turkish', family: 'Turkic', accuracy: 82.8, samples: 18900 },
    he: { name: 'Hebrew', family: 'Afro-Asiatic', accuracy: 81.5, samples: 17200 },
    th: { name: 'Thai', family: 'Tai-Kadai', accuracy: 79.8, samples: 15600 },
    vi: { name: 'Vietnamese', family: 'Austroasiatic', accuracy: 80.2, samples: 16100 },
    id: { name: 'Indonesian', family: 'Austronesian', accuracy: 83.9, samples: 21700 },
    ms: { name: 'Malay', family: 'Austronesian', accuracy: 82.4, samples: 18300 },
    tl: { name: 'Tagalog', family: 'Austronesian', accuracy: 81.1, samples: 16800 }
};

// Sentiment analysis model class
class SentimentModel {
    constructor(language) {
        this.language = language;
        this.weights = this.initializeWeights();
        this.bias = 0;
        this.accuracy = languageConfigs[language]?.accuracy || 50;
        this.lastTrained = null;
        this.trainingHistory = [];
    }

    initializeWeights() {
        // Initialize random weights for sentiment features
        const features = ['positive_words', 'negative_words', 'intensity', 'context', 'punctuation'];
        const weights = {};
        features.forEach(feature => {
            weights[feature] = Math.random() * 2 - 1; // Random between -1 and 1
        });
        return weights;
    }

    extractFeatures(text) {
        // Simple feature extraction for demo
        const words = text.toLowerCase().split(/\s+/);
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'best', 'awesome'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'poor', 'suck', 'annoying'];

        return {
            positive_words: words.filter(word => positiveWords.includes(word)).length,
            negative_words: words.filter(word => negativeWords.includes(word)).length,
            intensity: this.calculateIntensity(text),
            context: this.analyzeContext(words),
            punctuation: (text.match(/[!?]+/g) || []).length
        };
    }

    calculateIntensity(text) {
        // Simple intensity calculation based on capitalization and punctuation
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        const punctuationRatio = (text.match(/[!?.,;]/g) || []).length / text.length;
        return Math.min(capsRatio * 2 + punctuationRatio, 1);
    }

    analyzeContext(words) {
        // Simple context analysis
        const intensifiers = ['very', 'really', 'so', 'extremely', 'totally', 'absolutely'];
        const negations = ['not', 'never', 'no', 'none', 'nothing', 'nobody'];

        const hasIntensifier = words.some(word => intensifiers.includes(word));
        const hasNegation = words.some(word => negations.includes(word));

        return (hasIntensifier ? 0.3 : 0) + (hasNegation ? -0.2 : 0);
    }

    predict(text) {
        const features = this.extractFeatures(text);
        let score = this.bias;

        for (const [feature, value] of Object.entries(features)) {
            score += this.weights[feature] * value;
        }

        // Apply sigmoid activation
        const probability = 1 / (1 + Math.exp(-score));

        // Convert to sentiment categories
        let sentiment, confidence;
        if (probability > 0.6) {
            sentiment = 'positive';
            confidence = probability;
        } else if (probability < 0.4) {
            sentiment = 'negative';
            confidence = 1 - probability;
        } else {
            sentiment = 'neutral';
            confidence = 1 - Math.abs(probability - 0.5) * 2;
        }

        return { sentiment, confidence, score: probability };
    }

    train(samples, labels, epochs = 10, learningRate = 0.01) {
        const startTime = Date.now();

        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;

            for (let i = 0; i < samples.length; i++) {
                const features = this.extractFeatures(samples[i]);
                const prediction = this.predict(samples[i]).score;
                const target = labels[i] === 'positive' ? 1 : labels[i] === 'negative' ? 0 : 0.5;

                // Calculate loss (MSE)
                const loss = Math.pow(prediction - target, 2);
                totalLoss += loss;

                // Update weights using gradient descent
                const gradient = 2 * (prediction - target) * prediction * (1 - prediction);

                for (const [feature, value] of Object.entries(features)) {
                    this.weights[feature] -= learningRate * gradient * value;
                }
                this.bias -= learningRate * gradient;
            }

            const avgLoss = totalLoss / samples.length;
            this.trainingHistory.push({ epoch: epoch + 1, loss: avgLoss });

            // Update accuracy estimate
            this.accuracy = Math.max(50, Math.min(95, this.accuracy + (Math.random() - 0.5) * 2));
        }

        this.lastTrained = new Date();
        const trainingTime = Date.now() - startTime;

        return {
            finalAccuracy: this.accuracy,
            trainingTime,
            epochs,
            finalLoss: this.trainingHistory[this.trainingHistory.length - 1]?.loss || 0
        };
    }
}

// Utility functions
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function logActivity(message, type = 'info', details = {}) {
    const activity = {
        id: generateId('activity'),
        timestamp: new Date(),
        message,
        type,
        details
    };

    analyticsData.unshift(activity);
    if (analyticsData.length > 1000) {
        analyticsData = analyticsData.slice(0, 1000);
    }

    updateActivityList();
    updateAnalyticsCharts();
}

function detectLanguage(text) {
    // Simple language detection based on character patterns
    const patterns = {
        zh: /[\u4e00-\u9fff]/,
        ja: /[\u3040-\u309f\u30a0-\u30ff]/,
        ko: /[\uac00-\ud7af]/,
        ar: /[\u0600-\u06ff]/,
        hi: /[\u0900-\u097f]/,
        ru: /[\u0400-\u04ff]/,
        he: /[\u0590-\u05ff]/,
        th: /[\u0e00-\u0e7f]/,
        vi: /[\u00c0-\u01bf]/,
        es: /\b(el|la|los|las|un|una|unos|unas|y|o|pero|porque)\b/i,
        fr: /\b(le|la|les|un|une|des|et|ou|mais|mais|donc)\b/i,
        de: /\b(der|die|das|ein|eine|und|oder|aber|weil)\b/i,
        it: /\b(il|lo|la|i|gli|le|un|uno|una|e|o|ma|perché)\b/i,
        pt: /\b(o|a|os|as|um|uma|uns|umas|e|ou|mas|porque)\b/i
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
            return lang;
        }
    }

    return 'en'; // Default to English
}

function formatNumber(num, decimals = 1) {
    return Number(num).toFixed(decimals);
}

function formatPercentage(num) {
    return `${formatNumber(num * 100)}%`;
}

function getRandomColor() {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSettings();
    initializeLanguages();
    initializeModels();
    initializeCharts();
    updateDashboard();
    updateActivityList();
});

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            switchSection(targetId);
        });
    });

    // Dashboard actions
    document.getElementById('quickCalibrateBtn').addEventListener('click', quickCalibrate);
    document.getElementById('addLanguageBtn').addEventListener('click', () => showModal('addLanguageModal'));
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('runTestsBtn').addEventListener('click', runTests);

    // Calibration controls
    document.getElementById('calibrationThreshold').addEventListener('input', updateThresholdDisplay);
    document.getElementById('analyzeSampleBtn').addEventListener('click', analyzeSample);
    document.getElementById('addToTrainingBtn').addEventListener('click', addToTraining);

    // Training data actions
    document.getElementById('importTrainingDataBtn').addEventListener('click', importTrainingData);
    document.getElementById('exportTrainingDataBtn').addEventListener('click', exportTrainingData);
    document.getElementById('clearTrainingDataBtn').addEventListener('click', clearTrainingData);

    // Analysis filters
    document.getElementById('timeRange').addEventListener('change', updateAnalyticsCharts);
    document.getElementById('analysisLanguages').addEventListener('change', updateAnalyticsCharts);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('exportSettingsBtn').addEventListener('click', exportSettings);

    // Modal actions
    document.getElementById('saveLanguage').addEventListener('click', saveLanguage);
    document.getElementById('cancelAddLanguage').addEventListener('click', () => hideModal('addLanguageModal'));

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Alert modal
    document.getElementById('alertOkBtn').addEventListener('click', () => hideModal('alertModal'));

    // Window events
    window.addEventListener('beforeunload', saveState);
}

// Initialize application components
function initializeApp() {
    console.log('Initializing Multilingual Sentiment Calibration...');

    // Load saved state
    loadState();

    // Initialize with sample data if empty
    if (languages.length === 0) {
        initializeSampleData();
    }
}

function initializeSampleData() {
    // Initialize languages from config
    Object.entries(languageConfigs).forEach(([code, config]) => {
        languages.push({
            id: generateId('lang'),
            code,
            name: config.name,
            family: config.family,
            accuracy: config.accuracy,
            samples: config.samples,
            enabled: true,
            lastCalibrated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
    });

    // Initialize sample training data
    const sampleTexts = {
        positive: [
            "This product is amazing! I love it so much.",
            "Excellent service and great quality.",
            "Best purchase I've ever made!",
            "Absolutely fantastic experience.",
            "Highly recommend this to everyone!"
        ],
        negative: [
            "This is terrible. Complete waste of money.",
            "Worst product I've ever bought.",
            "Poor quality and bad customer service.",
            "Don't buy this, it's awful.",
            "Very disappointed with this purchase."
        ],
        neutral: [
            "This product is okay, nothing special.",
            "It's average, does the job.",
            "Neither good nor bad.",
            "Standard quality for the price.",
            "It's acceptable but not great."
        ]
    };

    Object.entries(sampleTexts).forEach(([sentiment, texts]) => {
        trainingData[sentiment] = texts.map(text => ({
            id: generateId('sample'),
            text,
            language: detectLanguage(text),
            sentiment,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            confidence: Math.random() * 0.5 + 0.5
        }));
    });

    // Initialize analytics data
    for (let i = 0; i < 50; i++) {
        const languages = ['en', 'es', 'fr', 'de', 'zh'];
        const sentiments = ['positive', 'negative', 'neutral'];
        analyticsData.push({
            id: generateId('analytics'),
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
            language: languages[Math.floor(Math.random() * languages.length)],
            sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
            confidence: Math.random() * 0.5 + 0.5,
            processingTime: Math.random() * 0.5 + 0.1
        });
    }
}

// Switch between sections
function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Dashboard functions
function updateDashboard() {
    // Update metrics
    const totalLanguages = languages.filter(l => l.enabled).length;
    const totalSamples = Object.values(trainingData).flat().length;
    const avgAccuracy = languages.reduce((sum, lang) => sum + lang.accuracy, 0) / languages.length;
    const avgProcessingTime = analyticsData.slice(0, 100).reduce((sum, item) => sum + item.processingTime, 0) / Math.max(analyticsData.length, 1);

    document.getElementById('totalLanguages').textContent = totalLanguages;
    document.getElementById('calibrationAccuracy').textContent = formatPercentage(avgAccuracy / 100);
    document.getElementById('totalSamples').textContent = totalSamples.toLocaleString();
    document.getElementById('processingTime').textContent = formatNumber(avgProcessingTime, 2) + 's';

    // Update change indicators (simulated)
    updateMetricChanges();

    // Update charts
    updateDashboardCharts();
}

function updateMetricChanges() {
    const changes = [
        { id: 'totalLanguagesChange', base: 24, current: languages.filter(l => l.enabled).length },
        { id: 'calibrationAccuracyChange', base: 94.7, current: languages.reduce((sum, lang) => sum + lang.accuracy, 0) / languages.length },
        { id: 'totalSamplesChange', base: 156432, current: Object.values(trainingData).flat().length },
        { id: 'processingTimeChange', base: 0.23, current: analyticsData.slice(0, 100).reduce((sum, item) => sum + item.processingTime, 0) / Math.max(analyticsData.length, 1) }
    ];

    changes.forEach(change => {
        const element = document.getElementById(change.id);
        const diff = change.current - change.base;
        const percentChange = (diff / change.base) * 100;
        const isPositive = change.id.includes('processingTime') ? diff < 0 : diff > 0;

        element.textContent = `${isPositive ? '+' : ''}${formatNumber(percentChange)}%`;
        element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    });
}

// Chart initialization and updates
function initializeCharts() {
    // Language Performance Chart
    const langCtx = document.getElementById('languagePerformanceChart').getContext('2d');
    charts.languagePerformance = new Chart(langCtx, {
        type: 'bar',
        data: {
            labels: languages.slice(0, 10).map(l => l.name),
            datasets: [{
                label: 'Accuracy (%)',
                data: languages.slice(0, 10).map(l => l.accuracy),
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false, min: 70, max: 100 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Sentiment Distribution Chart
    const sentimentCtx = document.getElementById('sentimentDistributionChart').getContext('2d');
    const sentimentCounts = analyticsData.slice(0, 100).reduce((acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
        return acc;
    }, {});

    charts.sentimentDistribution = new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [
                    sentimentCounts.positive || 0,
                    sentimentCounts.negative || 0,
                    sentimentCounts.neutral || 0
                ],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Sentiment Trends Chart
    const trendsCtx = document.getElementById('sentimentTrendsChart').getContext('2d');
    const trendData = generateTrendData(30);

    charts.sentimentTrends = new Chart(trendsCtx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: 'Positive',
                data: trendData.positive,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true
            }, {
                label: 'Negative',
                data: trendData.negative,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true
            }, {
                label: 'Neutral',
                data: trendData.neutral,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Language Distribution Chart
    const langDistCtx = document.getElementById('languageDistributionChart').getContext('2d');
    const langCounts = analyticsData.slice(0, 100).reduce((acc, item) => {
        acc[item.language] = (acc[item.language] || 0) + 1;
        return acc;
    }, {});

    charts.languageDistribution = new Chart(langDistCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(langCounts).map(code => languageConfigs[code]?.name || code.toUpperCase()),
            datasets: [{
                data: Object.values(langCounts),
                backgroundColor: Object.keys(langCounts).map(() => getRandomColor())
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Accuracy by Language Chart
    const accuracyCtx = document.getElementById('accuracyByLanguageChart').getContext('2d');
    charts.accuracyByLanguage = new Chart(accuracyCtx, {
        type: 'horizontalBar',
        data: {
            labels: languages.slice(0, 10).map(l => l.name),
            datasets: [{
                label: 'Accuracy (%)',
                data: languages.slice(0, 10).map(l => l.accuracy),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { beginAtZero: false, min: 70, max: 100 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Confidence Distribution Chart
    const confidenceCtx = document.getElementById('confidenceDistributionChart').getContext('2d');
    const confidenceRanges = analyticsData.slice(0, 100).reduce((acc, item) => {
        const range = Math.floor(item.confidence * 10) / 10;
        acc[range] = (acc[range] || 0) + 1;
        return acc;
    }, {});

    charts.confidenceDistribution = new Chart(confidenceCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(confidenceRanges).sort().map(r => `${r}-${parseFloat(r) + 0.1}`),
            datasets: [{
                label: 'Count',
                data: Object.values(confidenceRanges),
                backgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Error Analysis Chart
    const errorCtx = document.getElementById('errorAnalysisChart').getContext('2d');
    charts.errorAnalysis = new Chart(errorCtx, {
        type: 'radar',
        data: {
            labels: ['False Positive', 'False Negative', 'Misclassification', 'Low Confidence', 'Language Detection'],
            datasets: [{
                label: 'Error Rate (%)',
                data: [2.3, 1.8, 3.1, 4.2, 1.5],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: { beginAtZero: true, max: 10 }
            }
        }
    });
}

function updateDashboardCharts() {
    if (charts.languagePerformance) {
        charts.languagePerformance.data.labels = languages.slice(0, 10).map(l => l.name);
        charts.languagePerformance.data.datasets[0].data = languages.slice(0, 10).map(l => l.accuracy);
        charts.languagePerformance.update();
    }

    if (charts.sentimentDistribution) {
        const sentimentCounts = analyticsData.slice(0, 100).reduce((acc, item) => {
            acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
            return acc;
        }, {});
        charts.sentimentDistribution.data.datasets[0].data = [
            sentimentCounts.positive || 0,
            sentimentCounts.negative || 0,
            sentimentCounts.neutral || 0
        ];
        charts.sentimentDistribution.update();
    }
}

function updateAnalyticsCharts() {
    // Update charts based on current filters
    const timeRange = document.getElementById('timeRange').value;
    const selectedLanguages = Array.from(document.getElementById('analysisLanguages').selectedOptions).map(opt => opt.value);

    // Filter data based on time range and languages
    const filteredData = analyticsData.filter(item => {
        const hoursDiff = (Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60);
        const timeFilter = timeRange === '1h' ? hoursDiff <= 1 :
                          timeRange === '24h' ? hoursDiff <= 24 :
                          timeRange === '7d' ? hoursDiff <= 168 :
                          timeRange === '30d' ? hoursDiff <= 720 : true;

        const languageFilter = selectedLanguages.length === 0 || selectedLanguages.includes(item.language);

        return timeFilter && languageFilter;
    });

    // Update performance table
    updatePerformanceTable(filteredData);

    // Update trend chart
    if (charts.sentimentTrends) {
        const newTrendData = generateTrendData(30, filteredData);
        charts.sentimentTrends.data.labels = newTrendData.labels;
        charts.sentimentTrends.data.datasets[0].data = newTrendData.positive;
        charts.sentimentTrends.data.datasets[1].data = newTrendData.negative;
        charts.sentimentTrends.data.datasets[2].data = newTrendData.neutral;
        charts.sentimentTrends.update();
    }
}

function generateTrendData(days, data = null) {
    const sourceData = data || analyticsData;
    const labels = [];
    const positive = [];
    const negative = [];
    const neutral = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString());

        const dayData = sourceData.filter(item =>
            item.timestamp.toDateString() === date.toDateString()
        );

        const counts = dayData.reduce((acc, item) => {
            acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
            return acc;
        }, {});

        positive.push(counts.positive || 0);
        negative.push(counts.negative || 0);
        neutral.push(counts.neutral || 0);
    }

    return { labels, positive, negative, neutral };
}

function updatePerformanceTable(data) {
    const tableBody = document.querySelector('#performanceTable tbody');
    tableBody.innerHTML = '';

    const langStats = {};
    data.forEach(item => {
        if (!langStats[item.language]) {
            langStats[item.language] = {
                total: 0,
                correct: 0,
                precision: 0,
                recall: 0,
                f1: 0
            };
        }
        langStats[item.language].total++;
        // Simulate accuracy calculation
        if (item.confidence > 0.7) {
            langStats[item.language].correct++;
        }
    });

    Object.entries(langStats).forEach(([lang, stats]) => {
        const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        const precision = accuracy; // Simplified
        const recall = accuracy; // Simplified
        const f1 = 2 * (precision * recall) / (precision + recall) || 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${languageConfigs[lang]?.name || lang.toUpperCase()}</td>
            <td>${formatNumber(accuracy)}%</td>
            <td>${formatNumber(precision)}%</td>
            <td>${formatNumber(recall)}%</td>
            <td>${formatNumber(f1)}</td>
            <td>${stats.total}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Activity list
function updateActivityList() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    analyticsData.slice(0, 10).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const iconClass = activity.type === 'success' ? 'fa-check-circle' :
                         activity.type === 'error' ? 'fa-exclamation-circle' :
                         activity.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

        item.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <div class="activity-content">
                <div class="activity-message">${activity.message}</div>
                <div class="activity-time">${activity.timestamp.toLocaleString()}</div>
            </div>
        `;

        activityList.appendChild(item);
    });
}

// Language management
function updateLanguageGrid() {
    const grid = document.getElementById('languageGrid');
    grid.innerHTML = '';

    languages.forEach(language => {
        const card = document.createElement('div');
        card.className = 'language-card';

        card.innerHTML = `
            <div class="language-header">
                <div>
                    <h3 class="language-name">${language.name}</h3>
                    <span class="language-code">${language.code.toUpperCase()}</span>
                </div>
                <div class="language-status ${language.enabled ? 'enabled' : 'disabled'}">
                    ${language.enabled ? 'Enabled' : 'Disabled'}
                </div>
            </div>

            <div class="language-stats">
                <div class="language-stat">
                    <span class="language-stat-value">${formatNumber(language.accuracy)}%</span>
                    <div class="language-stat-label">Accuracy</div>
                </div>
                <div class="language-stat">
                    <span class="language-stat-value">${language.samples.toLocaleString()}</span>
                    <div class="language-stat-label">Samples</div>
                </div>
            </div>

            <div class="language-actions">
                <button class="btn btn-secondary" onclick="editLanguage('${language.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn ${language.enabled ? 'btn-warning' : 'btn-success'}" onclick="toggleLanguage('${language.id}')">
                    <i class="fas ${language.enabled ? 'fa-pause' : 'fa-play'}"></i>
                    ${language.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn btn-danger" onclick="deleteLanguage('${language.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function saveLanguage() {
    const form = document.getElementById('addLanguageForm');
    const formData = new FormData(form);

    const languageData = {
        id: generateId('lang'),
        code: formData.get('languageCode'),
        name: formData.get('languageName'),
        family: formData.get('languageFamily'),
        accuracy: parseFloat(formData.get('initialAccuracy')),
        samples: 0,
        enabled: true,
        lastCalibrated: new Date()
    };

    languages.push(languageData);

    // Initialize model for new language
    const model = new SentimentModel(languageData.code);
    sentimentModels.set(languageData.code, model);

    updateLanguageGrid();
    hideModal('addLanguageModal');
    form.reset();

    logActivity(`Added new language: ${languageData.name}`, 'info');
    showAlert('Language added successfully!');
}

// Calibration functions
function updateThresholdDisplay() {
    const threshold = document.getElementById('calibrationThreshold').value;
    document.getElementById('thresholdValue').textContent = threshold;
}

function analyzeSample() {
    const text = document.getElementById('sampleText').value.trim();
    if (!text) {
        showAlert('Please enter some text to analyze.', 'Warning');
        return;
    }

    const language = document.getElementById('calibrationLanguage').value;
    const model = sentimentModels.get(language);

    if (!model) {
        showAlert('Model not available for this language.', 'Error');
        return;
    }

    const startTime = performance.now();
    const result = model.predict(text);
    const processingTime = performance.now() - startTime;

    // Update results display
    document.getElementById('predictedSentiment').textContent = result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1);
    document.getElementById('confidenceScore').textContent = formatPercentage(result.confidence);
    document.getElementById('detectedLanguage').textContent = languageConfigs[language]?.name || language.toUpperCase();
    document.getElementById('processingTime').textContent = formatNumber(processingTime, 2) + 'ms';

    // Update sentiment scale
    updateSentimentScale(result.score);

    // Show results
    document.getElementById('analysisResults').style.display = 'block';

    logActivity(`Analyzed sample text in ${languageConfigs[language]?.name || language}`, 'info');
}

function updateSentimentScale(score) {
    const fill = document.getElementById('sentimentScaleFill');
    const position = score * 100; // Convert to percentage
    fill.style.width = `${Math.min(position, 100)}%`;
    fill.style.left = `${Math.max(0, position - 20)}%`;
}

function addToTraining() {
    const text = document.getElementById('sampleText').value.trim();
    if (!text) {
        showAlert('Please enter some text to add to training.', 'Warning');
        return;
    }

    // Prompt for sentiment label (simplified - in real app would have UI for this)
    const sentiment = prompt('Enter sentiment label (positive/negative/neutral):', 'neutral');
    if (!sentiment || !['positive', 'negative', 'neutral'].includes(sentiment)) {
        showAlert('Invalid sentiment label.', 'Error');
        return;
    }

    const language = detectLanguage(text);
    const sample = {
        id: generateId('sample'),
        text,
        language,
        sentiment,
        timestamp: new Date(),
        confidence: 1.0 // Manually labeled
    };

    trainingData[sentiment].push(sample);
    updateTrainingStats();

    document.getElementById('sampleText').value = '';
    document.getElementById('analysisResults').style.display = 'none';

    logActivity(`Added sample to ${sentiment} training data`, 'info');
    showAlert('Sample added to training data!');
}

function updateTrainingStats() {
    document.getElementById('positiveSamples').textContent = trainingData.positive.length;
    document.getElementById('negativeSamples').textContent = trainingData.negative.length;
    document.getElementById('neutralSamples').textContent = trainingData.neutral.length;
    document.getElementById('totalTrainingSamples').textContent = Object.values(trainingData).flat().length;
}

// Training data management
function importTrainingData() {
    // Simplified import - in real app would handle file upload
    showAlert('Import functionality would handle CSV/JSON file upload.', 'Info');
}

function exportTrainingData() {
    const data = {
        positive: trainingData.positive,
        negative: trainingData.negative,
        neutral: trainingData.neutral
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training-data.json';
    a.click();
    URL.revokeObjectURL(url);

    logActivity('Training data exported', 'info');
}

function clearTrainingData() {
    if (confirm('Are you sure you want to clear all training data? This action cannot be undone.')) {
        trainingData = { positive: [], negative: [], neutral: [] };
        updateTrainingStats();
        logActivity('Training data cleared', 'warning');
        showAlert('Training data cleared!');
    }
}

// Quick actions
function quickCalibrate() {
    if (isCalibrating) {
        showAlert('Calibration already in progress.', 'Warning');
        return;
    }

    isCalibrating = true;
    logActivity('Starting quick calibration...', 'info');

    // Simulate calibration process
    setTimeout(() => {
        const enabledLanguages = languages.filter(l => l.enabled);
        enabledLanguages.forEach(lang => {
            // Simulate accuracy improvement
            lang.accuracy = Math.min(95, lang.accuracy + Math.random() * 2);
            lang.lastCalibrated = new Date();
        });

        updateLanguageGrid();
        updateDashboard();
        isCalibrating = false;

        logActivity('Quick calibration completed', 'success');
        showAlert('Calibration completed successfully!');
    }, 3000);
}

function exportData() {
    const data = {
        languages,
        trainingData,
        analyticsData: analyticsData.slice(0, 1000), // Limit export size
        settings,
        exportDate: new Date()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentiment-calibration-data.json';
    a.click();
    URL.revokeObjectURL(url);

    logActivity('Data exported', 'info');
}

function runTests() {
    logActivity('Running test suite...', 'info');

    // Simulate test execution
    setTimeout(() => {
        const testResults = {
            total: 100,
            passed: 87,
            failed: 13,
            accuracy: 87
        };

        logActivity(`Tests completed: ${testResults.passed}/${testResults.total} passed`, 'info');
        showAlert(`Test Results:\nPassed: ${testResults.passed}\nFailed: ${testResults.failed}\nAccuracy: ${testResults.accuracy}%`);
    }, 2000);
}

// Settings management
function saveSettings() {
    settings = {
        autoCalibration: document.getElementById('autoCalibration').checked,
        realTimeAnalysis: document.getElementById('realTimeAnalysis').checked,
        globalConfidenceThreshold: parseFloat(document.getElementById('globalConfidenceThreshold').value),
        batchSize: parseInt(document.getElementById('batchSize').value),
        learningRate: parseFloat(document.getElementById('learningRate').value),
        epochs: parseInt(document.getElementById('epochs').value),
        dataRetention: parseInt(document.getElementById('dataRetention').value),
        maxSamples: parseInt(document.getElementById('maxSamples').value)
    };

    localStorage.setItem('sentimentSettings', JSON.stringify(settings));
    logActivity('Settings saved', 'info');
    showAlert('Settings saved successfully!');
}

function resetSettings() {
    settings = { ...defaultSettings };
    loadSettingsToUI();
    logActivity('Settings reset to defaults', 'warning');
    showAlert('Settings reset to defaults!');
}

function loadSettings() {
    const stored = localStorage.getItem('sentimentSettings');
    if (stored) {
        settings = { ...defaultSettings, ...JSON.parse(stored) };
    } else {
        settings = { ...defaultSettings };
    }
    loadSettingsToUI();
}

function loadSettingsToUI() {
    document.getElementById('autoCalibration').checked = settings.autoCalibration;
    document.getElementById('realTimeAnalysis').checked = settings.realTimeAnalysis;
    document.getElementById('globalConfidenceThreshold').value = settings.globalConfidenceThreshold;
    document.getElementById('batchSize').value = settings.batchSize;
    document.getElementById('learningRate').value = settings.learningRate;
    document.getElementById('epochs').value = settings.epochs;
    document.getElementById('dataRetention').value = settings.dataRetention;
    document.getElementById('maxSamples').value = settings.maxSamples;

    // Update threshold display
    document.getElementById('globalThresholdValue').textContent = settings.globalConfidenceThreshold;
}

function exportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentiment-settings.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Alert modal
function showAlert(message, title = 'Alert') {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    showModal('alertModal');
}

// State management
function saveState() {
    const state = {
        languages,
        trainingData,
        analyticsData,
        settings,
        calibrationHistory
    };
    localStorage.setItem('sentimentState', JSON.stringify(state));
}

function loadState() {
    const stored = localStorage.getItem('sentimentState');
    if (stored) {
        const state = JSON.parse(stored);
        languages = state.languages || [];
        trainingData = state.trainingData || { positive: [], negative: [], neutral: [] };
        analyticsData = state.analyticsData || [];
        settings = state.settings || {};
        calibrationHistory = state.calibrationHistory || [];
    }
}

function initializeLanguages() {
    updateLanguageGrid();
}

function initializeModels() {
    languages.forEach(lang => {
        if (!sentimentModels.has(lang.code)) {
            sentimentModels.set(lang.code, new SentimentModel(lang.code));
        }
    });
}

// Global functions for HTML onclick handlers
window.editLanguage = function(languageId) {
    // Implementation for editing language
    showAlert('Language editing not implemented in demo');
};

window.toggleLanguage = function(languageId) {
    const language = languages.find(l => l.id === languageId);
    if (language) {
        language.enabled = !language.enabled;
        updateLanguageGrid();
        logActivity(`${language.enabled ? 'Enabled' : 'Disabled'} language: ${language.name}`, 'info');
    }
};

window.deleteLanguage = function(languageId) {
    const index = languages.findIndex(l => l.id === languageId);
    if (index !== -1) {
        const language = languages[index];
        languages.splice(index, 1);
        updateLanguageGrid();
        logActivity(`Deleted language: ${language.name}`, 'warning');
    }
};

// Auto-save settings on change
document.addEventListener('change', function(e) {
    if (e.target.closest('#settings')) {
        // Auto-save settings after a delay
        clearTimeout(window.settingsTimeout);
        window.settingsTimeout = setTimeout(saveSettings, 1000);
    }
});

// Initialize everything
console.log('Multilingual Sentiment Calibration loaded successfully!');