// Context Drift Detector - Advanced Implementation
// Author: AI Assistant
// Date: 2026
// Description: A comprehensive tool for detecting context drift in text using semantic analysis

// Global variables
let currentAnalysis = null;
let analysisHistory = [];
let settings = {
    minSimilarity: 0.3,
    windowSize: 3,
    maxTopics: 5,
    chartType: 'line',
    colorScheme: 'default',
    includeCharts: true,
    includeAnnotations: true,
    autoSave: false
};

let similarityChart = null;
let topicChart = null;

// Sample texts for demonstration
const sampleTexts = {
    conversation: `Hello, how are you today? I'm doing well, thank you. By the way, have you seen the latest movie about space exploration? It was really interesting. Speaking of space, I think we should invest more in renewable energy sources. What do you think about solar panels? They're becoming more efficient every year. Actually, let me tell you about my new electric car. It's amazing how technology has improved battery life.`,

    document: `Machine learning is a subset of artificial intelligence that enables computers to learn without being explicitly programmed. The field has grown rapidly in recent years. Neural networks are a key component of modern ML systems. They are inspired by the human brain's structure. Deep learning uses multiple layers of neural networks to solve complex problems. Natural language processing allows computers to understand human language. Computer vision enables machines to interpret visual information from the world. Reinforcement learning teaches agents to make decisions through trial and error. The future of AI looks promising with continued advancements in these areas.`,

    text: `The weather today is beautiful and sunny. I decided to go for a walk in the park. The flowers are blooming and birds are singing. Suddenly, I remembered I need to buy groceries. Milk, bread, and eggs are essential items. Then I thought about my upcoming vacation plans. Traveling to tropical islands sounds amazing. I should check flight prices and book accommodations. Speaking of travel, I need to renew my passport soon. The process can be quite lengthy and requires specific documentation.`
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSettings();
    loadHistory();
    initializeCharts();
});

// Initialize application components
function initializeApp() {
    console.log('Initializing Context Drift Detector...');
    updateSensitivityDisplay();
    updateMinSimilarityDisplay();
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

    // Analysis controls
    document.getElementById('analyzeBtn').addEventListener('click', performAnalysis);
    document.getElementById('clearBtn').addEventListener('click', clearInput);
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleText);

    // Sensitivity slider
    document.getElementById('sensitivity').addEventListener('input', updateSensitivityDisplay);

    // Export and save
    document.getElementById('exportReportBtn').addEventListener('click', exportReport);
    document.getElementById('saveAnalysisBtn').addEventListener('click', saveAnalysis);

    // History controls
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    document.getElementById('exportHistoryBtn').addEventListener('click', exportHistory);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);

    // Settings inputs
    document.getElementById('minSimilarity').addEventListener('input', updateMinSimilarityDisplay);
}

// Switch between sections
function switchSection(sectionId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });

    document.getElementById(sectionId).style.display = 'block';
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Update sensitivity display
function updateSensitivityDisplay() {
    const sensitivity = document.getElementById('sensitivity').value;
    document.getElementById('sensitivityValue').textContent = sensitivity;
}

// Update minimum similarity display
function updateMinSimilarityDisplay() {
    const minSimilarity = document.getElementById('minSimilarity').value;
    document.getElementById('minSimilarityValue').textContent = minSimilarity;
}

// Load sample text
function loadSampleText() {
    const inputType = document.getElementById('inputType').value;
    const sampleText = sampleTexts[inputType] || sampleTexts.text;
    document.getElementById('inputText').value = sampleText;
}

// Clear input
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('resultsSection').style.display = 'none';
}

// Perform context drift analysis
async function performAnalysis() {
    const inputText = document.getElementById('inputText').value.trim();
    if (!inputText) {
        alert('Please enter some text to analyze.');
        return;
    }

    // Show loading modal
    showLoadingModal();

    try {
        // Perform analysis
        const analysisMode = document.getElementById('analysisMode').value;
        const sensitivity = parseFloat(document.getElementById('sensitivity').value);

        currentAnalysis = await analyzeContextDrift(inputText, analysisMode, sensitivity);

        // Display results
        displayResults(currentAnalysis);

        // Save to history if auto-save is enabled
        if (settings.autoSave) {
            saveAnalysis();
        }

    } catch (error) {
        console.error('Analysis error:', error);
        alert('An error occurred during analysis. Please try again.');
    } finally {
        hideLoadingModal();
    }
}

// Main analysis function
async function analyzeContextDrift(text, mode, sensitivity) {
    const segments = segmentText(text, mode);
    const embeddings = await generateEmbeddings(segments);
    const similarities = calculateSimilarities(embeddings);
    const driftPoints = detectDriftPoints(similarities, sensitivity);
    const topics = extractTopics(segments);
    const coherenceScore = calculateCoherenceScore(similarities);

    return {
        originalText: text,
        segments,
        similarities,
        driftPoints,
        topics,
        coherenceScore,
        timestamp: new Date().toISOString(),
        settings: { mode, sensitivity }
    };
}

