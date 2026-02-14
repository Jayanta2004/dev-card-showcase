// Social Energy Tracker JavaScript

let socialInteractions = JSON.parse(localStorage.getItem('socialInteractions')) || [];
let currentInteraction = null;

// Energy level descriptions
const ENERGY_LEVELS = {
    1: 'Exhausted',
    2: 'Very Low',
    3: 'Low',
    4: 'Below Average',
    5: 'Moderate',
    6: 'Above Average',
    7: 'Good',
    8: 'High',
    9: 'Very High',
    10: 'Energized'
};

// Social energy tips
const SOCIAL_TIPS = [
    {
        title: 'Know Your Limits',
        text: 'Pay attention to how long you can maintain energy in social situations.'
    },
    {
        title: 'Quality over Quantity',
        text: 'Focus on meaningful interactions rather than attending every social event.'
    },
    {
        title: 'Pre-Interaction Preparation',
        text: 'Check in with yourself before social events to set realistic expectations.'
    },
    {
        title: 'Post-Interaction Recovery',
        text: 'Allow time to recharge after draining social experiences.'
    },
    {
        title: 'Small Interactions First',
        text: 'Build up your social energy with shorter, lower-stakes interactions.'
    },
    {
        title: 'Track Patterns',
        text: 'Notice which types of interactions energize you versus drain you.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
});

function initializeApp() {
    // Event listeners
    document.getElementById('preForm').addEventListener('submit', startInteraction);
    document.getElementById('postForm').addEventListener('submit', completeInteraction);
    document.getElementById('preEnergyLevel').addEventListener('input', updatePreEnergyDisplay);
    document.getElementById('postEnergyLevel').addEventListener('input', updatePostEnergyDisplay);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));

    // Initialize energy displays
    updatePreEnergyDisplay();
    updatePostEnergyDisplay();

    // Check for active interaction
    loadActiveInteraction();
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

function updatePreEnergyDisplay() {
    const energy = document.getElementById('preEnergyLevel').value;
    document.getElementById('preEnergyValue').textContent = energy;
    document.getElementById('preEnergyText').textContent = ENERGY_LEVELS[energy];
}

function updatePostEnergyDisplay() {
    const energy = document.getElementById('postEnergyLevel').value;
    document.getElementById('postEnergyValue').textContent = energy;
    document.getElementById('postEnergyText').textContent = ENERGY_LEVELS[energy];
}

function startInteraction(e) {
    e.preventDefault();

    currentInteraction = {
        id: Date.now(),
        type: document.getElementById('interactionType').value,
        expectedDuration: parseInt(document.getElementById('expectedDuration').value),
        peopleCount: parseInt(document.getElementById('peopleCount').value),
        preEnergy: parseInt(document.getElementById('preEnergyLevel').value),
        preNotes: document.getElementById('preNotes').value,
        startTime: new Date().toISOString(),
        status: 'active'
    };

    // Save to localStorage
    localStorage.setItem('currentInteraction', JSON.stringify(currentInteraction));

    // Update UI
    showActiveInteraction();
    document.getElementById('preForm').reset();
    updatePreEnergyDisplay();

    // Show success message
    alert('Interaction started! Remember to check in after it ends.');
}

function showActiveInteraction() {
    if (!currentInteraction) return;

    document.getElementById('activeInteraction').style.display = 'block';
    document.getElementById('postForm').style.display = 'block';

    document.getElementById('currentType').textContent = currentInteraction.type.replace('-', ' ');
    document.getElementById('startTime').textContent = new Date(currentInteraction.startTime).toLocaleString();
    document.getElementById('preEnergyDisplay').textContent = `${currentInteraction.preEnergy}/10 (${ENERGY_LEVELS[currentInteraction.preEnergy]})`;

    // Auto-fill actual duration
    const elapsed = Math.round((Date.now() - new Date(currentInteraction.startTime)) / 60000);
    document.getElementById('actualDuration').value = elapsed;
}

function completeInteraction(e) {
    e.preventDefault();

    if (!currentInteraction) return;

    const postEnergy = parseInt(document.getElementById('postEnergyLevel').value);
    const actualDuration = parseInt(document.getElementById('actualDuration').value);
    const postNotes = document.getElementById('postNotes').value;

    // Complete the interaction
    const completedInteraction = {
        ...currentInteraction,
        postEnergy: postEnergy,
        actualDuration: actualDuration,
        postNotes: postNotes,
        endTime: new Date().toISOString(),
        energyChange: postEnergy - currentInteraction.preEnergy,
        status: 'completed'
    };

    // Add to interactions array
    socialInteractions.push(completedInteraction);
    localStorage.setItem('socialInteractions', JSON.stringify(socialInteractions));

    // Clear current interaction
    currentInteraction = null;
    localStorage.removeItem('currentInteraction');

    // Update UI
    document.getElementById('activeInteraction').style.display = 'none';
    document.getElementById('postForm').style.display = 'none';
    document.getElementById('postForm').reset();
    updatePostEnergyDisplay();

    updateDisplay();

    // Show success message
    alert('Interaction completed! Your data has been saved.');
}

function loadActiveInteraction() {
    const saved = localStorage.getItem('currentInteraction');
    if (saved) {
        currentInteraction = JSON.parse(saved);
        showActiveInteraction();
    }
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateChart();
    updateInsights();
}

