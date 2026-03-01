document.addEventListener('DOMContentLoaded', function() {
    const knowledgeInput = document.getElementById('knowledge-input');
    const refinementMethod = document.getElementById('refinement-method');
    const iterationsInput = document.getElementById('iterations');
    const refineBtn = document.getElementById('refine-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('knowledge-canvas');
    const ctx = canvas.getContext('2d');
    const playPauseBtn = document.getElementById('play-pause');
    const resetBtn = document.getElementById('reset');
    const timeline = document.getElementById('timeline');
    const qualityScore = document.getElementById('quality-score');
    const efficiencyScore = document.getElementById('efficiency-score');
    const adaptationRate = document.getElementById('adaptation-rate');

    let knowledgeGraph = null;
    let refinementHistory = [];
    let animationFrame = null;
    let isPlaying = false;
    let currentStep = 0;

    refineBtn.addEventListener('click', runRefinement);
    playPauseBtn.addEventListener('click', togglePlayback);
    resetBtn.addEventListener('click', resetVisualization);
    timeline.addEventListener('input', updateTimeline);

    // Initialize with default knowledge
    initializeDefaultKnowledge();

    function initializeDefaultKnowledge() {
        const defaultKnowledge = {
            concepts: [
                "Machine Learning", "Neural Networks", "Deep Learning",
                "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning",
                "Computer Vision", "Natural Language Processing", "Data Mining"
            ],
            relations: [
                { from: "Machine Learning", to: "Neural Networks", type: "contains", weight: 0.8 },
                { from: "Machine Learning", to: "Deep Learning", type: "contains", weight: 0.9 },
                { from: "Deep Learning", to: "Neural Networks", type: "uses", weight: 0.95 },
                { from: "Machine Learning", to: "Supervised Learning", type: "includes", weight: 0.85 },
                { from: "Machine Learning", to: "Unsupervised Learning", type: "includes", weight: 0.82 },
                { from: "Machine Learning", to: "Reinforcement Learning", type: "includes", weight: 0.78 },
                { from: "Deep Learning", to: "Computer Vision", type: "enables", weight: 0.88 },
                { from: "Deep Learning", to: "Natural Language Processing", type: "enables", weight: 0.92 },
                { from: "Machine Learning", to: "Data Mining", type: "related", weight: 0.75 }
            ]
        };
        knowledgeInput.value = JSON.stringify(defaultKnowledge, null, 2);
        loadKnowledgeGraph(defaultKnowledge);
    }

    function runRefinement() {
        try {
            const input = JSON.parse(knowledgeInput.value);
            const method = refinementMethod.value;
            const iterations = parseInt(iterationsInput.value);

            resultsDiv.innerHTML = '<div class="loading">Running knowledge refinement...</div>';

            // Simulate refinement process
            setTimeout(() => {
                const results = simulateRefinement(input, method, iterations);
                displayResults(results);
                startVisualization(results.history);
            }, 2000);

        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    function simulateRefinement(input, method, iterations) {
        let knowledge = JSON.parse(JSON.stringify(input)); // Deep copy
        const history = [JSON.parse(JSON.stringify(knowledge))];

        for (let i = 0; i < iterations; i++) {
            knowledge = applyRefinementStep(knowledge, method, i / iterations);
            history.push(JSON.parse(JSON.stringify(knowledge)));
        }

        const finalMetrics = calculateMetrics(knowledge);

        return {
            method: method,
            iterations: iterations,
            initialConcepts: input.concepts.length,
            finalConcepts: knowledge.concepts.length,
            initialRelations: input.relations.length,
            finalRelations: knowledge.relations.length,
            metrics: finalMetrics,
            history: history
        };
    }

    function applyRefinementStep(knowledge, method, progress) {
        const refined = JSON.parse(JSON.stringify(knowledge));

        switch (method) {
            case 'confidence-weighting':
                refined.relations = refined.relations.map(rel => ({
                    ...rel,
                    weight: Math.min(rel.weight + (Math.random() - 0.5) * 0.1, 1.0)
                }));
                break;

            case 'temporal-decay':
                refined.relations = refined.relations.map(rel => ({
                    ...rel,
                    weight: rel.weight * (0.99 + Math.random() * 0.02)
                }));
                break;

            case 'usage-frequency':
                refined.relations = refined.relations.map(rel => ({
                    ...rel,
                    weight: rel.weight * (0.95 + Math.random() * 0.1)
                }));
                // Add some new relations based on usage patterns
                if (Math.random() < 0.1) {
                    const concept1 = refined.concepts[Math.floor(Math.random() * refined.concepts.length)];
                    const concept2 = refined.concepts[Math.floor(Math.random() * refined.concepts.length)];
                    if (concept1 !== concept2) {
                        refined.relations.push({
                            from: concept1,
                            to: concept2,
                            type: 'discovered',
                            weight: Math.random() * 0.3 + 0.1
                        });
                    }
                }
                break;

            case 'semantic-clustering':
                // Group similar concepts
                const clusters = clusterConcepts(refined.concepts);
                refined.relations = refined.relations.filter(rel =>
                    clusters.some(cluster => cluster.includes(rel.from) && cluster.includes(rel.to))
                );
                break;

            case 'reinforcement-learning':
                refined.relations = refined.relations.map(rel => ({
                    ...rel,
                    weight: rel.weight + (Math.random() - 0.5) * 0.05
                }));
                // Remove weak relations
                refined.relations = refined.relations.filter(rel => rel.weight > 0.1);
                break;
        }

        return refined;
    }

    function clusterConcepts(concepts) {
        // Simple clustering based on name similarity (placeholder)
        const clusters = [];
        const used = new Set();

        concepts.forEach(concept => {
            if (!used.has(concept)) {
                const cluster = [concept];
                used.add(concept);

                concepts.forEach(other => {
                    if (!used.has(other) && concept !== other) {
                        // Simple similarity check
                        const similarity = calculateSimilarity(concept, other);
                        if (similarity > 0.3) {
                            cluster.push(other);
                            used.add(other);
                        }
                    }
                });

                clusters.push(cluster);
            }
        });

        return clusters;
    }

    function calculateSimilarity(str1, str2) {
        // Simple Jaccard similarity for demonstration
        const set1 = new Set(str1.toLowerCase().split(' '));
        const set2 = new Set(str2.toLowerCase().split(' '));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    function calculateMetrics(knowledge) {
        const avgWeight = knowledge.relations.reduce((sum, rel) => sum + rel.weight, 0) / knowledge.relations.length;
        const connectivity = knowledge.relations.length / (knowledge.concepts.length * (knowledge.concepts.length - 1) / 2);
        const strength = avgWeight * connectivity;

        return {
            quality: Math.min(strength * 100, 100),
            efficiency: Math.min((knowledge.relations.length / knowledge.concepts.length) * 20, 100),
            adaptation: Math.min((1 - Math.abs(0.5 - avgWeight)) * 200, 100)
        };
    }

    function displayResults(results) {
        resultsDiv.innerHTML = `
            <div class="metric">
                <span class="metric-label">Refinement Method:</span>
                <span class="metric-value">${results.method.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Iterations:</span>
                <span class="metric-value">${results.iterations}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Concepts:</span>
                <span class="metric-value">${results.initialConcepts} → ${results.finalConcepts}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Relations:</span>
                <span class="metric-value">${results.initialRelations} → ${results.finalRelations}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Knowledge Quality:</span>
                <span class="metric-value">${results.metrics.quality.toFixed(1)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Refinement Efficiency:</span>
                <span class="metric-value">${results.metrics.efficiency.toFixed(1)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Adaptation Rate:</span>
                <span class="metric-value">${results.metrics.adaptation.toFixed(1)}%</span>
            </div>
        `;

        // Update metrics display
        qualityScore.textContent = results.metrics.quality.toFixed(1) + '%';
        efficiencyScore.textContent = results.metrics.efficiency.toFixed(1) + '%';
        adaptationRate.textContent = results.metrics.adaptation.toFixed(1) + '%';
    }

    function loadKnowledgeGraph(knowledge) {
        knowledgeGraph = knowledge;
        drawKnowledgeGraph(knowledge);
    }

    function drawKnowledgeGraph(knowledge, step = 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!knowledge || !knowledge.concepts) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 50;

        // Draw relations
        knowledge.relations.forEach(rel => {
            const fromIndex = knowledge.concepts.indexOf(rel.from);
            const toIndex = knowledge.concepts.indexOf(rel.to);

            if (fromIndex >= 0 && toIndex >= 0) {
                const angle1 = (fromIndex / knowledge.concepts.length) * 2 * Math.PI - Math.PI / 2;
                const angle2 = (toIndex / knowledge.concepts.length) * 2 * Math.PI - Math.PI / 2;

                const x1 = centerX + Math.cos(angle1) * radius;
                const y1 = centerY + Math.sin(angle1) * radius;
                const x2 = centerX + Math.cos(angle2) * radius;
                const y2 = centerY + Math.sin(angle2) * radius;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = `rgba(52, 152, 219, ${rel.weight})`;
                ctx.lineWidth = Math.max(rel.weight * 3, 1);
                ctx.stroke();
            }
        });

        // Draw concepts
        knowledge.concepts.forEach((concept, index) => {
            const angle = (index / knowledge.concepts.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = '#3498db';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw concept label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(concept.split(' ')[0], x, y + 4);
        });
    }

    function startVisualization(history) {
        refinementHistory = history;
        timeline.max = history.length - 1;
        timeline.value = 0;
        currentStep = 0;
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        drawKnowledgeGraph(history[0]);
    }

    function togglePlayback() {
        isPlaying = !isPlaying;
        playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';

        if (isPlaying) {
            animateVisualization();
        } else {
            cancelAnimationFrame(animationFrame);
        }
    }

    function animateVisualization() {
        if (!isPlaying || currentStep >= refinementHistory.length - 1) {
            isPlaying = false;
            playPauseBtn.textContent = 'Play';
            return;
        }

        currentStep++;
        timeline.value = currentStep;
        drawKnowledgeGraph(refinementHistory[currentStep]);

        animationFrame = setTimeout(animateVisualization, 500);
    }

    function resetVisualization() {
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        currentStep = 0;
        timeline.value = 0;
        if (refinementHistory.length > 0) {
            drawKnowledgeGraph(refinementHistory[0]);
        }
        cancelAnimationFrame(animationFrame);
    }

    function updateTimeline() {
        currentStep = parseInt(timeline.value);
        if (refinementHistory.length > currentStep) {
            drawKnowledgeGraph(refinementHistory[currentStep]);
        }
    }

    // Update visualization when input changes
    knowledgeInput.addEventListener('input', function() {
        try {
            const knowledge = JSON.parse(this.value);
            loadKnowledgeGraph(knowledge);
        } catch (e) {
            // Invalid JSON, skip update
        }
    });
});