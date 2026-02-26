/**
 * Contextual Intent Drift Analyzer
 * 
 * Detects gradual shifts in user intent during extended interactions
 * through rolling semantic comparison and coherence analysis.
 */

class ContextualIntentDriftAnalyzer {
    constructor() {
        this.sessionActive = false;
        this.sessionStartTime = null;
        this.interactions = [];
        this.initialIntent = null;
        this.driftHistory = [];
        this.alerts = [];
        this.selectedInteraction = null;

        this.config = {
            driftThreshold: 0.30,
            coherenceTarget: 0.80,
            windowSize: 5,
            minInteractions: 2
        };

        this.initializeDefaults();
    }

    /**
     * Initialize with sample data
     */
    initializeDefaults() {
        this.sampleQueries = [
            "How do I optimize database performance?",
            "What are the best practices for query indexing?",
            "I'm seeing slow response times in my API",
            "Should I consider switching databases?",
            "What cloud services would be better for scaling?",
            "How much would migration cost?",
            "What are the financial implications?",
            "Can you help with budget planning?",
            "How do I get approval from finance?",
            "What timeline should I propose?"
        ];
    }

    /**
     * Initialize UI
     */
    initialize() {
        this.updateUI();
    }

    /**
     * Start a new session
     */
    startSession() {
        this.sessionActive = true;
        this.sessionStartTime = new Date();
        this.interactions = [];
        this.initialIntent = null;
        this.driftHistory = [];
        this.alerts = [];

        this.logAlert('Session started', 'Session Analysis Initiated', 'info');
        this.updateUI();
        alert('✓ Session started. Add interactions to track intent drift.');
    }

    /**
     * Add simulated interaction
     */
    addSimulatedInteraction() {
        if (!this.sessionActive) {
            alert('⚠️ Start a session first');
            return;
        }

        const randomQuery = this.sampleQueries[Math.floor(Math.random() * this.sampleQueries.length)];
        this.addInteraction(randomQuery);
    }

