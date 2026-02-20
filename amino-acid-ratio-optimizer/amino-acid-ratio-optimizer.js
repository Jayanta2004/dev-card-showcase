// Amino Acid Ratio Optimizer JavaScript

// DOM Elements
const form = document.getElementById('amino-acid-form');
const foodNameInput = document.getElementById('food-name');
const clearFormBtn = document.getElementById('clear-form');
const clearHistoryBtn = document.getElementById('clear-history');
const entriesList = document.getElementById('entries-list');
const presetButtons = document.querySelectorAll('.preset-btn');

// Results elements
const bcaaRatioEl = document.getElementById('bcaa-ratio');
const bcaaStatusEl = document.getElementById('bcaa-status');
const proteinScoreEl = document.getElementById('protein-score');
const proteinStatusEl = document.getElementById('protein-status');
const limitingAaEl = document.getElementById('limiting-aa');
const limitingStatusEl = document.getElementById('limiting-status');
const insightsList = document.getElementById('insights-list');

// Chart
let aminoAcidChart;

// Amino acid data storage
let dailyEntries = [];

// Preset food data (amino acids in mg per serving)
const presetFoods = {
    'chicken-breast': {
        name: 'Chicken Breast (100g)',
        leucine: 1720,
        isoleucine: 980,
        valine: 1020,
        lysine: 1920,
        methionine: 580,
        phenylalanine: 850,
        threonine: 890,
        tryptophan: 190,
        histidine: 780
    },
    'eggs': {
        name: 'Eggs (2 large)',
        leucine: 1040,
        isoleucine: 680,
        valine: 860,
        lysine: 880,
        methionine: 480,
        phenylalanine: 780,
        threonine: 620,
        tryptophan: 240,
        histidine: 380
    },
    'whey-protein': {
        name: 'Whey Protein (30g)',
        leucine: 2700,
        isoleucine: 1500,
        valine: 1350,
        lysine: 2400,
        methionine: 600,
        phenylalanine: 900,
        threonine: 1800,
        tryptophan: 450,
        histidine: 450
    },
    'salmon': {
        name: 'Salmon (100g)',
        leucine: 1620,
        isoleucine: 890,
        valine: 980,
        lysine: 1840,
        methionine: 650,
        phenylalanine: 780,
        threonine: 890,
        tryptophan: 220,
        histidine: 580
    },
    'beef': {
        name: 'Beef (100g)',
        leucine: 1680,
        isoleucine: 880,
        valine: 920,
        lysine: 1780,
        methionine: 580,
        phenylalanine: 780,
        threonine: 850,
        tryptophan: 190,
        histidine: 650
    },
    'tofu': {
        name: 'Tofu (100g)',
        leucine: 380,
        isoleucine: 220,
        valine: 240,
        lysine: 280,
        methionine: 80,
        phenylalanine: 220,
        threonine: 200,
        tryptophan: 50,
        histidine: 120
    }
};

// Reference values for calculations (mg/g protein for scoring)
const referenceValues = {
    leucine: 59,
    isoleucine: 30,
    valine: 39,
    lysine: 45,
    methionine: 16,
    phenylalanine: 30,
    threonine: 23,
    tryptophan: 6,
    histidine: 15
};

// Initialize the app
function init() {
    loadNavbar();
    loadFooter();
    loadData();
    setupEventListeners();
    updateDisplay();
}

// Load navbar and footer
function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function loadFooter() {
    fetch('../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

// Setup event listeners
function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    clearFormBtn.addEventListener('click', clearForm);
    clearHistoryBtn.addEventListener('click', clearHistory);

    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => loadPresetFood(btn.dataset.food));
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        foodName: foodNameInput.value.trim(),
        leucine: parseFloat(document.getElementById('leucine').value) || 0,
        isoleucine: parseFloat(document.getElementById('isoleucine').value) || 0,
        valine: parseFloat(document.getElementById('valine').value) || 0,
        lysine: parseFloat(document.getElementById('lysine').value) || 0,
        methionine: parseFloat(document.getElementById('methionine').value) || 0,
        phenylalanine: parseFloat(document.getElementById('phenylalanine').value) || 0,
        threonine: parseFloat(document.getElementById('threonine').value) || 0,
        tryptophan: parseFloat(document.getElementById('tryptophan').value) || 0,
        histidine: parseFloat(document.getElementById('histidine').value) || 0
    };

    dailyEntries.push(entry);
    saveData();
    updateDisplay();
    clearForm();
}

