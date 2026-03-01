// Sauna Session Tracker JavaScript

let saunaSessions = JSON.parse(localStorage.getItem('saunaSessions')) || [];

// Comfort level descriptions
const COMFORT_LEVELS = {
    1: 'Very Uncomfortable',
    2: 'Uncomfortable',
    3: 'Slightly Uncomfortable',
    4: 'Mild Discomfort',
    5: 'Neutral',
    6: 'Slightly Comfortable',
    7: 'Comfortable',
    8: 'Very Comfortable',
    9: 'Highly Comfortable',
    10: 'Perfectly Comfortable'
};

// Tolerance levels based on sessions and adaptation
const TOLERANCE_LEVELS = {
    beginner: { sessions: 0, maxDuration: 15, label: 'Beginner' },
    intermediate: { sessions: 10, maxDuration: 25, label: 'Intermediate' },
    advanced: { sessions: 25, maxDuration: 35, label: 'Advanced' },
    expert: { sessions: 50, maxDuration: 45, label: 'Expert' }
};

// Safety guidelines
const SAFETY_GUIDELINES = [
    {
        title: 'Hydration is Critical',
        text: 'Drink plenty of water before, during, and after sauna use. Dehydration can occur rapidly in high heat.'
    },
    {
        title: 'Know Your Limits',
        text: 'Start with shorter sessions (10-15 minutes) and gradually increase duration as you adapt to heat.'
    },
    {
        title: 'Listen to Your Body',
        text: 'Exit immediately if you feel dizzy, lightheaded, or experience chest pain. These are serious warning signs.'
    },
    {
        title: 'Cool Down Properly',
        text: 'After sauna, cool down gradually. Avoid jumping into cold water immediately after high heat exposure.'
    },
    {
        title: 'Medical Consultation',
        text: 'Consult a doctor before starting sauna therapy, especially if you have heart conditions, high blood pressure, or are pregnant.'
    },
    {
        title: 'Session Frequency',
        text: 'Limit to 2-3 sessions per week initially. Allow at least 24 hours between sessions for recovery.'
    },
    {
        title: 'Temperature Awareness',
        text: 'Traditional saunas: 180-195°F, Infrared: 140-160°F. Never exceed recommended temperatures.'
    },
    {
        title: 'Emergency Preparedness',
        text: 'Have water nearby and know the location of emergency exits. Never sauna alone for extended periods.'
    }
];

// Recovery recommendations based on session intensity
const RECOVERY_RECOMMENDATIONS = {
    light: [
        { title: 'Short Recovery', text: '15-30 minutes of rest and rehydration before resuming normal activities.' },
        { title: 'Hydration Focus', text: 'Drink electrolyte-rich fluids to replace minerals lost through sweat.' }
    ],
    moderate: [
        { title: 'Extended Recovery', text: '1-2 hours of light activity and continued hydration.' },
        { title: 'Monitor Symptoms', text: 'Watch for delayed fatigue or dizziness over the next few hours.' },
        { title: 'Nutrition Support', text: 'Consume a balanced meal with protein and complex carbohydrates.' }
    ],
    intense: [
        { title: 'Full Recovery Day', text: 'Take it easy for the rest of the day. Avoid strenuous activities.' },
        { title: 'Extended Hydration', text: 'Continue drinking fluids throughout the day and evening.' },
        { title: 'Medical Attention', text: 'If you experience persistent symptoms, consult a healthcare provider.' },
        { title: 'Session Adjustment', text: 'Consider reducing duration or temperature for future sessions.' }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
    initializeForm();
    initializeComfortSlider();
    initializeHistoryControls();
    setDefaultDate();
    updateAllDisplays();
    lucide.createIcons();
});

// Initialize navbar
function initializeNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

// Initialize form
function initializeForm() {
    const form = document.getElementById('saunaForm');
    form.addEventListener('submit', handleFormSubmit);
}

