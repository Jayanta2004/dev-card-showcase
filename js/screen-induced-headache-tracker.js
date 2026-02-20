// Screen-Induced Headache Tracker JavaScript

let headacheEpisodes = JSON.parse(localStorage.getItem('headacheEpisodes')) || [];
let screenTimeEntries = JSON.parse(localStorage.getItem('screenTimeEntries')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDashboard();
    renderCorrelationChart();
    updateHistory();
});

function initializeApp() {
    // Set default date/time for headache form
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    document.getElementById('headacheDate').value = dateTimeString;

    // Set default date for screen time form
    const today = now.toISOString().split('T')[0];
    document.getElementById('screenDate').value = today;

    // Event listeners
    document.getElementById('headacheForm').addEventListener('submit', logHeadache);
    document.getElementById('screenTimeForm').addEventListener('submit', logScreenTime);

    // Severity slider
    document.getElementById('severity').addEventListener('input', updateSeverityValue);

    // Chart controls
    document.getElementById('viewDay').addEventListener('click', () => filterChart('day'));
    document.getElementById('viewWeek').addEventListener('click', () => filterChart('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterChart('month'));

    // History controls
    document.getElementById('sortRecent').addEventListener('click', () => sortHistory('recent'));
    document.getElementById('sortSevere').addEventListener('click', () => sortHistory('severe'));
    document.getElementById('sortScreenTime').addEventListener('click', () => sortHistory('screenTime'));
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

function updateSeverityValue() {
    const severity = document.getElementById('severity').value;
    document.querySelector('.severity-value').textContent = severity;
}

function logHeadache(e) {
    e.preventDefault();

    // Get headache types
    const types = [];
    if (document.getElementById('typeTension').checked) types.push('Tension');
    if (document.getElementById('typeMigraine').checked) types.push('Migraine');
    if (document.getElementById('typeCluster').checked) types.push('Cluster');
    if (document.getElementById('typeOther').checked) types.push('Other');

    // Get triggers
    const triggers = [];
    if (document.getElementById('triggerBrightness').checked) triggers.push('Bright screens');
    if (document.getElementById('triggerBlueLight').checked) triggers.push('Blue light');
    if (document.getElementById('triggerEyeStrain').checked) triggers.push('Eye strain');
    if (document.getElementById('triggerDehydration').checked) triggers.push('Dehydration');
    if (document.getElementById('triggerStress').checked) triggers.push('Work stress');
    if (document.getElementById('triggerSleep').checked) triggers.push('Poor sleep');

    const episode = {
        id: Date.now(),
        dateTime: document.getElementById('headacheDate').value,
        severity: parseInt(document.getElementById('severity').value),
        types: types,
        screenTime: parseFloat(document.getElementById('screenTime').value),
        screenType: document.getElementById('screenType').value,
        triggers: triggers,
        symptoms: document.getElementById('symptoms').value,
        relief: document.getElementById('relief').value,
        timestamp: new Date().toISOString()
    };

    headacheEpisodes.push(episode);
    localStorage.setItem('headacheEpisodes', JSON.stringify(headacheEpisodes));

    // Reset form
    document.getElementById('headacheForm').reset();
    document.getElementById('headacheDate').value = new Date().toISOString().slice(0, 16);
    updateSeverityValue();

    updateDashboard();
    renderCorrelationChart();
    updateHistory();

    // Show success message
    alert('Headache episode logged successfully!');
}

function logScreenTime(e) {
    e.preventDefault();

    // Get activities
    const activities = [];
    if (document.getElementById('activityWork').checked) activities.push('Work/Programming');
    if (document.getElementById('activityEntertainment').checked) activities.push('Entertainment');
    if (document.getElementById('activitySocial').checked) activities.push('Social Media');
    if (document.getElementById('activityGaming').checked) activities.push('Gaming');

    const entry = {
        id: Date.now(),
        date: document.getElementById('screenDate').value,
        hours: parseFloat(document.getElementById('screenHours').value),
        activities: activities,
        timestamp: new Date().toISOString()
    };

    screenTimeEntries.push(entry);
    localStorage.setItem('screenTimeEntries', JSON.stringify(screenTimeEntries));

    // Reset form
    document.getElementById('screenTimeForm').reset();
    document.getElementById('screenDate').value = new Date().toISOString().split('T')[0];

    updateDashboard();
    renderCorrelationChart();

    // Show success message
    alert('Screen time logged successfully!');
}

function updateDashboard() {
    if (headacheEpisodes.length === 0) return;

    // Sort by date descending
    const sortedEpisodes = [...headacheEpisodes].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    const latest = sortedEpisodes[0];

    // Current severity
    document.getElementById('currentSeverity').textContent = `${latest.severity}/10`;

    // Calculate severity trend
    if (sortedEpisodes.length >= 2) {
        const previous = sortedEpisodes[1];
        const trend = ((latest.severity - previous.severity) / previous.severity * 100).toFixed(1);
        document.getElementById('severityTrend').textContent = `${trend > 0 ? '+' : ''}${trend}% from last`;
        document.getElementById('severityTrend').className = `status-trend ${trend > 0 ? 'negative' : 'positive'}`;
    }

    // Today's screen time
    const today = new Date().toISOString().split('T')[0];
    const todayScreenTime = screenTimeEntries
        .filter(entry => entry.date === today)
        .reduce((total, entry) => total + entry.hours, 0);

    const hours = Math.floor(todayScreenTime);
    const minutes = Math.round((todayScreenTime - hours) * 60);
    document.getElementById('todayScreenTime').textContent = `${hours}h ${minutes}m`;

    // Screen time trend (compare to yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const yesterdayScreenTime = screenTimeEntries
        .filter(entry => entry.date === yesterdayString)
        .reduce((total, entry) => total + entry.hours, 0);

    if (yesterdayScreenTime > 0) {
        const trend = ((todayScreenTime - yesterdayScreenTime) / yesterdayScreenTime * 100).toFixed(1);
        document.getElementById('screenTimeTrend').textContent = `${trend > 0 ? '+' : ''}${trend}% from yesterday`;
        document.getElementById('screenTimeTrend').className = `status-trend ${trend > 0 ? 'negative' : 'positive'}`;
    }

    // Correlation score
    const correlation = calculateCorrelation();
    document.getElementById('correlationScore').textContent = `${Math.abs(correlation * 100).toFixed(0)}%`;

    if (Math.abs(correlation) > 0.7) {
        document.getElementById('correlationTrend').textContent = 'Strong correlation detected';
    } else if (Math.abs(correlation) > 0.5) {
        document.getElementById('correlationTrend').textContent = 'Moderate correlation';
    } else if (Math.abs(correlation) > 0.3) {
        document.getElementById('correlationTrend').textContent = 'Weak correlation';
    } else {
        document.getElementById('correlationTrend').textContent = 'No significant correlation';
    }

    // Headache count
    document.getElementById('headacheCount').textContent = headacheEpisodes.length;

    // Headaches this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const headachesThisWeek = headacheEpisodes.filter(h => new Date(h.dateTime) >= oneWeekAgo).length;
    document.getElementById('headacheFrequency').textContent = `This week: ${headachesThisWeek}`;
}

function calculateCorrelation() {
    if (headacheEpisodes.length < 3) return 0;

    // Get screen time data for the same days as headaches
    const dataPoints = headacheEpisodes.map(episode => {
        const episodeDate = new Date(episode.dateTime).toISOString().split('T')[0];
        const dayScreenTime = screenTimeEntries
            .filter(entry => entry.date === episodeDate)
            .reduce((total, entry) => total + entry.hours, 0);

        return {
            screenTime: dayScreenTime,
            severity: episode.severity
        };
    }).filter(point => point.screenTime > 0);

    if (dataPoints.length < 3) return 0;

    const screenTimes = dataPoints.map(p => p.screenTime);
    const severities = dataPoints.map(p => p.severity);

    return calculatePearsonCorrelation(screenTimes, severities);
}

function calculatePearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
}

function filterChart(period) {
    // Update button states
    document.querySelectorAll('.chart-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    renderCorrelationChart(period);
}

function renderCorrelationChart(period = 'day') {
    const canvas = document.getElementById('correlationChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    // Filter data based on period
    let filteredHeadaches = headacheEpisodes;
    const now = new Date();

    if (period === 'day') {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filteredHeadaches = headacheEpisodes.filter(h => new Date(h.dateTime) >= oneDayAgo);
    } else if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHeadaches = headacheEpisodes.filter(h => new Date(h.dateTime) >= oneWeekAgo);
    } else if (period === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredHeadaches = headacheEpisodes.filter(h => new Date(h.dateTime) >= oneMonthAgo);
    }

    if (filteredHeadaches.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more data points to see correlation analysis', width / 2, height / 2);
        updateCorrelationInsights('Need more data points for meaningful analysis.');
        return;
    }

    // Prepare data points
    const dataPoints = filteredHeadaches.map(episode => {
        const episodeDate = new Date(episode.dateTime).toISOString().split('T')[0];
        const dayScreenTime = screenTimeEntries
            .filter(entry => entry.date === episodeDate)
            .reduce((total, entry) => total + entry.hours, 0);

        return {
            screenTime: dayScreenTime,
            severity: episode.severity,
            date: episodeDate
        };
    }).filter(point => point.screenTime > 0);

    if (dataPoints.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Need screen time data for the same days as headaches', width / 2, height / 2);
        updateCorrelationInsights('Log screen time for days when you experience headaches.');
        return;
    }

    // Draw scatter plot
    const maxScreenTime = Math.max(...dataPoints.map(p => p.screenTime));
    const maxSeverity = 10; // Scale of 1-10

    // Draw points
    dataPoints.forEach(point => {
        const x = 60 + (point.screenTime / maxScreenTime) * (width - 120);
        const y = height - 60 - (point.severity / maxSeverity) * (height - 120);

        // Color based on severity
        let color = '#28a745'; // green for mild
        if (point.severity >= 7) color = '#dc3545'; // red for severe
        else if (point.severity >= 5) color = '#ffc107'; // yellow for moderate

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Add stroke
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw axes
    ctx.strokeStyle = 'var(--text-secondary)';
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 50, height - 50);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'var(--text-primary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Screen Time (hours)', width / 2, height - 20);

    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Headache Severity (1-10)', 0, 0);
    ctx.restore();

    // Axis values
    ctx.textAlign = 'center';
    ctx.fillText('0', 50, height - 35);
    ctx.fillText(maxScreenTime.toFixed(1), width - 50, height - 35);

    ctx.textAlign = 'right';
    ctx.fillText('1', 45, height - 55);
    ctx.fillText('10', 45, 60);

    // Calculate and display correlation
    const correlation = calculatePearsonCorrelation(
        dataPoints.map(p => p.screenTime),
        dataPoints.map(p => p.severity)
    );

    updateCorrelationInsights(correlation, dataPoints.length);
}

function updateCorrelationInsights(correlation, dataPoints = 0) {
    const insightsElement = document.getElementById('correlationInsights');

    if (dataPoints < 2) {
        insightsElement.innerHTML = '<p>Log more data points to see correlation analysis.</p>';
        return;
    }

    const correlationStrength = Math.abs(correlation);
    let strengthText = '';
    let advice = '';

    if (correlationStrength > 0.7) {
        strengthText = 'Strong correlation';
        advice = correlation > 0 ?
            'Consider reducing screen time to prevent headaches.' :
            'Your headaches may not be primarily screen-related.';
    } else if (correlationStrength > 0.5) {
        strengthText = 'Moderate correlation';
        advice = 'Monitor screen time patterns and headache occurrences.';
    } else if (correlationStrength > 0.3) {
        strengthText = 'Weak correlation';
        advice = 'Other factors may be contributing to your headaches.';
    } else {
        strengthText = 'No significant correlation';
        advice = 'Focus on other potential headache triggers.';
    }

    insightsElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <strong>${strengthText}</strong> (${(correlation * 100).toFixed(1)}% correlation coefficient)
        </div>
        <p>${advice}</p>
        <small>Based on ${dataPoints} data points</small>
    `;
}

function sortHistory(criteria) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`sort${criteria.charAt(0).toUpperCase() + criteria.slice(1)}`).classList.add('active');

    updateHistory(criteria);
}

function updateHistory(sortBy = 'recent') {
    const historyList = document.getElementById('headacheHistory');
    historyList.innerHTML = '';

    if (headacheEpisodes.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i data-lucide="inbox"></i>
                <p>No headache episodes logged yet. Start tracking to identify patterns with screen usage.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Sort episodes
    let sortedEpisodes = [...headacheEpisodes];

    if (sortBy === 'recent') {
        sortedEpisodes.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    } else if (sortBy === 'severe') {
        sortedEpisodes.sort((a, b) => b.severity - a.severity);
    } else if (sortBy === 'screenTime') {
        sortedEpisodes.sort((a, b) => b.screenTime - a.screenTime);
    }

    sortedEpisodes.forEach(episode => {
        const dateTime = new Date(episode.dateTime).toLocaleString();
        const severityClass = episode.severity >= 7 ? 'severe' : episode.severity >= 5 ? 'moderate' : 'mild';

        const item = document.createElement('div');
        item.className = 'history-item';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${dateTime}</span>
                    <span class="history-severity ${severityClass}">Severity: ${episode.severity}/10</span>
                </div>
                <div class="history-details">
                    <strong>Type:</strong> ${episode.types.join(', ') || 'Not specified'} |
                    <strong>Screen Time:</strong> ${episode.screenTime}h |
                    <strong>Screen Type:</strong> ${episode.screenType}
                    ${episode.triggers.length > 0 ? `<br><strong>Triggers:</strong> ${episode.triggers.join(', ')}` : ''}
                    ${episode.symptoms ? `<br><strong>Symptoms:</strong> ${episode.symptoms}` : ''}
                    ${episode.relief ? `<br><strong>Relief:</strong> ${episode.relief}` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn btn-small btn-secondary" onclick="deleteEpisode(${episode.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteEpisode(id) {
    if (confirm('Are you sure you want to delete this headache episode?')) {
        headacheEpisodes = headacheEpisodes.filter(h => h.id !== id);
        localStorage.setItem('headacheEpisodes', JSON.stringify(headacheEpisodes));
        updateDashboard();
        renderCorrelationChart();
        updateHistory();
    }
}