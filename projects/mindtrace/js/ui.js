const UI = {
    sessionStartTime: Date.now(),
    activeElement: null,

    init: function() {
        this.startSessionTimer();
        this.attachEventListeners();
    },

    attachEventListeners: function() {
        window.addEventListener('interaction', (e) => this.updateInteractionCount(e.detail));
        window.addEventListener('predictionMade', (e) => this.updatePrediction(e.detail));
        window.addEventListener('predictionMatched', (e) => this.handlePredictionMatch(e.detail));
        window.addEventListener('predictionMissed', (e) => this.handlePredictionMiss(e.detail));
        window.addEventListener('patternsUpdated', () => this.updatePatterns());
    },

    startSessionTimer: function() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            document.getElementById('sessionTime').textContent = Utils.formatTime(elapsed);
        }, 1000);
    },

    updateInteractionCount: function(interaction) {
        const countEl = document.getElementById('interactionCount');
        const currentCount = parseInt(countEl.textContent) || 0;
        countEl.textContent = currentCount + 1;
        countEl.classList.add('updated');
        setTimeout(() => countEl.classList.remove('updated'), 400);

        this.addToTimeline(interaction);
        this.updateMetrics();
    },

    updatePrediction: function(prediction) {
        const targetEl = document.getElementById('predictionTarget');
        const confidenceBar = document.getElementById('confidenceBar');
        const confidenceValue = document.getElementById('confidenceValue');

        if (!prediction) {
            targetEl.innerHTML = '<span class="waiting-text">Observing patterns...</span>';
            targetEl.classList.remove('active');
            confidenceBar.style.width = '0%';
            confidenceValue.textContent = '0%';
            this.clearPredictionHighlight();
            return;
        }

        targetEl.innerHTML = `
            <div class="target-info">
                <div class="target-element">${this.formatElementName(prediction.element)}</div>
                <div class="target-type">${prediction.reasons.join(', ')}</div>
            </div>
        `;
        targetEl.classList.add('active');

        const confidence = Math.round(prediction.confidence);
        confidenceBar.style.width = `${confidence}%`;
        confidenceValue.textContent = `${confidence}%`;

        this.highlightPredictedElement(prediction.element);
    },

    highlightPredictedElement: function(selector) {
        this.clearPredictionHighlight();

        try {
            const element = document.querySelector(selector);
            if (element && element.closest('.interactive-zone')) {
                element.classList.add('predicted-element');
                this.activeElement = element;
            }
        } catch (e) {
            console.error('Failed to highlight element:', e);
        }
    },

    clearPredictionHighlight: function() {
        if (this.activeElement) {
            this.activeElement.classList.remove('predicted-element');
            this.activeElement = null;
        }

        document.querySelectorAll('.predicted-element').forEach(el => {
            el.classList.remove('predicted-element');
        });
    },

    addToTimeline: function(interaction) {
        const container = document.getElementById('timelineContainer');
        const empty = container.querySelector('.timeline-empty');
        if (empty) {
            empty.remove();
        }

        const item = document.createElement('div');
        item.className = 'timeline-item';

        const typeLabel = Utils.getInteractionType({ type: interaction.type });
        const timeLabel = Utils.getRelativeTimestamp(interaction.timestamp, this.sessionStartTime);

        item.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-action">${typeLabel}: ${this.formatElementName(interaction.element || interaction.key)}</div>
                <div class="timeline-details">${interaction.description || ''}</div>
            </div>
            <div class="timeline-time">${timeLabel}</div>
        `;

        container.insertBefore(item, container.firstChild);

        const items = container.querySelectorAll('.timeline-item');
        if (items.length > 30) {
            items[items.length - 1].remove();
        }
    },

    handlePredictionMatch: function(data) {
        const container = document.getElementById('timelineContainer');
        const firstItem = container.querySelector('.timeline-item');

        if (firstItem) {
            firstItem.classList.add('matched');
        }

        this.updateAccuracy();
    },

    handlePredictionMiss: function(data) {
        const container = document.getElementById('timelineContainer');
        const firstItem = container.querySelector('.timeline-item');

        if (firstItem) {
            firstItem.classList.add('missed');
        }

        this.updateAccuracy();
    },

    updateAccuracy: function() {
        const accuracy = Predictor.getAccuracy();
        const accuracyEl = document.getElementById('accuracyRate');

        if (accuracy > 0) {
            accuracyEl.textContent = `${accuracy}%`;
            accuracyEl.classList.add('updated');
            setTimeout(() => accuracyEl.classList.remove('updated'), 400);
        }

        const hitEl = document.getElementById('predictionHit');
        hitEl.textContent = `${Predictor.correctPredictions}/${Predictor.totalPredictions}`;
    },

    updateMetrics: function() {
        const avgClickSpeed = Tracker.getAverageClickSpeed();
        const avgHoverTime = Tracker.getAverageHoverDuration();
        const keyPressRate = Tracker.getKeyPressRate();

        const clickSpeedEl = document.getElementById('avgClickSpeed');
        const hoverTimeEl = document.getElementById('avgHoverTime');
        const keyRateEl = document.getElementById('keyPressRate');

        if (avgClickSpeed > 0) {
            clickSpeedEl.textContent = Utils.formatDuration(avgClickSpeed);
        }

        if (avgHoverTime > 0) {
            hoverTimeEl.textContent = Utils.formatDuration(avgHoverTime);
        }

        if (keyPressRate > 0) {
            keyRateEl.textContent = `${keyPressRate}/min`;
        }
    },

    updatePatterns: function() {
        const patternList = document.getElementById('patternList');
        const topPatterns = Predictor.getTopPatterns(5);

        if (topPatterns.length === 0) {
            patternList.innerHTML = '<div class="empty-state">No patterns detected yet</div>';
            return;
        }

        patternList.innerHTML = '';
        topPatterns.forEach(pattern => {
            const item = document.createElement('div');
            item.className = 'pattern-item';

            const sequence = pattern.sequence
                .split('→')
                .map(s => this.formatElementName(s))
                .join(' → ');

            item.innerHTML = `
                <div class="pattern-sequence">${sequence}</div>
                <div class="pattern-count">×${pattern.count}</div>
            `;

            patternList.appendChild(item);
        });
    },

    formatElementName: function(selector) {
        if (!selector) return 'Unknown';

        if (selector.includes('[data-action=')) {
            const match = selector.match(/data-action="([^"]+)"/);
            return match ? match[1] : selector;
        }

        if (selector.includes('[data-card=')) {
            const match = selector.match(/data-card="([^"]+)"/);
            return match ? `Card ${match[1]}` : selector;
        }

        if (selector.startsWith('#')) {
            return selector.substring(1);
        }

        if (selector.startsWith('.')) {
            return selector.substring(1).replace(/-/g, ' ');
        }

        return selector;
    }
};
