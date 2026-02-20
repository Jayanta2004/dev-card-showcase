let allergyEpisodes = JSON.parse(localStorage.getItem('allergyEpisodes')) || [];

// Simulated environmental data
let environmentalData = {
    pollenLevel: 'Low',
    airQuality: 'Good',
    temperature: 22,
    humidity: 65
};

const allergyTips = [
    "Keep windows closed during high pollen seasons and use air conditioning with HEPA filters.",
    "Wash bedding in hot water weekly and use allergen-proof covers on mattresses and pillows.",
    "Shower and change clothes after spending time outdoors to remove pollen.",
    "Avoid known food triggers and read ingredient labels carefully.",
    "Use saline nasal rinses to clear nasal passages and reduce congestion.",
    "Keep pets out of bedrooms if you're allergic to pet dander.",
    "Clean floors with a damp mop rather than sweeping to avoid stirring up dust.",
    "Use a dehumidifier to keep indoor humidity below 50% to prevent mold growth.",
    "Avoid smoking and secondhand smoke which can worsen allergy symptoms.",
    "Track your symptoms daily to identify patterns and triggers more easily."
];

function refreshEnvironment() {
    // Simulate environmental changes
    const pollenLevels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    const airQualities = ['Excellent', 'Good', 'Moderate', 'Poor', 'Very Poor'];

    environmentalData.pollenLevel = pollenLevels[Math.floor(Math.random() * pollenLevels.length)];
    environmentalData.airQuality = airQualities[Math.floor(Math.random() * airQualities.length)];
    environmentalData.temperature = Math.round((15 + Math.random() * 20) * 10) / 10; // 15-35°C
    environmentalData.humidity = Math.round(30 + Math.random() * 50); // 30-80%

    updateEnvironmentalDisplay();
    updateAlerts();
}

function updateEnvironmentalDisplay() {
    document.getElementById('pollenLevel').textContent = environmentalData.pollenLevel;
    document.getElementById('airQuality').textContent = environmentalData.airQuality;
    document.getElementById('temperature').textContent = `${environmentalData.temperature}°C`;
    document.getElementById('humidity').textContent = `${environmentalData.humidity}%`;

    // Update colors based on levels
    const pollenEl = document.getElementById('pollenLevel');
    const airEl = document.getElementById('airQuality');

    // Reset classes
    pollenEl.className = '';
    airEl.className = '';

    // Add appropriate classes
    if (environmentalData.pollenLevel === 'High' || environmentalData.pollenLevel === 'Very High') {
        pollenEl.className = 'high-risk';
    }
    if (environmentalData.airQuality === 'Poor' || environmentalData.airQuality === 'Very Poor') {
        airEl.className = 'high-risk';
    }
}

function updateSeverityValue() {
    document.getElementById('severityValue').textContent = document.getElementById('symptomSeverity').value;
}

function logSymptoms() {
    const severity = parseInt(document.getElementById('symptomSeverity').value);
    const primarySymptom = document.getElementById('primarySymptom').value;
    const duration = parseFloat(document.getElementById('symptomDuration').value);
    const dateTime = document.getElementById('symptomDateTime').value;

    // Get selected triggers
    const triggerCheckboxes = document.querySelectorAll('.trigger-checkboxes input:checked');
    const triggers = Array.from(triggerCheckboxes).map(cb => cb.value);

    // Get medication info
    const medicationName = document.getElementById('medicationName').value.trim();
    const medicationDosage = document.getElementById('medicationDosage').value;
    const medicationTiming = document.getElementById('medicationTiming').value;

    const medication = medicationName ? {
        name: medicationName,
        dosage: medicationDosage,
        timing: medicationTiming
    } : null;

    const notes = document.getElementById('notes').value;

    if (!dateTime) {
        alert('Please select a date and time');
        return;
    }

    const episode = {
        severity,
        primarySymptom,
        duration,
        dateTime,
        triggers,
        medication,
        notes,
        environmentalData: { ...environmentalData },
        timestamp: new Date().getTime()
    };

    allergyEpisodes.push(episode);
    localStorage.setItem('allergyEpisodes', JSON.stringify(allergyEpisodes));

    updateStats();
    updateAnalysis();
    updateHistory();
    drawChart();

    // Clear form
    document.getElementById('symptomSeverity').value = 5;
    document.getElementById('severityValue').textContent = '5';
    document.getElementById('primarySymptom').selectedIndex = 0;
    document.getElementById('symptomDuration').value = '';
    document.getElementById('symptomDateTime').value = '';
    document.querySelectorAll('.trigger-checkboxes input').forEach(cb => cb.checked = false);
    document.getElementById('medicationName').value = '';
    document.getElementById('medicationDosage').value = '';
    document.getElementById('notes').value = '';
}

