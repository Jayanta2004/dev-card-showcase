let exposureSessions = JSON.parse(localStorage.getItem('exposureSessions')) || [];

// Simulated weather data (in a real app, this would come from a weather API)
let currentWeather = {
    temperature: 22,
    feelsLike: 24,
    humidity: 65,
    windSpeed: 12,
    uvIndex: 6
};

const safetyTips = [
    "Stay hydrated by drinking water regularly, even if you don't feel thirsty.",
    "Wear appropriate clothing: light-colored, loose-fitting clothes for heat; layered clothing for cold.",
    "Take frequent breaks in shaded or warm areas during extreme conditions.",
    "Acclimatize gradually to temperature changes over several days.",
    "Monitor your urine color - dark urine indicates dehydration.",
    "Use sunscreen with high SPF when exposed to sunlight.",
    "Avoid alcohol and caffeine which can worsen dehydration.",
    "Know the signs of heat exhaustion: dizziness, nausea, rapid heartbeat.",
    "Recognize frostbite symptoms: numbness, white or grayish skin.",
    "Never leave children or pets in parked vehicles during hot weather."
];

function refreshWeather() {
    // Simulate weather changes (in reality, this would fetch from API)
    const tempChange = (Math.random() - 0.5) * 10; // -5 to +5 degrees
    currentWeather.temperature = Math.round((currentWeather.temperature + tempChange) * 10) / 10;
    currentWeather.feelsLike = Math.round((currentWeather.temperature + (Math.random() - 0.5) * 4) * 10) / 10;
    currentWeather.humidity = Math.round(50 + Math.random() * 40); // 50-90%
    currentWeather.windSpeed = Math.round(5 + Math.random() * 20); // 5-25 km/h
    currentWeather.uvIndex = Math.round(1 + Math.random() * 10); // 1-11

    updateWeatherDisplay();
    updateRiskAssessment();
    updateAlerts();
}

function updateWeatherDisplay() {
    document.getElementById('currentTemp').textContent = `${currentWeather.temperature}°C`;
    document.getElementById('feelsLike').textContent = `${currentWeather.feelsLike}°C`;
    document.getElementById('humidity').textContent = `${currentWeather.humidity}%`;
    document.getElementById('windSpeed').textContent = `${currentWeather.windSpeed} km/h`;
    document.getElementById('uvIndex').textContent = currentWeather.uvIndex;
}

function logExposure() {
    const exposureType = document.getElementById('exposureType').value;
    const temperature = parseFloat(document.getElementById('exposureTemp').value);
    const duration = parseInt(document.getElementById('duration').value);
    const activityLevel = document.getElementById('activityLevel').value;
    const dateTime = document.getElementById('exposureDateTime').value;
    const notes = document.getElementById('notes').value;

    if (!temperature || !duration || !dateTime) {
        alert('Please fill in temperature, duration, and date/time');
        return;
    }

    const riskLevel = calculateRiskLevel(exposureType, temperature, duration, activityLevel);

    const session = {
        exposureType,
        temperature,
        duration,
        activityLevel,
        dateTime,
        notes,
        riskLevel,
        timestamp: new Date().getTime()
    };

    exposureSessions.push(session);
    localStorage.setItem('exposureSessions', JSON.stringify(exposureSessions));

    updateStats();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('exposureTemp').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('exposureDateTime').value = '';
}

function calculateRiskLevel(exposureType, temperature, duration, activityLevel) {
    let riskScore = 0;

    if (exposureType === 'heat') {
        // Heat risk calculation
        if (temperature > 32) riskScore += (temperature - 32) * 2;
        if (temperature > 35) riskScore += 10; // Extreme heat
        if (duration > 120) riskScore += (duration - 120) / 10; // Prolonged exposure
        if (activityLevel === 'high') riskScore += 15;
        else if (activityLevel === 'moderate') riskScore += 8;

        // Humidity factor
        if (currentWeather.humidity > 80) riskScore += 10;

        // UV factor
        if (currentWeather.uvIndex > 8) riskScore += 5;
    } else {
        // Cold risk calculation
        if (temperature < 0) riskScore += (0 - temperature) * 1.5;
        if (temperature < -10) riskScore += 15; // Extreme cold
        if (duration > 60) riskScore += (duration - 60) / 5; // Prolonged exposure
        if (activityLevel === 'low') riskScore += 10; // Less movement = higher risk
        if (currentWeather.windSpeed > 20) riskScore += 10; // Wind chill
    }

    if (riskScore < 20) return 'low';
    if (riskScore < 40) return 'moderate';
    if (riskScore < 60) return 'high';
    return 'extreme';
}

