// Real-Time Interaction Quality Evaluator - JavaScript Implementation

class RealTimeInteractionQualityEvaluator {
    constructor() {
        this.interactions = [];
        this.qualityHistory = [];
        this.currentInteraction = null;
        this.isChatMode = true;
        this.simulationRunning = false;

        this.qualityMetrics = {
            overall: 85,
            relevance: 88,
            timing: 92,
            satisfaction: 78,
            clarity: 85
        };

        this.initializeElements();
        this.bindEvents();
        this.initializeCharts();
        this.loadSampleData();
        this.updateUI();
    }

    initializeElements() {
        // Mode selectors
        this.chatModeBtn = document.getElementById('chatMode');
        this.uiModeBtn = document.getElementById('uiMode');

        // Chat elements
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendMessageBtn = document.getElementById('sendMessage');

        // UI elements
        this.uiInterface = document.getElementById('uiInterface');
        this.chatInterface = document.getElementById('chatInterface');
        this.demoName = document.getElementById('demoName');
        this.demoEmail = document.getElementById('demoEmail');
        this.demoMessage = document.getElementById('demoMessage');
        this.submitFormBtn = document.getElementById('submitForm');

        // Control elements
        this.simulateBtn = document.getElementById('simulateInteraction');
        this.clearHistoryBtn = document.getElementById('clearHistory');

        // Quality elements
        this.overallScoreEl = document.getElementById('overallScore');
        this.scoreTrendEl = document.getElementById('scoreTrend');
        this.relevanceBar = document.getElementById('relevanceBar');
        this.timingBar = document.getElementById('timingBar');
        this.satisfactionBar = document.getElementById('satisfactionBar');
        this.clarityBar = document.getElementById('clarityBar');
        this.relevanceScore = document.getElementById('relevanceScore');
        this.timingScore = document.getElementById('timingScore');
        this.satisfactionScore = document.getElementById('satisfactionScore');
        this.clarityScore = document.getElementById('clarityScore');

        // Feedback elements
        this.feedbackBtns = document.querySelectorAll('.feedback-btn');

        // Analytics elements
        this.analyticsTabs = document.querySelectorAll('.tab-btn');
        this.trendsTab = document.getElementById('trendsTab');
        this.distributionTab = document.getElementById('distributionTab');
        this.insightsTab = document.getElementById('insightsTab');

        // Modal elements
        this.historyModal = document.getElementById('historyModal');
        this.closeHistoryModal = document.getElementById('closeHistoryModal');
        this.interactionHistory = document.getElementById('interactionHistory');
    }

