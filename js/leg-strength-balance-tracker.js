// Leg Strength Balance Tracker JavaScript

let exerciseEntries = JSON.parse(localStorage.getItem('exerciseEntries')) || [];

// Exercise recommendations
const RECOMMENDATIONS = [
    {
        title: 'Focus on Weak Side',
        text: 'When imbalances are detected, perform extra sets with your weaker leg first.'
    },
    {
        title: 'Unilateral Exercises',
        text: 'Incorporate single-leg exercises like lunges and step-ups to address imbalances.'
    },
    {
        title: 'Progressive Overload',
        text: 'Gradually increase weight while maintaining balance between both legs.'
    },
    {
        title: 'Recovery Time',
        text: 'Allow adequate recovery between leg days, especially when correcting imbalances.'
    },
    {
        title: 'Form First',
        text: 'Always prioritize proper form over weight to prevent injury.'
    },
    {
        title: 'Regular Assessment',
        text: 'Test your strength balance every 4-6 weeks to track progress.'
    }
];

// Safety guidelines
const SAFETY_GUIDELINES = [
    {
        title: 'Warm Up Properly',
        text: 'Always warm up before strength training to prevent injury.'
    },
    {
        title: 'Use Proper Form',
        text: 'Maintain correct technique throughout exercises to avoid strain.'
    },
    {
        title: 'Progressive Loading',
        text: 'Increase weight gradually to allow your muscles and joints to adapt.'
    },
    {
        title: 'Listen to Your Body',
        text: 'Stop immediately if you feel pain (beyond normal muscle fatigue).'
    },
    {
        title: 'Rest Between Sets',
        text: 'Allow adequate recovery time between sets and training sessions.'
    },
    {
        title: 'Medical Clearance',
        text: 'Consult a physician before starting a strength training program, especially with imbalances.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderRecommendations();
    renderGuidelines();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('exerciseDate').value = today;

    // Event listeners
    document.getElementById('exerciseForm').addEventListener('submit', logExercise);
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Re-initialize Lucide icons for navbar
            lucide.createIcons();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function logExercise(e) {
    e.preventDefault();

    const leftWeight = parseFloat(document.getElementById('leftWeight').value);
    const rightWeight = parseFloat(document.getElementById('rightWeight').value);
    const imbalance = Math.abs(leftWeight - rightWeight) / Math.max(leftWeight, rightWeight) * 100;

    const entry = {
        id: Date.now(),
        date: document.getElementById('exerciseDate').value,
        exerciseType: document.getElementById('exerciseType').value,
        leftWeight: leftWeight,
        rightWeight: rightWeight,
        reps: parseInt(document.getElementById('reps').value),
        sets: parseInt(document.getElementById('sets').value),
        imbalance: imbalance,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    exerciseEntries.push(entry);
    localStorage.setItem('exerciseEntries', JSON.stringify(exerciseEntries));

    // Reset form
    document.getElementById('exerciseForm').reset();
    document.getElementById('exerciseDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();

    // Show success message
    alert('Exercise logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateAlerts();
    updateHistory();
    updateChart();
    updateProgress();
}

function updateMetrics() {
    const totalExercises = exerciseEntries.length;
    document.getElementById('totalExercises').textContent = totalExercises;

    if (totalExercises > 0) {
        const recentEntries = exerciseEntries.slice(-10); // Last 10 entries
        const avgLeft = recentEntries.reduce((sum, e) => sum + e.leftWeight, 0) / recentEntries.length;
        const avgRight = recentEntries.reduce((sum, e) => sum + e.rightWeight, 0) / recentEntries.length;
        const avgImbalance = recentEntries.reduce((sum, e) => sum + e.imbalance, 0) / recentEntries.length;

        document.getElementById('avgLeftStrength').textContent = `${avgLeft.toFixed(1)} lbs`;
        document.getElementById('avgRightStrength').textContent = `${avgRight.toFixed(1)} lbs`;
        document.getElementById('currentImbalance').textContent = `${avgImbalance.toFixed(1)}%`;
    }
}

function updateAlerts() {
    const alertsContainer = document.getElementById('balanceAlerts');
    alertsContainer.innerHTML = '';

    if (exerciseEntries.length === 0) return;

    const recentEntries = exerciseEntries.slice(-5); // Last 5 entries
    const avgImbalance = recentEntries.reduce((sum, e) => sum + e.imbalance, 0) / recentEntries.length;

    if (avgImbalance > 15) {
        const alert = document.createElement('div');
        alert.className = 'alert-item warning';
        alert.innerHTML = `
            <div class="alert-icon">
                <i data-lucide="alert-triangle"></i>
            </div>
            <div class="alert-content">
                <strong>Significant Imbalance Detected!</strong> Your average strength imbalance is ${avgImbalance.toFixed(1)}%. Consider focusing more on your weaker leg.
            </div>
        `;
        alertsContainer.appendChild(alert);
    } else if (avgImbalance > 10) {
        const alert = document.createElement('div');
        alert.className = 'alert-item';
        alert.innerHTML = `
            <div class="alert-icon">
                <i data-lucide="info"></i>
            </div>
            <div class="alert-content">
                <strong>Moderate Imbalance</strong> Your average strength imbalance is ${avgImbalance.toFixed(1)}%. Keep monitoring and consider corrective exercises.
            </div>
        `;
        alertsContainer.appendChild(alert);
    } else if (avgImbalance <= 5) {
        const alert = document.createElement('div');
        alert.className = 'alert-item success';
        alert.innerHTML = `
            <div class="alert-icon">
                <i data-lucide="check-circle"></i>
            </div>
            <div class="alert-content">
                <strong>Excellent Balance!</strong> Your strength imbalance is only ${avgImbalance.toFixed(1)}%. Keep up the good work!
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // Re-initialize icons
    lucide.createIcons();
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'week') {
    const now = new Date();
    let filteredEntries = exerciseEntries;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredEntries = exerciseEntries.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredEntries = exerciseEntries.filter(e => new Date(e.date) >= monthAgo);
    }

    // Sort by date descending
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('exerciseHistory');
    historyList.innerHTML = '';

    if (filteredEntries.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No exercises found for this period.</p>';
        return;
    }

    filteredEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(entry.date).toLocaleDateString();
        const imbalanceClass = entry.imbalance > 10 ? 'high-imbalance' : entry.imbalance > 5 ? 'moderate-imbalance' : 'low-imbalance';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-exercise">${entry.exerciseType}</span>
                </div>
                <div class="history-details">
                    <span>Left: <strong class="history-strength">${entry.leftWeight} lbs</strong></span> |
                    <span>Right: <strong class="history-strength">${entry.rightWeight} lbs</strong></span> |
                    <span>${entry.sets} sets × ${entry.reps} reps</span>
                    <br>
                    <span class="history-imbalance ${imbalanceClass}">Imbalance: ${entry.imbalance.toFixed(1)}%</span>
                    ${entry.notes ? `<br><em>${entry.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteEntry(${entry.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this exercise entry?')) {
        exerciseEntries = exerciseEntries.filter(e => e.id !== id);
        localStorage.setItem('exerciseEntries', JSON.stringify(exerciseEntries));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('balanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (exerciseEntries.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more exercises to see balance trends', width / 2, height / 2);
        return;
    }

    // Simple bar chart comparing left vs right strength over time
    const entries = exerciseEntries.slice(-10); // Last 10 entries
    const maxWeight = Math.max(...entries.flatMap(e => [e.leftWeight, e.rightWeight]));

    const barWidth = (width - 60) / entries.length;
    const leftColor = '#4a90e2';
    const rightColor = '#e24a4a';

    entries.forEach((entry, index) => {
        const x = 30 + index * barWidth;
        const leftHeight = (entry.leftWeight / maxWeight) * (height - 60);
        const rightHeight = (entry.rightWeight / maxWeight) * (height - 60);

        // Left leg bar
        ctx.fillStyle = leftColor;
        ctx.fillRect(x, height - 30 - leftHeight, barWidth / 2 - 1, leftHeight);

        // Right leg bar
        ctx.fillStyle = rightColor;
        ctx.fillRect(x + barWidth / 2 + 1, height - 30 - rightHeight, barWidth / 2 - 1, rightHeight);
    });

    // Legend
    ctx.fillStyle = leftColor;
    ctx.fillRect(30, 10, 15, 15);
    ctx.fillStyle = 'var(--text-primary)';
    ctx.font = '12px Arial';
    ctx.fillText('Left', 50, 22);

    ctx.fillStyle = rightColor;
    ctx.fillRect(100, 10, 15, 15);
    ctx.fillStyle = 'var(--text-primary)';
    ctx.fillText('Right', 120, 22);
}

function updateProgress() {
    // Strength progress
    const progressElement = document.getElementById('strengthProgress');
    if (exerciseEntries.length >= 5) {
        const firstEntries = exerciseEntries.slice(0, 5);
        const lastEntries = exerciseEntries.slice(-5);

        const firstAvg = (firstEntries.reduce((sum, e) => sum + (e.leftWeight + e.rightWeight) / 2, 0) / firstEntries.length);
        const lastAvg = (lastEntries.reduce((sum, e) => sum + (e.leftWeight + e.rightWeight) / 2, 0) / lastEntries.length);

        const improvement = ((lastAvg - firstAvg) / firstAvg * 100).toFixed(1);
        progressElement.innerHTML = `<p>Your average strength has ${improvement > 0 ? 'improved' : 'decreased'} by ${Math.abs(improvement)}% over time.</p>`;
    }

    // Balance improvement
    const balanceElement = document.getElementById('balanceImprovement');
    if (exerciseEntries.length >= 10) {
        const firstHalf = exerciseEntries.slice(0, Math.floor(exerciseEntries.length / 2));
        const secondHalf = exerciseEntries.slice(Math.floor(exerciseEntries.length / 2));

        const firstImbalance = firstHalf.reduce((sum, e) => sum + e.imbalance, 0) / firstHalf.length;
        const secondImbalance = secondHalf.reduce((sum, e) => sum + e.imbalance, 0) / secondHalf.length;

        const balanceChange = (firstImbalance - secondImbalance).toFixed(1);
        balanceElement.innerHTML = `<p>Your average imbalance has ${balanceChange > 0 ? 'improved' : 'worsened'} by ${Math.abs(balanceChange)}%.</p>`;
    }

    // Weak side focus
    const weakElement = document.getElementById('weakSideFocus');
    if (exerciseEntries.length > 0) {
        const avgLeft = exerciseEntries.reduce((sum, e) => sum + e.leftWeight, 0) / exerciseEntries.length;
        const avgRight = exerciseEntries.reduce((sum, e) => sum + e.rightWeight, 0) / exerciseEntries.length;

        const weakSide = avgLeft < avgRight ? 'left' : 'right';
        const difference = Math.abs(avgLeft - avgRight).toFixed(1);
        weakElement.innerHTML = `<p>Your ${weakSide} leg is ${difference} lbs weaker on average. Focus extra attention on this side.</p>`;
    }
}

function renderRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = '';

    RECOMMENDATIONS.forEach(rec => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';
        recElement.innerHTML = `
            <div class="recommendation-icon">
                <i data-lucide="lightbulb"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.text}</p>
            </div>
        `;
        recommendationsContainer.appendChild(recElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}

function renderGuidelines() {
    const guidelinesContainer = document.getElementById('guidelines');
    guidelinesContainer.innerHTML = '';

    SAFETY_GUIDELINES.forEach(guideline => {
        const guidelineElement = document.createElement('div');
        guidelineElement.className = 'guideline-item';
        guidelineElement.innerHTML = `
            <div class="guideline-icon">
                <i data-lucide="alert-triangle"></i>
            </div>
            <div class="guideline-content">
                <h4>${guideline.title}</h4>
                <p>${guideline.text}</p>
            </div>
        `;
        guidelinesContainer.appendChild(guidelineElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}