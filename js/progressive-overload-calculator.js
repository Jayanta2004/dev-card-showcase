// Progressive Overload Calculator JavaScript

let liftHistory = JSON.parse(localStorage.getItem('liftHistory')) || [];

// Progression percentages based on experience level and lift category
const PROGRESSION_RATES = {
    beginner: {
        'upper-body': { min: 2.5, max: 5, recommended: 2.5 },
        'lower-body': { min: 2.5, max: 5, recommended: 2.5 },
        'olympic': { min: 2.5, max: 5, recommended: 2.5 },
        'accessory': { min: 5, max: 10, recommended: 5 }
    },
    intermediate: {
        'upper-body': { min: 2.5, max: 5, recommended: 2.5 },
        'lower-body': { min: 2.5, max: 5, recommended: 2.5 },
        'olympic': { min: 2.5, max: 5, recommended: 2.5 },
        'accessory': { min: 5, max: 10, recommended: 5 }
    },
    advanced: {
        'upper-body': { min: 1, max: 2.5, recommended: 1.25 },
        'lower-body': { min: 1, max: 2.5, recommended: 1.25 },
        'olympic': { min: 1, max: 2.5, recommended: 1.25 },
        'accessory': { min: 2.5, max: 5, recommended: 2.5 }
    }
};

// Training guidelines
const TRAINING_GUIDELINES = [
    {
        level: 'Beginner (0-6 months)',
        increments: '2.5-5% per week',
        description: 'Focus on form and consistency. Increase weight when you can complete all sets/reps with good form.',
        frequency: '2-3x per week per muscle group'
    },
    {
        level: 'Intermediate (6-24 months)',
        increments: '2.5-5% per week',
        description: 'Periodize training with deload weeks. Focus on progressive overload while maintaining form.',
        frequency: '3-4x per week per muscle group'
    },
    {
        level: 'Advanced (2+ years)',
        increments: '1-2.5% per week',
        description: 'Smaller increments with longer training cycles. Include competition lifts and accessory work.',
        frequency: '4-6x per week per muscle group'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderGuidelines();
});

function initializeApp() {
    // Event listeners
    document.getElementById('overloadForm').addEventListener('submit', calculateProgression);

    // History controls
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
    document.getElementById('viewUpper').addEventListener('click', () => filterHistory('upper-body'));
    document.getElementById('viewLower').addEventListener('click', () => filterHistory('lower-body'));
}

function calculateProgression(e) {
    e.preventDefault();

    const liftName = document.getElementById('liftName').value.trim();
    const currentWeight = parseFloat(document.getElementById('currentWeight').value);
    const category = document.getElementById('liftCategory').value;
    const experience = document.getElementById('experienceLevel').value;

    if (!liftName || !currentWeight || !category || !experience) {
        alert('Please fill in all fields.');
        return;
    }

    // Save to history
    const liftEntry = {
        id: Date.now(),
        name: liftName,
        weight: currentWeight,
        category: category,
        experience: experience,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
    };

    liftHistory.push(liftEntry);
    localStorage.setItem('liftHistory', JSON.stringify(liftHistory));

    // Calculate progression options
    const rates = PROGRESSION_RATES[experience][category];
    const options = [
        {
            label: 'Conservative',
            percentage: rates.min,
            weight: currentWeight * (1 + rates.min / 100),
            description: 'Safer progression, better for form focus'
        },
        {
            label: 'Recommended',
            percentage: rates.recommended,
            weight: currentWeight * (1 + rates.recommended / 100),
            description: 'Balanced progression for steady gains'
        },
        {
            label: 'Aggressive',
            percentage: rates.max,
            weight: currentWeight * (1 + rates.max / 100),
            description: 'Faster progression, higher risk of form breakdown'
        }
    ];

    displayResults(liftName, currentWeight, options);
    updateDisplay();
    showNotification('Progression calculated successfully!', 'success');
}

function displayResults(liftName, currentWeight, options) {
    const container = document.getElementById('resultsContainer');

    const resultsHTML = `
        <div class="results-card">
            <div class="results-header">
                <div class="lift-title">${liftName}</div>
                <div class="current-pr">Current PR: ${currentWeight}kg</div>
            </div>
            <div class="progression-options">
                ${options.map(option => `
                    <div class="progression-option">
                        <div class="option-header">
                            <span class="option-label">${option.label}</span>
                            <span class="option-weight">${option.weight.toFixed(2)}kg</span>
                        </div>
                        <div class="option-description">
                            +${option.percentage}% (${(currentWeight * option.percentage / 100).toFixed(2)}kg increase) - ${option.description}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = resultsHTML;
}

function updateDisplay() {
    updateInsights();
    updateHistory();
    updateChart();
}

