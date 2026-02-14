let exposureLogs = JSON.parse(localStorage.getItem('exposureLogs')) || [];

// Simulated AQI data
let currentAQIData = {
    aqi: 45,
    status: 'Good',
    pollutants: {
        pm25: 12,
        pm10: 25,
        ozone: 35,
        no2: 18
    }
};

const healthTips = [
    "When AQI exceeds 100, limit outdoor activities, especially for children and people with respiratory conditions.",
    "Use N95 or surgical masks during high pollution days to reduce inhalation of harmful particles.",
    "Keep windows closed and use air purifiers with HEPA filters indoors during poor air quality periods.",
    "Exercise indoors or reschedule outdoor activities when air quality is unhealthy.",
    "Stay hydrated as it helps your body clear pollutants from your lungs and respiratory system.",
    "Monitor local air quality forecasts and plan your day accordingly.",
    "Avoid burning wood, trash, or leaves which can worsen local air quality.",
    "Choose routes with less traffic when walking or cycling to minimize exposure to vehicle emissions.",
    "Plants like peace lilies and spider plants can help improve indoor air quality.",
    "If you have asthma or other respiratory conditions, keep your rescue inhaler handy during high pollution days."
];

function refreshAQIData() {
    // Simulate AQI changes
    const baseAQI = 35 + Math.random() * 65; // 35-100 range
    currentAQIData.aqi = Math.round(baseAQI);

    // Update pollutants based on AQI
    currentAQIData.pollutants.pm25 = Math.round(8 + Math.random() * 20);
    currentAQIData.pollutants.pm10 = Math.round(15 + Math.random() * 35);
    currentAQIData.pollutants.ozone = Math.round(25 + Math.random() * 40);
    currentAQIData.pollutants.no2 = Math.round(10 + Math.random() * 25);

    // Determine status
    if (currentAQIData.aqi <= 50) {
        currentAQIData.status = 'Good';
    } else if (currentAQIData.aqi <= 100) {
        currentAQIData.status = 'Moderate';
    } else if (currentAQIData.aqi <= 150) {
        currentAQIData.status = 'Unhealthy for Sensitive Groups';
    } else if (currentAQIData.aqi <= 200) {
        currentAQIData.status = 'Unhealthy';
    } else if (currentAQIData.aqi <= 300) {
        currentAQIData.status = 'Very Unhealthy';
    } else {
        currentAQIData.status = 'Hazardous';
    }

    updateAQIDisplay();
    updateAlerts();
    updateRecommendations();
}

function updateAQIDisplay() {
    document.getElementById('currentAQI').textContent = currentAQIData.aqi;
    document.getElementById('aqiStatus').textContent = currentAQIData.status;

    // Update status styling
    const statusEl = document.getElementById('aqiStatus');
    statusEl.className = 'aqi-status';

    if (currentAQIData.aqi <= 50) {
        statusEl.classList.add('aqi-good');
    } else if (currentAQIData.aqi <= 100) {
        statusEl.classList.add('aqi-moderate');
    } else if (currentAQIData.aqi <= 150) {
        statusEl.classList.add('aqi-unhealthy-sensitive');
    } else if (currentAQIData.aqi <= 200) {
        statusEl.classList.add('aqi-unhealthy');
    } else if (currentAQIData.aqi <= 300) {
        statusEl.classList.add('aqi-very-unhealthy');
    } else {
        statusEl.classList.add('aqi-hazardous');
    }

    // Update pollutants
    document.getElementById('pm25').textContent = `${currentAQIData.pollutants.pm25} µg/m³`;
    document.getElementById('pm10').textContent = `${currentAQIData.pollutants.pm10} µg/m³`;
    document.getElementById('ozone').textContent = `${currentAQIData.pollutants.ozone} ppb`;
    document.getElementById('no2').textContent = `${currentAQIData.pollutants.no2} ppb`;
}

function logExposure() {
    const dateTime = document.getElementById('exposureDateTime').value;
    const duration = parseInt(document.getElementById('exposureDuration').value);
    const activityType = document.getElementById('activityType').value;
    const location = document.getElementById('location').value;

    // Get selected symptoms
    const symptomCheckboxes = document.querySelectorAll('.symptom-checkboxes input:checked');
    const symptoms = Array.from(symptomCheckboxes).map(cb => cb.value);

    const notes = document.getElementById('exposureNotes').value;

    if (!dateTime || !activityType || !location) {
        alert('Please fill in all required fields');
        return;
    }

    const exposure = {
        dateTime,
        duration,
        activityType,
        location,
        symptoms,
        notes,
        aqiAtTime: currentAQIData.aqi,
        timestamp: new Date().getTime()
    };

    exposureLogs.push(exposure);
    localStorage.setItem('exposureLogs', JSON.stringify(exposureLogs));

    updateStats();
    updateHistory();
    drawChart();

    // Clear form
    document.getElementById('exposureDateTime').value = '';
    document.getElementById('exposureDuration').value = '';
    document.getElementById('activityType').selectedIndex = 0;
    document.getElementById('location').selectedIndex = 0;
    document.querySelectorAll('.symptom-checkboxes input').forEach(cb => cb.checked = false);
    document.getElementById('exposureNotes').value = '';
}

