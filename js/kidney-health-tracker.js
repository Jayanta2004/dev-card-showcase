// Kidney Health Tracker JavaScript

let kidneyTests = JSON.parse(localStorage.getItem('kidneyTests')) || [];

// GFR Stages
const GFR_STAGES = {
    1: { label: 'Normal', range: '≥90', color: 'normal', description: 'Normal kidney function' },
    2: { label: 'Mildly Decreased', range: '60-89', color: 'caution', description: 'Mildly reduced kidney function' },
    3: { label: 'Moderately Decreased', range: '30-59', color: 'warning', description: 'Moderately reduced kidney function' },
    4: { label: 'Severely Decreased', range: '15-29', color: 'warning', description: 'Severely reduced kidney function' },
    5: { label: 'Kidney Failure', range: '<15', color: 'critical', description: 'Kidney failure requiring dialysis' }
};

// Creatinine status
function getCreatinineStatus(creatinine, age, gender) {
    // Simplified ranges - in reality, this varies by age, gender, and muscle mass
    if (gender === 'female') {
        if (creatinine < 0.6) return { status: 'low', color: 'caution', message: 'Below normal range' };
        if (creatinine <= 1.1) return { status: 'normal', color: 'normal', message: 'Normal range' };
        if (creatinine <= 1.3) return { status: 'high-normal', color: 'caution', message: 'Upper normal range' };
        return { status: 'high', color: 'warning', message: 'Above normal range' };
    } else {
        if (creatinine < 0.7) return { status: 'low', color: 'caution', message: 'Below normal range' };
        if (creatinine <= 1.2) return { status: 'normal', color: 'normal', message: 'Normal range' };
        if (creatinine <= 1.4) return { status: 'high-normal', color: 'caution', message: 'Upper normal range' };
        return { status: 'high', color: 'warning', message: 'Above normal range' };
    }
}

function getGFRStage(gfr) {
    if (gfr >= 90) return GFR_STAGES[1];
    if (gfr >= 60) return GFR_STAGES[2];
    if (gfr >= 30) return GFR_STAGES[3];
    if (gfr >= 15) return GFR_STAGES[4];
    return GFR_STAGES[5];
}

// Health recommendations
const HEALTH_RECOMMENDATIONS = [
    {
        title: 'Stay Hydrated',
        text: 'Drink adequate water daily. Proper hydration supports kidney function and helps flush toxins.'
    },
    {
        title: 'Monitor Blood Pressure',
        text: 'Keep blood pressure under control. High blood pressure can damage kidney filters over time.'
    },
    {
        title: 'Healthy Diet',
        text: 'Follow a balanced diet with appropriate protein intake. Limit salt and processed foods.'
    },
    {
        title: 'Regular Exercise',
        text: 'Maintain regular physical activity. Exercise helps control weight and blood pressure.'
    },
    {
        title: 'Medication Management',
        text: 'Take medications as prescribed. Some medications can affect kidney function.'
    },
    {
        title: 'Regular Checkups',
        text: 'Schedule regular kidney function tests. Early detection is key to managing kidney health.'
    }
];