// Load preset food data
function loadPresetFood(foodKey) {
    const food = presetFoods[foodKey];
    if (!food) return;

    foodNameInput.value = food.name;
    document.getElementById('leucine').value = food.leucine;
    document.getElementById('isoleucine').value = food.isoleucine;
    document.getElementById('valine').value = food.valine;
    document.getElementById('lysine').value = food.lysine;
    document.getElementById('methionine').value = food.methionine;
    document.getElementById('phenylalanine').value = food.phenylalanine;
    document.getElementById('threonine').value = food.threonine;
    document.getElementById('tryptophan').value = food.tryptophan;
    document.getElementById('histidine').value = food.histidine;
}

// Clear form
function clearForm() {
    form.reset();
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all today\'s entries?')) {
        dailyEntries = [];
        saveData();
        updateDisplay();
    }
}

// Calculate BCAA ratio
function calculateBCAARatio() {
    const totals = getTotals();
    if (totals.leucine === 0) return { ratio: '0:0:0', status: 'No data' };

    const leu = totals.leucine;
    const ile = totals.isoleucine;
    const val = totals.valine;

    // Normalize to leucine
    const ratio = `${(leu/leu).toFixed(1)}:${(ile/leu).toFixed(1)}:${(val/leu).toFixed(1)}`;

    // Ideal BCAA ratio is approximately 2:1:1
    const idealLeu = 2;
    const idealIle = 1;
    const idealVal = 1;

    const deviation = Math.abs(leu/ile - idealLeu/idealIle) + Math.abs(leu/val - idealLeu/idealVal);
    let status = 'Optimal';
    if (deviation > 1) status = 'Suboptimal';
    if (deviation > 2) status = 'Poor';

    return { ratio, status };
}

// Calculate protein quality score
function calculateProteinScore() {
    const totals = getTotals();
    const totalProtein = Object.values(totals).reduce((sum, val) => sum + val, 0);

    if (totalProtein === 0) return { score: 0, status: 'No data' };

    // Calculate amino acid score for each essential AA
    const scores = Object.keys(referenceValues).map(aa => {
        const actual = totals[aa] || 0;
        const reference = referenceValues[aa] * (totalProtein / 1000); // Convert to mg
        return Math.min(actual / reference, 1) * 100;
    });

    const limitingScore = Math.min(...scores);
    const status = limitingScore >= 100 ? 'Complete' :
                   limitingScore >= 80 ? 'High Quality' :
                   limitingScore >= 60 ? 'Good Quality' : 'Low Quality';

    return { score: Math.round(limitingScore), status };
}

// Find limiting amino acid
function findLimitingAminoAcid() {
    const totals = getTotals();
    const totalProtein = Object.values(totals).reduce((sum, val) => sum + val, 0);

    if (totalProtein === 0) return { aa: 'None', status: 'No data' };

    let limitingAA = '';
    let lowestScore = Infinity;

    Object.keys(referenceValues).forEach(aa => {
        const actual = totals[aa] || 0;
        const reference = referenceValues[aa] * (totalProtein / 1000);
        const score = actual / reference;

        if (score < lowestScore) {
            lowestScore = score;
            limitingAA = aa.charAt(0).toUpperCase() + aa.slice(1);
        }
    });

    const status = lowestScore >= 1 ? 'All adequate' :
                   lowestScore >= 0.8 ? 'Slightly limiting' :
                   lowestScore >= 0.6 ? 'Moderately limiting' : 'Severely limiting';

    return { aa: limitingAA, status };
}

// Get totals for all entries
function getTotals() {
    return dailyEntries.reduce((totals, entry) => {
        Object.keys(referenceValues).forEach(aa => {
            totals[aa] = (totals[aa] || 0) + (entry[aa] || 0);
        });
        return totals;
    }, {});
}

