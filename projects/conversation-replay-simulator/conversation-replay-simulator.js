// Conversation Replay Simulator - JavaScript Implementation
// Author: AI Assistant
// Date: 2026
// Description: Advanced conversation recording, replay, and analysis system

// Global variables
let conversations = [];
let currentConversation = null;
let isRecording = false;
let recordingStartTime = null;
let participants = [];
let replayInterval = null;
let currentReplayTime = 0;
let scenarios = [];
let settings = {
    autoSave: false,
    realTimeAnalysis: true,
    notifications: true,
    defaultRecordingMode: 'manual',
    maxParticipants: 5,
    autoStopTime: 60,
    sentimentSensitivity: 'medium',
    topicThreshold: 0.7,
    languageModel: 'advanced',
    localStorage: true
};

// Sentiment Analysis Engine
class SentimentAnalyzer {
    constructor() {
        this.sentimentWords = {
            positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased', 'satisfied', 'awesome', 'brilliant', 'perfect', 'outstanding'],
            negative: ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated', 'annoyed', 'upset', 'worried', 'concerned', 'unhappy'],
            neutral: ['okay', 'fine', 'alright', 'maybe', 'perhaps', 'possibly', 'think', 'believe', 'feel', 'seems', 'appears']
        };
    }

    analyze(text) {
        const words = text.toLowerCase().split(/\s+/);
        let positiveScore = 0;
        let negativeScore = 0;
        let neutralScore = 0;

        words.forEach(word => {
            if (this.sentimentWords.positive.includes(word)) positiveScore++;
            else if (this.sentimentWords.negative.includes(word)) negativeScore++;
            else if (this.sentimentWords.neutral.includes(word)) neutralScore++;
        });

        const total = positiveScore + negativeScore + neutralScore;
        if (total === 0) return { score: 0, label: 'neutral' };

        const normalizedScore = (positiveScore - negativeScore) / total;
        let label = 'neutral';
        if (normalizedScore > 0.1) label = 'positive';
        else if (normalizedScore < -0.1) label = 'negative';

        return { score: normalizedScore, label };
    }
}

// Topic Detection Engine
class TopicDetector {
    constructor() {
        this.topics = {
            'technical': ['code', 'programming', 'software', 'development', 'api', 'database', 'server', 'bug', 'error', 'fix', 'implement'],
            'business': ['project', 'deadline', 'meeting', 'client', 'requirement', 'budget', 'timeline', 'milestone', 'deliverable'],
            'personal': ['family', 'friend', 'health', 'holiday', 'weekend', 'weather', 'food', 'travel', 'hobby'],
            'emotional': ['feel', 'emotion', 'stress', 'happy', 'sad', 'worried', 'excited', 'frustrated', 'angry', 'love']
        };
    }

    detect(text) {
        const words = text.toLowerCase().split(/\s+/);
        const topicScores = {};

        Object.keys(this.topics).forEach(topic => {
            let score = 0;
            this.topics[topic].forEach(keyword => {
                const count = words.filter(word => word.includes(keyword)).length;
                score += count;
            });
            if (score > 0) topicScores[topic] = score;
        });

        return Object.entries(topicScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([topic, score]) => ({ topic, score }));
    }
}

// Conversation Manager
class ConversationManager {
    constructor() {
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.topicDetector = new TopicDetector();
    }

    createConversation(title, participants) {
        return {
            id: Date.now().toString(),
            title,
            participants,
            messages: [],
            startTime: new Date(),
            endTime: null,
            duration: 0,
            sentiment: [],
            topics: [],
            metadata: {
                totalMessages: 0,
                avgResponseTime: 0,
                engagementScore: 0
            }
        };
    }

    addMessage(conversation, participantId, content, timestamp = Date.now()) {
        const message = {
            id: Date.now().toString(),
            participantId,
            content,
            timestamp,
            sentiment: this.sentimentAnalyzer.analyze(content),
            topics: this.topicDetector.detect(content),
            metadata: {
                wordCount: content.split(/\s+/).length,
                characterCount: content.length,
                hasQuestions: content.includes('?'),
                hasExclamation: content.includes('!')
            }
        };

        conversation.messages.push(message);
        conversation.metadata.totalMessages++;

        // Update conversation analytics
        this.updateConversationAnalytics(conversation);

        return message;
    }