function updateRiskAssessment() {
    const heatRisk = assessHeatRisk(currentWeather.temperature, currentWeather.humidity, currentWeather.uvIndex);
    const coldRisk = assessColdRisk(currentWeather.temperature, currentWeather.windSpeed);

    document.getElementById('heatRiskLevel').textContent = heatRisk.level;
    document.getElementById('heatRiskDesc').textContent = heatRisk.description;
    document.getElementById('heatRiskLevel').className = `risk-level risk-${heatRisk.level}`;

    document.getElementById('coldRiskLevel').textContent = coldRisk.level;
    document.getElementById('coldRiskDesc').textContent = coldRisk.description;
    document.getElementById('coldRiskLevel').className = `risk-level risk-${coldRisk.level}`;
}

function assessHeatRisk(temp, humidity, uvIndex) {
    if (temp > 35 || (temp > 30 && humidity > 80) || uvIndex > 10) {
        return { level: 'Extreme', description: 'Dangerous conditions - avoid prolonged exposure' };
    } else if (temp > 32 || (temp > 27 && humidity > 70) || uvIndex > 7) {
        return { level: 'High', description: 'Take precautions - limit exposure time' };
    } else if (temp > 27 || uvIndex > 5) {
        return { level: 'Moderate', description: 'Monitor conditions - stay hydrated' };
    } else {
        return { level: 'Low', description: 'Safe conditions' };
    }
}