// Initialize comfort slider
function initializeComfortSlider() {
    const slider = document.getElementById('comfort');
    slider.addEventListener('input', updateComfortDisplay);
    updateComfortDisplay(); // Initial display
}

// Initialize history controls
function initializeHistoryControls() {
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Update comfort display
function updateComfortDisplay() {
    const slider = document.getElementById('comfort');
    const valueElement = document.getElementById('comfortValue');
    const textElement = document.getElementById('comfortText');

    const value = parseInt(slider.value);
    valueElement.textContent = value;
    textElement.textContent = COMFORT_LEVELS[value];
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        id: Date.now(),
        date: document.getElementById('date').value,
        duration: parseInt(document.getElementById('duration').value),
        temperature: parseInt(document.getElementById('temperature').value),
        saunaType: document.getElementById('saunaType').value,
        comfort: parseInt(document.getElementById('comfort').value),
        hydration: document.getElementById('hydration').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    // Check for duplicate date
    const existingEntry = saunaSessions.find(session => session.date === formData.date);
    if (existingEntry) {
        if (!confirm('A session already exists for this date. Do you want to replace it?')) {
            return;
        }
        // Remove existing entry
        saunaSessions = saunaSessions.filter(session => session.id !== existingEntry.id);
    }

    saunaSessions.push(formData);
    saveSessions();
    updateAllDisplays();
    resetForm();

    // Show success message
    showNotification('Sauna session logged successfully!', 'success');
}

// Save sessions to localStorage
function saveSessions() {
    localStorage.setItem('saunaSessions', JSON.stringify(saunaSessions));
}

// Reset form
function resetForm() {
    document.getElementById('saunaForm').reset();
    setDefaultDate();
    updateComfortDisplay();
}

// Update all displays
function updateAllDisplays() {
    updateSafetyAlerts();
    updateToleranceMetrics();
    updateHistory('week');
    updateRecoveryInfo();
    updateRecommendations();
    updateGuidelines();
    updateChart();
}

// Update safety alerts
function updateSafetyAlerts() {
    const alertsContainer = document.getElementById('safetyAlerts');
    const alerts = generateSafetyAlerts();

    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type}">
            <i data-lucide="${alert.icon}"></i>
            <div>
                <strong>${alert.title}</strong>
                <p>${alert.message}</p>
            </div>
        </div>
    `).join('');

    // Re-initialize icons for dynamic content
    lucide.createIcons();
}

// Generate safety alerts based on current session and history
function generateSafetyAlerts() {
    const alerts = [];
    const today = new Date().toISOString().split('T')[0];
    const todaySession = saunaSessions.find(session => session.date === today);

    if (todaySession) {
        // Duration alerts
        if (todaySession.duration > 30) {
            alerts.push({
                type: 'warning',
                icon: 'alert-triangle',
                title: 'Extended Session',
                message: 'Sessions over 30 minutes increase health risks. Monitor your body closely.'
            });
        }

        // Temperature alerts
        if (todaySession.temperature > 200) {
            alerts.push({
                type: 'danger',
                icon: 'flame',
                title: 'High Temperature',
                message: 'Temperatures above 200°F can be dangerous. Ensure proper ventilation.'
            });
        }

        // Hydration alerts
        if (todaySession.hydration === 'dehydrated') {
            alerts.push({
                type: 'danger',
                icon: 'droplets',
                title: 'Dehydration Risk',
                message: 'Do not sauna when dehydrated. Hydrate thoroughly before your next session.'
            });
        }

        // Comfort alerts
        if (todaySession.comfort < 4) {
            alerts.push({
                type: 'warning',
                icon: 'frown',
                title: 'Low Comfort Level',
                message: 'Consider reducing duration or temperature for better comfort and safety.'
            });
        }
    }

    // Frequency alerts
    const recentSessions = saunaSessions.filter(session => {
        const sessionDate = new Date(session.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
    });

    if (recentSessions.length >= 5) {
        alerts.push({
            type: 'warning',
            icon: 'calendar',
            title: 'High Frequency',
            message: '5+ sessions per week may strain your body. Allow more recovery time between sessions.'
        });
    }

    // Adaptation progress
    if (saunaSessions.length > 0) {
        const avgDuration = saunaSessions.reduce((sum, session) => sum + session.duration, 0) / saunaSessions.length;
        if (avgDuration > 25 && saunaSessions.length < 10) {
            alerts.push({
                type: 'info',
                icon: 'trending-up',
                title: 'Rapid Progression',
                message: 'You\'re progressing quickly! Ensure you\'re adapting safely to increased durations.'
            });
        }
    }

    return alerts;
}

// Update tolerance metrics
function updateToleranceMetrics() {
    const totalSessions = saunaSessions.length;
    const toleranceLevel = getToleranceLevel(totalSessions);

    document.getElementById('currentTolerance').textContent = toleranceLevel.label;

    if (saunaSessions.length > 0) {
        const avgDuration = saunaSessions.reduce((sum, session) => sum + session.duration, 0) / saunaSessions.length;
        document.getElementById('avgDuration').textContent = `${Math.round(avgDuration)} min`;
    } else {
        document.getElementById('avgDuration').textContent = '-- min';
    }

    document.getElementById('totalSessions').textContent = totalSessions;
}

// Get tolerance level based on session count
function getToleranceLevel(sessionCount) {
    if (sessionCount >= TOLERANCE_LEVELS.expert.sessions) return TOLERANCE_LEVELS.expert;
    if (sessionCount >= TOLERANCE_LEVELS.advanced.sessions) return TOLERANCE_LEVELS.advanced;
    if (sessionCount >= TOLERANCE_LEVELS.intermediate.sessions) return TOLERANCE_LEVELS.intermediate;
    return TOLERANCE_LEVELS.beginner;
}

// Filter and update history
function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

// Update history display
function updateHistory(period) {
    let filteredSessions = [...saunaSessions];

    const now = new Date();
    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = filteredSessions.filter(session => new Date(session.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredSessions = filteredSessions.filter(session => new Date(session.date) >= monthAgo);
    }

    // Sort by date descending
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const historyList = document.getElementById('sessionHistory');
    historyList.innerHTML = filteredSessions.map(session => `
        <div class="history-item">
            <div class="history-date">${formatDate(session.date)}</div>
            <div class="history-details">
                <div class="history-duration">${session.duration} min</div>
                <div class="history-temperature">${session.temperature}°F</div>
                <div class="history-comfort">${COMFORT_LEVELS[session.comfort]}</div>
            </div>
        </div>
    `).join('');
}

// Update recovery information
function updateRecoveryInfo() {
    const lastSession = saunaSessions[saunaSessions.length - 1];
    const now = new Date();

    if (lastSession) {
        const lastSessionDate = new Date(lastSession.date);
        const hoursSince = (now - lastSessionDate) / (1000 * 60 * 60);

        // Next session recommendation
        let nextSessionText = '';
        if (hoursSince < 24) {
            nextSessionText = 'Allow at least 24 hours recovery before your next session.';
        } else if (hoursSince < 48) {
            nextSessionText = 'Good timing for your next session. Monitor how you feel.';
        } else {
            nextSessionText = 'Ready for another session. Consider your energy levels.';
        }

        document.getElementById('nextSession').innerHTML = `<p>${nextSessionText}</p>`;

        // Hydration reminder
        const hydrationText = lastSession.hydration === 'dehydrated' ?
            'Critical: Rehydrate thoroughly and monitor for dehydration symptoms.' :
            'Continue drinking water regularly. Consider electrolyte replenishment.';
        document.getElementById('hydrationReminder').innerHTML = `<p>${hydrationText}</p>`;

        // Progress insights
        const toleranceLevel = getToleranceLevel(saunaSessions.length);
        const progressText = `Current level: ${toleranceLevel.label}. You've completed ${saunaSessions.length} sessions.`;
        document.getElementById('progressInsights').innerHTML = `<p>${progressText}</p>`;
    } else {
        document.getElementById('nextSession').innerHTML = '<p>Ready to start your sauna journey!</p>';
        document.getElementById('hydrationReminder').innerHTML = '<p>Always hydrate well before sauna use.</p>';
        document.getElementById('progressInsights').innerHTML = '<p>Begin with shorter sessions and gradually increase.</p>';
    }
}