    updateConversationAnalytics(conversation) {
        // Calculate sentiment over time
        conversation.sentiment = conversation.messages.map(msg => ({
            timestamp: msg.timestamp,
            score: msg.sentiment.score
        }));

        // Aggregate topics
        const topicCounts = {};
        conversation.messages.forEach(msg => {
            msg.topics.forEach(topic => {
                topicCounts[topic.topic] = (topicCounts[topic.topic] || 0) + topic.score;
            });
        });
        conversation.topics = Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count);

        // Calculate engagement score
        const totalWords = conversation.messages.reduce((sum, msg) => sum + msg.metadata.wordCount, 0);
        const avgWordsPerMessage = totalWords / conversation.messages.length;
        const questionRatio = conversation.messages.filter(msg => msg.metadata.hasQuestions).length / conversation.messages.length;
        conversation.metadata.engagementScore = (avgWordsPerMessage * 0.6) + (questionRatio * 0.4);
    }

    endConversation(conversation) {
        conversation.endTime = new Date();
        conversation.duration = conversation.endTime - conversation.startTime;
        this.updateConversationAnalytics(conversation);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadData();
    updateDashboard();
    initializeCharts();
});

// Initialize application components
function initializeApp() {
    console.log('Initializing Conversation Replay Simulator...');
    updateConnectionStatus(true);

    // Initialize conversation manager
    window.conversationManager = new ConversationManager();

    // Set up initial participants
    updateParticipantsList();
}

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

    // Recording controls
    document.getElementById('startRecordingBtn').addEventListener('click', startRecording);
    document.getElementById('stopRecordingBtn').addEventListener('click', stopRecording);
    document.getElementById('saveConversationBtn').addEventListener('click', saveConversation);
    document.getElementById('clearConversationBtn').addEventListener('click', clearConversation);
    document.getElementById('exportConversationBtn').addEventListener('click', exportConversation);
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('addParticipantBtn').addEventListener('click', addParticipant);

    // Message input
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Recording mode change
    document.getElementById('recordingMode').addEventListener('change', function() {
        updateRecordingInterface();
    });

    // Participant count change
    document.getElementById('participantCount').addEventListener('change', function() {
        updateParticipantsList();
    });

    // Replay controls
    document.getElementById('conversationSelect').addEventListener('change', loadConversationForReplay);
    document.getElementById('playPauseBtn').addEventListener('click', toggleReplay);
    document.getElementById('resetReplayBtn').addEventListener('click', resetReplay);
    document.getElementById('timelineSlider').addEventListener('input', seekReplay);

    // Analytics
    document.getElementById('refreshAnalyticsBtn').addEventListener('click', refreshAnalytics);

    // Scenarios
    document.getElementById('createScenarioBtn').addEventListener('click', createNewScenario);
    document.getElementById('importScenarioBtn').addEventListener('click', importScenario);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('clearAllDataBtn').addEventListener('click', clearAllData);

    // Modal
    document.getElementById('alertClose').addEventListener('click', closeModal);
    document.getElementById('alertOkBtn').addEventListener('click', closeModal);
    document.getElementById('scenarioModalClose').addEventListener('click', closeScenarioModal);
    document.getElementById('scenarioCancelBtn').addEventListener('click', closeScenarioModal);
    document.getElementById('scenarioSaveBtn').addEventListener('click', saveScenario);
    document.getElementById('addBranchBtn').addEventListener('click', addBranch);

    // Window events
    window.addEventListener('beforeunload', saveData);
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

// Update participants list
function updateParticipantsList() {
    const count = parseInt(document.getElementById('participantCount').value);
    participants = [];

    for (let i = 0; i < count; i++) {
        participants.push({
            id: `participant_${i + 1}`,
            name: `Participant ${i + 1}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`,
            role: i === 0 ? 'initiator' : 'participant'
        });
    }

    renderParticipantsList();
    updateSpeakerSelect();
}

