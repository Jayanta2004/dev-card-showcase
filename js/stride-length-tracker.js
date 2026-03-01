// Stride Length Tracker JavaScript

let runningSessions = JSON.parse(localStorage.getItem('runningSessions')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDashboard();
    renderChart();
    renderCorrelationChart();
    updateHistory();
});

function initializeApp() {
    // Set default date and time to now
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeString = now.toTimeString().slice(0, 5);

    document.getElementById('sessionDate').value = today;
    document.getElementById('sessionTime').value = timeString;

    // Event listeners
    document.getElementById('sessionForm').addEventListener('submit', logSession);

    // Chart controls
    document.getElementById('viewWeek').addEventListener('click', () => filterChart('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterChart('month'));
    document.getElementById('viewQuarter').addEventListener('click', () => filterChart('quarter'));
    document.getElementById('viewAll').addEventListener('click', () => filterChart('all'));

    // History controls
    document.getElementById('sortDate').addEventListener('click', () => sortHistory('date'));
    document.getElementById('sortStride').addEventListener('click', () => sortHistory('stride'));
    document.getElementById('sortPace').addEventListener('click', () => sortHistory('pace'));
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

function logSession(e) {
    e.preventDefault();

    const session = {
        id: Date.now(),
        date: document.getElementById('sessionDate').value,
        time: document.getElementById('sessionTime').value,
        distance: parseFloat(document.getElementById('distance').value),
        duration: parseFloat(document.getElementById('duration').value),
        strideLength: parseFloat(document.getElementById('strideLength').value),
        cadence: parseInt(document.getElementById('cadence').value),
        effortLevel: parseInt(document.getElementById('effortLevel').value),
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    // Calculate derived metrics
    session.pace = calculatePace(session.distance, session.duration); // minutes per km
    session.speed = session.distance / (session.duration / 60); // km/h
    session.efficiency = session.strideLength * session.cadence / 100; // stride efficiency score

    runningSessions.push(session);
    localStorage.setItem('runningSessions', JSON.stringify(runningSessions));

    // Reset form
    document.getElementById('sessionForm').reset();
    document.getElementById('sessionDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('sessionTime').value = new Date().toTimeString().slice(0, 5);

    updateDashboard();
    renderChart();
    renderCorrelationChart();
    updateHistory();

    // Show success message
    alert('Running session logged successfully!');
}

function calculatePace(distance, duration) {
    // Return pace in minutes per km
    return duration / distance;
}

function formatPace(pace) {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateDashboard() {
    if (runningSessions.length === 0) return;

    // Sort by date descending
    const sortedSessions = [...runningSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedSessions[0];

    // Current stats
    document.getElementById('currentStride').textContent = `${latest.strideLength.toFixed(2)} m`;
    document.getElementById('currentPace').textContent = formatPace(latest.pace);
    document.getElementById('efficiencyScore').textContent = latest.efficiency.toFixed(1);
    document.getElementById('sessionsCount').textContent = runningSessions.length;

    // Calculate changes
    if (sortedSessions.length >= 2) {
        const previous = sortedSessions[1];
        const strideChange = ((latest.strideLength - previous.strideLength) / previous.strideLength * 100).toFixed(1);
        const paceChange = ((previous.pace - latest.pace) / previous.pace * 100).toFixed(1); // Lower pace is better
        const efficiencyChange = ((latest.efficiency - previous.efficiency) / previous.efficiency * 100).toFixed(1);

        document.getElementById('strideChange').textContent = `${strideChange > 0 ? '+' : ''}${strideChange}%`;
        document.getElementById('strideChange').className = `stat-change ${strideChange > 0 ? 'positive' : 'negative'}`;

        document.getElementById('paceChange').textContent = `${paceChange > 0 ? '+' : ''}${paceChange}%`;
        document.getElementById('paceChange').className = `stat-change ${paceChange > 0 ? 'positive' : 'negative'}`;

        document.getElementById('efficiencyChange').textContent = `${efficiencyChange > 0 ? '+' : ''}${efficiencyChange}%`;
        document.getElementById('efficiencyChange').className = `stat-change ${efficiencyChange > 0 ? 'positive' : 'negative'}`;
    }

    // Sessions this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const sessionsThisWeek = runningSessions.filter(s => new Date(s.date) >= oneWeekAgo).length;
    document.getElementById('sessionsThisWeek').textContent = `This week: ${sessionsThisWeek}`;
}

function filterChart(period) {
    // Update button states
    document.querySelectorAll('.chart-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    renderChart(period);
}

function renderChart(period = 'week') {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    if (runningSessions.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Log more sessions to see performance trends', width / 2, height / 2);
        return;
    }

    // Filter sessions by period
    let filteredSessions = runningSessions;
    const now = new Date();

    if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = runningSessions.filter(s => new Date(s.date) >= oneWeekAgo);
    } else if (period === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredSessions = runningSessions.filter(s => new Date(s.date) >= oneMonthAgo);
    } else if (period === 'quarter') {
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filteredSessions = runningSessions.filter(s => new Date(s.date) >= threeMonthsAgo);
    }

    // Sort by date
    filteredSessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredSessions.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Not enough data for this period', width / 2, height / 2);
        return;
    }

    // Draw stride length line (blue)
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const maxStride = Math.max(...filteredSessions.map(s => s.strideLength));
    const minStride = Math.min(...filteredSessions.map(s => s.strideLength));

    filteredSessions.forEach((session, index) => {
        const x = (index / (filteredSessions.length - 1)) * (width - 60) + 30;
        const y = height - 30 - ((session.strideLength - minStride) / (maxStride - minStride)) * (height - 60);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw pace line (red) - inverted scale (lower is better)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    const maxPace = Math.max(...filteredSessions.map(s => s.pace));
    const minPace = Math.min(...filteredSessions.map(s => s.pace));

    filteredSessions.forEach((session, index) => {
        const x = (index / (filteredSessions.length - 1)) * (width - 60) + 30;
        const y = height - 30 - ((maxPace - session.pace) / (maxPace - minPace)) * (height - 60); // Inverted

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
    ctx.setLineDash([]);

    // Add labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.fillText('Stride Length (blue) & Pace (red, inverted)', width / 2, height - 10);
}

function renderCorrelationChart() {
    const canvas = document.getElementById('correlationChart');
    if (!canvas || runningSessions.length < 3) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Calculate correlation between stride length and pace
    const strides = runningSessions.map(s => s.strideLength);
    const paces = runningSessions.map(s => s.pace);

    const correlation = calculateCorrelation(strides, paces);

    // Simple scatter plot
    const maxStride = Math.max(...strides);
    const minStride = Math.min(...strides);
    const maxPace = Math.max(...paces);
    const minPace = Math.min(...paces);

    ctx.fillStyle = '#3498db';
    runningSessions.forEach(session => {
        const x = 20 + ((session.strideLength - minStride) / (maxStride - minStride)) * (width - 40);
        const y = height - 20 - ((session.pace - minPace) / (maxPace - minPace)) * (height - 40);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Update correlation insight
    const correlationElement = document.getElementById('correlationInsight');
    if (Math.abs(correlation) > 0.5) {
        correlationElement.textContent = `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation (${correlation.toFixed(2)}) between stride length and pace.`;
    } else if (Math.abs(correlation) > 0.3) {
        correlationElement.textContent = `Moderate ${correlation > 0 ? 'positive' : 'negative'} correlation (${correlation.toFixed(2)}) between stride length and pace.`;
    } else {
        correlationElement.textContent = `Weak correlation (${correlation.toFixed(2)}) between stride length and pace. Focus on consistent form.`;
    }

    // Update efficiency insight
    const efficiencyElement = document.getElementById('efficiencyInsight');
    if (runningSessions.length > 0) {
        const avgEfficiency = runningSessions.reduce((sum, s) => sum + s.efficiency, 0) / runningSessions.length;
        document.getElementById('currentEfficiency').textContent = avgEfficiency.toFixed(2);

        if (avgEfficiency > 2.0) {
            efficiencyElement.textContent = 'Excellent efficiency! Your stride length and cadence are well optimized.';
        } else if (avgEfficiency > 1.5) {
            efficiencyElement.textContent = 'Good efficiency. Consider increasing cadence or stride length gradually.';
        } else {
            efficiencyElement.textContent = 'Room for improvement. Focus on quicker, lighter steps.';
        }
    }
}

function calculateCorrelation(x, y) {
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

function sortHistory(criteria) {
    // Update button states
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`sort${criteria.charAt(0).toUpperCase() + criteria.slice(1)}`).classList.add('active');

    updateHistory(criteria);
}

function updateHistory(sortBy = 'date') {
    const historyList = document.getElementById('sessionHistory');
    historyList.innerHTML = '';

    if (runningSessions.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i data-lucide="inbox"></i>
                <p>No running sessions logged yet. Start tracking your stride length!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Sort sessions
    let sortedSessions = [...runningSessions];

    if (sortBy === 'date') {
        sortedSessions.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    } else if (sortBy === 'stride') {
        sortedSessions.sort((a, b) => b.strideLength - a.strideLength);
    } else if (sortBy === 'pace') {
        sortedSessions.sort((a, b) => a.pace - b.pace); // Lower pace is better
    }

    sortedSessions.forEach(session => {
        const date = new Date(session.date).toLocaleDateString();
        const time = session.time;

        const item = document.createElement('div');
        item.className = 'history-item';

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-header">
                    <span class="history-date">${date} ${time}</span>
                    <div class="history-metrics">
                        <span class="history-metric">Stride: <strong>${session.strideLength.toFixed(2)}m</strong></span>
                        <span class="history-metric">Pace: <strong>${formatPace(session.pace)}</strong></span>
                        <span class="history-metric">Distance: <strong>${session.distance}km</strong></span>
                    </div>
                </div>
                <div class="history-details">
                    Cadence: ${session.cadence} spm | Duration: ${session.duration} min | Effort: ${session.effortLevel}/6
                    ${session.notes ? `<br><em>${session.notes}</em>` : ''}
                </div>
            </div>
            <div class="history-actions">
                <button class="btn btn-small btn-secondary" onclick="deleteSession(${session.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(item);
    });
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this running session?')) {
        runningSessions = runningSessions.filter(s => s.id !== id);
        localStorage.setItem('runningSessions', JSON.stringify(runningSessions));
        updateDashboard();
        renderChart();
        renderCorrelationChart();
        updateHistory();
    }
}