// Segment text based on analysis mode
function segmentText(text, mode) {
    switch (mode) {
        case 'sentence':
            return text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim());
        case 'paragraph':
            return text.split(/\n\n+/).filter(p => p.trim().length > 0).map(p => p.trim());
        case 'window':
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim());
            const windows = [];
            const windowSize = settings.windowSize;

            for (let i = 0; i <= sentences.length - windowSize; i++) {
                windows.push(sentences.slice(i, i + windowSize).join('. '));
            }
            return windows;
        default:
            return [text];
    }
}

// Generate embeddings (simplified simulation)
async function generateEmbeddings(segments) {
    // In a real implementation, this would use a proper embedding model
    // For demo purposes, we'll create simple vector representations
    const embeddings = [];

    for (const segment of segments) {
        const vector = await textToVector(segment);
        embeddings.push(vector);
    }

    return embeddings;
}

// Convert text to vector (simplified)
async function textToVector(text) {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));

    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(50).fill(0);

    // Simple word-based vectorization
    words.forEach(word => {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash) + word.charCodeAt(i);
            hash = hash & hash;
        }
        const index = Math.abs(hash) % 50;
        vector[index] += 1;
    });

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => magnitude > 0 ? val / magnitude : 0);
}

// Calculate similarities between consecutive segments
function calculateSimilarities(embeddings) {
    const similarities = [];

    for (let i = 0; i < embeddings.length - 1; i++) {
        const similarity = cosineSimilarity(embeddings[i], embeddings[i + 1]);
        similarities.push({
            index: i,
            similarity: similarity,
            segment1: i,
            segment2: i + 1
        });
    }

    return similarities;
}

// Cosine similarity calculation
function cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (norm1 * norm2);
}

// Detect drift points based on similarity threshold
function detectDriftPoints(similarities, sensitivity) {
    const threshold = settings.minSimilarity * sensitivity;
    const driftPoints = [];

    similarities.forEach((sim, index) => {
        if (sim.similarity < threshold) {
            driftPoints.push({
                index: index,
                position: sim.segment2,
                confidence: (threshold - sim.similarity) / threshold,
                similarity: sim.similarity,
                description: generateDriftDescription(sim.similarity)
            });
        }
    });

    return driftPoints;
}

// Generate description for drift point
function generateDriftDescription(similarity) {
    if (similarity < 0.1) return "Strong context shift detected";
    if (similarity < 0.2) return "Significant topic change";
    if (similarity < 0.3) return "Moderate context drift";
    return "Minor topic shift";
}

// Extract topics from segments (simplified)
function extractTopics(segments) {
    const topicKeywords = {
        technology: ['computer', 'software', 'algorithm', 'data', 'system', 'network'],
        science: ['research', 'study', 'experiment', 'theory', 'analysis', 'method'],
        business: ['company', 'market', 'product', 'service', 'customer', 'strategy'],
        personal: ['I', 'me', 'my', 'feel', 'think', 'want'],
        weather: ['sunny', 'rain', 'cloud', 'temperature', 'weather', 'climate'],
        travel: ['travel', 'vacation', 'flight', 'hotel', 'destination', 'journey']
    };

    const topics = [];
    const topicCounts = {};

    segments.forEach((segment, index) => {
        const words = segment.toLowerCase().split(/\s+/);
        const segmentTopics = new Set();

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            const matches = keywords.filter(keyword => words.includes(keyword)).length;
            if (matches > 0) {
                segmentTopics.add(topic);
                topicCounts[topic] = (topicCounts[topic] || 0) + matches;
            }
        });

        if (segmentTopics.size === 0) {
            segmentTopics.add('general');
            topicCounts.general = (topicCounts.general || 0) + 1;
        }

        topics.push({
            segmentIndex: index,
            topics: Array.from(segmentTopics)
        });
    });

    // Get top topics
    const sortedTopics = Object.entries(topicCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, settings.maxTopics)
        .map(([topic, count]) => ({ name: topic, count }));

    return sortedTopics;
}

// Calculate coherence score
function calculateCoherenceScore(similarities) {
    if (similarities.length === 0) return 100;

    const avgSimilarity = similarities.reduce((sum, sim) => sum + sim.similarity, 0) / similarities.length;
    return Math.round(avgSimilarity * 100);
}

