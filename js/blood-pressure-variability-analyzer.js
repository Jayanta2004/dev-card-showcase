// Blood Pressure Variability Analyzer JavaScript

let bpReadings = JSON.parse(localStorage.getItem('bpReadings')) || [];

// BP Categories
const BP_CATEGORIES = [
    {
        name: 'Normal',
        systolic: { min: 0, max: 120 },
        diastolic: { min: 0, max: 80 },
        class: 'normal',
        description: 'Blood pressure is within the normal range.'
    },
    {
        name: 'Elevated',
        systolic: { min: 120, max: 130 },
        diastolic: { min: 0, max: 80 },
        class: 'elevated',
        description: 'Systolic pressure is between 120-129 mmHg and diastolic is less than 80 mmHg.'
    },
    {
        name: 'High Blood Pressure Stage 1',
        systolic: { min: 130, max: 140 },
        diastolic: { min: 80, max: 90 },
        class: 'high',
        description: 'Systolic is 130-139 mmHg or diastolic is 80-89 mmHg.'
    },
    {
        name: 'High Blood Pressure Stage 2',
        systolic: { min: 140, max: 180 },
        diastolic: { min: 90, max: 120 },
        class: 'high',
        description: 'Systolic is 140 mmHg or higher, or diastolic is 90 mmHg or higher.'
    },
    {
        name: 'Hypertensive Crisis',
        systolic: { min: 180, max: 999 },
        diastolic: { min: 120, max: 999 },
        class: 'crisis',
        description: 'Systolic is higher than 180 mmHg and/or diastolic is higher than 120 mmHg. Seek immediate medical attention.'
    }
];

// Health recommendations
const HEALTH_RECOMMENDATIONS = [
    {
        title: 'Monitor Regularly',
        text: 'Take readings at the same time each day for consistent tracking.'
    },
    {
        title: 'Proper Technique',
        text: 'Sit quietly for 5 minutes before measuring, keep feet flat on floor, and arm at heart level.'
    },
    {
        title: 'Lifestyle Factors',
        text: 'Track readings before and after exercise, meals, stress, or medication to identify patterns.'
    },
    {
        title: 'Medical Consultation',
        text: 'Share your readings and patterns with your healthcare provider for personalized advice.'
    },
    {
        title: 'Home Monitoring',
        text: 'Regular home monitoring can help detect issues early and guide treatment decisions.'
    },
    {
        title: 'Medication Adherence',
        text: 'If prescribed medication, track readings before and after doses to monitor effectiveness.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderCategories();
    renderRecommendations();
});

function initializeApp() {
    // Set default date and time
    const now = new Date();
    document.getElementById('bpDate').value = now.toISOString().split('T')[0];
    document.getElementById('bpTime').value = now.toTimeString().slice(0, 5);

    // Event listeners
    document.getElementById('bpForm').addEventListener('submit', logBPReading);

    // History controls
    document.getElementById('viewDay').addEventListener('click', () => filterHistory('day'));
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
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

function logBPReading(e) {
    e.preventDefault();

    const reading = {
        id: Date.now(),
        date: document.getElementById('bpDate').value,
        time: document.getElementById('bpTime').value,
        systolic: parseInt(document.getElementById('systolic').value),
        diastolic: parseInt(document.getElementById('diastolic').value),
        type: document.getElementById('measurementType').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString(),
        category: getBPCategory(
            parseInt(document.getElementById('systolic').value),
            parseInt(document.getElementById('diastolic').value)
        )
    };

    bpReadings.push(reading);
    localStorage.setItem('bpReadings', JSON.stringify(bpReadings));

    // Reset form
    document.getElementById('bpForm').reset();
    const now = new Date();
    document.getElementById('bpDate').value = now.toISOString().split('T')[0];
    document.getElementById('bpTime').value = now.toTimeString().slice(0, 5);

    updateDisplay();

    // Show success message
    alert('Blood pressure reading logged successfully!');
}

function getBPCategory(systolic, diastolic) {
    for (const category of BP_CATEGORIES) {
        if (systolic >= category.systolic.min && systolic < category.systolic.max &&
            diastolic >= category.diastolic.min && diastolic < category.diastolic.max) {
            return category.name;
        }
    }
    return 'Unknown';
}

function updateDisplay() {
    updateCurrentStatus();
    updateMetrics();
    updateHistory();
    updateChart();
    updateInsights();
}

function updateCurrentStatus() {
    const latestReading = bpReadings[bpReadings.length - 1];

    if (latestReading) {
        document.getElementById('currentReading').innerHTML = `
            <div class="reading-value">${latestReading.systolic}/${latestReading.diastolic}</div>
            <div class="reading-time">${new Date(latestReading.timestamp).toLocaleString()}</div>
        `;

        // Today's range
        const today = new Date().toISOString().split('T')[0];
        const todayReadings = bpReadings.filter(r => r.date === today);
        if (todayReadings.length > 0) {
            const systolicValues = todayReadings.map(r => r.systolic);
            const diastolicValues = todayReadings.map(r => r.diastolic);
            const systolicRange = `${Math.min(...systolicValues)}-${Math.max(...systolicValues)}`;
            const diastolicRange = `${Math.min(...diastolicValues)}-${Math.max(...diastolicValues)}`;
            document.getElementById('todayRange').textContent = `${systolicRange}/${diastolicRange}`;
        }

        // Variability calculation
        if (todayReadings.length >= 2) {
            const systolicValues = todayReadings.map(r => r.systolic);
            const diastolicValues = todayReadings.map(r => r.diastolic);
            const systolicVariability = Math.max(...systolicValues) - Math.min(...systolicValues);
            const diastolicVariability = Math.max(...diastolicValues) - Math.min(...diastolicValues);
            document.getElementById('variability').textContent = `${systolicVariability}/${diastolicVariability}`;
        }

        // Risk level
        const riskLevel = getRiskLevel(latestReading.systolic, latestReading.diastolic);
        document.getElementById('riskLevel').textContent = riskLevel;

        // Generate alerts
        generateAlerts(latestReading);
    }
}

function getRiskLevel(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) return 'Crisis';
    if (systolic >= 140 || diastolic >= 90) return 'High';
    if (systolic >= 130 || diastolic >= 80) return 'Elevated';
    return 'Normal';
}

