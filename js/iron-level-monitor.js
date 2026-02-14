// Iron Level Monitor JavaScript

let ironTests = JSON.parse(localStorage.getItem('ironTests')) || [];

// Reference ranges
const REFERENCE_RANGES = {
    hemoglobin: { women: { min: 12.0, max: 16.0 }, men: { min: 14.0, max: 18.0 } },
    ferritin: { min: 30, max: 300 },
    iron: { min: 50, max: 170 },
    tibc: { min: 250, max: 450 }
};

// Health recommendations
const HEALTH_RECOMMENDATIONS = [
    {
        title: 'Iron-Rich Foods',
        text: 'Include red meat, spinach, lentils, and fortified cereals in your diet.'
    },
    {
        title: 'Vitamin C for Absorption',
        text: 'Pair iron-rich foods with vitamin C sources like citrus fruits for better absorption.'
    },
    {
        title: 'Avoid Inhibitors',
        text: 'Limit coffee, tea, and calcium supplements around mealtimes as they can inhibit iron absorption.'
    },
    {
        title: 'Regular Monitoring',
        text: 'Get blood tests every 3-6 months if you have iron deficiency or overload concerns.'
    },
    {
        title: 'Supplementation',
        text: 'Only take iron supplements under medical supervision to avoid overload.'
    },
    {
        title: 'Address Underlying Causes',
        text: 'Consult a doctor to identify and treat causes of iron deficiency or excess.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderRecommendations();
    renderRanges();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('testDate').value = today;

    // Event listeners
    document.getElementById('labForm').addEventListener('submit', logLabResults);

    // History controls
    document.getElementById('viewQuarter').addEventListener('click', () => filterHistory('quarter'));
    document.getElementById('viewYear').addEventListener('click', () => filterHistory('year'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
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

function logLabResults(e) {
    e.preventDefault();

    const test = {
        id: Date.now(),
        date: document.getElementById('testDate').value,
        hemoglobin: parseFloat(document.getElementById('hemoglobin').value),
        ferritin: parseInt(document.getElementById('ferritin').value),
        iron: document.getElementById('iron').value ? parseInt(document.getElementById('iron').value) : null,
        tibc: document.getElementById('tibc').value ? parseInt(document.getElementById('tibc').value) : null,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    ironTests.push(test);
    localStorage.setItem('ironTests', JSON.stringify(ironTests));

    // Reset form
    document.getElementById('labForm').reset();
    document.getElementById('testDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();

    // Show success message
    alert('Lab results logged successfully!');
}

function updateDisplay() {
    updateStatus();
    updateHistory();
    updateChart();
    updateInsights();
}

function updateStatus() {
    if (ironTests.length === 0) return;

    // Get latest test
    const latest = ironTests[ironTests.length - 1];

    // Update current values
    document.getElementById('currentHemoglobin').textContent = `${latest.hemoglobin} g/dL`;
    document.getElementById('currentFerritin').textContent = `${latest.ferritin} ng/mL`;

    // Calculate iron saturation if both iron and TIBC are available
    if (latest.iron && latest.tibc) {
        const saturation = ((latest.iron / latest.tibc) * 100).toFixed(1);
        document.getElementById('ironSaturation').textContent = `${saturation}%`;
        const saturationStatus = getStatus(saturation, { min: 20, max: 50 }, 'saturation');
        document.getElementById('saturationStatus').textContent = saturationStatus.text;
        document.getElementById('saturationStatus').className = `metric-status ${saturationStatus.class}`;
    }

    // Update statuses
    const hemoglobinStatus = getHemoglobinStatus(latest.hemoglobin);
    document.getElementById('hemoglobinStatus').textContent = hemoglobinStatus.text;
    document.getElementById('hemoglobinStatus').className = `metric-status ${hemoglobinStatus.class}`;

    const ferritinStatus = getStatus(latest.ferritin, REFERENCE_RANGES.ferritin, 'ferritin');
    document.getElementById('ferritinStatus').textContent = ferritinStatus.text;
    document.getElementById('ferritinStatus').className = `metric-status ${ferritinStatus.class}`;

    // Overall status
    const overallStatus = getOverallStatus(latest);
    document.getElementById('overallStatus').textContent = overallStatus.text;
    document.getElementById('overallStatusColor').textContent = overallStatus.text;
    document.getElementById('overallStatusColor').className = `metric-status ${overallStatus.class}`;
}

function getHemoglobinStatus(value) {
    // Assume female ranges for simplicity (can be enhanced with gender selection)
    const range = REFERENCE_RANGES.hemoglobin.women;
    return getStatus(value, range, 'hemoglobin');
}

function getStatus(value, range, type) {
    if (value < range.min) {
        if (type === 'ferritin' && value < 15) return { text: 'Critical Low', class: 'critical' };
        return { text: 'Low', class: 'low' };
    } else if (value > range.max) {
        return { text: 'High', class: 'high' };
    } else {
        return { text: 'Normal', class: 'normal' };
    }
}

function getOverallStatus(latest) {
    const statuses = [];

    statuses.push(getHemoglobinStatus(latest.hemoglobin));
    statuses.push(getStatus(latest.ferritin, REFERENCE_RANGES.ferritin, 'ferritin'));

    if (latest.iron) statuses.push(getStatus(latest.iron, REFERENCE_RANGES.iron, 'iron'));
    if (latest.tibc) statuses.push(getStatus(latest.tibc, REFERENCE_RANGES.tibc, 'tibc'));

    const criticalCount = statuses.filter(s => s.class === 'critical').length;
    const lowCount = statuses.filter(s => s.class === 'low').length;
    const highCount = statuses.filter(s => s.class === 'high').length;

    if (criticalCount > 0) return { text: 'Critical', class: 'critical' };
    if (lowCount >= 2 || highCount >= 2) return { text: 'Concerning', class: 'high' };
    if (lowCount > 0 || highCount > 0) return { text: 'Monitor', class: 'low' };
    return { text: 'Healthy', class: 'normal' };
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'quarter') {
    const now = new Date();
    let filteredTests = ironTests;

    if (period === 'quarter') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        filteredTests = ironTests.filter(t => new Date(t.date) >= threeMonthsAgo);
    } else if (period === 'year') {
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        filteredTests = ironTests.filter(t => new Date(t.date) >= oneYearAgo);
    }

    // Sort by date descending
    filteredTests.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('labHistory');
    historyList.innerHTML = '';

    if (filteredTests.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No lab results found for this period.</p>';
        return;
    }

    filteredTests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(test.date).toLocaleDateString();
        const overallStatus = getOverallStatus(test);

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-values">Hb: ${test.hemoglobin}, Ferritin: ${test.ferritin}</span>
                </div>
                <div class="history-details">
                    <span>Status: <strong class="${overallStatus.class}">${overallStatus.text}</strong></span>
                    ${test.notes ? `<br><em>${test.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteTest(${test.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteTest(id) {
    if (confirm('Are you sure you want to delete this lab result?')) {
        ironTests = ironTests.filter(t => t.id !== id);
        localStorage.setItem('ironTests', JSON.stringify(ironTests));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('ironChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (ironTests.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more results to see trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for hemoglobin and ferritin over time
    const tests = ironTests.slice(-10); // Last 10 tests
    const maxHemoglobin = Math.max(...tests.map(t => t.hemoglobin));
    const maxFerritin = Math.max(...tests.map(t => t.ferritin));

    // Hemoglobin line (blue)
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    tests.forEach((test, index) => {
        const x = (index / (tests.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (test.hemoglobin / maxHemoglobin) * (height - 40);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Ferritin line (green)
    ctx.strokeStyle = '#28a745';
    ctx.beginPath();

    tests.forEach((test, index) => {
        const x = (index / (tests.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (test.ferritin / maxFerritin) * (height - 40);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Add legend
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.fillText('Hemoglobin (blue) & Ferritin (green)', width / 2, height - 5);
}

function updateInsights() {
    // Trend analysis
    const trendElement = document.getElementById('trendAnalysis');
    if (ironTests.length >= 3) {
        const recent = ironTests.slice(-3);
        const hemoglobinTrend = recent[2].hemoglobin - recent[0].hemoglobin;
        const ferritinTrend = recent[2].ferritin - recent[0].ferritin;

        let trendText = 'Your iron levels are ';
        if (hemoglobinTrend > 0.5 && ferritinTrend > 10) {
            trendText += 'improving.';
        } else if (hemoglobinTrend < -0.5 || ferritinTrend < -10) {
            trendText += 'declining.';
        } else {
            trendText += 'stable.';
        }

        trendElement.innerHTML = `<p>${trendText}</p>`;
    }

    // Risk assessment
    const riskElement = document.getElementById('riskAssessment');
    if (ironTests.length > 0) {
        const latest = ironTests[ironTests.length - 1];
        const overallStatus = getOverallStatus(latest);

        if (overallStatus.class === 'critical') {
            riskElement.innerHTML = '<p><strong>High Risk:</strong> Your iron levels require immediate medical attention.</p>';
        } else if (overallStatus.class === 'high') {
            riskElement.innerHTML = '<p><strong>Moderate Risk:</strong> Monitor your levels closely and consult a healthcare provider.</p>';
        } else {
            riskElement.innerHTML = '<p><strong>Low Risk:</strong> Your iron levels are within acceptable ranges.</p>';
        }
    }

    // Supplementation advice
    const suppElement = document.getElementById('supplementation');
    if (ironTests.length > 0) {
        const latest = ironTests[ironTests.length - 1];
        const hemoglobinLow = latest.hemoglobin < REFERENCE_RANGES.hemoglobin.women.min;
        const ferritinLow = latest.ferritin < REFERENCE_RANGES.ferritin.min;

        if (hemoglobinLow || ferritinLow) {
            suppElement.innerHTML = '<p>Consider iron supplementation under medical supervision, along with dietary changes.</p>';
        } else {
            suppElement.innerHTML = '<p>Maintain a balanced diet with adequate iron sources.</p>';
        }
    }
}

function renderRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = '';

    HEALTH_RECOMMENDATIONS.forEach(rec => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';
        recElement.innerHTML = `
            <div class="recommendation-icon">
                <i data-lucide="check-circle"></i>
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

function renderRanges() {
    const rangesContainer = document.getElementById('ranges');
    rangesContainer.innerHTML = '';

    const ranges = [
        { label: 'Hemoglobin (Women)', normal: '12.0 - 16.0 g/dL', unit: 'g/dL' },
        { label: 'Hemoglobin (Men)', normal: '14.0 - 18.0 g/dL', unit: 'g/dL' },
        { label: 'Ferritin', normal: '30 - 300 ng/mL', unit: 'ng/mL' },
        { label: 'Iron', normal: '50 - 170 μg/dL', unit: 'μg/dL' },
        { label: 'TIBC', normal: '250 - 450 μg/dL', unit: 'μg/dL' },
        { label: 'Iron Saturation', normal: '20 - 50%', unit: '%' }
    ];

    ranges.forEach(range => {
        const rangeElement = document.createElement('div');
        rangeElement.className = 'range-item';
        rangeElement.innerHTML = `
            <div class="range-label">${range.label}</div>
            <div class="range-values">
                <div class="range-normal">${range.normal}</div>
                <div class="range-unit">${range.unit}</div>
            </div>
        `;
        rangesContainer.appendChild(rangeElement);
    });
}