    /**
     * Add interaction to session
     */
    addInteraction(query) {
        if (!this.sessionActive) return;

        const interaction = {
            id: this.interactions.length + 1,
            query,
            timestamp: new Date(),
            keywords: this.extractKeywords(query),
            embedding: this.generateEmbedding(query),
            similarity: null,
            coherence: null,
            drift: null
        };

        if (this.interactions.length === 0) {
            this.initialIntent = {
                query,
                keywords: interaction.keywords,
                embedding: interaction.embedding,
                tone: this.analyzeTone(query)
            };
            interaction.similarity = 1.0;
            interaction.coherence = 1.0;
            interaction.drift = 0;
        } else {
            // Calculate similarity to initial intent
            interaction.similarity = this.calculateSimilarity(
                this.initialIntent.embedding,
                interaction.embedding
            );

            // Calculate coherence within rolling window
            interaction.coherence = this.calculateCoherence(interaction);

            // Calculate drift
            interaction.drift = Math.abs(1 - interaction.similarity) * 100;
        }

        this.interactions.push(interaction);
        this.driftHistory.push({
            index: interaction.id,
            drift: interaction.drift,
            coherence: interaction.coherence,
            timestamp: interaction.timestamp
        });

        // Check thresholds
        if (interaction.drift > (this.config.driftThreshold * 100)) {
            this.logAlert(
                `Intent drift detected at interaction ${interaction.id}`,
                `Drift: ${interaction.drift.toFixed(1)}% | Similarity: ${(interaction.similarity * 100).toFixed(1)}%`,
                'drift-warning'
            );
        }

        if (interaction.coherence < 0.5) {
            this.logAlert(
                `Low coherence detected`,
                `Coherence score: ${(interaction.coherence * 100).toFixed(1)}%`,
                'coherence-low'
            );
        }

        this.updateUI();
    }

    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'is', 'are', 'be', 'do', 'does', 'did', 'will', 'would'
        ]);

        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));

        // Count frequency
        const freq = {};
        words.forEach(word => freq[word] = (freq[word] || 0) + 1);

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }

    /**
     * Generate simple embedding representation
     */
    generateEmbedding(text) {
        const keywords = this.extractKeywords(text);
        const embedding = {};

        keywords.forEach((keyword, index) => {
            embedding[keyword] = 1 - (index * 0.15);
        });

        return embedding;
    }

    /**
     * Calculate semantic similarity between embeddings
     */
    calculateSimilarity(emb1, emb2) {
        const keys1 = Object.keys(emb1);
        const keys2 = Object.keys(emb2);

        if (keys1.length === 0 || keys2.length === 0) return 0;

        // Jaccard similarity + weighted overlap
        const intersection = keys1.filter(k => keys2.includes(k));
        const union = new Set([...keys1, ...keys2]).size;

        let overlap = 0;
        intersection.forEach(key => {
            overlap += (emb1[key] + emb2[key]) / 2;
        });

        const jaccardSimilarity = intersection.length / union;
        const overlapSimilarity = overlap / Math.max(keys1.length, keys2.length);

        return (jaccardSimilarity * 0.4) + (overlapSimilarity * 0.6);
    }

    /**
     * Calculate topic coherence using rolling window
     */
    calculateCoherence(interaction) {
        if (this.interactions.length < this.config.windowSize) {
            return 1.0;
        }

        const windowStart = Math.max(0, this.interactions.length - this.config.windowSize);
        const window = this.interactions.slice(windowStart);

        let totalSimilarity = 0;
        let pairCount = 0;

        for (let i = 0; i < window.length - 1; i++) {
            const sim = this.calculateSimilarity(window[i].embedding, window[i + 1].embedding);
            totalSimilarity += sim;
            pairCount++;
        }

        return pairCount > 0 ? totalSimilarity / pairCount : 1.0;
    }

    /**
     * Analyze tone/intent category
     */
    analyzeTone(text) {
        const text_lower = text.toLowerCase();

        const toneMaps = {
            'question': ['how', 'what', 'when', 'where', 'why', 'is', 'are', 'can'],
            'problem': ['issue', 'problem', 'error', 'fail', 'slow', 'broken', 'crash'],
            'decision': ['should', 'would', 'consider', 'switch', 'choose', 'migrate'],
            'planning': ['budget', 'cost', 'timeline', 'plan', 'approval', 'finance']
        };

        const scores = {};
        Object.entries(toneMaps).forEach(([tone, words]) => {
            scores[tone] = words.filter(w => text_lower.includes(w)).length;
        });

        const maxScore = Math.max(...Object.values(scores));
        return Object.entries(scores).find(s => s[1] === maxScore)?.[0] || 'general';
    }

    /**
     * Calculate overall compliance score
     */
    calculateOverallMetrics() {
        if (this.interactions.length === 0) {
            return {
                drift: 0,
                alignment: 100,
                coherence: 100,
                stability: 100
            };
        }

        const avgDrift = this.driftHistory.reduce((sum, d) => sum + d.drift, 0) / this.driftHistory.length;
        const avgCoherence = this.driftHistory.reduce((sum, d) => sum + (d.coherence || 1), 0) / this.driftHistory.length;

        // Calculate intent stability (inverse of drift variance)
        let driftVariance = 0;
        const driftMean = avgDrift;
        this.driftHistory.forEach(d => {
            driftVariance += Math.pow(d.drift - driftMean, 2);
        });
        driftVariance = driftVariance / Math.max(this.driftHistory.length, 1);
        const stability = Math.max(0, 100 - Math.sqrt(driftVariance));

        return {
            drift: Math.min(100, avgDrift),
            alignment: Math.max(0, 100 - avgDrift),
            coherence: Math.round(avgCoherence * 100),
            stability: Math.round(stability)
        };
    }

    /**
     * Analyze entire session
     */
    analyzeSession() {
        if (this.interactions.length < 2) {
            alert('⚠️ Need at least 2 interactions for analysis');
            return;
        }

        const metrics = this.calculateOverallMetrics();
        const analysis = `
Session Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Interactions: ${this.interactions.length}
Average Drift: ${metrics.drift.toFixed(1)}%
Intent Alignment: ${metrics.alignment.toFixed(1)}%
Topic Coherence: ${metrics.coherence.toFixed(1)}%
Intent Stability: ${metrics.stability.toFixed(1)}%

Initial Intent: ${this.initialIntent?.tone}
Shift Detected: ${metrics.drift > 30 ? 'Yes ⚠️' : 'No ✓'}
Coherence Status: ${metrics.coherence >= 80 ? 'Excellent' : 'Good'}

Alerts Generated: ${this.alerts.length}
`;
        alert(analysis);
        this.logAlert('Analysis completed', `Generated comprehensive metrics report`, 'policy');
    }

    /**
     * Export session data
     */
    exportSession() {
        if (this.interactions.length === 0) {
            alert('⚠️ No session data to export');
            return;
        }

        const exportData = {
            sessionInfo: {
                startTime: this.sessionStartTime,
                duration: new Date() - this.sessionStartTime,
                interactionCount: this.interactions.length
            },
            metrics: this.calculateOverallMetrics(),
            interactions: this.interactions.map(i => ({
                id: i.id,
                query: i.query,
                keywords: i.keywords,
                similarity: i.similarity?.toFixed(3),
                coherence: i.coherence?.toFixed(3),
                drift: i.drift?.toFixed(2)
            })),
            alerts: this.alerts
        };

        console.log('📊 Session Export:', exportData);
        alert('✓ Session exported! Check console for details.');
    }

    /**
     * Log alert
     */
    logAlert(title, message, type) {
        this.alerts.unshift({
            id: this.alerts.length,
            title,
            message,
            type,
            timestamp: new Date()
        });

        if (this.alerts.length > 50) {
            this.alerts.pop();
        }
    }

    /**
     * Show interaction details in modal
     */
    showInteractionDetails(id) {
        const interaction = this.interactions.find(i => i.id === id);
        if (!interaction) return;

        this.selectedInteraction = interaction;

        const detailsHtml = `
            <p><strong>Query:</strong> "${interaction.query}"</p>
            <p><strong>Keywords:</strong> ${interaction.keywords.join(', ')}</p>
            <p><strong>Similarity:</strong> ${(interaction.similarity * 100).toFixed(1)}%</p>
            <p><strong>Coherence:</strong> ${(interaction.coherence * 100).toFixed(1)}%</p>
            <p><strong>Drift:</strong> ${interaction.drift?.toFixed(1)}%</p>
            <p><strong>Timestamp:</strong> ${interaction.timestamp.toLocaleTimeString()}</p>
        `;

        document.getElementById('interactionTitle').textContent = `Interaction #${interaction.id}`;
        document.getElementById('interactionDetails').innerHTML = detailsHtml;
        document.getElementById('interactionModal').classList.add('show');
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('interactionModal').classList.remove('show');
        this.selectedInteraction = null;
    }

    /**
     * Clear session
     */
    clearSession() {
        if (confirm('Clear all session data?')) {
            this.sessionActive = false;
            this.sessionStartTime = null;
            this.interactions = [];
            this.initialIntent = null;
            this.driftHistory = [];
            this.alerts = [];
            this.updateUI();
            alert('✓ Session cleared');
        }
    }

    /**
     * Render timeline events
     */
    renderTimelineEvents() {
        const container = document.getElementById('timelineEvents');

        if (this.interactions.length === 0) {
            container.innerHTML = '<div class="placeholder">No interactions recorded</div>';
            return;
        }

        container.innerHTML = this.interactions.map(interaction => `
            <div class="timeline-event">
                <div class="event-header">
                    <span class="event-number">Interaction #${interaction.id}</span>
                    <span class="event-drift">${interaction.drift?.toFixed(1)}% drift</span>
                </div>
                <div class="event-text">"${interaction.query}"</div>
                <div class="event-metrics">
                    <span class="event-metric">Similarity: ${(interaction.similarity * 100).toFixed(0)}%</span>
                    <span class="event-metric">Coherence: ${(interaction.coherence * 100).toFixed(0)}%</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render interactions list
     */
    renderInteractions() {
        const container = document.getElementById('interactionsList');

        if (this.interactions.length === 0) {
            container.innerHTML = '<div class="placeholder">Start a session to record interactions</div>';
            return;
        }

        container.innerHTML = this.interactions.map(interaction => `
            <div class="interaction-card" onclick="window.analyzer.showInteractionDetails(${interaction.id})">
                <div class="interaction-header">
                    <span class="inter-num">Interaction #${interaction.id}</span>
                    <span class="inter-drift">${interaction.drift?.toFixed(1)}% drift</span>
                </div>
                <div class="inter-query">"${interaction.query}"</div>
                <div class="inter-metrics">
                    <span>Similarity: ${(interaction.similarity * 100).toFixed(0)}%</span>
                    <span>Coherence: ${(interaction.coherence * 100).toFixed(0)}%</span>
                    <span>Keywords: ${interaction.keywords.join(', ')}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render alerts
     */
    renderAlerts() {
        const container = document.getElementById('alertsList');

        if (this.alerts.length === 0) {
            container.innerHTML = '<div class="placeholder">No alerts</div>';
            return;
        }

        const filtered = this.getFilteredAlerts();

        if (filtered.length === 0) {
            container.innerHTML = '<div class="placeholder">No alerts match filter</div>';
            return;
        }

        container.innerHTML = filtered.map(alert => {
            const severity = alert.type.includes('critical') ? 'critical' : 'warning';
            const icon = severity === 'critical' ? '🚨' : '⚠️';

            return `
                <div class="alert-item ${severity}">
                    <div class="alert-icon">${icon}</div>
                    <div class="alert-content">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-message">${alert.message}</div>
                    </div>
                    <div class="alert-time">${alert.timestamp.toLocaleTimeString()}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get filtered alerts
     */
    getFilteredAlerts() {
        const filter = document.getElementById('alertType').value;
        if (!filter) return this.alerts;
        return this.alerts.filter(a => a.type === filter);
    }

    /**
     * Filter alerts
     */
    filterAlerts() {
        this.renderAlerts();
    }

    /**
     * Update timeline chart
     */
    updateTimeline() {
        const canvas = document.getElementById('driftChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;

        if (this.driftHistory.length < 2) {
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Insufficient data for timeline', width / 2, height / 2);
            return;
        }

        const padding = 50;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw grid and data
        const maxDrift = Math.max(...this.driftHistory.map(d => d.drift), 100);
        const pointSpacing = graphWidth / (this.driftHistory.length - 1 || 1);

        // Draw drift line
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.driftHistory.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - (point.drift / maxDrift) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw coherence line
        ctx.strokeStyle = '#6366f1';
        ctx.beginPath();

        this.driftHistory.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - ((point.coherence || 1) * 100 / maxDrift) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw threshold line
        const thresholdY = height - padding - (this.config.driftThreshold * 100 / maxDrift) * graphHeight;
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, thresholdY);
        ctx.lineTo(width - padding, thresholdY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Drift %', width / 2, height - 10);
    }

    /**
     * Update drift map chart
     */
    updateDriftMap() {
        const canvas = document.getElementById('driftMapCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;

        if (this.interactions.length < 2) {
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Insufficient data for drift map', width / 2, height / 2);
            return;
        }

        const padding = 50;
        const cellSize = (width - padding * 2) / this.interactions.length;
        const rowHeight = (height - padding * 2) / Math.max(this.interactions.length, 5);

        // Draw heatmap
        this.interactions.forEach((inter1, i) => {
            this.interactions.forEach((inter2, j) => {
                const x = padding + (i * cellSize);
                const y = padding + (j * rowHeight);

                const similarity = this.calculateSimilarity(inter1.embedding, inter2.embedding);
                const intensity = Math.round(similarity * 255);
                const color = `rgb(${intensity}, 99, 102)`;

                ctx.fillStyle = color;
                ctx.fillRect(x, y, cellSize, rowHeight);
            });
        });

        // Labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        this.interactions.forEach((_, i) => {
            ctx.fillText(i + 1, padding + (i * cellSize) + cellSize / 2, padding - 10);
        });
    }

    /**
     * Render semantic analysis
     */
    renderSemanticAnalysis() {
        // Initial intent
        const initialDisplay = this.initialIntent
            ? `"${this.initialIntent.query}"\n\nTone: ${this.initialIntent.tone}\nKeywords: ${this.initialIntent.keywords.join(', ')}`
            : 'No initial query';

        document.getElementById('initialIntent').innerHTML = `<div style="color: #cbd5e1; white-space: pre-wrap; line-height: 1.6;">${initialDisplay}</div>`;

        // Current intent
        if (this.interactions.length > 0) {
            const current = this.interactions[this.interactions.length - 1];
            const currentDisplay = `"${current.query}"\n\nKeywords: ${current.keywords.join(', ')}\nSimilarity: ${(current.similarity * 100).toFixed(1)}%`;
            document.getElementById('currentIntent').innerHTML = `<div style="color: #cbd5e1; white-space: pre-wrap; line-height: 1.6;">${currentDisplay}</div>`;
        }

        // Metrics
        if (this.interactions.length > 1) {
            const current = this.interactions[this.interactions.length - 1];
            document.getElementById('similarity').textContent = (current.similarity * 100).toFixed(1) + '%';
            document.getElementById('coherence').textContent = (current.coherence * 100).toFixed(1) + '%';

            // Vocabulary overlap
            const initialKeywords = new Set(this.initialIntent.keywords);
            const currentKeywords = new Set(current.keywords);
            const overlap = [...initialKeywords].filter(k => currentKeywords.has(k)).length;
            const overlapPercent = (overlap / Math.max(initialKeywords.size, 1)) * 100;
            document.getElementById('overlap').textContent = overlapPercent.toFixed(1) + '%';

            // Stability
            const driftVariance = this.driftHistory.length > 1
                ? this.driftHistory.reduce((sum, d) => sum + d.drift, 0) / this.driftHistory.length
                : 0;
            const stability = Math.max(0, 100 - driftVariance);
            document.getElementById('stability').textContent = stability.toFixed(1) + '%';
        } else {
            document.getElementById('similarity').textContent = '--';
            document.getElementById('coherence').textContent = '--';
            document.getElementById('overlap').textContent = '--';
            document.getElementById('stability').textContent = '--';
        }

        // Keywords
        if (this.initialIntent) {
            document.getElementById('initialKeywords').innerHTML = this.initialIntent.keywords
                .map(k => `<span class="keyword-tag">${k}</span>`)
                .join('');
        }

        if (this.interactions.length > 0) {
            const current = this.interactions[this.interactions.length - 1];
            document.getElementById('currentKeywords').innerHTML = current.keywords
                .map(k => `<span class="keyword-tag">${k}</span>`)
                .join('');
        }
    }

    /**
     * Update UI
     */
    updateUI() {
        const metrics = this.calculateOverallMetrics();

        // Update status overview
        document.getElementById('currentDrift').textContent = metrics.drift.toFixed(1) + '%';
        document.getElementById('alignment').textContent = metrics.alignment.toFixed(1) + '%';
        document.getElementById('interactionCount').textContent = this.interactions.length;
        document.getElementById('thresholdStatus').textContent = metrics.drift > 30 ? '⚠️ WARNING' : '✓ OK';

        // Update footer
        const status = this.sessionActive ? 'Recording' : 'Idle';
        document.getElementById('sessionStatus').textContent = status;

        if (this.sessionStartTime) {
            const duration = new Date() - this.sessionStartTime;
            const seconds = Math.floor(duration / 1000);
            const minutes = Math.floor(seconds / 60);
            document.getElementById('sessionDuration').textContent = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        }

        // Render all sections
        this.renderTimelineEvents();
        this.renderInteractions();
        this.renderAlerts();
        this.renderSemanticAnalysis();
        this.updateTimeline();
        this.updateDriftMap();

        // Update drift analysis
        const analysis = this.interactions.length > 0
            ? `Detected ${this.driftHistory.filter(d => d.drift > 30).length} significant drift points`
            : 'No analysis available';
        document.getElementById('driftAnalysis').textContent = analysis;

        // Phase detection
        const phases = this.detectPhases();
        document.getElementById('phaseInfo').textContent = phases.length > 0
            ? `${phases.length} phases detected: ${phases.join(', ')}`
            : 'No distinct phases detected';
    }

    /**
     * Detect conversation phases
     */
    detectPhases() {
        const phases = [];
        let currentTone = null;

        this.interactions.forEach(interaction => {
            const tone = this.analyzeTone(interaction.query);
            if (tone !== currentTone) {
                phases.push(tone.charAt(0).toUpperCase() + tone.slice(1));
                currentTone = tone;
            }
        });

        return phases;
    }

    /**
     * Edit policy placeholder
     */
    editPolicy(id) {
        alert(`✓ Edit Policy: ${id}`);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextualIntentDriftAnalyzer;
}
