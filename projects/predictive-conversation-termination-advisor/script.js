// Predictive Conversation Termination Advisor - Comprehensive Implementation

class PredictiveConversationTerminationAdvisor {
    constructor() {
        this.conversation = [];
        this.conversationType = 'customer-service';
        this.conversationSpeed = 'normal';
        this.isActive = false;
        this.terminationReadiness = 0;
        this.objectiveFulfillment = 0;
        this.conversationDuration = 0;
        this.userEngagement = 'High';
        this.signals = [];
        this.analytics = {
            totalConversations: 0,
            avgTerminationTime: 0,
            accuracyRate: 0,
            conversationTypes: {
                'customer-service': 0,
                'technical-support': 0,
                'sales': 0,
                'general': 0
            }
        };
        this.charts = {};
        this.intervals = {};

        this.initializeElements();
        this.bindEvents();
        this.initializeCharts();
        this.updateDisplay();
    }

    initializeElements() {
        // Main controls
        this.startBtn = document.getElementById('start-simulation');
        this.resetBtn = document.getElementById('reset-conversation');
        this.speedSelect = document.getElementById('conversation-speed');
        this.typeSelect = document.getElementById('conversation-type');

        // Conversation elements
        this.messagesContainer = document.getElementById('conversation-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-message');

        // Tab buttons
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');

        // Termination elements
        this.terminationStatusCircle = document.getElementById('termination-status-circle');
        this.terminationStatusText = document.getElementById('termination-status-text');
        this.terminationConfidence = document.getElementById('termination-confidence');
        this.terminationPercentage = document.getElementById('termination-percentage');
        this.terminationMeterFill = document.getElementById('termination-meter-fill');
        this.terminationSignals = document.getElementById('termination-signals');
        this.suggestBtn = document.getElementById('suggest-termination');
        this.forceBtn = document.getElementById('force-termination');

        // Signals elements
        this.objectiveScore = document.getElementById('objective-score');
        this.durationScore = document.getElementById('duration-score');
        this.engagementScore = document.getElementById('engagement-score');
        this.signalBreakdown = document.getElementById('signal-breakdown');

        // Suggestions elements
        this.suggestedResponses = document.getElementById('suggested-responses');
        this.followUpActions = document.getElementById('follow-up-actions');

        // Analytics elements
        this.avgConversationTime = document.getElementById('avg-conversation-time');
        this.terminationAccuracy = document.getElementById('termination-accuracy');
        this.customerServiceBar = document.getElementById('customer-service-bar');
        this.technicalSupportBar = document.getElementById('technical-support-bar');
        this.salesBar = document.getElementById('sales-bar');
        this.customerServicePercent = document.getElementById('customer-service-percent');
        this.technicalSupportPercent = document.getElementById('technical-support-percent');
        this.salesPercent = document.getElementById('sales-percent');
        this.performanceInsights = document.getElementById('performance-insights');

        // Modal elements
        this.terminationModal = document.getElementById('termination-modal');
        this.closeModalBtn = document.getElementById('close-termination-modal');
        this.dismissTerminationBtn = document.getElementById('dismiss-termination');
        this.acceptTerminationBtn = document.getElementById('accept-termination');
        this.closureOptions = document.getElementById('closure-options');
    }

    bindEvents() {
        // Main controls
        this.startBtn.addEventListener('click', () => this.startSimulation());
        this.resetBtn.addEventListener('click', () => this.resetConversation());
        this.speedSelect.addEventListener('change', (e) => {
            this.conversationSpeed = e.target.value;
        });
        this.typeSelect.addEventListener('change', (e) => {
            this.conversationType = e.target.value;
        });

        // Conversation input
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Tab switching
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Termination actions
        this.suggestBtn.addEventListener('click', () => this.showTerminationModal());
        this.forceBtn.addEventListener('click', () => this.forceTermination());

        // Modal actions
        this.closeModalBtn.addEventListener('click', () => this.hideTerminationModal());
        this.dismissTerminationBtn.addEventListener('click', () => this.hideTerminationModal());
        this.acceptTerminationBtn.addEventListener('click', () => this.acceptTermination());
    }