    bindEvents() {
        // Mode switching
        this.chatModeBtn.addEventListener('click', () => this.switchMode('chat'));
        this.uiModeBtn.addEventListener('click', () => this.switchMode('ui'));

        // Chat events
        this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // UI events
        this.submitFormBtn.addEventListener('click', () => this.submitForm());

        // Control events
        this.simulateBtn.addEventListener('click', () => this.startSimulation());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Feedback events
        this.feedbackBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.submitFeedback(e.target.dataset.feedback));
        });

        // Analytics tabs
        this.analyticsTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchAnalyticsTab(tab.dataset.tab));
        });

        // Modal events
        this.closeHistoryModal.addEventListener('click', () => this.closeHistoryModal());
        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) this.closeHistoryModal();
        });
    }

    initializeCharts() {
        // Quality trends chart
        this.trendsChart = new Chart(document.getElementById('qualityTrendsChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Overall Quality',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Relevance',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Response Time',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                            text: 'Quality Score'
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

        // Quality distribution chart
        this.distributionChart = new Chart(document.getElementById('qualityDistributionChart'), {
            type: 'doughnut',
            data: {
                labels: ['High Quality (90-100)', 'Medium Quality (70-89)', 'Low Quality (0-69)'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    switchMode(mode) {
        this.isChatMode = mode === 'chat';

        if (this.isChatMode) {
            this.chatModeBtn.classList.add('active');
            this.uiModeBtn.classList.remove('active');
            this.chatInterface.style.display = 'flex';
            this.uiInterface.style.display = 'none';
        } else {
            this.chatModeBtn.classList.remove('active');
            this.uiModeBtn.classList.add('active');
            this.chatInterface.style.display = 'none';
            this.uiInterface.style.display = 'block';
        }
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.startInteraction('chat', { message });
        this.addChatMessage('user', message);
        this.chatInput.value = '';

        // Simulate assistant response
        setTimeout(() => {
            const response = this.generateAssistantResponse(message);
            this.addChatMessage('assistant', response);
            this.completeInteraction({ response });
        }, 1000 + Math.random() * 2000);
    }

    submitForm() {
        const name = this.demoName.value.trim();
        const email = this.demoEmail.value.trim();
        const message = this.demoMessage.value.trim();

        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }

        this.startInteraction('form', { name, email, message });

        // Simulate form processing
        this.submitFormBtn.disabled = true;
        this.submitFormBtn.textContent = 'Processing...';

        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            if (success) {
                alert('Form submitted successfully!');
                this.demoName.value = '';
                this.demoEmail.value = '';
                this.demoMessage.value = '';
            } else {
                alert('Form submission failed. Please try again.');
            }

            this.submitFormBtn.disabled = false;
            this.submitFormBtn.textContent = 'Submit';
            this.completeInteraction({ success });
        }, 1500 + Math.random() * 2000);
    }

    startInteraction(type, data) {
        this.currentInteraction = {
            id: Date.now(),
            type: type,
            startTime: Date.now(),
            data: data,
            quality: null
        };
    }

    completeInteraction(result) {
        if (!this.currentInteraction) return;

        this.currentInteraction.endTime = Date.now();
        this.currentInteraction.duration = this.currentInteraction.endTime - this.currentInteraction.startTime;
        this.currentInteraction.result = result;

        // Evaluate quality
        this.currentInteraction.quality = this.evaluateQuality(this.currentInteraction);

        // Update metrics
        this.updateQualityMetrics(this.currentInteraction.quality);

        // Store interaction
        this.interactions.push(this.currentInteraction);
        this.qualityHistory.push(this.currentInteraction.quality);

        // Update UI
        this.updateUI();
        this.updateCharts();

        this.currentInteraction = null;
    }

    evaluateQuality(interaction) {
        let relevance = 85;
        let timing = 90;
        let satisfaction = 80;
        let clarity = 88;

        // Evaluate based on interaction type and characteristics
        if (interaction.type === 'chat') {
            // Analyze message relevance
            const message = interaction.data.message.toLowerCase();
            const response = interaction.result.response.toLowerCase();

            // Simple relevance check
            const keywords = message.split(' ');
            let matchingKeywords = 0;
            keywords.forEach(keyword => {
                if (keyword.length > 3 && response.includes(keyword)) {
                    matchingKeywords++;
                }
            });
            relevance = Math.min(100, 60 + (matchingKeywords / keywords.length) * 40);

            // Response time evaluation
            timing = Math.max(0, 100 - (interaction.duration - 1000) / 20);

            // Clarity based on response length and structure
            const responseLength = interaction.result.response.length;
            clarity = responseLength > 50 && responseLength < 300 ? 90 : 70;

        } else if (interaction.type === 'form') {
            // Form interaction quality
            timing = Math.max(0, 100 - (interaction.duration - 1500) / 20);
            relevance = interaction.result.success ? 95 : 60;
            clarity = 85; // Forms are generally clear
        }

        // Add some randomness and context
        relevance = Math.max(0, Math.min(100, relevance + (Math.random() - 0.5) * 20));
        timing = Math.max(0, Math.min(100, timing + (Math.random() - 0.5) * 20));
        satisfaction = Math.max(0, Math.min(100, (relevance + timing + clarity) / 3 + (Math.random() - 0.5) * 15));
        clarity = Math.max(0, Math.min(100, clarity + (Math.random() - 0.5) * 20));

        const overall = (relevance * 0.3 + timing * 0.25 + satisfaction * 0.25 + clarity * 0.2);

        return {
            overall: Math.round(overall),
            relevance: Math.round(relevance),
            timing: Math.round(timing),
            satisfaction: Math.round(satisfaction),
            clarity: Math.round(clarity)
        };
    }

    updateQualityMetrics(newQuality) {
        const alpha = 0.1; // Smoothing factor

        this.qualityMetrics.overall = Math.round(
            this.qualityMetrics.overall * (1 - alpha) + newQuality.overall * alpha
        );
        this.qualityMetrics.relevance = Math.round(
            this.qualityMetrics.relevance * (1 - alpha) + newQuality.relevance * alpha
        );
        this.qualityMetrics.timing = Math.round(
            this.qualityMetrics.timing * (1 - alpha) + newQuality.timing * alpha
        );
        this.qualityMetrics.satisfaction = Math.round(
            this.qualityMetrics.satisfaction * (1 - alpha) + newQuality.satisfaction * alpha
        );
        this.qualityMetrics.clarity = Math.round(
            this.qualityMetrics.clarity * (1 - alpha) + newQuality.clarity * alpha
        );
    }

    addChatMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const icon = type === 'user' ? 'fas fa-user' : 'fas fa-robot';

        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="${icon}"></i>
                <span>${content}</span>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    generateAssistantResponse(userMessage) {
        const responses = {
            greeting: [
                "Hello! How can I help you today?",
                "Hi there! What can I assist you with?",
                "Greetings! How may I be of service?"
            ],
            help: [
                "I'm here to help! What specific information are you looking for?",
                "I'd be happy to assist you. Could you please provide more details?",
                "I'm ready to help. What would you like to know?"
            ],
            thanks: [
                "You're welcome! Is there anything else I can help you with?",
                "My pleasure! Let me know if you need further assistance.",
                "Glad I could help! Feel free to ask if you have more questions."
            ],
            default: [
                "I understand you're asking about that. Let me provide you with some relevant information.",
                "That's an interesting question. Based on what you've shared, here's what I can tell you.",
                "Thanks for bringing that up. Here's some information that might be helpful."
            ]
        };

        const message = userMessage.toLowerCase();

        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
        } else if (message.includes('help') || message.includes('assist')) {
            return responses.help[Math.floor(Math.random() * responses.help.length)];
        } else if (message.includes('thank') || message.includes('thanks')) {
            return responses.thanks[Math.floor(Math.random() * responses.thanks.length)];
        } else {
            return responses.default[Math.floor(Math.random() * responses.default.length)];
        }
    }

    submitFeedback(feedback) {
        if (!this.interactions.length) return;

        const lastInteraction = this.interactions[this.interactions.length - 1];

        // Adjust satisfaction based on feedback
        let satisfactionAdjustment = 0;
        switch (feedback) {
            case 'positive':
                satisfactionAdjustment = 10;
                break;
            case 'neutral':
                satisfactionAdjustment = 0;
                break;
            case 'negative':
                satisfactionAdjustment = -15;
                break;
        }

        lastInteraction.quality.satisfaction = Math.max(0, Math.min(100,
            lastInteraction.quality.satisfaction + satisfactionAdjustment
        ));

        // Recalculate overall score
        lastInteraction.quality.overall = Math.round(
            lastInteraction.quality.relevance * 0.3 +
            lastInteraction.quality.timing * 0.25 +
            lastInteraction.quality.satisfaction * 0.25 +
            lastInteraction.quality.clarity * 0.2
        );

        // Update metrics
        this.updateQualityMetrics(lastInteraction.quality);

        // Visual feedback
        this.feedbackBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-feedback="${feedback}"]`).classList.add('active');

        setTimeout(() => {
            this.feedbackBtns.forEach(btn => btn.classList.remove('active'));
        }, 2000);

        this.updateUI();
        this.updateCharts();

        this.addChatMessage('system', `Thank you for your feedback! Quality score adjusted.`);
    }

    startSimulation() {
        if (this.simulationRunning) return;

        this.simulationRunning = true;
        this.simulateBtn.disabled = true;
        this.simulateBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Simulation';

        this.simulationInterval = setInterval(() => {
            if (!this.simulationRunning) return;

            // Randomly choose interaction type
            if (Math.random() > 0.5) {
                this.simulateChatInteraction();
            } else {
                this.simulateFormInteraction();
            }
        }, 3000 + Math.random() * 4000);
    }

    stopSimulation() {
        this.simulationRunning = false;
        clearInterval(this.simulationInterval);
        this.simulateBtn.disabled = false;
        this.simulateBtn.innerHTML = '<i class="fas fa-play"></i> Simulate Interaction';
    }

    simulateChatInteraction() {
        const messages = [
            "How can I help you?",
            "What's the weather like?",
            "Can you explain this feature?",
            "I need assistance with my account",
            "Thank you for your help"
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        this.startInteraction('chat', { message, simulated: true });

        setTimeout(() => {
            const response = this.generateAssistantResponse(message);
            this.completeInteraction({ response, simulated: true });
        }, 800 + Math.random() * 1200);
    }

    simulateFormInteraction() {
        const formData = {
            name: "User " + Math.floor(Math.random() * 1000),
            email: "user" + Math.floor(Math.random() * 1000) + "@example.com",
            message: "This is a simulated form submission for testing purposes."
        };

        this.startInteraction('form', { ...formData, simulated: true });

        setTimeout(() => {
            const success = Math.random() > 0.15; // 85% success rate
            this.completeInteraction({ success, simulated: true });
        }, 1200 + Math.random() * 1800);
    }

    clearHistory() {
        if (!confirm('Are you sure you want to clear all interaction history?')) return;

        this.interactions = [];
        this.qualityHistory = [];
        this.chatMessages.innerHTML = `
            <div class="message system">
                <div class="message-content">
                    <i class="fas fa-robot"></i>
                    <span>Welcome! I'm here to help. How can I assist you today?</span>
                </div>
            </div>
        `;

        // Reset to default metrics
        this.qualityMetrics = {
            overall: 85,
            relevance: 88,
            timing: 92,
            satisfaction: 78,
            clarity: 85
        };

        this.updateUI();
        this.updateCharts();
    }

    updateUI() {
        // Update quality scores
        this.updateScoreCircle(this.overallScoreEl, this.qualityMetrics.overall);

        this.relevanceBar.style.width = `${this.qualityMetrics.relevance}%`;
        this.timingBar.style.width = `${this.qualityMetrics.timing}%`;
        this.satisfactionBar.style.width = `${this.qualityMetrics.satisfaction}%`;
        this.clarityBar.style.width = `${this.qualityMetrics.clarity}%`;

        this.relevanceScore.textContent = `${this.qualityMetrics.relevance}%`;
        this.timingScore.textContent = `${this.qualityMetrics.timing}%`;
        this.satisfactionScore.textContent = `${this.qualityMetrics.satisfaction}%`;
        this.clarityScore.textContent = `${this.qualityMetrics.clarity}%`;

        // Update trend
        if (this.qualityHistory.length > 1) {
            const current = this.qualityHistory[this.qualityHistory.length - 1].overall;
            const previous = this.qualityHistory[this.qualityHistory.length - 2].overall;
            const trend = current - previous;

            this.scoreTrendEl.innerHTML = `
                <i class="fas fa-arrow-${trend >= 0 ? 'up' : 'down'}"></i>
                ${Math.abs(trend).toFixed(1)}%
            `;
            this.scoreTrendEl.style.color = trend >= 0 ? '#10b981' : '#ef4444';
        }
    }

    updateScoreCircle(element, score) {
        const percentage = score;
        element.style.background = `conic-gradient(#10b981 0% ${percentage}%, #e2e8f0 ${percentage}% 100%)`;
        element.querySelector('.score-value').textContent = score;
    }

    updateCharts() {
        // Update trends chart
        const labels = this.qualityHistory.map((_, index) => `Interaction ${index + 1}`);
        const overallData = this.qualityHistory.map(q => q.overall);
        const relevanceData = this.qualityHistory.map(q => q.relevance);
        const timingData = this.qualityHistory.map(q => q.timing);

        this.trendsChart.data.labels = labels;
        this.trendsChart.data.datasets[0].data = overallData;
        this.trendsChart.data.datasets[1].data = relevanceData;
        this.trendsChart.data.datasets[2].data = timingData;
        this.trendsChart.update();

        // Update distribution chart
        const highQuality = this.qualityHistory.filter(q => q.overall >= 90).length;
        const mediumQuality = this.qualityHistory.filter(q => q.overall >= 70 && q.overall < 90).length;
        const lowQuality = this.qualityHistory.filter(q => q.overall < 70).length;

        this.distributionChart.data.datasets[0].data = [highQuality, mediumQuality, lowQuality];
        this.distributionChart.update();
    }

    switchAnalyticsTab(tabName) {
        // Update tab buttons
        this.analyticsTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }

    loadSampleData() {
        // Load some sample interactions for demonstration
        const sampleInteractions = [
            {
                id: Date.now() - 300000,
                type: 'chat',
                startTime: Date.now() - 300000,
                endTime: Date.now() - 295000,
                duration: 5000,
                data: { message: 'Hello, how can you help me?' },
                result: { response: 'Hi! I\'m here to assist you with any questions you have.' },
                quality: { overall: 92, relevance: 95, timing: 88, satisfaction: 90, clarity: 94 }
            },
            {
                id: Date.now() - 240000,
                type: 'form',
                startTime: Date.now() - 240000,
                endTime: Date.now() - 238000,
                duration: 2000,
                data: { name: 'John Doe', email: 'john@example.com', message: 'Contact form test' },
                result: { success: true },
                quality: { overall: 87, relevance: 90, timing: 85, satisfaction: 82, clarity: 88 }
            },
            {
                id: Date.now() - 180000,
                type: 'chat',
                startTime: Date.now() - 180000,
                endTime: Date.now() - 178000,
                duration: 2000,
                data: { message: 'What services do you offer?' },
                result: { response: 'We offer a wide range of services including consulting, development, and support.' },
                quality: { overall: 89, relevance: 92, timing: 90, satisfaction: 85, clarity: 90 }
            }
        ];

        this.interactions = sampleInteractions;
        this.qualityHistory = sampleInteractions.map(i => i.quality);

        // Update metrics based on sample data
        sampleInteractions.forEach(interaction => {
            this.updateQualityMetrics(interaction.quality);
        });
    }

    showHistoryModal() {
        this.renderInteractionHistory();
        this.historyModal.classList.add('active');
    }

    closeHistoryModal() {
        this.historyModal.classList.remove('active');
    }

    renderInteractionHistory() {
        this.interactionHistory.innerHTML = '';

        this.interactions.slice().reverse().forEach(interaction => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const quality = interaction.quality;
            const qualityClass = quality.overall >= 90 ? 'high' :
                               quality.overall >= 70 ? 'medium' : 'low';

            historyItem.innerHTML = `
                <div class="history-header">
                    <div class="history-timestamp">${new Date(interaction.startTime).toLocaleString()}</div>
                    <div class="history-score ${qualityClass}">Score: ${quality.overall}</div>
                </div>
                <div class="history-content">
                    <strong>${interaction.type === 'chat' ? 'Chat' : 'Form Submission'}:</strong>
                    ${interaction.type === 'chat' ?
                        `"${interaction.data.message}"` :
                        `"${interaction.data.name}" submitted a form`
                    }
                </div>
                <div class="history-metrics">
                    <div>Relevance: ${quality.relevance}</div>
                    <div>Timing: ${quality.timing}</div>
                    <div>Satisfaction: ${quality.satisfaction}</div>
                    <div>Clarity: ${quality.clarity}</div>
                </div>
            `;

            this.interactionHistory.appendChild(historyItem);
        });
    }
}

// Initialize Chart.js library if not already loaded
if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
        // Initialize the quality evaluator after Chart.js loads
        document.addEventListener('DOMContentLoaded', () => {
            new RealTimeInteractionQualityEvaluator();
        });
    };
    document.head.appendChild(script);
} else {
    // Chart.js already loaded
    document.addEventListener('DOMContentLoaded', () => {
        new RealTimeInteractionQualityEvaluator();
    });
}