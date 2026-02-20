const Predictor = {
    patterns: {},
    currentPrediction: null,
    predictionHistory: [],
    correctPredictions: 0,
    totalPredictions: 0,

    init: function() {
        this.patterns = Storage.loadPatterns();
        this.startPredictionLoop();
        window.addEventListener('interaction', (e) => this.handleInteraction(e.detail));
    },

    handleInteraction: function(interaction) {
        this.checkPredictionAccuracy(interaction);
        this.updatePatterns(interaction);
        this.makePrediction();
    },

    updatePatterns: function(interaction) {
        const recentSequence = this.getRecentSequence(3);
        if (recentSequence.length >= 2) {
            const patternKey = recentSequence.join('→');
            if (!this.patterns[patternKey]) {
                this.patterns[patternKey] = {
                    count: 0,
                    nextActions: {},
                    lastSeen: Date.now()
                };
            }

            this.patterns[patternKey].count++;
            this.patterns[patternKey].lastSeen = Date.now();

            if (interaction.element) {
                if (!this.patterns[patternKey].nextActions[interaction.element]) {
                    this.patterns[patternKey].nextActions[interaction.element] = 0;
                }
                this.patterns[patternKey].nextActions[interaction.element]++;
            }
        }

        const elementKey = interaction.element;
        if (elementKey && !this.patterns[elementKey]) {
            this.patterns[elementKey] = {
                count: 0,
                type: interaction.type,
                lastSeen: Date.now()
            };
        }
        if (elementKey) {
            this.patterns[elementKey].count++;
            this.patterns[elementKey].lastSeen = Date.now();
        }

        Storage.savePatterns(this.patterns);
        window.dispatchEvent(new CustomEvent('patternsUpdated', { detail: this.patterns }));
    },

    getRecentSequence: function(length) {
        const recent = Tracker.getRecentInteractions(length);
        return recent.map(i => i.element).filter(e => e);
    },

    makePrediction: function() {
        if (Tracker.interactions.length < 2) {
            this.currentPrediction = null;
            return;
        }

        const predictions = [];

        const sequencePredictions = this.predictFromSequence();
        if (sequencePredictions.length > 0) {
            predictions.push(...sequencePredictions);
        }

        const frequencyPredictions = this.predictFromFrequency();
        if (frequencyPredictions.length > 0) {
            predictions.push(...frequencyPredictions);
        }

        const timingPredictions = this.predictFromTiming();
        if (timingPredictions.length > 0) {
            predictions.push(...timingPredictions);
        }

        const hoverPredictions = this.predictFromHover();
        if (hoverPredictions.length > 0) {
            predictions.push(...hoverPredictions);
        }

        if (predictions.length === 0) {
            this.currentPrediction = null;
            return;
        }

        const aggregated = this.aggregatePredictions(predictions);
        const best = aggregated[0];

        if (best && best.confidence > 30) {
            this.currentPrediction = best;
            this.totalPredictions++;

            window.dispatchEvent(new CustomEvent('predictionMade', { 
                detail: this.currentPrediction 
            }));
        } else {
            this.currentPrediction = null;
        }
    },

    predictFromSequence: function() {
        const sequence = this.getRecentSequence(3);
        if (sequence.length < 2) return [];

        const predictions = [];
        for (let i = 2; i <= sequence.length; i++) {
            const subSequence = sequence.slice(-i);
            const patternKey = subSequence.join('→');

            if (this.patterns[patternKey] && this.patterns[patternKey].nextActions) {
                const nextActions = this.patterns[patternKey].nextActions;
                const total = Object.values(nextActions).reduce((sum, count) => sum + count, 0);

                for (const [element, count] of Object.entries(nextActions)) {
                    const probability = count / total;
                    const recency = this.calculateRecencyScore(this.patterns[patternKey].lastSeen);
                    const confidence = (probability * 0.7 + recency * 0.3) * 100;

                    predictions.push({
                        element: element,
                        confidence: confidence,
                        reason: 'sequence',
                        weight: i * 2
                    });
                }
            }
        }

        return predictions;
    },

    predictFromFrequency: function() {
        const elementCounts = {};
        const recentInteractions = Tracker.getRecentInteractions(20);

        recentInteractions.forEach(interaction => {
            if (interaction.element) {
                elementCounts[interaction.element] = (elementCounts[interaction.element] || 0) + 1;
            }
        });

        const predictions = [];
        const total = recentInteractions.length;

        for (const [element, count] of Object.entries(elementCounts)) {
            const frequency = count / total;
            const recency = this.patterns[element] ? 
                this.calculateRecencyScore(this.patterns[element].lastSeen) : 0;
            const confidence = (frequency * 0.6 + recency * 0.4) * 100;

            predictions.push({
                element: element,
                confidence: confidence,
                reason: 'frequency',
                weight: 1
            });
        }

        return predictions;
    },

    predictFromTiming: function() {
        const recentClicks = Tracker.interactions
            .filter(i => i.type === 'click')
            .slice(-10);

        if (recentClicks.length < 3) return [];

        const intervals = [];
        for (let i = 1; i < recentClicks.length; i++) {
            intervals.push(recentClicks[i].timestamp - recentClicks[i - 1].timestamp);
        }

        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const timeSinceLast = Date.now() - Tracker.lastInteractionTime;

        if (timeSinceLast > avgInterval * 0.8 && timeSinceLast < avgInterval * 1.5) {
            const lastElement = recentClicks[recentClicks.length - 1].element;
            const elementCounts = {};

            recentClicks.forEach(click => {
                elementCounts[click.element] = (elementCounts[click.element] || 0) + 1;
            });

            const predictions = [];
            for (const [element, count] of Object.entries(elementCounts)) {
                if (element !== lastElement) {
                    const confidence = (count / recentClicks.length) * 100;
                    predictions.push({
                        element: element,
                        confidence: confidence,
                        reason: 'timing',
                        weight: 1.5
                    });
                }
            }

            return predictions;
        }

        return [];
    },

    predictFromHover: function() {
        if (Tracker.hoverPath.length < 2) return [];

        const recentHovers = Tracker.hoverPath.slice(-5);
        const predictions = [];

        recentHovers.forEach(hover => {
            const hoverElement = hover.element;
            const clicksAfterHover = Tracker.interactions.filter(i => 
                i.type === 'click' && 
                i.timestamp > hover.timestamp &&
                i.timestamp < hover.timestamp + 3000
            );

            clicksAfterHover.forEach(click => {
                predictions.push({
                    element: click.element,
                    confidence: 40,
                    reason: 'hover',
                    weight: 1.2
                });
            });
        });

        return predictions;
    },

    aggregatePredictions: function(predictions) {
        const aggregated = {};

        predictions.forEach(pred => {
            if (!aggregated[pred.element]) {
                aggregated[pred.element] = {
                    element: pred.element,
                    totalScore: 0,
                    totalWeight: 0,
                    reasons: new Set()
                };
            }

            aggregated[pred.element].totalScore += pred.confidence * pred.weight;
            aggregated[pred.element].totalWeight += pred.weight;
            aggregated[pred.element].reasons.add(pred.reason);
        });

        const results = Object.values(aggregated).map(item => ({
            element: item.element,
            confidence: Math.min(95, item.totalScore / item.totalWeight),
            reasons: Array.from(item.reasons)
        }));

        results.sort((a, b) => b.confidence - a.confidence);
        return results;
    },

    calculateRecencyScore: function(timestamp) {
        const age = Date.now() - timestamp;
        const maxAge = 300000;
        return Math.max(0, 1 - (age / maxAge));
    },

    checkPredictionAccuracy: function(interaction) {
        if (!this.currentPrediction) return;

        if (this.currentPrediction.element === interaction.element) {
            this.correctPredictions++;
            window.dispatchEvent(new CustomEvent('predictionMatched', {
                detail: {
                    prediction: this.currentPrediction,
                    actual: interaction
                }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('predictionMissed', {
                detail: {
                    prediction: this.currentPrediction,
                    actual: interaction
                }
            }));
        }

        this.predictionHistory.push({
            prediction: this.currentPrediction,
            actual: interaction,
            matched: this.currentPrediction.element === interaction.element,
            timestamp: Date.now()
        });

        if (this.predictionHistory.length > 50) {
            this.predictionHistory.shift();
        }
    },

    getAccuracy: function() {
        if (this.totalPredictions === 0) return 0;
        return Math.round((this.correctPredictions / this.totalPredictions) * 100);
    },

    getTopPatterns: function(limit = 5) {
        const patternArray = Object.entries(this.patterns)
            .filter(([key]) => key.includes('→'))
            .map(([key, value]) => ({
                sequence: key,
                count: value.count,
                lastSeen: value.lastSeen
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return patternArray;
    },

    startPredictionLoop: function() {
        setInterval(() => {
            if (Tracker.interactions.length >= 2 && !this.currentPrediction) {
                this.makePrediction();
            }
        }, 2000);
    }
};