    initializeCharts() {
        const efficiencyCanvas = document.getElementById('efficiency-chart');
        if (efficiencyCanvas) {
            const ctx = efficiencyCanvas.getContext('2d');
            this.charts.efficiency = { canvas: efficiencyCanvas, ctx };
            this.drawEfficiencyChart();
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panels
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
    }

    startSimulation() {
        if (this.isActive) {
            this.stopSimulation();
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start Simulation';
            this.startBtn.classList.remove('active');
            return;
        }

        this.isActive = true;
        this.startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Simulation';
        this.startBtn.classList.add('active');

        this.resetConversation();
        this.analytics.totalConversations++;
        this.analytics.conversationTypes[this.conversationType]++;

        // Start conversation simulation
        this.startConversationFlow();

        // Start real-time monitoring
        this.startMonitoring();

        this.showNotification('Conversation simulation started', 'success');
    }

    stopSimulation() {
        this.isActive = false;
        if (this.intervals.conversation) {
            clearInterval(this.intervals.conversation);
        }
        if (this.intervals.monitoring) {
            clearInterval(this.intervals.monitoring);
        }
    }

    resetConversation() {
        this.conversation = [];
        this.terminationReadiness = 0;
        this.objectiveFulfillment = 0;
        this.conversationDuration = 0;
        this.signals = [];
        this.userEngagement = 'High';

        this.updateMessagesDisplay();
        this.updateTerminationStatus();
        this.updateSignalsDisplay();
        this.updateSuggestions();
        this.updateAnalytics();

        this.userInput.disabled = false;
        this.sendBtn.disabled = false;
        this.suggestBtn.disabled = true;
        this.forceBtn.disabled = true;

        this.stopSimulation();
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start Simulation';
        this.startBtn.classList.remove('active');
    }

    startConversationFlow() {
        const flow = this.getConversationFlow(this.conversationType);
        let step = 0;

        this.intervals.conversation = setInterval(() => {
            if (!this.isActive || step >= flow.length) {
                clearInterval(this.intervals.conversation);
                return;
            }

            const message = flow[step];
            this.addBotMessage(message.text, message.delay || 1000);
            step++;

            // Auto-advance if no user input required
            if (!message.waitForUser) {
                // Continue to next step
            }
        }, this.getSpeedDelay());
    }

    getConversationFlow(type) {
        const flows = {
            'customer-service': [
                { text: "Hello! Welcome to our customer support. How can I help you today?", waitForUser: true },
                { text: "I understand you're having an issue. Let me check that for you.", delay: 2000 },
                { text: "I've found the solution to your problem. Here's what you need to do:", delay: 3000 },
                { text: "1. Go to your account settings\n2. Click on 'Preferences'\n3. Update your information\n4. Save the changes", delay: 1000 },
                { text: "Is there anything else I can assist you with today?", waitForUser: true }
            ],
            'technical-support': [
                { text: "Hi there! I'm here to help with your technical issue. Can you describe what's happening?", waitForUser: true },
                { text: "That sounds like a common connectivity problem. Let me run some diagnostics.", delay: 2000 },
                { text: "I've identified the issue. It appears to be a configuration problem on our end.", delay: 3000 },
                { text: "The fix has been applied automatically. You should see the issue resolved within the next few minutes.", delay: 2000 },
                { text: "Please let me know if you're still experiencing any problems.", waitForUser: true }
            ],
            'sales': [
                { text: "Hello! Thank you for your interest in our products. What are you looking for today?", waitForUser: true },
                { text: "That's a great choice! Let me tell you about our current promotions.", delay: 2000 },
                { text: "We have a special discount of 20% off for new customers like yourself.", delay: 2000 },
                { text: "Would you like me to help you complete your purchase, or do you have any questions about the product?", waitForUser: true }
            ],
            'general': [
                { text: "Hi! How are you doing today?", waitForUser: true },
                { text: "That's good to hear! What would you like to talk about?", waitForUser: true },
                { text: "Interesting topic! Let me share some thoughts on that.", delay: 2000 },
                { text: "I hope that was helpful. Is there anything else you'd like to discuss?", waitForUser: true }
            ]
        };

        return flows[type] || flows['general'];
    }

    getSpeedDelay() {
        const delays = {
            'slow': 3000,
            'normal': 2000,
            'fast': 1000
        };
        return delays[this.conversationSpeed] || 2000;
    }

    addBotMessage(text, delay = 0) {
        setTimeout(() => {
            const message = {
                id: Date.now(),
                type: 'bot',
                text: text,
                timestamp: new Date(),
                signals: this.analyzeMessageSignals(text, 'bot')
            };

            this.conversation.push(message);
            this.updateMessagesDisplay();
            this.analyzeConversation();
        }, delay);
    }

    sendMessage() {
        const text = this.userInput.value.trim();
        if (!text) return;

        const message = {
            id: Date.now(),
            type: 'user',
            text: text,
            timestamp: new Date(),
            signals: this.analyzeMessageSignals(text, 'user')
        };

        this.conversation.push(message);
        this.userInput.value = '';
        this.updateMessagesDisplay();
        this.analyzeConversation();

        // Simulate bot response if conversation is active
        if (this.isActive) {
            setTimeout(() => {
                this.generateBotResponse(text);
            }, 1000 + Math.random() * 2000);
        }
    }

    generateBotResponse(userMessage) {
        const responses = {
            'customer-service': [
                "Thank you for providing that information. I'm working on your request.",
                "I appreciate your patience. This should be resolved shortly.",
                "Your issue has been escalated to our senior support team.",
                "Perfect! I've updated your account with the new information.",
                "Is there anything else I can help you with today?"
            ],
            'technical-support': [
                "Let me check the system logs for any error messages.",
                "I've found the root cause of the issue. Applying the fix now.",
                "The system should be back online within 5 minutes.",
                "Please try restarting your application and let me know if that helps.",
                "Your technical issue has been resolved. Do you need help with anything else?"
            ],
            'sales': [
                "That sounds like a perfect fit for your needs!",
                "Let me check our current inventory for you.",
                "We can offer you free shipping on this order.",
                "Would you like to proceed with the purchase?",
                "Thank you for your business! Is there anything else I can help you with?"
            ],
            'general': [
                "That's interesting! Tell me more about that.",
                "I understand what you mean. Here's my perspective...",
                "That's a great point! Have you considered...",
                "I appreciate you sharing that with me.",
                "Thanks for the conversation! Is there anything else on your mind?"
            ]
        };

        const typeResponses = responses[this.conversationType] || responses['general'];
        const response = typeResponses[Math.floor(Math.random() * typeResponses.length)];

        this.addBotMessage(response);
    }

    updateMessagesDisplay() {
        this.messagesContainer.innerHTML = '';

        if (this.conversation.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-info-circle"></i>
                    <span>Click "Start Simulation" to begin a conversation analysis</span>
                </div>
            `;
            return;
        }

        this.conversation.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageElement);
        });

        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;

        const avatarLetter = message.type === 'user' ? 'U' : 'B';
        const avatarClass = message.type === 'user' ? 'user' : 'bot';

        messageDiv.innerHTML = `
            <div class="message-avatar ${avatarClass}">${avatarLetter}</div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(message.text)}</div>
                <div class="message-meta">
                    <span>${message.timestamp.toLocaleTimeString()}</span>
                    ${message.signals ? `<span class="signals">${message.signals.length} signals detected</span>` : ''}
                </div>
            </div>
        `;

        return messageDiv;
    }

    formatMessage(text) {
        return text.replace(/\n/g, '<br>');
    }

    analyzeMessageSignals(text, type) {
        const signals = [];

        // Completion signals
        if (text.toLowerCase().includes('thank you') || text.toLowerCase().includes('thanks')) {
            signals.push({ type: 'completion', name: 'Gratitude', strength: 0.8 });
        }

        if (text.toLowerCase().includes('that helps') || text.toLowerCase().includes('solved')) {
            signals.push({ type: 'completion', name: 'Problem Solved', strength: 0.9 });
        }

        if (text.toLowerCase().includes('understood') || text.toLowerCase().includes('got it')) {
            signals.push({ type: 'completion', name: 'Understanding', strength: 0.7 });
        }

        // Termination signals
        if (text.toLowerCase().includes('goodbye') || text.toLowerCase().includes('bye')) {
            signals.push({ type: 'termination', name: 'Farewell', strength: 1.0 });
        }

        if (text.toLowerCase().includes('nothing else') || text.toLowerCase().includes('that\'s all')) {
            signals.push({ type: 'termination', name: 'No Further Needs', strength: 0.9 });
        }

        // Engagement signals
        if (text.includes('?') || text.toLowerCase().includes('what') || text.toLowerCase().includes('how')) {
            signals.push({ type: 'engagement', name: 'Question', strength: 0.6 });
        }

        return signals;
    }

    analyzeConversation() {
        this.conversationDuration = (Date.now() - this.conversation[0]?.timestamp) / 1000 / 60; // minutes

        // Calculate objective fulfillment
        const completionSignals = this.conversation.flatMap(msg => msg.signals || [])
            .filter(signal => signal.type === 'completion');

        this.objectiveFulfillment = Math.min(100, completionSignals.length * 20);

        // Calculate termination readiness
        const terminationSignals = this.conversation.flatMap(msg => msg.signals || [])
            .filter(signal => signal.type === 'termination');

        this.terminationReadiness = Math.min(100, (terminationSignals.length * 30) + (this.objectiveFulfillment * 0.7));

        // Update engagement based on conversation length and signals
        const engagementSignals = this.conversation.flatMap(msg => msg.signals || [])
            .filter(signal => signal.type === 'engagement');

        if (this.conversationDuration > 10) {
            this.userEngagement = engagementSignals.length > 2 ? 'High' : 'Medium';
        } else {
            this.userEngagement = 'High';
        }

        // Collect all signals
        this.signals = this.conversation.flatMap(msg => msg.signals || []);

        this.updateTerminationStatus();
        this.updateSignalsDisplay();
        this.updateSuggestions();

        // Enable termination buttons if ready
        const shouldEnable = this.terminationReadiness > 60;
        this.suggestBtn.disabled = !shouldEnable;
        this.forceBtn.disabled = !shouldEnable;
    }

    updateTerminationStatus() {
        let statusText = 'Monitoring Active';
        let statusClass = 'monitoring';
        let confidence = 'Analyzing...';

        if (this.terminationReadiness > 80) {
            statusText = 'Ready for Termination';
            statusClass = 'ready';
            confidence = `High confidence (${Math.round(this.terminationReadiness)}%)`;
        } else if (this.terminationReadiness > 50) {
            statusText = 'Termination Possible';
            statusClass = 'warning';
            confidence = `Medium confidence (${Math.round(this.terminationReadiness)}%)`;
        }

        this.terminationStatusCircle.className = `status-circle ${statusClass}`;
        this.terminationStatusText.textContent = statusText;
        this.terminationConfidence.textContent = `Confidence: ${confidence}`;
        this.terminationPercentage.textContent = `${Math.round(this.terminationReadiness)}%`;
        this.terminationMeterFill.style.width = `${this.terminationReadiness}%`;

        // Update signals list
        this.updateTerminationSignals();
    }

    updateTerminationSignals() {
        const recentSignals = this.signals.slice(-5); // Last 5 signals

        if (recentSignals.length === 0) {
            this.terminationSignals.innerHTML = `
                <div class="signal-item">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Analyzing conversation flow...</span>
                </div>
            `;
            return;
        }

        this.terminationSignals.innerHTML = recentSignals.map(signal => `
            <div class="signal-item">
                <i class="fas fa-signal"></i>
                <span>${signal.name} (${Math.round(signal.strength * 100)}%)</span>
            </div>
        `).join('');
    }

    updateSignalsDisplay() {
        this.objectiveScore.textContent = `${Math.round(this.objectiveFulfillment)}%`;
        this.durationScore.textContent = `${this.conversationDuration.toFixed(1)} min`;
        this.engagementScore.textContent = this.userEngagement;

        // Update signal breakdown
        const signalCounts = {};
        this.signals.forEach(signal => {
            signalCounts[signal.type] = (signalCounts[signal.type] || 0) + 1;
        });

        this.signalBreakdown.innerHTML = Object.entries(signalCounts).map(([type, count]) => `
            <div class="signal-item">
                <i class="fas fa-${this.getSignalIcon(type)}"></i>
                <span>${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} signals</span>
            </div>
        `).join('') || '<div class="signal-item"><i class="fas fa-info-circle"></i><span>No signals detected yet</span></div>';
    }

    getSignalIcon(type) {
        const icons = {
            'completion': 'check-circle',
            'termination': 'stop-circle',
            'engagement': 'comments'
        };
        return icons[type] || 'signal';
    }

    updateSuggestions() {
        // Suggested responses
        const suggestions = this.generateSuggestedResponses();
        this.suggestedResponses.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" onclick="this.classList.toggle('selected')">
                <i class="fas fa-comment"></i>
                <span>${suggestion}</span>
            </div>
        `).join('');

        // Follow-up actions
        const actions = this.generateFollowUpActions();
        this.followUpActions.innerHTML = actions.map(action => `
            <div class="suggestion-item">
                <i class="fas fa-${action.icon}"></i>
                <span>${action.text}</span>
            </div>
        `).join('');
    }