function updateStats() {
    const totalEpisodes = allergyEpisodes.length;
    const avgSeverity = allergyEpisodes.length ?
        (allergyEpisodes.reduce((sum, ep) => sum + ep.severity, 0) / allergyEpisodes.length).toFixed(1) : 0;

    // Episodes this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyEpisodes = allergyEpisodes.filter(ep => new Date(ep.dateTime) > oneWeekAgo).length;

    // Most common symptom
    const symptomCounts = {};
    allergyEpisodes.forEach(ep => {
        symptomCounts[ep.primarySymptom] = (symptomCounts[ep.primarySymptom] || 0) + 1;
    });
    const mostAffected = Object.keys(symptomCounts).length ?
        Object.keys(symptomCounts).reduce((a, b) => symptomCounts[a] > symptomCounts[b] ? a : b) : 'None';

    document.getElementById('totalEpisodes').textContent = totalEpisodes;
    document.getElementById('avgSeverity').textContent = avgSeverity;
    document.getElementById('weeklyEpisodes').textContent = weeklyEpisodes;
    document.getElementById('mostAffected').textContent = mostAffected.replace('-', ' ');
}

function updateAnalysis() {
    updateTopTriggers();
    updateSymptomPatterns();
    updatePeakTimes();
}

function updateTopTriggers() {
    const triggerCounts = {};
    allergyEpisodes.forEach(episode => {
        episode.triggers.forEach(trigger => {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
    });

    const topTriggersEl = document.getElementById('topTriggers');
    topTriggersEl.innerHTML = '';

    // Sort by frequency
    const sortedTriggers = Object.entries(triggerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    sortedTriggers.forEach(([trigger, count]) => {
        const div = document.createElement('div');
        div.className = 'trigger-frequency';
        div.innerHTML = `
            <span>${trigger.replace('-', ' ')}</span>
            <span>${count} episodes</span>
        `;
        topTriggersEl.appendChild(div);
    });
}

function updateSymptomPatterns() {
    const symptomCounts = {};
    allergyEpisodes.forEach(episode => {
        symptomCounts[episode.primarySymptom] = (symptomCounts[episode.primarySymptom] || 0) + 1;
    });

    const symptomPatternsEl = document.getElementById('symptomPatterns');
    symptomPatternsEl.innerHTML = '';

    // Sort by frequency
    const sortedSymptoms = Object.entries(symptomCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    sortedSymptoms.forEach(([symptom, count]) => {
        const div = document.createElement('div');
        div.className = 'symptom-frequency';
        div.innerHTML = `
            <span>${symptom.replace('-', ' ')}</span>
            <span>${count} times</span>
        `;
        symptomPatternsEl.appendChild(div);
    });
}

function updatePeakTimes() {
    const hourCounts = {};
    allergyEpisodes.forEach(episode => {
        const hour = new Date(episode.dateTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakTimesEl = document.getElementById('peakTimes');
    peakTimesEl.innerHTML = '';

    // Find peak hours
    const sortedHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

    sortedHours.forEach(([hour, count]) => {
        const timeLabel = hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
        const div = document.createElement('div');
        div.className = 'symptom-frequency';
        div.innerHTML = `
            <span>${timeLabel}</span>
            <span>${count} episodes</span>
        `;
        peakTimesEl.appendChild(div);
    });
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alerts = [];

    // High pollen alert
    if (environmentalData.pollenLevel === 'High' || environmentalData.pollenLevel === 'Very High') {
        alerts.push({
            type: 'high',
            icon: '🌿',
            message: 'High pollen levels detected. Consider staying indoors and taking preventive medication.'
        });
    }

    // Poor air quality alert
    if (environmentalData.airQuality === 'Poor' || environmentalData.airQuality === 'Very Poor') {
        alerts.push({
            type: 'high',
            icon: '💨',
            message: 'Poor air quality may trigger allergy symptoms. Use air purifiers and limit outdoor activities.'
        });
    }

    // Recent episode pattern alert
    const recentEpisodes = allergyEpisodes.filter(ep => {
        const episodeDate = new Date(ep.dateTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return episodeDate > weekAgo;
    });

    if (recentEpisodes.length >= 3) {
        alerts.push({
            type: 'moderate',
            icon: '📈',
            message: 'Multiple allergy episodes this week. Review your trigger avoidance strategies.'
        });
    }

    // Severe episode alert
    const severeEpisodes = recentEpisodes.filter(ep => ep.severity >= 8);
    if (severeEpisodes.length > 0) {
        alerts.push({
            type: 'high',
            icon: '⚠️',
            message: 'Severe allergy symptoms detected. Consider consulting an allergist for better management.'
        });
    }

    alerts.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-item alert-${alert.type}`;
        div.innerHTML = `
            <span class="icon">${alert.icon}</span>
            <span>${alert.message}</span>
        `;
        alertsContainer.appendChild(div);
    });
}

function drawChart() {
    const ctx = document.getElementById('symptomChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (allergyEpisodes.length === 0) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailySeverity = last7Days.map(date => {
        const dayEpisodes = allergyEpisodes.filter(ep => ep.dateTime.startsWith(date));
        return dayEpisodes.length ? dayEpisodes.reduce((sum, ep) => sum + ep.severity, 0) / dayEpisodes.length : 0;
    });

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / 7;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;

    dailySeverity.forEach((severity, index) => {
        const x = 25 + index * barWidth;
        const height = (severity / 10) * chartHeight;
        const y = ctx.canvas.height - height - 30;

        const color = severity <= 3 ? '#28a745' : severity <= 7 ? '#ffc107' : '#dc3545';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(severity.toFixed(1), x + 5, y - 5);
        ctx.fillText(last7Days[index].slice(-2), x + 5, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('symptomHistory');
    historyEl.innerHTML = '';

    allergyEpisodes.slice(-5).reverse().forEach(episode => {
        const li = document.createElement('li');
        const severityClass = episode.severity <= 3 ? 'low' : episode.severity <= 7 ? 'moderate' : 'high';

        li.innerHTML = `
            <div class="episode-header">
                <span>${new Date(episode.dateTime).toLocaleString()}</span>
                <span class="severity-badge severity-${severityClass}">Severity: ${episode.severity}/10</span>
            </div>
            <div class="episode-details">
                <strong>${episode.primarySymptom.replace('-', ' ')}</strong> (${episode.duration}h)
                ${episode.triggers.length > 0 ? '<br><div class="trigger-tags">Triggers: ' +
                    episode.triggers.map(t => `<span class="trigger-tag">${t.replace('-', ' ')}</span>`).join('') +
                    '</div>' : ''}
                ${episode.medication ? `<br>Medication: ${episode.medication.name} (${episode.medication.dosage}mg, ${episode.medication.timing})` : ''}
                ${episode.notes ? `<br>Notes: ${episode.notes}` : ''}
            </div>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = allergyTips[Math.floor(Math.random() * allergyTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('symptomDateTime').value = new Date().toISOString().slice(0, 16);
updateEnvironmentalDisplay();
updateStats();
updateAnalysis();
updateAlerts();
updateHistory();
drawChart();
getNewTip();