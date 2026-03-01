// Contextual Authorization Escalation Guard - JavaScript Implementation

document.addEventListener('DOMContentLoaded', function() {
    const behaviorScoreInput = document.getElementById('behaviorScore');
    const behaviorScoreValue = document.getElementById('behaviorScoreValue');
    const submitButton = document.getElementById('submitRequest');
    const evaluationResult = document.getElementById('evaluationResult');

    // Update behavior score display
    behaviorScoreInput.addEventListener('input', function() {
        behaviorScoreValue.textContent = this.value;
    });

    // Handle permission request submission
    submitButton.addEventListener('click', function() {
        const requestData = getRequestData();
        const evaluation = evaluateRequest(requestData);
        displayResult(evaluation);
        evaluationResult.style.display = 'block';
        evaluationResult.scrollIntoView({ behavior: 'smooth' });
    });

    function getRequestData() {
        return {
            user: document.getElementById('user').value,
            currentRole: document.getElementById('currentRole').value,
            requestedPermission: document.getElementById('requestedPermission').value,
            context: document.getElementById('context').value,
            behaviorScore: parseInt(document.getElementById('behaviorScore').value)
        };
    }

    function evaluateRequest(data) {
        // Risk scoring algorithm
        let riskScore = 0;
        let reasoning = [];
        let analytics = [];

        // Base risk based on permission level escalation
        const permissionLevels = {
            'read': 1,
            'write': 2,
            'admin': 3,
            'system': 4
        };

        const roleLevels = {
            'user': 1,
            'moderator': 2,
            'admin': 3
        };

        const currentLevel = roleLevels[data.currentRole];
        const requestedLevel = permissionLevels[data.requestedPermission];
        const escalationLevel = requestedLevel - currentLevel;

        // Calculate risk score
        riskScore += escalationLevel * 20; // Escalation risk

        // Context-based risk adjustment
        switch(data.context) {
            case 'normal':
                riskScore += 10;
                reasoning.push('Normal operations context - standard risk assessment');
                break;
            case 'maintenance':
                riskScore += 5;
                reasoning.push('Maintenance context - slightly reduced risk due to authorized activity');
                break;
            case 'emergency':
                riskScore -= 15;
                reasoning.push('Emergency situation - elevated permissions may be necessary');
                break;
            case 'audit':
                riskScore += 15;
                reasoning.push('Security audit context - increased scrutiny required');
                break;
        }

        // Behavior score adjustment (inverse relationship)
        const behaviorRisk = (100 - data.behaviorScore) / 2;
        riskScore += behaviorRisk;

        // Behavior analytics
        if (data.behaviorScore >= 80) {
            analytics.push('High behavior score indicates trustworthy user patterns');
        } else if (data.behaviorScore >= 60) {
            analytics.push('Moderate behavior score - user has some history of compliant actions');
        } else if (data.behaviorScore >= 40) {
            analytics.push('Low behavior score - user has shown concerning patterns');
        } else {
            analytics.push('Very low behavior score - significant red flags in user behavior');
        }

        // Permission escalation analysis
        if (escalationLevel > 2) {
            riskScore += 30;
            reasoning.push('High privilege escalation requested - requires strong justification');
        } else if (escalationLevel > 0) {
            riskScore += 10;
            reasoning.push('Moderate privilege escalation - standard approval process');
        } else {
            reasoning.push('No privilege escalation - routine permission request');
        }

        // Historical context simulation
        const historicalRequests = simulateHistoricalData(data.user);
        if (historicalRequests.recentDenials > 0) {
            riskScore += historicalRequests.recentDenials * 15;
            analytics.push(`User has ${historicalRequests.recentDenials} recent permission denials`);
        }

        if (historicalRequests.successfulRequests > 5) {
            riskScore -= 10;
            analytics.push('User has established history of successful permission usage');
        }

        // Time-based analysis
        const currentHour = new Date().getHours();
        if (currentHour < 6 || currentHour > 22) {
            riskScore += 20;
            reasoning.push('Request made outside normal business hours - increased scrutiny');
        }

        // Decision threshold
        const approved = riskScore < 60;
        let riskLevel = 'low';
        if (riskScore > 80) riskLevel = 'high';
        else if (riskScore > 60) riskLevel = 'medium';

        return {
            approved: approved,
            riskScore: Math.round(riskScore),
            riskLevel: riskLevel,
            reasoning: reasoning,
            analytics: analytics,
            data: data
        };
    }

    function simulateHistoricalData(userId) {
        // Simulate historical data based on user ID
        const hash = userId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        return {
            recentDenials: Math.abs(hash) % 3,
            successfulRequests: Math.abs(hash) % 10 + 1
        };
    }

    function displayResult(evaluation) {
        const decisionEl = document.getElementById('decision');
        const riskScoreEl = document.getElementById('riskScore');
        const reasoningEl = document.getElementById('reasoning');
        const analyticsEl = document.getElementById('analytics');

        // Decision
        decisionEl.className = 'decision';
        decisionEl.classList.add(evaluation.approved ? 'approved' : 'denied');
        decisionEl.textContent = evaluation.approved ? '✅ APPROVED' : '❌ DENIED';

        // Risk Score
        riskScoreEl.innerHTML = `
            <div>Risk Score: <span class="score ${evaluation.riskLevel}">${evaluation.riskScore}/100</span></div>
            <div>Risk Level: ${evaluation.riskLevel.toUpperCase()}</div>
        `;

        // Reasoning
        reasoningEl.innerHTML = `
            <h4>Decision Reasoning:</h4>
            <ul>
                ${evaluation.reasoning.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
        `;

        // Analytics
        analyticsEl.innerHTML = `
            <h4>Behavior Analytics:</h4>
            <ul>
                ${evaluation.analytics.map(analytic => `<li>${analytic}</li>`).join('')}
            </ul>
            <div style="margin-top: 15px; padding: 10px; background: #e8f4fd; border-radius: 5px;">
                <strong>Request Summary:</strong><br>
                User: ${evaluation.data.user} (${evaluation.data.currentRole})<br>
                Requested: ${evaluation.data.requestedPermission}<br>
                Context: ${evaluation.data.context}<br>
                Behavior Score: ${evaluation.data.behaviorScore}/100
            </div>
        `;
    }
});