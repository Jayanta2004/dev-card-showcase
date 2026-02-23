// decision-confidence-tracker.js

let decisions = JSON.parse(localStorage.getItem('decisionConfidenceData')) || [];
let confidenceChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeTracker();
    updateConfidenceSlider();
});

function initializeTracker() {
    displayDecisions();
    updateStats();
    createChart();
}

function updateConfidenceSlider() {
    const slider = document.getElementById('confidenceLevel');
    const value = document.getElementById('confidenceValue');

    slider.addEventListener('input', function() {
        value.textContent = this.value;
    });
}

function logDecision() {
    const description = document.getElementById('decisionDescription').value.trim();
    const category = document.getElementById('decisionCategory').value;
    const confidence = parseInt(document.getElementById('confidenceLevel').value);
    const outcome = document.getElementById('decisionOutcome').value.trim();

    if (!description) {
        alert('Please enter a decision description.');
        return;
    }

    const decision = {
        id: Date.now(),
        description: description,
        category: category,
        confidence: confidence,
        outcome: outcome,
        date: new Date().toISOString()
    };

    decisions.unshift(decision); // Add to beginning of array
    saveDecisions();
    displayDecisions();
    updateStats();
    updateChart();

    // Clear form
    document.getElementById('decisionDescription').value = '';
    document.getElementById('decisionOutcome').value = '';
    document.getElementById('confidenceLevel').value = '5';
    document.getElementById('confidenceValue').textContent = '5';

    // Show success message
    showNotification('Decision logged successfully!', 'success');
}

function saveDecisions() {
    localStorage.setItem('decisionConfidenceData', JSON.stringify(decisions));
}

function displayDecisions() {
    const historyDiv = document.getElementById('decisionsHistory');
    historyDiv.innerHTML = '';

    if (decisions.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No decisions logged yet. Start by logging your first decision above!</p>';
        return;
    }

    decisions.slice(0, 20).forEach(decision => { // Show last 20 decisions
        const decisionDiv = document.createElement('div');
        decisionDiv.className = 'decision-item';

        const confidenceColor = getConfidenceColor(decision.confidence);

        decisionDiv.innerHTML = `
            <h4>${decision.description}</h4>
            <div class="decision-meta">
                <span class="decision-category">${decision.category}</span>
                <span class="decision-confidence" style="color: ${confidenceColor}">Confidence: ${decision.confidence}/10</span>
            </div>
            ${decision.outcome ? `<p class="decision-outcome"><strong>Expected Outcome:</strong> ${decision.outcome}</p>` : ''}
            <div class="decision-date">${formatDate(decision.date)}</div>
        `;

        historyDiv.appendChild(decisionDiv);
    });
}

function getConfidenceColor(confidence) {
    if (confidence >= 8) return '#4CAF50'; // Green
    if (confidence >= 6) return '#FF9800'; // Orange
    if (confidence >= 4) return '#FF5722'; // Red
    return '#f44336'; // Dark red
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function updateStats() {
    if (decisions.length === 0) {
        document.getElementById('avgConfidence').textContent = '0';
        document.getElementById('totalDecisions').textContent = '0';
        document.getElementById('highConfidenceCount').textContent = '0';
        document.getElementById('lowConfidenceCount').textContent = '0';
        return;
    }

    const totalConfidence = decisions.reduce((sum, d) => sum + d.confidence, 0);
    const avgConfidence = (totalConfidence / decisions.length).toFixed(1);

    const highConfidenceCount = decisions.filter(d => d.confidence > 7).length;
    const lowConfidenceCount = decisions.filter(d => d.confidence < 4).length;

    document.getElementById('avgConfidence').textContent = avgConfidence;
    document.getElementById('totalDecisions').textContent = decisions.length;
    document.getElementById('highConfidenceCount').textContent = highConfidenceCount;
    document.getElementById('lowConfidenceCount').textContent = lowConfidenceCount;
}

function createChart() {
    const ctx = document.getElementById('confidenceChart').getContext('2d');

    // Prepare data for chart (last 30 decisions)
    const recentDecisions = decisions.slice(0, 30).reverse();
    const labels = recentDecisions.map((d, i) => `Decision ${recentDecisions.length - i}`);
    const confidenceData = recentDecisions.map(d => d.confidence);

    confidenceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Confidence Level',
                data: confidenceData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 2,
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
                    max: 10,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateChart() {
    if (!confidenceChart) return;

    const recentDecisions = decisions.slice(0, 30).reverse();
    const labels = recentDecisions.map((d, i) => `Decision ${recentDecisions.length - i}`);
    const confidenceData = recentDecisions.map(d => d.confidence);

    confidenceChart.data.labels = labels;
    confidenceChart.data.datasets[0].data = confidenceData;
    confidenceChart.update();
}

function showNotification(message, type) {
    // Simple notification - you could enhance this with a proper notification system
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);