// Render participants list
function renderParticipantsList() {
    const container = document.getElementById('participantsList');
    container.innerHTML = '';

    participants.forEach(participant => {
        const participantEl = document.createElement('div');
        participantEl.className = 'participant-item';
        participantEl.innerHTML = `
            <img src="${participant.avatar}" alt="${participant.name}" class="participant-avatar">
            <div class="participant-info">
                <div class="participant-name">${participant.name}</div>
                <div class="participant-role">${participant.role}</div>
            </div>
            <button class="btn btn-sm btn-secondary edit-participant" data-id="${participant.id}">
                <i class="fas fa-edit"></i>
            </button>
        `;
        container.appendChild(participantEl);
    });
}

// Update speaker select dropdown
function updateSpeakerSelect() {
    const select = document.getElementById('currentSpeaker');
    select.innerHTML = '<option value="">Select speaker...</option>';

    participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant.id;
        option.textContent = participant.name;
        select.appendChild(option);
    });
}

// Add new participant
function addParticipant() {
    const name = prompt('Enter participant name:');
    if (name && name.trim()) {
        const newParticipant = {
            id: `participant_${Date.now()}`,
            name: name.trim(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            role: 'participant'
        };
        participants.push(newParticipant);
        renderParticipantsList();
        updateSpeakerSelect();
    }
}

// Start recording
function startRecording() {
    if (isRecording) return;

    const title = document.getElementById('conversationTitle').value.trim() || 'Untitled Conversation';
    currentConversation = window.conversationManager.createConversation(title, participants);
    isRecording = true;
    recordingStartTime = Date.now();

    updateRecordingUI(true);
    updateRecordingStatus('Recording...', 'recording');

    // Auto-stop timer
    setTimeout(() => {
        if (isRecording) {
            stopRecording();
        }
    }, settings.autoStopTime * 60 * 1000);

    logActivity(`Started recording: ${title}`);
}

// Stop recording
function stopRecording() {
    if (!isRecording) return;

    isRecording = false;
    window.conversationManager.endConversation(currentConversation);

    updateRecordingUI(false);
    updateRecordingStatus('Recording stopped', 'stopped');

    if (settings.autoSave) {
        saveConversation();
    }

    logActivity(`Stopped recording: ${currentConversation.title}`);
}

// Update recording UI
function updateRecordingUI(recording) {
    const startBtn = document.getElementById('startRecordingBtn');
    const stopBtn = document.getElementById('stopRecordingBtn');
    const saveBtn = document.getElementById('saveConversationBtn');
    const exportBtn = document.getElementById('exportConversationBtn');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');

    if (recording) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        saveBtn.disabled = true;
        exportBtn.disabled = true;
        messageInput.disabled = false;
        sendBtn.disabled = false;
    } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        saveBtn.disabled = false;
        exportBtn.disabled = false;
        messageInput.disabled = true;
        sendBtn.disabled = true;
    }
}

// Update recording status
function updateRecordingStatus(text, status) {
    const statusText = document.getElementById('recordingStatusText');
    const statusIndicator = document.getElementById('recordingStatus');

    statusText.textContent = text;
    statusIndicator.className = `status-indicator ${status === 'recording' ? 'recording' : ''}`;
}

// Send message
function sendMessage() {
    if (!isRecording) return;

    const speakerId = document.getElementById('currentSpeaker').value;
    const content = document.getElementById('messageInput').value.trim();

    if (!speakerId || !content) {
        showAlert('Please select a speaker and enter a message.', 'Warning');
        return;
    }

    const message = window.conversationManager.addMessage(currentConversation, speakerId, content);
    renderMessage(message);
    document.getElementById('messageInput').value = '';

    // Auto-analyze if enabled
    if (settings.realTimeAnalysis) {
        analyzeMessageRealtime(message);
    }
}