// Update recommendations
function updateRecommendations() {
    const recommendations = generateRecommendations();
    const recommendationsContainer = document.getElementById('recommendations');

    recommendationsContainer.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item ${rec.priority}">
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-text">${rec.text}</div>
        </div>
    `).join('');
}

// Generate personalized recommendations
function generateRecommendations() {
    const recommendations = [];
    const sessionCount = saunaSessions.length;

    if (sessionCount === 0) {
        recommendations.push({
            title: 'Start Slow',
            text: 'Begin with 10-15 minute sessions at moderate temperatures.',
            priority: ''
        });
    } else {
        const lastSession = saunaSessions[saunaSessions.length - 1];
        const avgComfort = saunaSessions.reduce((sum, session) => sum + session.comfort, 0) / sessionCount;

        if (avgComfort < 6) {
            recommendations.push({
                title: 'Adjust Comfort',
                text: 'Consider lower temperatures or shorter durations for better comfort.',
                priority: 'warning'
            });
        }

        if (lastSession.duration > 25 && sessionCount < 20) {
            recommendations.push({
                title: 'Monitor Adaptation',
                text: 'Longer sessions require careful monitoring of your body\'s response.',
                priority: 'warning'
            });
        }

        const recentSessions = saunaSessions.slice(-3);
        const increasingDuration = recentSessions.every((session, index) =>
            index === 0 || session.duration >= recentSessions[index - 1].duration
        );

        if (increasingDuration && recentSessions.length >= 3) {
            recommendations.push({
                title: 'Good Progression',
                text: 'You\'re gradually increasing duration safely. Continue monitoring comfort.',
                priority: ''
            });
        }
    }

    // Recovery intensity recommendations
    const lastSession = saunaSessions[saunaSessions.length - 1];
    if (lastSession) {
        const intensity = lastSession.duration > 25 || lastSession.temperature > 190 ? 'intense' :
                         lastSession.duration > 15 || lastSession.temperature > 180 ? 'moderate' : 'light';

        const recoveryRecs = RECOVERY_RECOMMENDATIONS[intensity];
        recommendations.push(...recoveryRecs.slice(0, 2)); // Add top 2 recovery recommendations
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
}

// Update safety guidelines
function updateGuidelines() {
    const guidelinesContainer = document.getElementById('guidelines');
    guidelinesContainer.innerHTML = SAFETY_GUIDELINES.map(guideline => `
        <div class="guideline-item">
            <div class="guideline-title">${guideline.title}</div>
            <div class="guideline-text">${guideline.text}</div>
        </div>
    `).join('');
}

// Update chart (simplified version)
function updateChart() {
    // This would require Chart.js or similar library
    // For now, just show a placeholder
    const chartCanvas = document.getElementById('toleranceChart');
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    // Simple line chart placeholder
    ctx.strokeStyle = '#e53e3e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 200);
    ctx.lineTo(80, 180);
    ctx.lineTo(140, 160);
    ctx.lineTo(200, 140);
    ctx.lineTo(260, 120);
    ctx.stroke();

    // Add text
    ctx.fillStyle = '#1a202c';
    ctx.font = '12px Arial';
    ctx.fillText('Tolerance Progression (Duration)', 20, 20);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type) {
    // Simple notification - could be enhanced with a proper notification system
    alert(message);
}