function generateAlerts(latestReading) {
    const alertsSection = document.getElementById('alertsSection');
    alertsSection.innerHTML = '';

    const alerts = [];

    // Crisis alert
    if (latestReading.systolic >= 180 || latestReading.diastolic >= 120) {
        alerts.push({
            type: 'danger',
            title: 'Hypertensive Crisis',
            text: 'Seek immediate medical attention. This is a medical emergency.'
        });
    }

    // High variability alert
    const today = new Date().toISOString().split('T')[0];
    const todayReadings = bpReadings.filter(r => r.date === today);
    if (todayReadings.length >= 3) {
        const systolicValues = todayReadings.map(r => r.systolic);
        const systolicRange = Math.max(...systolicValues) - Math.min(...systolicValues);
        if (systolicRange > 30) {
            alerts.push({
                type: 'warning',
                title: 'High Variability Detected',
                text: 'Your blood pressure has varied significantly today. Monitor closely and consult your doctor.'
            });
        }
    }

    // Medication timing alert
    if (latestReading.type === 'before-medication' && bpReadings.length > 1) {
        const previousReading = bpReadings[bpReadings.length - 2];
        if (previousReading.type === 'after-medication' &&
            Math.abs(latestReading.systolic - previousReading.systolic) < 10) {
            alerts.push({
                type: 'info',
                title: 'Medication Effectiveness',
                text: 'Consider discussing medication dosage or timing with your healthcare provider.'
            });
        }
    }

    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${alert.type}`;
        alertElement.innerHTML = `
            <div class="alert-icon">
                <i data-lucide="alert-triangle"></i>
            </div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.text}</p>
            </div>
        `;
        alertsSection.appendChild(alertElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}

function updateMetrics() {
    const totalReadings = bpReadings.length;
    document.getElementById('totalReadings').textContent = totalReadings;

    if (totalReadings > 0) {
        const avgSystolic = Math.round(bpReadings.reduce((sum, r) => sum + r.systolic, 0) / totalReadings);
        const avgDiastolic = Math.round(bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / totalReadings);
        document.getElementById('avgSystolic').textContent = avgSystolic;
        document.getElementById('avgDiastolic').textContent = avgDiastolic;

        // Variability index (coefficient of variation)
        if (totalReadings >= 3) {
            const systolicValues = bpReadings.map(r => r.systolic);
            const systolicMean = systolicValues.reduce((sum, val) => sum + val, 0) / systolicValues.length;
            const systolicStd = Math.sqrt(systolicValues.reduce((sum, val) => sum + Math.pow(val - systolicMean, 2), 0) / systolicValues.length);
            const variabilityIndex = Math.round((systolicStd / systolicMean) * 100);
            document.getElementById('variabilityIndex').textContent = `${variabilityIndex}%`;
        }
    }
}

function filterHistory(period) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateHistory(period = 'day') {
    const now = new Date();
    let filteredReadings = bpReadings;

    if (period === 'day') {
        const today = now.toISOString().split('T')[0];
        filteredReadings = bpReadings.filter(r => r.date === today);
    } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredReadings = bpReadings.filter(r => new Date(r.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredReadings = bpReadings.filter(r => new Date(r.date) >= monthAgo);
    }

    // Sort by timestamp descending
    filteredReadings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyList = document.getElementById('bpHistory');
    historyList.innerHTML = '';

    if (filteredReadings.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No readings found for this period.</p>';
        return;
    }

    filteredReadings.forEach(reading => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(reading.timestamp).toLocaleDateString();
        const time = new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const categoryClass = reading.category.toLowerCase().replace(/\s+/g, '-');

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date}</span>
                    <span class="history-time">${time}</span>
                </div>
                <div class="history-details">
                    <span class="history-bp">${reading.systolic}/${reading.diastolic} mmHg</span> |
                    <span>${reading.type.replace('-', ' ')}</span> |
                    <span class="category-${categoryClass}">${reading.category}</span>
                    ${reading.notes ? `<br><em>${reading.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-small btn-secondary" onclick="deleteReading(${reading.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteReading(id) {
    if (confirm('Are you sure you want to delete this reading?')) {
        bpReadings = bpReadings.filter(r => r.id !== id);
        localStorage.setItem('bpReadings', JSON.stringify(bpReadings));
        updateDisplay();
    }
}

function updateChart() {
    const canvas = document.getElementById('bpChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (bpReadings.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more readings to see variability trends', width / 2, height / 2);
        return;
    }

    // Simple line chart for BP over time
    const readings = bpReadings.slice(-20); // Last 20 readings
    const maxSystolic = Math.max(...readings.map(r => r.systolic));
    const minSystolic = Math.min(...readings.map(r => r.systolic));
    const maxDiastolic = Math.max(...readings.map(r => r.diastolic));
    const minDiastolic = Math.min(...readings.map(r => r.diastolic));

    const systolicScale = (height - 40) / (maxSystolic - minSystolic || 1);
    const diastolicScale = (height - 40) / (maxDiastolic - minDiastolic || 1);

    // Systolic line
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();

    readings.forEach((reading, index) => {
        const x = (index / (readings.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((reading.systolic - minSystolic) * systolicScale);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Diastolic line
    ctx.strokeStyle = '#007bff';
    ctx.beginPath();

    readings.forEach((reading, index) => {
        const x = (index / (readings.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((reading.diastolic - minDiastolic) * diastolicScale);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Add labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Recent Readings', width / 2, height - 5);
}

function updateInsights() {
    // Daily patterns
    const patternsElement = document.getElementById('dailyPatterns');
    const morningReadings = bpReadings.filter(r => r.type === 'morning');
    const eveningReadings = bpReadings.filter(r => r.type === 'evening');

    if (morningReadings.length >= 3 && eveningReadings.length >= 3) {
        const avgMorningSystolic = morningReadings.reduce((sum, r) => sum + r.systolic, 0) / morningReadings.length;
        const avgEveningSystolic = eveningReadings.reduce((sum, r) => sum + r.systolic, 0) / eveningReadings.length;

        if (avgEveningSystolic > avgMorningSystolic + 10) {
            patternsElement.innerHTML = `<p>Your blood pressure tends to be higher in the evening. Consider evening monitoring and relaxation techniques.</p>`;
        } else {
            patternsElement.innerHTML = `<p>Your blood pressure shows consistent patterns throughout the day.</p>`;
        }
    }

    // Risk factors
    const riskElement = document.getElementById('riskFactors');
    const stressReadings = bpReadings.filter(r => r.type === 'stress');
    if (stressReadings.length >= 2) {
        const avgStressSystolic = stressReadings.reduce((sum, r) => sum + r.systolic, 0) / stressReadings.length;
        const avgNormalSystolic = bpReadings.filter(r => r.type !== 'stress').reduce((sum, r) => sum + r.systolic, 0) / bpReadings.filter(r => r.type !== 'stress').length;

        if (avgStressSystolic > avgNormalSystolic + 15) {
            riskElement.innerHTML = `<p>Stress significantly elevates your blood pressure. Consider stress management techniques.</p>`;
        }
    }

    // Medication response
    const medElement = document.getElementById('medicationResponse');
    const beforeMed = bpReadings.filter(r => r.type === 'before-medication');
    const afterMed = bpReadings.filter(r => r.type === 'after-medication');

    if (beforeMed.length >= 2 && afterMed.length >= 2) {
        const avgBefore = beforeMed.reduce((sum, r) => sum + r.systolic, 0) / beforeMed.length;
        const avgAfter = afterMed.reduce((sum, r) => sum + r.systolic, 0) / afterMed.length;
        const reduction = avgBefore - avgAfter;

        if (reduction > 20) {
            medElement.innerHTML = `<p>Your medication shows good effectiveness with an average reduction of ${Math.round(reduction)} mmHg.</p>`;
        } else if (reduction < 10) {
            medElement.innerHTML = `<p>Discuss medication effectiveness with your doctor - reduction appears limited.</p>`;
        }
    }
}

function renderCategories() {
    const categoriesContainer = document.getElementById('categories');
    categoriesContainer.innerHTML = '';

    BP_CATEGORIES.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = `category-item ${category.class}`;
        categoryElement.innerHTML = `
            <h4>${category.name}</h4>
            <p>${category.description}</p>
        `;
        categoriesContainer.appendChild(categoryElement);
    });
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