    generateSuggestedResponses() {
        const baseSuggestions = {
            'customer-service': [
                "Thank you for contacting our support team. Is there anything else I can help you with today?",
                "Your issue has been resolved. Please don't hesitate to reach out if you need further assistance.",
                "We're glad we could help! Have a great day!"
            ],
            'technical-support': [
                "The technical issue has been addressed. Please let us know if you experience any further problems.",
                "Your system should now be functioning normally. Contact us if you need additional support.",
                "Technical support session completed. Thank you for your patience."
            ],
            'sales': [
                "Thank you for your interest in our products. Would you like to proceed with your purchase?",
                "We're excited about the opportunity to work with you. Shall we move forward with the next steps?",
                "Thank you for considering our services. Please let me know if you have any final questions."
            ],
            'general': [
                "Thank you for the conversation! It was great chatting with you.",
                "I enjoyed our discussion. Feel free to reach out anytime.",
                "Thanks for sharing your thoughts. Have a wonderful day!"
            ]
        };

        return baseSuggestions[this.conversationType] || baseSuggestions['general'];
    }

    generateFollowUpActions() {
        const actions = [
            { icon: 'envelope', text: 'Send satisfaction survey' },
            { icon: 'star', text: 'Request feedback rating' },
            { icon: 'user-plus', text: 'Offer to connect on social media' },
            { icon: 'calendar', text: 'Schedule follow-up call' }
        ];

        return actions.slice(0, 2); // Return first 2 actions
    }