// Render message in conversation
function renderMessage(message) {
    const container = document.getElementById('conversationMessages');
    const participant = participants.find(p => p.id === message.participantId);

    // Remove empty state if present
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.sentiment.label}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <img src="${participant.avatar}" alt="${participant.name}" class="message-avatar">
            <div class="message-info">
                <span class="message-author">${participant.name}</span>
                <span class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="message-sentiment">
                <i class="fas fa-${message.sentiment.label === 'positive' ? 'smile' : message.sentiment.label === 'negative' ? 'frown' : 'meh'}"></i>
                ${message.sentiment.score.toFixed(2)}
            </div>
        </div>
        <div class="message-content">${message.content}</div>
        <div class="message-topics">
            ${message.topics.slice(0, 2).map(t => `<span class="topic-tag">${t.topic}</span>`).join('')}
        </div>
    `;

    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

// Analyze message in real-time
function analyzeMessageRealtime(message) {
    // Simulate real-time analysis delay
    setTimeout(() => {
        console.log('Real-time analysis for message:', message.id, message.sentiment, message.topics);
        // Could trigger notifications or UI updates here
    }, 100);
}

// Save conversation
function saveConversation() {
    if (!currentConversation) return;

    conversations.unshift(currentConversation);
    saveData();
    updateDashboard();
    updateConversationSelect();

    showAlert('Conversation saved successfully!', 'Success');
    logActivity(`Saved conversation: ${currentConversation.title}`);
}

// Clear conversation
function clearConversation() {
    if (!confirm('Are you sure you want to clear the current conversation? This action cannot be undone.')) return;

    currentConversation = null;
    document.getElementById('conversationMessages').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comment-dots"></i>
            <p>Start recording to see messages here</p>
        </div>
    `;
    document.getElementById('conversationTitle').value = '';
    updateRecordingUI(false);
    updateRecordingStatus('Ready to record', '');

    logActivity('Cleared current conversation');
}

// Export conversation
function exportConversation() {
    if (!currentConversation) return;

    const data = {
        conversation: currentConversation,
        exportDate: new Date(),
        format: 'JSON'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logActivity(`Exported conversation: ${currentConversation.title}`);
}

// Update recording interface based on mode
function updateRecordingInterface() {
    const mode = document.getElementById('recordingMode').value;
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');

    switch (mode) {
        case 'manual':
            messageInput.placeholder = 'Type a message...';
            sendBtn.style.display = 'inline-block';
            break;
        case 'real-time':
            messageInput.placeholder = 'Real-time chat mode...';
            sendBtn.style.display = 'inline-block';
            break;
        case 'import':
            messageInput.placeholder = 'Import conversation data...';
            sendBtn.style.display = 'none';
            break;
    }
}

// Load conversation for replay
function loadConversationForReplay() {
    const conversationId = document.getElementById('conversationSelect').value;
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) return;

    const titleEl = document.getElementById('replayConversationTitle');
    const durationEl = document.getElementById('replayDuration');
    const participantsEl = document.getElementById('replayParticipants');

    titleEl.textContent = conversation.title;
    durationEl.textContent = `Duration: ${formatDuration(conversation.duration)}`;
    participantsEl.textContent = `Participants: ${conversation.participants.length}`;

    // Enable replay controls
    document.getElementById('playPauseBtn').disabled = false;
    document.getElementById('resetReplayBtn').disabled = false;
    document.getElementById('timelineSlider').disabled = false;

    // Set timeline max
    document.getElementById('timelineSlider').max = conversation.messages.length;

    renderReplayTimeline(conversation);
}

// Render replay timeline
function renderReplayTimeline(conversation) {
    const timeline = document.getElementById('conversationTimeline');
    timeline.innerHTML = '';

    conversation.messages.forEach((message, index) => {
        const participant = participants.find(p => p.id === message.participantId);
        const timeEl = document.createElement('div');
        timeEl.className = 'timeline-item';
        timeEl.innerHTML = `
            <div class="timeline-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
            <div class="timeline-speaker">${participant ? participant.name : 'Unknown'}</div>
            <div class="timeline-preview">${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}</div>
        `;
        timeEl.addEventListener('click', () => seekToMessage(index));
        timeline.appendChild(timeEl);
    });
}