// Generate insights
function generateInsights() {
    const insights = [];
    const totals = getTotals();
    const totalProtein = Object.values(totals).reduce((sum, val) => sum + val, 0);

    if (totalProtein === 0) {
        return ['<li>Enter amino acid values to see insights</li>'];
    }

    const bcaa = calculateBCAARatio();
    const protein = calculateProteinScore();
    const limiting = findLimitingAminoAcid();

    if (bcaa.status === 'Optimal') {
        insights.push('<li class="positive">✓ BCAA ratio is well-balanced for optimal muscle protein synthesis</li>');
    } else if (bcaa.status === 'Suboptimal') {
        insights.push('<li class="warning">⚠ BCAA ratio could be improved for better muscle recovery</li>');
    } else {
        insights.push('<li class="negative">✗ BCAA ratio is imbalanced - consider adjusting leucine intake</li>');
    }

    if (protein.score >= 100) {
        insights.push('<li class="positive">✓ Protein has complete amino acid profile</li>');
    } else if (protein.score >= 80) {
        insights.push('<li class="warning">⚠ Protein quality is good but could be enhanced</li>');
    } else {
        insights.push('<li class="negative">✗ Protein quality is limited - supplement with ' + limiting.aa.toLowerCase() + '</li>');
    }

    if (totals.leucine > 2000) {
        insights.push('<li class="positive">✓ Good leucine intake for muscle protein synthesis activation</li>');
    } else if (totals.leucine > 1000) {
        insights.push('<li>ℹ Moderate leucine intake - consider increasing for optimal MPS</li>');
    } else {
        insights.push('<li class="warning">⚠ Low leucine intake - add leucine-rich foods</li>');
    }

    return insights.map(insight => insight);
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('amino-acid-chart').getContext('2d');
    const totals = getTotals();

    const labels = Object.keys(referenceValues).map(aa =>
        aa.charAt(0).toUpperCase() + aa.slice(1)
    );
    const data = Object.keys(referenceValues).map(aa => totals[aa] || 0);

    if (aminoAcidChart) {
        aminoAcidChart.destroy();
    }

    aminoAcidChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Amount (mg)',
                data: data,
                backgroundColor: 'rgba(46, 125, 50, 0.6)',
                borderColor: 'rgba(46, 125, 50, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Milligrams (mg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Amino Acids'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Amino Acid Intake'
                }
            }
        }
    });
}

// Update display
function updateDisplay() {
    // Update ratios
    const bcaa = calculateBCAARatio();
    bcaaRatioEl.textContent = bcaa.ratio;
    bcaaStatusEl.textContent = bcaa.status;
    bcaaStatusEl.className = 'ratio-status ' + bcaa.status.toLowerCase();

    const protein = calculateProteinScore();
    proteinScoreEl.textContent = protein.score;
    proteinStatusEl.textContent = protein.status;

    const limiting = findLimitingAminoAcid();
    limitingAaEl.textContent = limiting.aa;
    limitingStatusEl.textContent = limiting.status;

    // Update insights
    const insights = generateInsights();
    insightsList.innerHTML = insights.join('');

    // Update chart
    updateChart();

    // Update entries list
    updateEntriesList();
}

// Update entries list
function updateEntriesList() {
    if (dailyEntries.length === 0) {
        entriesList.innerHTML = '<p>No entries yet. Add some amino acid data above.</p>';
        return;
    }

    const entriesHtml = dailyEntries.map(entry => `
        <div class="entry-item">
            <div class="entry-info">
                <h4>${entry.foodName}</h4>
                <p>Added at ${new Date(entry.timestamp).toLocaleTimeString()}</p>
            </div>
            <div class="entry-actions">
                <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
            </div>
        </div>
    `).join('');

    entriesList.innerHTML = entriesHtml;
}

// Delete entry
function deleteEntry(id) {
    dailyEntries = dailyEntries.filter(entry => entry.id !== id);
    saveData();
    updateDisplay();
}

// Data persistence
function saveData() {
    const data = {
        date: new Date().toDateString(),
        entries: dailyEntries
    };
    localStorage.setItem('aminoAcidData', JSON.stringify(data));
}

function loadData() {
    const data = localStorage.getItem('aminoAcidData');
    if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === new Date().toDateString()) {
            dailyEntries = parsed.entries || [];
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);