function assessColdRisk(temp, windSpeed) {
    const windChill = temp - (windSpeed * 0.7); // Simplified wind chill calculation

    if (windChill < -20) {
        return { level: 'Extreme', description: 'Severe cold - frostbite risk in minutes' };
    } else if (windChill < -10) {
        return { level: 'High', description: 'Very cold - limit exposure, dress warmly' };
    } else if (windChill < 0) {
        return { level: 'Moderate', description: 'Cold conditions - dress in layers' };
    } else {
        return { level: 'Low', description: 'Comfortable temperatures' };
    }
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alerts = [];

    // Heat alerts
    if (currentWeather.temperature > 35) {
        alerts.push({
            type: 'danger',
            icon: '🔥',
            message: 'Extreme heat warning: Stay indoors, stay hydrated, avoid strenuous activity'
        });
    } else if (currentWeather.temperature > 32) {
        alerts.push({
            type: 'heat',
            icon: '☀️',
            message: 'High heat: Take frequent breaks, drink water regularly'
        });
    }

    // Cold alerts
    const windChill = currentWeather.temperature - (currentWeather.windSpeed * 0.7);
    if (windChill < -15) {
        alerts.push({
            type: 'danger',
            icon: '❄️',
            message: 'Extreme cold warning: Frostbite risk - cover all skin, limit exposure'
        });
    } else if (windChill < -5) {
        alerts.push({
            type: 'cold',
            icon: '🧊',
            message: 'Very cold: Dress in warm layers, protect extremities'
        });
    }

    // UV alerts
    if (currentWeather.uvIndex > 8) {
        alerts.push({
            type: 'heat',
            icon: '🛡️',
            message: 'High UV index: Use sunscreen, wear protective clothing'
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

function updateStats() {
    const totalMinutes = exposureSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const heatMinutes = exposureSessions
        .filter(session => session.exposureType === 'heat')
        .reduce((sum, session) => sum + session.duration, 0);
    const heatHours = (heatMinutes / 60).toFixed(1);

    const coldMinutes = exposureSessions
        .filter(session => session.exposureType === 'cold')
        .reduce((sum, session) => sum + session.duration, 0);
    const coldHours = (coldMinutes / 60).toFixed(1);

    const riskIncidents = exposureSessions.filter(session =>
        session.riskLevel === 'high' || session.riskLevel === 'extreme'
    ).length;

    document.getElementById('totalExposureTime').textContent = totalHours;
    document.getElementById('heatExposureTime').textContent = heatHours;
    document.getElementById('coldExposureTime').textContent = coldHours;
    document.getElementById('riskIncidents').textContent = riskIncidents;

    updateGuidance();
}

function updateGuidance() {
    const guidanceContent = document.getElementById('guidanceContent');
    guidanceContent.innerHTML = '';

    const heatGuidance = {
        title: 'Heat Safety Guidelines',
        items: [
            'Drink water every 15-20 minutes during activity',
            'Wear light-colored, loose-fitting clothing',
            'Take breaks in shaded areas',
            'Know heat exhaustion symptoms: dizziness, nausea, rapid heartbeat',
            'Acclimatize gradually to hot conditions'
        ]
    };

    const coldGuidance = {
        title: 'Cold Safety Guidelines',
        items: [
            'Dress in layers to trap warm air',
            'Cover head, hands, and feet - major heat loss areas',
            'Stay dry - wet clothing increases heat loss',
            'Recognize frostbite: numbness, white/gray skin',
            'Know hypothermia symptoms: shivering, confusion, drowsiness'
        ]
    };

    [heatGuidance, coldGuidance].forEach(guidance => {
        const div = document.createElement('div');
        div.className = 'guidance-item';
        div.innerHTML = `
            <h4>${guidance.title}</h4>
            <ul>
                ${guidance.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        guidanceContent.appendChild(div);
    });
}

function drawChart() {
    const ctx = document.getElementById('exposureChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (exposureSessions.length === 0) return;

    const last7Sessions = exposureSessions.slice(-7);
    const heatSessions = last7Sessions.filter(s => s.exposureType === 'heat');
    const coldSessions = last7Sessions.filter(s => s.exposureType === 'cold');

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / 7;

    // Draw heat exposure bars (red/orange)
    heatSessions.forEach((session, index) => {
        const x = 25 + index * barWidth;
        const height = (session.duration / 240) * chartHeight; // Max 4 hours
        const y = ctx.canvas.height - height - 30;

        ctx.fillStyle = 'rgba(225, 112, 85, 0.7)';
        ctx.fillRect(x, y, barWidth - 2, height);
    });

    // Draw cold exposure bars (blue)
    coldSessions.forEach((session, index) => {
        const x = 25 + index * barWidth;
        const height = (session.duration / 240) * chartHeight;
        const y = ctx.canvas.height - height - 30;

        ctx.fillStyle = 'rgba(9, 132, 227, 0.7)';
        ctx.fillRect(x + 2, y, barWidth - 6, height);
    });

    // Add labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    last7Sessions.forEach((session, index) => {
        const x = 25 + index * barWidth;
        ctx.fillText(session.dateTime.slice(5, 10), x + 5, ctx.canvas.height - 10);
    });

    // Legend
    ctx.fillStyle = '#e17055';
    ctx.fillRect(280, 10, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Heat', 300, 22);

    ctx.fillStyle = '#0984e3';
    ctx.fillRect(280, 30, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Cold', 300, 42);
}

function updateHistory() {
    const historyEl = document.getElementById('exposureHistory');
    historyEl.innerHTML = '';

    exposureSessions.slice(-5).reverse().forEach(session => {
        const li = document.createElement('li');
        const riskClass = session.riskLevel;

        li.innerHTML = `
            <div>
                <span class="exposure-type type-${session.exposureType}">${session.exposureType}</span>
                <span class="risk-badge risk-${riskClass}">${session.riskLevel}</span>
                <div>${session.dateTime} - ${session.duration}min at ${session.temperature}°C</div>
                <div style="color: #636e72; font-size: 14px;">${session.activityLevel} activity</div>
            </div>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = safetyTips[Math.floor(Math.random() * safetyTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('exposureDateTime').value = new Date().toISOString().slice(0, 16);
updateWeatherDisplay();
updateRiskAssessment();
updateAlerts();
updateStats();
updateGuidance();
updateHistory();
drawChart();
getNewTip();