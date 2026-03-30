// Social Impact Dashboard Logic
const activityForm = document.getElementById('activity-form');
const activityInput = document.getElementById('activity-input');
const activityType = document.getElementById('activity-type');
const activityList = document.getElementById('activity-list');
const progressCharts = document.getElementById('progress-charts');
const badgesDiv = document.getElementById('badges');
const shareBtn = document.getElementById('share-btn');

let activities = JSON.parse(localStorage.getItem('activities')) || [];

function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
}

function renderActivities() {
    activityList.innerHTML = '';
    activities.forEach((activity, idx) => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span>${activity.description} <span class="activity-type">(${activity.type})</span></span>
            <span>${new Date(activity.date).toLocaleDateString()}</span>
        `;
        activityList.appendChild(item);
    });
}

activityForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const description = activityInput.value.trim();
    const type = activityType.value;
    if (description) {
        activities.push({ description, type, date: new Date().toISOString() });
        saveActivities();
        activityInput.value = '';
        renderActivities();
        renderImpactMetrics();
        renderBadges();
    }
});

function renderImpactMetrics() {
    // Progress charts (simple counts)
    const types = ['volunteering', 'donation', 'eco-action', 'community'];
    let metrics = types.map(type => {
        const count = activities.filter(a => a.type === type).length;
        return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`;
    }).join('<br>');
    progressCharts.innerHTML = metrics;
}

function renderBadges() {
    badgesDiv.innerHTML = '';
    const types = ['volunteering', 'donation', 'eco-action', 'community'];
    types.forEach(type => {
        const count = activities.filter(a => a.type === type).length;
        if (count >= 5) {
            let badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Star`;
            badgesDiv.appendChild(badge);
        }
    });
    if (badgesDiv.innerHTML === '') {
        badgesDiv.innerHTML = '<span>No badges yet. Log more activities!</span>';
    }
}

shareBtn.addEventListener('click', function() {
    // Simple share logic (copy summary to clipboard)
    let summary = `My Social Impact:\n`;
    activities.forEach(a => {
        summary += `${a.description} (${a.type}) on ${new Date(a.date).toLocaleDateString()}\n`;
    });
    navigator.clipboard.writeText(summary).then(() => {
        alert('Impact summary copied! Share it with your friends or on social media.');
    });
});

// Initial render
renderActivities();
renderImpactMetrics();
renderBadges();