// Toggle replay
function toggleReplay() {
    const btn = document.getElementById('playPauseBtn');
    const icon = btn.querySelector('i');

    if (replayInterval) {
        // Pause
        clearInterval(replayInterval);
        replayInterval = null;
        icon.className = 'fas fa-play';
        btn.innerHTML = '<i class="fas fa-play"></i> Play';
    } else {
        // Play
        startReplay();
        icon.className = 'fas fa-pause';
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

// Start replay
function startReplay() {
    const conversationId = document.getElementById('conversationSelect').value;
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) return;

    const messagesContainer = document.getElementById('replayMessages');
    const slider = document.getElementById('timelineSlider');
    const timeDisplay = document.getElementById('currentTime');

    messagesContainer.innerHTML = '';
    currentReplayTime = 0;

    replayInterval = setInterval(() => {
        if (currentReplayTime >= conversation.messages.length) {
            clearInterval(replayInterval);
            replayInterval = null;
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i> Play';
            return;
        }

        const message = conversation.messages[currentReplayTime];
        renderReplayMessage(message);
        slider.value = currentReplayTime;
        timeDisplay.textContent = formatTime(message.timestamp);

        currentReplayTime++;
    }, 2000); // 2 seconds per message
}

// Render replay message
function renderReplayMessage(message) {
    const container = document.getElementById('replayMessages');
    const participant = participants.find(p => p.id === message.participantId);

    const messageEl = document.createElement('div');
    messageEl.className = `message replay-message ${message.sentiment.label}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <img src="${participant.avatar}" alt="${participant.name}" class="message-avatar">
            <div class="message-info">
                <span class="message-author">${participant.name}</span>
                <span class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
        </div>
        <div class="message-content">${message.content}</div>
    `;

    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

// Seek replay to specific message
function seekToMessage(index) {
    currentReplayTime = index;
    const conversationId = document.getElementById('conversationSelect').value;
    const conversation = conversations.find(c => c.id === conversationId);

    if (conversation) {
        const messagesContainer = document.getElementById('replayMessages');
        messagesContainer.innerHTML = '';

        for (let i = 0; i <= index; i++) {
            renderReplayMessage(conversation.messages[i]);
        }

        document.getElementById('timelineSlider').value = index;
        document.getElementById('currentTime').textContent = formatTime(conversation.messages[index].timestamp);
    }
}

// Seek replay via slider
function seekReplay() {
    const index = parseInt(document.getElementById('timelineSlider').value);
    seekToMessage(index);
}

// Reset replay
function resetReplay() {
    if (replayInterval) {
        clearInterval(replayInterval);
        replayInterval = null;
    }

    currentReplayTime = 0;
    document.getElementById('replayMessages').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-play-circle"></i>
            <p>Select a conversation and click play to start replay</p>
        </div>
    `;
    document.getElementById('timelineSlider').value = 0;
    document.getElementById('currentTime').textContent = '0:00';
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i> Play';
}

// Update conversation select dropdown
function updateConversationSelect() {
    const select = document.getElementById('conversationSelect');
    select.innerHTML = '<option value="">Choose a conversation...</option>';

    conversations.forEach(conversation => {
        const option = document.createElement('option');
        option.value = conversation.id;
        option.textContent = `${conversation.title} (${conversation.messages.length} messages)`;
        select.appendChild(option);
    });
}

// Update dashboard
function updateDashboard() {
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const avgDuration = conversations.length > 0 ?
        conversations.reduce((sum, conv) => sum + conv.duration, 0) / conversations.length : 0;
    const activeParticipants = new Set(conversations.flatMap(conv => conv.participants.map(p => p.id))).size;

    document.getElementById('totalConversationsValue').textContent = totalConversations;
    document.getElementById('avgDurationValue').textContent = formatDuration(avgDuration);
    document.getElementById('activeParticipantsValue').textContent = activeParticipants;

    // Mock AI confidence (in real implementation, this would be calculated)
    document.getElementById('aiConfidenceValue').textContent = '87%';

    updateRecentConversations();
}

// Update recent conversations list
function updateRecentConversations() {
    const container = document.getElementById('recentConversationsList');
    container.innerHTML = '';

    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No conversations recorded yet</p>
                <button class="btn btn-primary" onclick="switchSection('recorder')">
                    <i class="fas fa-plus"></i> Start Recording
                </button>
            </div>
        `;
        return;
    }

    conversations.slice(0, 5).forEach(conversation => {
        const convEl = document.createElement('div');
        convEl.className = 'conversation-item';
        convEl.innerHTML = `
            <div class="conversation-info">
                <h4>${conversation.title}</h4>
                <div class="conversation-meta">
                    <span>${conversation.messages.length} messages</span>
                    <span>${formatDuration(conversation.duration)}</span>
                    <span>${conversation.participants.length} participants</span>
                </div>
            </div>
            <div class="conversation-actions">
                <button class="btn btn-sm btn-secondary" onclick="replayConversation('${conversation.id}')">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="exportConversationData('${conversation.id}')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        container.appendChild(convEl);
    });
}

// Initialize charts
function initializeCharts() {
    // Conversation Trends Chart
    const trendsCtx = document.getElementById('conversationTrendsChart').getContext('2d');
    charts.conversationTrends = new Chart(trendsCtx, {
        type: 'line',
        data: {
            labels: generateDateLabels(7),
            datasets: [{
                label: 'Conversations',
                data: generateRandomData(7),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Participant Activity Chart
    const activityCtx = document.getElementById('participantActivityChart').getContext('2d');
    charts.participantActivity = new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: participants.map(p => p.name),
            datasets: [{
                label: 'Messages',
                data: participants.map(() => Math.floor(Math.random() * 50)),
                backgroundColor: '#28a745'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Sentiment Chart
    const sentimentCtx = document.getElementById('sentimentChart').getContext('2d');
    charts.sentiment = new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Topics Chart
    const topicsCtx = document.getElementById('topicsChart').getContext('2d');
    charts.topics = new Chart(topicsCtx, {
        type: 'horizontalBar',
        data: {
            labels: ['Technical', 'Business', 'Personal', 'Emotional'],
            datasets: [{
                label: 'Frequency',
                data: [30, 25, 20, 15],
                backgroundColor: '#17a2b8'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y'
        }
    });

    // Engagement Chart
    const engagementCtx = document.getElementById('engagementChart').getContext('2d');
    charts.engagement = new Chart(engagementCtx, {
        type: 'radar',
        data: {
            labels: ['Response Time', 'Message Length', 'Question Ratio', 'Topic Diversity', 'Sentiment Variance'],
            datasets: [{
                label: 'Engagement Score',
                data: [85, 78, 92, 88, 76],
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Analytics Overview Chart
    const analyticsCtx = document.getElementById('analyticsOverviewChart').getContext('2d');
    charts.analyticsOverview = new Chart(analyticsCtx, {
        type: 'line',
        data: {
            labels: generateDateLabels(30),
            datasets: [{
                label: 'Conversations',
                data: generateRandomData(30),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true
            }, {
                label: 'Messages',
                data: generateRandomData(30),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Refresh analytics
function refreshAnalytics() {
    // Update charts with new data
    updateAnalyticsCharts();
    updateInsights();

    showAlert('Analytics refreshed!', 'Success');
}

// Update analytics charts
function updateAnalyticsCharts() {
    if (charts.analyticsOverview) {
        charts.analyticsOverview.data.datasets[0].data = generateRandomData(30);
        charts.analyticsOverview.data.datasets[1].data = generateRandomData(30);
        charts.analyticsOverview.update();
    }

    if (charts.topics) {
        charts.topics.data.datasets[0].data = generateRandomData(4);
        charts.topics.update();
    }

    if (charts.engagement) {
        charts.engagement.data.datasets[0].data = generateRandomData(5);
        charts.engagement.update();
    }
}

// Update insights
function updateInsights() {
    const insights = [
        { type: 'positive', text: 'Conversation engagement increased by 23% this week' },
        { type: 'warning', text: 'Response times are 15% slower than average' },
        { type: 'info', text: 'Technical topics dominate 45% of conversations' },
        { type: 'negative', text: 'Sentiment analysis shows declining positivity' }
    ];

    const insightsList = document.getElementById('analyticsInsights');
    insightsList.innerHTML = '';

    insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = `insight-item ${insight.type}`;
        item.innerHTML = `
            <div class="insight-content">${insight.text}</div>
            <div class="insight-actions">
                <button class="btn btn-sm btn-secondary">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
        `;
        insightsList.appendChild(item);
    });
}

// Scenario management
function createNewScenario() {
    document.getElementById('scenarioModalTitle').textContent = 'Create New Scenario';
    document.getElementById('scenarioName').value = '';
    document.getElementById('scenarioDescription').value = '';
    document.getElementById('scenarioType').value = 'training';
    document.getElementById('branchesList').innerHTML = '';

    document.getElementById('scenarioModal').style.display = 'block';
}

function closeScenarioModal() {
    document.getElementById('scenarioModal').style.display = 'none';
}

function saveScenario() {
    const name = document.getElementById('scenarioName').value.trim();
    const description = document.getElementById('scenarioDescription').value.trim();
    const type = document.getElementById('scenarioType').value;

    if (!name) {
        showAlert('Please enter a scenario name.', 'Warning');
        return;
    }

    const scenario = {
        id: Date.now().toString(),
        name,
        description,
        type,
        branches: [],
        created: new Date()
    };

    scenarios.push(scenario);
    updateScenariosGrid();
    closeScenarioModal();
    showAlert('Scenario saved successfully!', 'Success');
}

function addBranch() {
    const branchesList = document.getElementById('branchesList');
    const branchEl = document.createElement('div');
    branchEl.className = 'branch-item';
    branchEl.innerHTML = `
        <input type="text" placeholder="Branch name" class="form-control branch-name">
        <textarea placeholder="Branch content" class="form-control branch-content" rows="2"></textarea>
        <button class="btn btn-sm btn-danger remove-branch">
            <i class="fas fa-trash"></i>
        </button>
    `;

    branchEl.querySelector('.remove-branch').addEventListener('click', function() {
        branchEl.remove();
    });

    branchesList.appendChild(branchEl);
}

function updateScenariosGrid() {
    const grid = document.getElementById('scenariosGrid');
    grid.innerHTML = '';

    if (scenarios.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sitemap"></i>
                <p>No scenarios created yet</p>
                <button class="btn btn-primary" onclick="createNewScenario()">
                    <i class="fas fa-plus"></i> Create Your First Scenario
                </button>
            </div>
        `;
        return;
    }

    scenarios.forEach(scenario => {
        const scenarioEl = document.createElement('div');
        scenarioEl.className = 'scenario-card';
        scenarioEl.innerHTML = `
            <div class="scenario-header">
                <h3>${scenario.name}</h3>
                <span class="scenario-type">${scenario.type}</span>
            </div>
            <p class="scenario-description">${scenario.description}</p>
            <div class="scenario-meta">
                <span>Branches: ${scenario.branches.length}</span>
                <span>Created: ${new Date(scenario.created).toLocaleDateString()}</span>
            </div>
            <div class="scenario-actions">
                <button class="btn btn-sm btn-primary" onclick="runScenario('${scenario.id}')">
                    <i class="fas fa-play"></i> Run
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editScenario('${scenario.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteScenario('${scenario.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        grid.appendChild(scenarioEl);
    });
}

// Settings management
function saveSettings() {
    settings.autoSave = document.getElementById('autoSaveToggle').classList.contains('active');
    settings.realTimeAnalysis = document.getElementById('realTimeAnalysisToggle').classList.contains('active');
    settings.notifications = document.getElementById('notificationsToggle').classList.contains('active');
    settings.localStorage = document.getElementById('localStorageToggle').classList.contains('active');
    settings.defaultRecordingMode = document.getElementById('defaultRecordingMode').value;
    settings.maxParticipants = parseInt(document.getElementById('maxParticipantsInput').value);
    settings.autoStopTime = parseInt(document.getElementById('autoStopTimeInput').value);
    settings.sentimentSensitivity = document.getElementById('sentimentSensitivity').value;
    settings.topicThreshold = parseFloat(document.getElementById('topicThresholdInput').value);
    settings.languageModel = document.getElementById('languageModel').value;

    localStorage.setItem('conversationReplaySettings', JSON.stringify(settings));
    showAlert('Settings saved successfully!', 'Success');
}

function resetSettings() {
    settings = {
        autoSave: false,
        realTimeAnalysis: true,
        notifications: true,
        defaultRecordingMode: 'manual',
        maxParticipants: 5,
        autoStopTime: 60,
        sentimentSensitivity: 'medium',
        topicThreshold: 0.7,
        languageModel: 'advanced',
        localStorage: true
    };

    loadSettingsToUI();
    showAlert('Settings reset to defaults!', 'Success');
}

function loadSettingsToUI() {
    toggleSettingUI('autoSaveToggle', settings.autoSave);
    toggleSettingUI('realTimeAnalysisToggle', settings.realTimeAnalysis);
    toggleSettingUI('notificationsToggle', settings.notifications);
    toggleSettingUI('localStorageToggle', settings.localStorage);

    document.getElementById('defaultRecordingMode').value = settings.defaultRecordingMode;
    document.getElementById('maxParticipantsInput').value = settings.maxParticipants;
    document.getElementById('autoStopTimeInput').value = settings.autoStopTime;
    document.getElementById('sentimentSensitivity').value = settings.sentimentSensitivity;
    document.getElementById('topicThresholdInput').value = settings.topicThreshold;
    document.getElementById('languageModel').value = settings.languageModel;
}

function toggleSetting(setting) {
    const element = document.getElementById(setting + 'Toggle');
    element.classList.toggle('active');
}

function toggleSettingUI(elementId, active) {
    const element = document.getElementById(elementId);
    if (active) {
        element.classList.add('active');
    } else {
        element.classList.remove('active');
    }
}

// Data management
function saveData() {
    if (settings.localStorage) {
        localStorage.setItem('conversationReplayData', JSON.stringify({
            conversations,
            scenarios,
            participants,
            settings
        }));
    }
}

function loadData() {
    const stored = localStorage.getItem('conversationReplayData');
    if (stored) {
        const data = JSON.parse(stored);
        conversations = data.conversations || [];
        scenarios = data.scenarios || [];
        participants = data.participants || [];
        settings = { ...settings, ...data.settings };
    }

    loadSettingsToUI();
    updateConversationSelect();
    updateScenariosGrid();
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) return;

    conversations = [];
    scenarios = [];
    currentConversation = null;

    localStorage.removeItem('conversationReplayData');
    localStorage.removeItem('conversationReplaySettings');

    updateDashboard();
    updateConversationSelect();
    updateScenariosGrid();
    clearConversation();

    showAlert('All data cleared!', 'Success');
}

// Utility functions
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function generateDateLabels(days) {
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString());
    }
    return labels;
}

function generateRandomData(count) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 100));
}

function showAlert(message, title = 'Alert') {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('alertModal').style.display = 'none';
}

function updateConnectionStatus(online) {
    const status = document.getElementById('connectionStatus');
    if (online) {
        status.textContent = 'Online';
        status.className = 'status-online';
    } else {
        status.textContent = 'Offline';
        status.className = 'status-offline';
    }
}

function logActivity(message) {
    console.log(`[Conversation Replay Simulator] ${new Date().toLocaleString()}: ${message}`);
}

// Initialize insights on load
updateInsights();

// Auto-save interval
setInterval(() => {
    if (settings.autoSave && currentConversation && isRecording) {
        saveData();
    }
}, 30000); // Save every 30 seconds

// Performance monitoring
let lastUpdate = Date.now();
setInterval(() => {
    const now = Date.now();
    const fps = 1000 / (now - lastUpdate);
    lastUpdate = now;

    if (fps < 30) {
        console.warn('Low performance detected:', fps.toFixed(1), 'FPS');
    }
}, 1000);

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showAlert('An error occurred. Please refresh the page.', 'Error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (isRecording) {
            saveConversation();
        }
    }
    if (e.key === 'Escape') {
        closeModal();
        closeScenarioModal();
    }
    if (e.key === ' ') {
        e.preventDefault();
        if (document.getElementById('replay').classList.contains('active')) {
            toggleReplay();
        }
    }
});

// Export for debugging
window.ConversationSimulator = {
    conversations,
    currentConversation,
    participants,
    scenarios,
    settings,
    startRecording,
    stopRecording,
    saveConversation,
    loadConversationForReplay,
    toggleReplay
};

console.log('Conversation Replay Simulator loaded successfully!');