// Display analysis results
function displayResults(analysis) {
    document.getElementById('resultsSection').style.display = 'block';

    // Update summary
    document.getElementById('driftCount').textContent = analysis.driftPoints.length;
    document.getElementById('coherenceScore').textContent = `${analysis.coherenceScore}%`;
    document.getElementById('topicCount').textContent = analysis.topics.length;

    // Update charts
    updateSimilarityChart(analysis);
    updateTopicChart(analysis);

    // Display drift points
    displayDriftPoints(analysis);

    // Display annotated text
    displayAnnotatedText(analysis);

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Update similarity chart
function updateSimilarityChart(analysis) {
    const ctx = document.getElementById('similarityChart').getContext('2d');

    if (similarityChart) {
        similarityChart.destroy();
    }

    const labels = analysis.similarities.map((_, index) => `Segment ${index + 1}-${index + 2}`);
    const data = analysis.similarities.map(sim => sim.similarity);

    similarityChart = new Chart(ctx, {
        type: settings.chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Context Similarity',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });
}

// Update topic chart
function updateTopicChart(analysis) {
    const ctx = document.getElementById('topicChart').getContext('2d');

    if (topicChart) {
        topicChart.destroy();
    }

    const labels = analysis.topics.map(topic => topic.name);
    const data = analysis.topics.map(topic => topic.count);

    topicChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Display drift points
function displayDriftPoints(analysis) {
    const driftList = document.getElementById('driftPoints');
    driftList.innerHTML = '';

    if (analysis.driftPoints.length === 0) {
        driftList.innerHTML = '<p>No significant context drift detected.</p>';
        return;
    }

    analysis.driftPoints.forEach(drift => {
        const driftElement = document.createElement('div');
        driftElement.className = `drift-point ${drift.confidence > 0.5 ? 'strong' : ''}`;

        driftElement.innerHTML = `
            <div class="drift-point-header">
                <span class="drift-position">Between segments ${drift.position} & ${drift.position + 1}</span>
                <span class="drift-confidence">${Math.round(drift.confidence * 100)}% confidence</span>
            </div>
            <div class="drift-description">${drift.description} (similarity: ${drift.similarity.toFixed(3)})</div>
        `;

        driftList.appendChild(driftElement);
    });
}

// Display annotated text
function displayAnnotatedText(analysis) {
    const annotatedElement = document.getElementById('annotatedText');
    const segments = analysis.segments;
    const driftPositions = analysis.driftPoints.map(d => d.position);

    let annotatedHTML = '';

    segments.forEach((segment, index) => {
        const isDriftPoint = driftPositions.includes(index);
        const driftInfo = analysis.driftPoints.find(d => d.position === index);

        if (isDriftPoint && driftInfo) {
            annotatedHTML += `<span class="drift-marker ${driftInfo.confidence > 0.5 ? 'strong' : ''}" data-drift="${driftInfo.description}">${segment}</span>`;
        } else {
            annotatedHTML += segment;
        }

        if (index < segments.length - 1) {
            annotatedHTML += ' ';
        }
    });

    annotatedElement.innerHTML = annotatedHTML;
}

// Initialize charts
function initializeCharts() {
    // Charts will be created when data is available
}

// Show loading modal
function showLoadingModal() {
    document.getElementById('loadingModal').style.display = 'block';
}

// Hide loading modal
function hideLoadingModal() {
    document.getElementById('loadingModal').style.display = 'none';
}

// Export report
function exportReport() {
    if (!currentAnalysis) {
        alert('No analysis to export.');
        return;
    }

    const report = generateReport(currentAnalysis);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `context-drift-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();

    URL.revokeObjectURL(url);
}

// Generate text report
function generateReport(analysis) {
    let report = `Context Drift Analysis Report\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;

    report += `SUMMARY\n`;
    report += `--------\n`;
    report += `Total Segments: ${analysis.segments.length}\n`;
    report += `Drift Points: ${analysis.driftPoints.length}\n`;
    report += `Coherence Score: ${analysis.coherenceScore}%\n`;
    report += `Topics Detected: ${analysis.topics.length}\n\n`;

    report += `DRIFT POINTS\n`;
    report += `------------\n`;
    analysis.driftPoints.forEach(drift => {
        report += `• ${drift.description} between segments ${drift.position} & ${drift.position + 1}\n`;
        report += `  Confidence: ${Math.round(drift.confidence * 100)}%, Similarity: ${drift.similarity.toFixed(3)}\n\n`;
    });

    report += `TOPICS\n`;
    report += `------\n`;
    analysis.topics.forEach(topic => {
        report += `• ${topic.name}: ${topic.count} occurrences\n`;
    });

    return report;
}

// Save analysis to history
function saveAnalysis() {
    if (!currentAnalysis) return;

    const historyItem = {
        ...currentAnalysis,
        id: Date.now(),
        title: `Analysis ${analysisHistory.length + 1}`,
        preview: currentAnalysis.originalText.substring(0, 100) + '...'
    };

    analysisHistory.unshift(historyItem);
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }

    saveHistoryToStorage();
    updateHistoryDisplay();
}

// Load history from storage
function loadHistory() {
    const stored = localStorage.getItem('contextDriftHistory');
    if (stored) {
        analysisHistory = JSON.parse(stored);
        updateHistoryDisplay();
    }
}

// Save history to storage
function saveHistoryToStorage() {
    localStorage.setItem('contextDriftHistory', JSON.stringify(analysisHistory));
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    analysisHistory.forEach(item => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.onclick = () => loadAnalysisFromHistory(item);

        historyElement.innerHTML = `
            <div class="history-header">
                <span class="history-title">${item.title}</span>
                <span class="history-date">${new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="history-preview">${item.preview}</div>
            <div class="history-stats">
                <span>Drifts: ${item.driftPoints.length}</span>
                <span>Coherence: ${item.coherenceScore}%</span>
                <span>Topics: ${item.topics.length}</span>
            </div>
        `;

        historyList.appendChild(historyElement);
    });
}

// Load analysis from history
function loadAnalysisFromHistory(item) {
    currentAnalysis = item;
    document.getElementById('inputText').value = item.originalText;
    displayResults(item);
    switchSection('analyze');
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all analysis history?')) {
        analysisHistory = [];
        saveHistoryToStorage();
        updateHistoryDisplay();
    }
}

// Export history
function exportHistory() {
    if (analysisHistory.length === 0) {
        alert('No history to export.');
        return;
    }

    const csv = generateHistoryCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `context-drift-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
}

// Generate history CSV
function generateHistoryCSV() {
    let csv = 'Date,Title,Drift Points,Coherence Score,Topics,Preview\n';

    analysisHistory.forEach(item => {
        csv += `"${new Date(item.timestamp).toLocaleDateString()}","${item.title}","${item.driftPoints.length}","${item.coherenceScore}%","${item.topics.length}","${item.preview.replace(/"/g, '""')}"\n`;
    });

    return csv;
}