// Health guidelines
const HEALTH_GUIDELINES = [
    {
        title: 'Know Your Numbers',
        text: 'Regular monitoring of creatinine and GFR helps track kidney function changes over time.'
    },
    {
        title: 'Understand GFR Stages',
        text: 'GFR indicates kidney function level. Stage 1-2 is normal to mild, Stage 3-5 indicates reduced function.'
    },
    {
        title: 'Creatinine as Indicator',
        text: 'Elevated creatinine levels may indicate reduced kidney function, but results should be interpreted by a doctor.'
    },
    {
        title: 'Lifestyle Impact',
        text: 'Diet, exercise, and medication can all affect kidney function. Track these factors with your test results.'
    },
    {
        title: 'When to See a Doctor',
        text: 'Consult a healthcare provider if you notice persistent changes in urination, swelling, or fatigue.'
    },
    {
        title: 'Prevention is Key',
        text: 'Maintaining healthy habits can help prevent kidney disease progression.'
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
    document.getElementById('testDate').value = today;

    // Event listeners
    document.getElementById('kidneyForm').addEventListener('submit', logTest);
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('view6Months').addEventListener('click', () => filterHistory('6months'));
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

function logTest(e) {
    e.preventDefault();

    const test = {
        id: Date.now(),
        date: document.getElementById('testDate').value,
        creatinine: parseFloat(document.getElementById('creatinine').value),
        gfr: parseInt(document.getElementById('gfr').value),
        bun: document.getElementById('bun').value ? parseFloat(document.getElementById('bun').value) : null,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    kidneyTests.push(test);
    localStorage.setItem('kidneyTests', JSON.stringify(kidneyTests));

    // Reset form
    document.getElementById('kidneyForm').reset();
    document.getElementById('testDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();

    // Show success message
    alert('Test results logged successfully!');
}

function updateDisplay() {
    updateMetrics();
    updateHistory();
    updateChart();
    updateInsights();
}

function updateMetrics() {
    const totalTests = kidneyTests.length;
    document.getElementById('totalTests').textContent = totalTests;

    if (totalTests > 0) {
        // Sort by date descending
        const sortedTests = [...kidneyTests].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = sortedTests[0];

        // Latest creatinine
        const creatinineStatus = getCreatinineStatus(latest.creatinine);
        document.getElementById('latestCreatinine').textContent = `${latest.creatinine} mg/dL`;
        document.getElementById('creatinineStatus').textContent = creatinineStatus.message;
        document.getElementById('creatinineStatus').className = `metric-status ${creatinineStatus.color}`;

        // Latest GFR
        const gfrStage = getGFRStage(latest.gfr);
        document.getElementById('latestGFR').textContent = `${latest.gfr} mL/min`;
        document.getElementById('gfrStatus').textContent = `${gfrStage.label} (${gfrStage.range})`;
        document.getElementById('gfrStatus').className = `metric-status ${gfrStage.color}`;

        // Trend analysis
        if (totalTests >= 2) {
            const previous = sortedTests[1];
            const creatinineChange = latest.creatinine - previous.creatinine;
            const gfrChange = latest.gfr - previous.gfr;

            let trend = 'stable';
            let trendColor = 'normal';
            let trendMessage = 'Stable';

            if (creatinineChange > 0.1 || gfrChange < -5) {
                trend = 'worsening';
                trendColor = 'warning';
                trendMessage = 'Worsening';
            } else if (creatinineChange < -0.1 || gfrChange > 5) {
                trend = 'improving';
                trendColor = 'normal';
                trendMessage = 'Improving';
            }

            document.getElementById('trendDirection').textContent = trendMessage;
            document.getElementById('trendStatus').textContent = 'vs previous test';
            document.getElementById('trendStatus').className = `metric-status ${trendColor}`;
        }
    }
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'month') {
    const now = new Date();
    let filteredTests = kidneyTests;

    if (period === 'month') {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        filteredTests = kidneyTests.filter(t => new Date(t.date) >= threeMonthsAgo);
    } else if (period === '6months') {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        filteredTests = kidneyTests.filter(t => new Date(t.date) >= sixMonthsAgo);
    }

    // Sort by date descending
    filteredTests.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('testHistory');
    historyList.innerHTML = '';

    if (filteredTests.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No test results found for this period.</p>';
        return;
    }

    filteredTests.forEach(test => {
        const date = new Date(test.date).toLocaleDateString();
        const gfrStage = getGFRStage(test.gfr);

        const item = document.createElement('div');
        item.className = 'history-item';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-values">Cr: ${test.creatinine} mg/dL | GFR: ${test.gfr}</span>
                </div>
                <div class="history-details">
                    <span>Stage: <strong class="history-stage">${gfrStage.label}</strong></span>
                    ${test.bun ? `<br>BUN: ${test.bun} mg/dL` : ''}
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
    if (confirm('Are you sure you want to delete this test result?')) {
        kidneyTests = kidneyTests.filter(t => t.id !== id);
        localStorage.setItem('kidneyTests', JSON.stringify(kidneyTests));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('kidneyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (kidneyTests.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more test results to see trends', width / 2, height / 2);
        return;
    }

    // Simple dual-axis chart for creatinine and GFR
    const tests = kidneyTests.slice(-10).sort((a, b) => new Date(a.date) - new Date(b.date));

    const maxCreatinine = Math.max(...tests.map(t => t.creatinine));
    const minCreatinine = Math.min(...tests.map(t => t.creatinine));
    const maxGFR = Math.max(...tests.map(t => t.gfr));
    const minGFR = Math.min(...tests.map(t => t.gfr));

    // Creatinine line (blue)
    ctx.strokeStyle = '#4A90E2';
    ctx.lineWidth = 2;
    ctx.beginPath();

    tests.forEach((test, index) => {
        const x = (index / (tests.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((test.creatinine - minCreatinine) / (maxCreatinine - minCreatinine)) * (height - 40);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = '#4A90E2';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.stroke();

    // GFR line (green)
    ctx.strokeStyle = '#50C878';
    ctx.beginPath();

    tests.forEach((test, index) => {
        const x = (index / (tests.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((test.gfr - minGFR) / (maxGFR - minGFR)) * (height - 40);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = '#50C878';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.stroke();

    // Legend
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.fillText('Creatinine (mg/dL)', width - 120, 20);
    ctx.fillText('GFR (mL/min)', width - 120, 35);

    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(width - 140, 12, 12, 12);
    ctx.fillStyle = '#50C878';
    ctx.fillRect(width - 140, 27, 12, 12);
}

function updateInsights() {
    if (kidneyTests.length === 0) return;

    const sortedTests = [...kidneyTests].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedTests[0];
    const gfrStage = getGFRStage(latest.gfr);

    // Kidney stage
    const stageElement = document.getElementById('kidneyStage');
    stageElement.innerHTML = `
        <p>Your current kidney function is in <strong>${gfrStage.label}</strong> stage (GFR: ${gfrStage.range}).</p>
        <p><em>${gfrStage.description}</em></p>
    `;

    // Trend analysis
    const trendElement = document.getElementById('trendAnalysis');
    if (kidneyTests.length >= 2) {
        const previous = sortedTests[1];
        const creatinineChange = latest.creatinine - previous.creatinine;
        const gfrChange = latest.gfr - previous.gfr;
        const daysBetween = Math.round((new Date(latest.date) - new Date(previous.date)) / (1000 * 60 * 60 * 24));

        trendElement.innerHTML = `
            <p>Over the last ${daysBetween} days:</p>
            <ul>
                <li>Creatinine: ${creatinineChange >= 0 ? '+' : ''}${creatinineChange.toFixed(2)} mg/dL</li>
                <li>GFR: ${gfrChange >= 0 ? '+' : ''}${gfrChange} mL/min</li>
            </ul>
        `;
    }

    // Next checkup
    const checkupElement = document.getElementById('nextCheckup');
    const lastTestDate = new Date(latest.date);
    const nextCheckup = new Date(lastTestDate);
    nextCheckup.setMonth(nextCheckup.getMonth() + 3); // Recommend every 3 months

    checkupElement.innerHTML = `
        <p>Based on your last test, consider scheduling your next kidney function checkup around:</p>
        <p><strong>${nextCheckup.toLocaleDateString()}</strong></p>
        <p>Regular monitoring helps track changes and manage kidney health effectively.</p>
    `;
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

function renderGuidelines() {
    const guidelinesContainer = document.getElementById('guidelines');
    guidelinesContainer.innerHTML = '';

    HEALTH_GUIDELINES.forEach(guideline => {
        const guidelineElement = document.createElement('div');
        guidelineElement.className = 'guideline-item';
        guidelineElement.innerHTML = `
            <div class="guideline-icon">
                <i data-lucide="info"></i>
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