function updateStats() {
    const totalExposure = exposureLogs.reduce((sum, exp) => sum + exp.duration, 0) / 60; // hours
    const avgAQI = exposureLogs.length ? exposureLogs.reduce((sum, exp) => sum + exp.aqiAtTime, 0) / exposureLogs.length : 0;
    const symptomCount = exposureLogs.reduce((sum, exp) => sum + exp.symptoms.length, 0);
    const totalPossibleSymptoms = exposureLogs.length * 8; // 8 symptom options
    const symptomRate = totalPossibleSymptoms ? (symptomCount / totalPossibleSymptoms * 100) : 0;

    // Risk level based on average AQI
    let riskLevel = 'Low';
    if (avgAQI > 150) riskLevel = 'High';
    else if (avgAQI > 100) riskLevel = 'Moderate';
    else if (avgAQI > 50) riskLevel = 'Low-Moderate';

    document.getElementById('totalExposure').textContent = totalExposure.toFixed(1);
    document.getElementById('avgAQI').textContent = Math.round(avgAQI);
    document.getElementById('symptomRate').textContent = `${symptomRate.toFixed(1)}%`;
    document.getElementById('riskLevel').textContent = riskLevel;

    updateInsights();
}

function updateInsights() {
    const insights = [];

    if (exposureLogs.length === 0) {
        insights.push('Log more exposures to see personalized insights');
    } else {
        // Activity insights
        const activityCounts = {};
        exposureLogs.forEach(exp => {
            activityCounts[exp.activityType] = (activityCounts[exp.activityType] || 0) + 1;
        });
        const topActivity = Object.keys(activityCounts).reduce((a, b) =>
            activityCounts[a] > activityCounts[b] ? a : b, '');

        if (topActivity) {
            insights.push(`Your most common outdoor activity is ${topActivity.replace('-', ' ')}`);
        }

        // Location insights
        const locationCounts = {};
        exposureLogs.forEach(exp => {
            locationCounts[exp.location] = (locationCounts[exp.location] || 0) + 1;
        });
        const riskiestLocation = Object.keys(locationCounts).reduce((a, b) =>
            locationCounts[a] > locationCounts[b] ? a : b, '');

        if (riskiestLocation) {
            insights.push(`${riskiestLocation.replace('-', ' ')} appears to be your most frequent exposure location`);
        }

        // Symptom correlation
        const highAQIDays = exposureLogs.filter(exp => exp.aqiAtTime > 100);
        const highAQISymptoms = highAQIDays.reduce((sum, exp) => sum + exp.symptoms.length, 0);
        const lowAQIDays = exposureLogs.filter(exp => exp.aqiAtTime <= 100);
        const lowAQISymptoms = lowAQIDays.reduce((sum, exp) => sum + exp.symptoms.length, 0);

        if (highAQIDays.length > 0 && lowAQIDays.length > 0) {
            const highAvg = highAQISymptoms / highAQIDays.length;
            const lowAvg = lowAQISymptoms / lowAQIDays.length;
            if (highAvg > lowAvg * 1.5) {
                insights.push('You report more symptoms on high AQI days');
            }
        }

        // Duration insights
        const avgDuration = exposureLogs.reduce((sum, exp) => sum + exp.duration, 0) / exposureLogs.length;
        if (avgDuration > 60) {
            insights.push('Your average outdoor exposure is over 1 hour - consider shorter sessions on poor air quality days');
        }
    }

    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '';
    insights.forEach(insight => {
        const li = document.createElement('li');
        li.textContent = insight;
        insightsList.appendChild(li);
    });
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alerts = [];

    // AQI-based alerts
    if (currentAQIData.aqi > 150) {
        alerts.push({
            type: 'danger',
            icon: '🚨',
            message: 'Hazardous air quality! Stay indoors and use air purifiers. Avoid all outdoor activities.'
        });
    } else if (currentAQIData.aqi > 100) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Unhealthy air quality. Limit outdoor activities, especially if you have respiratory conditions.'
        });
    } else if (currentAQIData.aqi > 50) {
        alerts.push({
            type: 'warning',
            icon: '🌫️',
            message: 'Moderate air quality. Sensitive individuals should consider limiting prolonged outdoor exposure.'
        });
    }

    // Recent exposure alerts
    const recentExposures = exposureLogs.filter(exp => {
        const expDate = new Date(exp.dateTime);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return expDate > oneDayAgo && exp.aqiAtTime > 100;
    });

    if (recentExposures.length > 0) {
        alerts.push({
            type: 'info',
            icon: '📊',
            message: `You've had ${recentExposures.length} exposure(s) in poor air quality conditions recently. Monitor for symptoms.`
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            icon: 'ℹ️',
            message: 'Air quality is acceptable. Continue monitoring and log your outdoor activities.'
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

function updateRecommendations() {
    const recommendations = [];

    if (currentAQIData.aqi > 150) {
        recommendations.push('Stay indoors with windows closed');
        recommendations.push('Use air purifiers with HEPA filters');
        recommendations.push('Wear N95 masks if outdoor exposure is unavoidable');
        recommendations.push('Limit physical exertion outdoors');
    } else if (currentAQIData.aqi > 100) {
        recommendations.push('Limit outdoor activities to 30 minutes or less');
        recommendations.push('Wear surgical masks when outdoors');
        recommendations.push('Avoid exercising near busy roads');
        recommendations.push('Shower and change clothes after coming indoors');
    } else if (currentAQIData.aqi > 50) {
        recommendations.push('Limit prolonged outdoor activities');
        recommendations.push('Take breaks indoors during outdoor work');
        recommendations.push('Stay hydrated to help clear pollutants');
    } else {
        recommendations.push('Air quality is good for outdoor activities');
        recommendations.push('Continue monitoring air quality regularly');
        recommendations.push('Log your exposures to track patterns');
    }

    // Add general recommendations
    recommendations.push('Keep windows closed during high pollution periods');
    recommendations.push('Use exhaust fans when cooking');

    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });
}

function drawChart() {
    const ctx = document.getElementById('aqiChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (exposureLogs.length === 0) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailyAQI = last7Days.map(date => {
        const dayExposures = exposureLogs.filter(exp => exp.dateTime.startsWith(date));
        return dayExposures.length ? dayExposures.reduce((sum, exp) => sum + exp.aqiAtTime, 0) / dayExposures.length : null;
    });

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / 7;

    ctx.strokeStyle = '#4299e1';
    ctx.lineWidth = 2;

    dailyAQI.forEach((aqi, index) => {
        if (aqi === null) return;

        const x = 25 + index * barWidth;
        const height = (aqi / 200) * chartHeight; // Scale to max AQI of 200
        const y = ctx.canvas.height - height - 30;

        let color = '#48bb78'; // Good
        if (aqi > 100) color = '#ed8936'; // Moderate-Unhealthy
        if (aqi > 150) color = '#e53e3e'; // Very Unhealthy+

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(Math.round(aqi), x + 5, y - 5);
        ctx.fillText(last7Days[index].slice(-2), x + 5, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('exposureHistory');
    historyEl.innerHTML = '';

    exposureLogs.slice(-5).reverse().forEach(exposure => {
        const li = document.createElement('li');
        const aqiClass = exposure.aqiAtTime <= 50 ? 'good' : exposure.aqiAtTime <= 100 ? 'moderate' : 'poor';

        li.innerHTML = `
            <div class="exposure-header">
                <span>${new Date(exposure.dateTime).toLocaleString()}</span>
                <span class="aqi-badge aqi-${aqiClass}">AQI: ${exposure.aqiAtTime}</span>
            </div>
            <div class="exposure-details">
                <strong>${exposure.activityType.replace('-', ' ')}</strong> at ${exposure.location.replace('-', ' ')} (${exposure.duration} min)
                ${exposure.symptoms.length > 0 ? '<br><div class="symptom-tags">' +
                    exposure.symptoms.map(s => `<span class="symptom-tag">${s.replace('-', ' ')}</span>`).join('') +
                    '</div>' : ''}
                ${exposure.notes ? `<br>Notes: ${exposure.notes}` : ''}
            </div>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    document.getElementById('healthTip').textContent = randomTip;
}

// Initialize
document.getElementById('exposureDateTime').value = new Date().toISOString().slice(0, 16);
updateAQIDisplay();
updateStats();
updateAlerts();
updateRecommendations();
updateHistory();
drawChart();
getNewTip();