// Load settings
function loadSettings() {
    const stored = localStorage.getItem('contextDriftSettings');
    if (stored) {
        settings = { ...settings, ...JSON.parse(stored) };
        applySettingsToUI();
    }
}

// Save settings
function saveSettings() {
    // Update settings from UI
    settings.minSimilarity = parseFloat(document.getElementById('minSimilarity').value);
    settings.windowSize = parseInt(document.getElementById('windowSize').value);
    settings.maxTopics = parseInt(document.getElementById('maxTopics').value);
    settings.chartType = document.getElementById('chartType').value;
    settings.colorScheme = document.getElementById('colorScheme').value;
    settings.includeCharts = document.getElementById('includeCharts').checked;
    settings.includeAnnotations = document.getElementById('includeAnnotations').checked;
    settings.autoSave = document.getElementById('autoSave').checked;

    localStorage.setItem('contextDriftSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

// Reset settings
function resetSettings() {
    settings = {
        minSimilarity: 0.3,
        windowSize: 3,
        maxTopics: 5,
        chartType: 'line',
        colorScheme: 'default',
        includeCharts: true,
        includeAnnotations: true,
        autoSave: false
    };

    applySettingsToUI();
    localStorage.removeItem('contextDriftSettings');
    alert('Settings reset to default!');
}

// Apply settings to UI
function applySettingsToUI() {
    document.getElementById('minSimilarity').value = settings.minSimilarity;
    document.getElementById('windowSize').value = settings.windowSize;
    document.getElementById('maxTopics').value = settings.maxTopics;
    document.getElementById('chartType').value = settings.chartType;
    document.getElementById('colorScheme').value = settings.colorScheme;
    document.getElementById('includeCharts').checked = settings.includeCharts;
    document.getElementById('includeAnnotations').checked = settings.includeAnnotations;
    document.getElementById('autoSave').checked = settings.autoSave;

    updateMinSimilarityDisplay();
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Performance monitoring
let analysisStartTime;
function startAnalysisTimer() {
    analysisStartTime = performance.now();
}

function endAnalysisTimer() {
    const duration = performance.now() - analysisStartTime;
    console.log(`Analysis completed in ${duration.toFixed(2)}ms`);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        performAnalysis();
    }
    if (e.key === 'Escape') {
        hideLoadingModal();
    }
});

// Export for testing
window.ContextDriftDetector = {
    analyze: analyzeContextDrift,
    getHistory: () => analysisHistory,
    getCurrentAnalysis: () => currentAnalysis,
    settings: settings
};

console.log('Context Drift Detector loaded successfully!');