document.addEventListener('DOMContentLoaded', function() {
    const conversationInput = document.getElementById('conversation-input');
    const routingAlgorithm = document.getElementById('routing-algorithm');
    const agentsInput = document.getElementById('agents');
    const routeBtn = document.getElementById('route-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('routing-canvas');
    const ctx = canvas.getContext('2d');
    const animateBtn = document.getElementById('animate-routing');
    const resetBtn = document.getElementById('reset-viz');
    const accuracySpan = document.getElementById('accuracy');
    const responseTimeSpan = document.getElementById('response-time');
    const utilizationSpan = document.getElementById('utilization');

    let routingResults = null;
    let animationFrame = null;
    let isAnimating = false;

    routeBtn.addEventListener('click', runPredictiveRouting);
    animateBtn.addEventListener('click', toggleAnimation);
    resetBtn.addEventListener('click', resetVisualization);

    // Initialize with default conversation data
    initializeDefaultData();

    function initializeDefaultData() {
        const defaultData = {
            conversations: [
                { id: 1, text: "I need help with my order", sentiment: "neutral", topic: "orders", urgency: 3 },
                { id: 2, text: "Billing issue urgent", sentiment: "negative", topic: "billing", urgency: 8 },
                { id: 3, text: "Product recommendation", sentiment: "positive", topic: "products", urgency: 2 },
                { id: 4, text: "Technical support needed", sentiment: "frustrated", topic: "technical", urgency: 7 },
                { id: 5, text: "General inquiry", sentiment: "neutral", topic: "general", urgency: 1 },
                { id: 6, text: "Complaint about service", sentiment: "angry", topic: "complaints", urgency: 9 }
            ]
        };
        conversationInput.value = JSON.stringify(defaultData, null, 2);
    }

    function runPredictiveRouting() {
        try {
            const input = JSON.parse(conversationInput.value);
            const algorithm = routingAlgorithm.value;
            const numAgents = parseInt(agentsInput.value);

            resultsDiv.innerHTML = '<div class="loading">Running predictive routing analysis...</div>';

            // Simulate routing process
            setTimeout(() => {
                const results = simulatePredictiveRouting(input.conversations, algorithm, numAgents);
                displayResults(results);
                visualizeRouting(results);
                updateMetrics(results);
            }, 2000);

        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    function simulatePredictiveRouting(conversations, algorithm, numAgents) {
        const agents = Array.from({ length: numAgents }, (_, i) => ({
            id: i + 1,
            workload: 0,
            expertise: Math.random(),
            availability: Math.random() > 0.2 // 80% available
        }));

        const routedConversations = conversations.map(conv => {
            const route = predictRoute(conv, agents, algorithm);
            return {
                ...conv,
                assignedAgent: route.agentId,
                confidence: route.confidence,
                estimatedResolutionTime: route.estimatedTime
            };
        });

        const metrics = calculateMetrics(routedConversations, agents);

        return {
            algorithm: algorithm,
            conversations: routedConversations,
            agents: agents,
            metrics: metrics
        };
    }

    function predictRoute(conversation, agents, algorithm) {
        let bestAgent = null;
        let bestScore = -1;
        let confidence = 0;

        agents.forEach(agent => {
            if (!agent.availability) return;

            let score = 0;

            switch (algorithm) {
                case 'sentiment-based':
                    score = calculateSentimentScore(conversation.sentiment, agent);
                    break;
                case 'topic-modeling':
                    score = calculateTopicScore(conversation.topic, agent);
                    break;
                case 'intent-classification':
                    score = calculateIntentScore(conversation, agent);
                    break;
                case 'urgency-scoring':
                    score = calculateUrgencyScore(conversation.urgency, agent);
                    break;
                case 'multi-modal':
                    score = calculateMultiModalScore(conversation, agent);
                    break;
            }

            // Factor in workload (prefer less busy agents)
            score *= (1 - agent.workload / 10);

            if (score > bestScore) {
                bestScore = score;
                bestAgent = agent;
                confidence = Math.min(score, 1);
            }
        });

        const estimatedTime = 5 + Math.random() * 15; // 5-20 minutes

        return {
            agentId: bestAgent ? bestAgent.id : null,
            confidence: confidence,
            estimatedTime: estimatedTime
        };
    }

    function calculateSentimentScore(sentiment, agent) {
        const sentimentMap = { positive: 0.8, neutral: 0.5, negative: 0.2, frustrated: 0.1, angry: 0.05 };
        const sentimentScore = sentimentMap[sentiment] || 0.5;
        return sentimentScore * agent.expertise;
    }

    function calculateTopicScore(topic, agent) {
        // Simple topic matching (in real implementation, use ML models)
        const topicExpertise = Math.random(); // Placeholder
        return topicExpertise * agent.expertise;
    }

    function calculateIntentScore(conversation, agent) {
        // Analyze text for intent (placeholder logic)
        const intentScore = conversation.text.length / 100; // Longer texts might need more expertise
        return Math.min(intentScore, 1) * agent.expertise;
    }

    function calculateUrgencyScore(urgency, agent) {
        // Higher urgency prefers more experienced agents
        return (urgency / 10) * agent.expertise;
    }

    function calculateMultiModalScore(conversation, agent) {
        const sentimentScore = calculateSentimentScore(conversation.sentiment, agent);
        const topicScore = calculateTopicScore(conversation.topic, agent);
        const urgencyScore = calculateUrgencyScore(conversation.urgency, agent);

        return (sentimentScore + topicScore + urgencyScore) / 3;
    }

    function calculateMetrics(conversations, agents) {
        const routedCount = conversations.filter(c => c.assignedAgent).length;
        const accuracy = routedCount / conversations.length;

        const avgResponseTime = conversations.reduce((sum, c) => sum + (c.estimatedResolutionTime || 0), 0) / conversations.length;

        const totalWorkload = agents.reduce((sum, agent) => sum + agent.workload, 0);
        const utilization = totalWorkload / (agents.length * 10); // Assuming max workload of 10

        return {
            accuracy: accuracy,
            avgResponseTime: avgResponseTime,
            utilization: utilization
        };
    }

    function displayResults(results) {
        resultsDiv.innerHTML = results.conversations.map(conv => `
            <div class="conversation-route">
                <strong>Conversation ${conv.id}:</strong> "${conv.text}"
                <div class="route-details">
                    Sentiment: ${conv.sentiment} | Topic: ${conv.topic} | Urgency: ${conv.urgency}/10<br>
                    Assigned Agent: ${conv.assignedAgent || 'None'} | Confidence: ${(conv.confidence * 100).toFixed(1)}% | Est. Time: ${conv.estimatedResolutionTime.toFixed(1)} min
                </div>
            </div>
        `).join('');
    }

    function visualizeRouting(results) {
        routingResults = results;
        drawRoutingNetwork(results);
    }

    function drawRoutingNetwork(results) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 60;

        // Draw agents
        results.agents.forEach((agent, index) => {
            const angle = (index / results.agents.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Agent node
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, 2 * Math.PI);
            ctx.fillStyle = agent.availability ? '#27ae60' : '#e74c3c';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Agent label
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Agent ${agent.id}`, x, y + 5);
        });

        // Draw conversations and routing lines
        results.conversations.forEach((conv, index) => {
            const convAngle = (index / results.conversations.length) * 2 * Math.PI - Math.PI / 2;
            const convX = centerX + Math.cos(convAngle) * (radius * 0.6);
            const convY = centerY + Math.sin(convAngle) * (radius * 0.6);

            // Conversation node
            ctx.beginPath();
            ctx.arc(convX, convY, 15, 0, 2 * Math.PI);
            ctx.fillStyle = '#3498db';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Conversation label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(`${conv.id}`, convX, convY + 3);

            // Draw routing line if assigned
            if (conv.assignedAgent) {
                const agentIndex = results.agents.findIndex(a => a.id === conv.assignedAgent);
                if (agentIndex >= 0) {
                    const agentAngle = (agentIndex / results.agents.length) * 2 * Math.PI - Math.PI / 2;
                    const agentX = centerX + Math.cos(agentAngle) * radius;
                    const agentY = centerY + Math.sin(agentAngle) * radius;

                    ctx.beginPath();
                    ctx.moveTo(convX, convY);
                    ctx.lineTo(agentX, agentY);
                    ctx.strokeStyle = `rgba(46, 204, 113, ${conv.confidence})`;
                    ctx.lineWidth = Math.max(conv.confidence * 5, 1);
                    ctx.stroke();
                }
            }
        });
    }

    function toggleAnimation() {
        if (isAnimating) {
            cancelAnimationFrame(animationFrame);
            isAnimating = false;
            animateBtn.textContent = 'Animate Routing';
        } else {
            isAnimating = true;
            animateBtn.textContent = 'Stop Animation';
            animateRoutingProcess();
        }
    }

    function animateRoutingProcess() {
        if (!isAnimating || !routingResults) return;

        // Simple animation: gradually reveal routing lines
        let progress = 0;
        const animate = () => {
            progress += 0.02;
            if (progress >= 1) {
                progress = 1;
                isAnimating = false;
                animateBtn.textContent = 'Animate Routing';
            }

            drawAnimatedRouting(routingResults, progress);
            if (isAnimating) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    function drawAnimatedRouting(results, progress) {
        drawRoutingNetwork(results);

        // Overlay animated elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(10, 10, 200, 30);
        ctx.fillStyle = '#2c3e50';
        ctx.font = '16px Arial';
        ctx.fillText(`Routing Progress: ${(progress * 100).toFixed(0)}%`, 20, 30);
    }

    function resetVisualization() {
        cancelAnimationFrame(animationFrame);
        isAnimating = false;
        animateBtn.textContent = 'Animate Routing';
        if (routingResults) {
            drawRoutingNetwork(routingResults);
        }
    }

    function updateMetrics(results) {
        accuracySpan.textContent = (results.metrics.accuracy * 100).toFixed(1) + '%';
        responseTimeSpan.textContent = results.metrics.avgResponseTime.toFixed(1) + ' min';
        utilizationSpan.textContent = (results.metrics.utilization * 100).toFixed(1) + '%';
    }
});