    updateAnalytics() {
        // Update conversation time
        const avgTime = this.analytics.totalConversations > 0 ?
            (this.analytics.avgTerminationTime + this.conversationDuration) / 2 : this.conversationDuration;
        this.analytics.avgTerminationTime = avgTime;
        this.avgConversationTime.textContent = `${avgTime.toFixed(1)} min`;

        // Update accuracy (simulated)
        this.analytics.accuracyRate = Math.min(95, 70 + Math.random() * 25);
        this.terminationAccuracy.textContent = `${Math.round(this.analytics.accuracyRate)}%`;

        // Update conversation type distribution
        const total = Object.values(this.analytics.conversationTypes).reduce((a, b) => a + b, 0);
        if (total > 0) {
            const customerPercent = (this.analytics.conversationTypes['customer-service'] / total) * 100;
            const technicalPercent = (this.analytics.conversationTypes['technical-support'] / total) * 100;
            const salesPercent = (this.analytics.conversationTypes['sales'] / total) * 100;

            this.customerServiceBar.style.width = `${customerPercent}%`;
            this.customerServicePercent.textContent = `${Math.round(customerPercent)}%`;

            this.technicalSupportBar.style.width = `${technicalPercent}%`;
            this.technicalSupportPercent.textContent = `${Math.round(technicalPercent)}%`;

            this.salesBar.style.width = `${salesPercent}%`;
            this.salesPercent.textContent = `${Math.round(salesPercent)}%`;
        }

        // Update performance insights
        this.updatePerformanceInsights();

        // Update efficiency chart
        this.drawEfficiencyChart();
    }