function updateMetrics() {
    const totalInteractions = socialInteractions.length;
    document.getElementById('totalInteractions').textContent = totalInteractions;

    if (totalInteractions > 0) {
        const totalChange = socialInteractions.reduce((sum, i) => sum + i.energyChange, 0);
        const avgChange = (totalChange / totalInteractions).toFixed(1);
        document.getElementById('avgEnergyChange').textContent = avgChange > 0 ? `+${avgChange}` : avgChange;

        // Calculate average recharge time (simplified)
        const drainingInteractions = socialInteractions.filter(i => i.energyChange < 0);
        if (drainingInteractions.length > 0) {
            const avgDrain = drainingInteractions.reduce((sum, i) => sum + Math.abs(i.energyChange), 0) / drainingInteractions.length;
            const rechargeHours = Math.round(avgDrain * 2); // Rough estimate
            document.getElementById('rechargeRate').textContent = `${rechargeHours} hrs`;
        }

        // Social battery (simplified calculation)
        const recentInteractions = socialInteractions.slice(-5);
        if (recentInteractions.length > 0) {
            const recentAvgChange = recentInteractions.reduce((sum, i) => sum + i.energyChange, 0) / recentInteractions.length;
            const batteryLevel = Math.max(0, Math.min(100, 50 + (recentAvgChange * 10)));
            document.getElementById('socialBattery').textContent = `${Math.round(batteryLevel)}%`;
        }
    }
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'week') {
    const now = new Date();
    let filteredInteractions = socialInteractions;

    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredInteractions = socialInteractions.filter(i => new Date(i.startTime) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredInteractions = socialInteractions.filter(i => new Date(i.startTime) >= monthAgo);
    }

    // Sort by date descending
    filteredInteractions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const historyList = document.getElementById('interactionHistory');
    historyList.innerHTML = '';

    if (filteredInteractions.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No interactions found for this period.</p>';
        return;
    }

    filteredInteractions.forEach(interaction => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(interaction.startTime).toLocaleDateString();
        const changeClass = interaction.energyChange >= 0 ? 'positive' : 'negative';
        const changeSign = interaction.energyChange >= 0 ? '+' : '';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-duration">${interaction.actualDuration} min</span>
                </div>
                <div class="history-details">
                    <span>Type: ${interaction.type.replace('-', ' ')}</span> |
                    <span>Energy Change: <strong class="history-energy-change ${changeClass}">${changeSign}${interaction.energyChange}</strong></span>
                    ${interaction.postNotes ? `<br><em>${interaction.postNotes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteInteraction(${interaction.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteInteraction(id) {
    if (confirm('Are you sure you want to delete this interaction?')) {
        socialInteractions = socialInteractions.filter(i => i.id !== id);
        localStorage.setItem('socialInteractions', JSON.stringify(socialInteractions));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('energyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (socialInteractions.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Complete more interactions to see energy trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for energy changes over time
    const interactions = socialInteractions.slice(-15); // Last 15 interactions
    const maxChange = Math.max(...interactions.map(i => Math.abs(i.energyChange)));
    const scale = maxChange > 0 ? (height - 40) / (maxChange * 2) : 1;

    ctx.strokeStyle = 'var(--primary-color)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    interactions.forEach((interaction, index) => {
        const x = (index / (interactions.length - 1)) * (width - 40) + 20;
        const y = height / 2 - (interaction.energyChange * scale);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = interaction.energyChange >= 0 ? '#28a745' : '#dc3545';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.stroke();

    // Add zero line
    ctx.strokeStyle = 'var(--text-secondary)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, height / 2);
    ctx.lineTo(width - 20, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Add labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recent Interactions', width / 2, height - 5);
}

function updateInsights() {
    // Energy patterns
    const patternsElement = document.getElementById('energyPatterns');
    if (socialInteractions.length >= 5) {
        const energizing = socialInteractions.filter(i => i.energyChange > 0).length;
        const draining = socialInteractions.filter(i => i.energyChange < 0).length;
        const ratio = draining > 0 ? (energizing / draining).toFixed(1) : 'all energizing';

        patternsElement.innerHTML = `<p>You have ${ratio} energizing interactions for every draining one.</p>`;
    }

    // Optimal interaction types
    const typeElement = document.getElementById('optimalTypes');
    const typeStats = {};
    socialInteractions.forEach(i => {
        if (!typeStats[i.type]) typeStats[i.type] = { count: 0, totalChange: 0 };
        typeStats[i.type].count++;
        typeStats[i.type].totalChange += i.energyChange;
    });

    const bestType = Object.keys(typeStats).reduce((a, b) =>
        (typeStats[a].totalChange / typeStats[a].count) > (typeStats[b].totalChange / typeStats[b].count) ? a : b, null);

    if (bestType) {
        typeElement.innerHTML = `<p>${bestType.replace('-', ' ')} interactions tend to be most energizing for you.</p>`;
    }

    // Recovery strategies
    const recoveryElement = document.getElementById('recoveryStrategies');
    const drainingInteractions = socialInteractions.filter(i => i.energyChange < 0);
    if (drainingInteractions.length > 0) {
        const avgDrain = drainingInteractions.reduce((sum, i) => sum + Math.abs(i.energyChange), 0) / drainingInteractions.length;
        const recoveryTime = Math.round(avgDrain * 1.5); // Rough estimate in hours
        recoveryElement.innerHTML = `<p>After draining interactions, you typically need about ${recoveryTime} hours to recover.</p>`;
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');
    tipsContainer.innerHTML = '';

    SOCIAL_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <div class="tip-icon">
                <i data-lucide="lightbulb"></i>
            </div>
            <div class="tip-content">
                <h4>${tip.title}</h4>
                <p>${tip.text}</p>
            </div>
        `;
        tipsContainer.appendChild(tipElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}