function updateInsights() {
    // Total lifts
    document.getElementById('totalLifts').innerHTML = `<p>${liftHistory.length} lifts</p>`;

    // Average progression
    if (liftHistory.length >= 2) {
        const progressions = [];
        const liftsByName = {};

        liftHistory.forEach(lift => {
            if (!liftsByName[lift.name]) {
                liftsByName[lift.name] = [];
            }
            liftsByName[lift.name].push(lift);
        });

        Object.values(liftsByName).forEach(lifts => {
            if (lifts.length >= 2) {
                lifts.sort((a, b) => new Date(a.date) - new Date(b.date));
                for (let i = 1; i < lifts.length; i++) {
                    const progression = ((lifts[i].weight - lifts[i-1].weight) / lifts[i-1].weight) * 100;
                    progressions.push(progression);
                }
            }
        });

        if (progressions.length > 0) {
            const avgProgression = progressions.reduce((a, b) => a + b, 0) / progressions.length;
            document.getElementById('avgProgression').innerHTML = `<p>${avgProgression.toFixed(1)}% per session</p>`;
        }
    }

    // Strongest category
    if (liftHistory.length > 0) {
        const categoryWeights = {};
        liftHistory.forEach(lift => {
            if (!categoryWeights[lift.category]) {
                categoryWeights[lift.category] = [];
            }
            categoryWeights[lift.category].push(lift.weight);
        });

        let strongestCategory = '';
        let maxAvgWeight = 0;

        Object.entries(categoryWeights).forEach(([category, weights]) => {
            const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
            if (avgWeight > maxAvgWeight) {
                maxAvgWeight = avgWeight;
                strongestCategory = category;
            }
        });

        const categoryNames = {
            'upper-body': 'Upper Body',
            'lower-body': 'Lower Body',
            'olympic': 'Olympic Lifts',
            'accessory': 'Accessory/Core'
        };

        document.getElementById('strongestCategory').innerHTML = `<p>${categoryNames[strongestCategory] || 'N/A'}</p>`;
    }
}

function updateHistory(filter = 'all') {
    const historyContainer = document.getElementById('historyList');
    let filteredHistory = [...liftHistory];

    if (filter !== 'all') {
        filteredHistory = liftHistory.filter(lift => lift.category === filter);
    }

    // Sort by date descending
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', '')}`).classList.add('active');

    historyContainer.innerHTML = '';

    if (filteredHistory.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No lifts found for this category.</p>';
        return;
    }

    filteredHistory.forEach(lift => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const categoryNames = {
            'upper-body': 'Upper Body',
            'lower-body': 'Lower Body',
            'olympic': 'Olympic Lifts',
            'accessory': 'Accessory/Core'
        };

        historyItem.innerHTML = `
            <div class="history-lift">${lift.name}</div>
            <div class="history-details">
                <div class="history-weight">${lift.weight}kg</div>
                <div class="history-category">${categoryNames[lift.category]}</div>
            </div>
        `;

        historyContainer.appendChild(historyItem);
    });
}

function filterHistory(category) {
    updateHistory(category);
}

function updateChart() {
    const ctx = document.getElementById('progressionChart').getContext('2d');

    if (liftHistory.length === 0) {
        // Clear chart if no data
        if (window.progressionChart) {
            window.progressionChart.destroy();
        }
        return;
    }

    // Group by lift name and sort by date
    const liftsByName = {};
    liftHistory.forEach(lift => {
        if (!liftsByName[lift.name]) {
            liftsByName[lift.name] = [];
        }
        liftsByName[lift.name].push(lift);
    });

    // Take the most recent lift for each name for simplicity
    const recentLifts = Object.values(liftsByName).map(lifts => {
        lifts.sort((a, b) => new Date(b.date) - new Date(a.date));
        return lifts[0];
    });

    // Sort by weight for bar chart
    recentLifts.sort((a, b) => b.weight - a.weight);

    const labels = recentLifts.map(lift => lift.name);
    const data = recentLifts.map(lift => lift.weight);

    if (window.progressionChart) {
        window.progressionChart.destroy();
    }

    window.progressionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current PR (kg)',
                data: data,
                backgroundColor: 'rgba(79, 209, 255, 0.6)',
                borderColor: 'rgba(79, 209, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Lift'
                    }
                }
            }
        }
    });
}

function renderGuidelines() {
    const guidelinesContainer = document.getElementById('guidelines');

    TRAINING_GUIDELINES.forEach(guideline => {
        const guidelineElement = document.createElement('div');
        guidelineElement.className = 'guideline-item';
        guidelineElement.innerHTML = `
            <h3>${guideline.level}</h3>
            <div class="level">Increments: ${guideline.increments}</div>
            <p>${guideline.description}</p>
            <p><strong>Frequency:</strong> ${guideline.frequency}</p>
        `;
        guidelinesContainer.appendChild(guidelineElement);
    });
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function showNotification(message, type = 'info') {
    // Simple notification
    alert(message);
}