    updatePerformanceInsights() {
        const insights = [];

        if (this.analytics.accuracyRate > 90) {
            insights.push({ icon: 'trophy', text: 'Excellent termination accuracy achieved' });
        }

        if (this.analytics.avgTerminationTime < 5) {
            insights.push({ icon: 'clock', text: 'Conversations terminating efficiently' });
        }

        if (this.terminationReadiness > 70) {
            insights.push({ icon: 'check-circle', text: 'High termination readiness detected' });
        }

        if (insights.length === 0) {
            insights.push({ icon: 'info-circle', text: 'Continue monitoring for performance insights' });
        }

        this.performanceInsights.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-${insight.icon}"></i>
                <span>${insight.text}</span>
            </div>
        `).join('');
    }

    drawEfficiencyChart() {
        if (!this.charts.efficiency) return;

        const { ctx, canvas } = this.charts.efficiency;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw efficiency trend (simulated data)
        const dataPoints = 10;
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
            data.push({
                x: (width / (dataPoints - 1)) * i,
                y: height - (0.3 + Math.random() * 0.6) * height // Random values between 30-90%
            });
        }

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);

        data.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#10b981';
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    showTerminationModal() {
        const confidence = Math.round(this.terminationReadiness);
        const timeSaved = Math.max(0.5, Math.random() * 3).toFixed(1);
        const costSaved = Math.round(Math.random() * 20 + 5);

        document.getElementById('recommendation-score').textContent = confidence;
        document.getElementById('termination-reason').textContent =
            this.getTerminationReason(confidence);
        document.getElementById('time-saved').textContent = `${timeSaved} min`;
        document.getElementById('cost-saved').textContent = `${costSaved}%`;

        // Generate closure options
        const options = this.generateClosureOptions();
        this.closureOptions.innerHTML = options.map((option, index) => `
            <div class="closure-option" data-index="${index}" onclick="this.classList.toggle('selected')">
                ${option}
            </div>
        `).join('');

        this.terminationModal.classList.add('show');
    }

    getTerminationReason(confidence) {
        if (confidence > 85) {
            return "The conversation has reached a natural conclusion with all objectives fulfilled and clear termination signals detected.";
        } else if (confidence > 70) {
            return "Multiple completion indicators suggest the conversation objectives have been met.";
        } else {
            return "Conversation analysis indicates a potential termination point based on current signals.";
        }
    }

    generateClosureOptions() {
        return [
            "Thank you for your time. Is there anything else I can help you with today?",
            "I believe we've addressed all your concerns. Please don't hesitate to contact us again.",
            "Your request has been completed. Have a wonderful day!",
            "We're all set here. Thank you for choosing our service.",
            "The conversation has concluded successfully. Best regards!"
        ];
    }

    hideTerminationModal() {
        this.terminationModal.classList.remove('show');
    }

    acceptTermination() {
        const selectedOption = this.closureOptions.querySelector('.selected');
        if (selectedOption) {
            this.addBotMessage(selectedOption.textContent);
        }

        this.hideTerminationModal();
        this.stopSimulation();
        this.showNotification('Conversation terminated successfully', 'success');

        // Update analytics
        this.analytics.accuracyRate = Math.min(100, this.analytics.accuracyRate + 1);
        this.updateAnalytics();
    }

    forceTermination() {
        this.addBotMessage("Thank you for your time. This conversation has been concluded.");
        this.stopSimulation();
        this.showNotification('Conversation forcefully terminated', 'warning');
    }

    startMonitoring() {
        this.intervals.monitoring = setInterval(() => {
            if (!this.isActive) return;

            // Update conversation duration
            this.conversationDuration = (Date.now() - this.conversation[0]?.timestamp) / 1000 / 60;

            // Auto-suggest termination if highly ready
            if (this.terminationReadiness > 85 && Math.random() > 0.95) {
                this.showTerminationModal();
            }

            this.updateSignalsDisplay();
            this.updateAnalytics();
        }, 5000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.getElementById('notifications').appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    updateDisplay() {
        this.updateTerminationStatus();
        this.updateSignalsDisplay();
        this.updateSuggestions();
        this.updateAnalytics();
    }

    destroy() {
        this.stopSimulation();
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
    }
}

// Initialize the advisor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.conversationAdvisor = new PredictiveConversationTerminationAdvisor();
});

    startNewConversation() {
        this.conversation = [];
        this.completionScore = 0;
        this.efficiencyRating = 100;
        this.isMonitoring = true;

        this.conversationContainer.innerHTML = '';
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;

        this.updateAdvisorStatus('monitoring');
        this.updateMetrics();
        this.updateInsights();

        // Add initial bot message based on conversation type
        const initialMessage = this.getInitialMessage();
        this.addMessage('bot', initialMessage);
    }

    getInitialMessage() {
        const messages = {
            'customer-support': 'Hello! How can I help you with your inquiry today?',
            'sales': 'Hi there! I\'m interested in learning more about your needs. What brings you here?',
            'technical': 'Greetings! I\'m here to assist with any technical questions you might have.',
            'general': 'Hello! What would you like to talk about?'
        };
        return messages[this.conversationType] || messages['general'];
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.messageInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            const response = this.generateBotResponse(message);
            this.addMessage('bot', response);
            this.analyzeConversation();
        }, 1000 + Math.random() * 2000); // Random delay for realism
    }

    addSimulatedMessage() {
        const simulatedMessages = {
            'customer-support': [
                'I\'m having trouble with my account login.',
                'Can you help me reset my password?',
                'I need to update my billing information.',
                'When will my order arrive?',
                'I\'d like to cancel my subscription.'
            ],
            'sales': [
                'Tell me about your premium features.',
                'What are your pricing plans?',
                'Do you offer a free trial?',
                'Can you provide a demo?',
                'I\'m interested in enterprise solutions.'
            ],
            'technical': [
                'How do I configure the API?',
                'I\'m getting an error code 500.',
                'Can you explain the authentication flow?',
                'What are the system requirements?',
                'How do I troubleshoot connection issues?'
            ],
            'general': [
                'What\'s the weather like today?',
                'Can you recommend a good book?',
                'Tell me about your hobbies.',
                'What\'s your favorite programming language?',
                'Do you have any travel recommendations?'
            ]
        };

        const messages = simulatedMessages[this.conversationType] || simulatedMessages['general'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        this.addMessage('user', randomMessage);

        setTimeout(() => {
            const response = this.generateBotResponse(randomMessage);
            this.addMessage('bot', response);
            this.analyzeConversation();
        }, 1000 + Math.random() * 2000);
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = sender === 'user' ? 'U' : 'B';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${content}</div>
        `;

        this.conversationContainer.appendChild(messageDiv);
        this.conversationContainer.scrollTop = this.conversationContainer.scrollHeight;

        this.conversation.push({ sender, content, timestamp: Date.now() });
    }

    generateBotResponse(userMessage) {
        // Simple response generation based on conversation type and message content
        const responses = {
            'customer-support': this.generateSupportResponse(userMessage),
            'sales': this.generateSalesResponse(userMessage),
            'technical': this.generateTechnicalResponse(userMessage),
            'general': this.generateGeneralResponse(userMessage)
        };

        return responses[this.conversationType] || responses['general'];
    }

    generateSupportResponse(message) {
        const responses = [
            'I understand your concern. Let me help you with that.',
            'I\'d be happy to assist you with your account issue.',
            'Let me check that for you right away.',
            'I can definitely help you resolve this.',
            'Thank you for bringing this to my attention.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateSalesResponse(message) {
        const responses = [
            'That\'s a great question! Let me tell you about our features.',
            'I\'d love to show you how our solution can benefit you.',
            'Our pricing is designed to be flexible for different needs.',
            'Would you like me to walk you through a demo?',
            'I\'m excited to help you find the right solution.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateTechnicalResponse(message) {
        const responses = [
            'Let me explain how that works step by step.',
            'I can help you troubleshoot this issue.',
            'Here\'s what you need to do to resolve that.',
            'Let me provide you with the technical details.',
            'I\'ll guide you through the configuration process.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateGeneralResponse(message) {
        const responses = [
            'That\'s interesting! Tell me more about that.',
            'I\'d love to hear your thoughts on this.',
            'That\'s a great point. What are your experiences?',
            'I\'m enjoying our conversation. What else is on your mind?',
            'Thanks for sharing that with me!'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    analyzeConversation() {
        if (!this.isMonitoring) return;

        this.calculateCompletionScore();
        this.calculateEfficiencyRating();
        this.updateMetrics();
        this.updateInsights();

        if (this.completionScore >= this.terminationThreshold) {
            this.suggestTermination();
        }
    }

    calculateCompletionScore() {
        let score = 0;

        // Analyze message patterns
        const userMessages = this.conversation.filter(msg => msg.sender === 'user');
        const botMessages = this.conversation.filter(msg => msg.sender === 'bot');

        // Completion indicators
        const completionKeywords = ['thank', 'thanks', 'resolved', 'solved', 'done', 'complete', 'understood', 'clear', 'perfect', 'great'];
        const userCompletionCount = userMessages.filter(msg =>
            completionKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
        ).length;

        // Bot confirmation patterns
        const confirmationPatterns = ['happy to help', 'resolved', 'assisted', 'completed', 'done'];
        const botConfirmationCount = botMessages.filter(msg =>
            confirmationPatterns.some(pattern => msg.content.toLowerCase().includes(pattern))
        ).length;

        // Conversation length factor
        const lengthScore = Math.min(50, this.conversation.length * 5);

        // Repetition detection (lower score for repetitive conversations)
        const uniqueMessages = new Set(this.conversation.map(msg => msg.content.toLowerCase()));
        const uniquenessScore = (uniqueMessages.size / this.conversation.length) * 30;

        score = lengthScore + (userCompletionCount * 10) + (botConfirmationCount * 15) + uniquenessScore;

        this.completionScore = Math.min(100, Math.max(0, score));
    }

    calculateEfficiencyRating() {
        // Efficiency decreases with conversation length and repetition
        const baseEfficiency = 100;
        const lengthPenalty = Math.max(0, this.conversation.length - 5) * 3;
        const repetitionPenalty = (1 - this.getMessageUniqueness()) * 20;

        this.efficiencyRating = Math.max(0, baseEfficiency - lengthPenalty - repetitionPenalty);
    }

    getMessageUniqueness() {
        const messages = this.conversation.map(msg => msg.content.toLowerCase());
        const uniqueMessages = new Set(messages);
        return uniqueMessages.size / messages.length;
    }

    updateMetrics() {
        this.completionBar.style.width = `${this.completionScore}%`;
        this.completionValue.textContent = `${Math.round(this.completionScore)}%`;

        this.efficiencyBar.style.width = `${this.efficiencyRating}%`;
        this.efficiencyValue.textContent = `${Math.round(this.efficiencyRating)}%`;
    }

    updateInsights() {
        const insights = [];

        if (this.conversation.length > 0) {
            insights.push(`Total messages: ${this.conversation.length}`);
            insights.push(`Conversation duration: ${this.getConversationDuration()} seconds`);
            insights.push(`Message uniqueness: ${Math.round(this.getMessageUniqueness() * 100)}%`);
        }

        if (this.completionScore > 50) {
            insights.push('Conversation appears to be approaching completion');
        }

        if (this.efficiencyRating < 70) {
            insights.push('Consider terminating to maintain efficiency');
        }

        this.insightsContent.innerHTML = insights.length > 0
            ? insights.map(insight => `<p>• ${insight}</p>`).join('')
            : '<p>No conversation data available yet.</p>';
    }

    getConversationDuration() {
        if (this.conversation.length < 2) return 0;
        const startTime = this.conversation[0].timestamp;
        const endTime = this.conversation[this.conversation.length - 1].timestamp;
        return Math.round((endTime - startTime) / 1000);
    }

    suggestTermination() {
        this.updateAdvisorStatus('suggesting');
        this.terminationSuggestions.style.display = 'block';

        const suggestions = this.getTerminationSuggestions();
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

        this.suggestionContent.innerHTML = `
            <p><strong>Suggested Response:</strong></p>
            <p class="suggested-message">"${randomSuggestion}"</p>
            <p><strong>Reason:</strong> Conversation completion score (${Math.round(this.completionScore)}%) indicates objectives may be fulfilled.</p>
        `;
    }

    getTerminationSuggestions() {
        const suggestions = {
            'customer-support': [
                'Is there anything else I can help you with today?',
                'I believe that resolves your issue. Let me know if you need further assistance.',
                'Thank you for contacting us. Your issue has been addressed.',
                'I hope this solution works for you. Please don\'t hesitate to reach out again.',
                'Your inquiry has been resolved. Have a great day!'
            ],
            'sales': [
                'Would you like to proceed with setting up your account?',
                'I can help you get started with our service right away.',
                'Thank you for your interest. Shall we move forward with the next steps?',
                'I believe I\'ve addressed your questions. Are you ready to make a decision?',
                'It\'s been great discussing our solutions with you. What are your next steps?'
            ],
            'technical': [
                'Does this resolve your technical question?',
                'I hope this explanation helps. Let me know if you need clarification.',
                'The issue should now be resolved. Please test and confirm.',
                'Thank you for bringing this to my attention. The solution is now in place.',
                'I believe we\'ve covered all the technical details. Any other questions?'
            ],
            'general': [
                'It\'s been great chatting with you!',
                'Thank you for the conversation. Have a wonderful day!',
                'I enjoyed our discussion. Until next time!',
                'That covers everything we discussed. Take care!',
                'Thanks for sharing your thoughts. Have a great day!'
            ]
        };

        return suggestions[this.conversationType] || suggestions['general'];
    }

    acceptTermination() {
        this.addMessage('bot', this.suggestionContent.querySelector('.suggested-message').textContent.slice(1, -1));
        this.endConversation();
    }

    continueConversation() {
        this.terminationSuggestions.style.display = 'none';
        this.updateAdvisorStatus('monitoring');
    }

    endConversation() {
        this.isMonitoring = false;
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        this.terminationSuggestions.style.display = 'none';
        this.updateAdvisorStatus('completed');

        setTimeout(() => {
            this.addMessage('system', 'Conversation terminated for efficiency. Final metrics: Completion ' +
                Math.round(this.completionScore) + '%, Efficiency ' + Math.round(this.efficiencyRating) + '%');
        }, 1000);
    }

    updateAdvisorStatus(status) {
        const statusText = {
            'monitoring': 'Monitoring conversation...',
            'suggesting': 'Termination suggested',
            'completed': 'Conversation completed'
        };

        this.statusIndicator.className = `status-indicator ${status}`;
        this.statusIndicator.querySelector('span').textContent = statusText[status] || statusText['monitoring'];
    }
}

// Initialize the advisor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ConversationTerminationAdvisor();
});