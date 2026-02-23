let activities = JSON.parse(localStorage.getItem('outdoorData')) || [];

const tips = [
    "Always check the weather forecast before heading out.",
    "Carry a fully charged phone and emergency supplies.",
    "Tell someone your plans and expected return time.",
    "Stay on marked trails and respect wildlife.",
    "Wear appropriate clothing and sun protection.",
    "Carry enough water and snacks for your activity.",
    "Know your limits and don't push beyond your capabilities.",
    "Learn basic first aid and carry a small kit.",
    "Be aware of your surroundings and potential hazards.",
    "Respect Leave No Trace principles in nature."
];

function logActivity() {
    const activityType = document.getElementById('activityType').value;
    const location = document.getElementById('location').value.trim();
    const distance = parseFloat(document.getElementById('distance').value);
    const duration = parseInt(document.getElementById('duration').value);
    const date = document.getElementById('activityDate').value;

    if (!location || !distance || !duration || !date) {
        alert('Please fill in all fields');
        return;
    }

    const activity = { activityType, location, distance, duration, date };

    activities.push(activity);
    localStorage.setItem('outdoorData', JSON.stringify(activities));

    updateStats();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('activityType').value = 'hiking';
    document.getElementById('location').value = '';
    document.getElementById('distance').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('activityDate').value = '';
}

function updateStats() {
    const totalDistance = activities.reduce((sum, activity) => sum + activity.distance, 0);
    const totalActivities = activities.length;
    const avgDistance = totalActivities ? totalDistance / totalActivities : 0;

    // Find favorite location
    const locationCounts = {};
    activities.forEach(activity => {
        locationCounts[activity.location] = (locationCounts[activity.location] || 0) + 1;
    });
    const favoriteLocation = Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b, 'None');

    document.getElementById('totalDistance').textContent = totalDistance.toFixed(1);
    document.getElementById('totalActivities').textContent = totalActivities;
    document.getElementById('favoriteLocation').textContent = favoriteLocation;
    document.getElementById('avgDistance').textContent = avgDistance.toFixed(1);
}

function drawChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (activities.length === 0) return;

    // Group by location and sum distances
    const locationData = {};
    activities.forEach(activity => {
        if (!locationData[activity.location]) {
            locationData[activity.location] = 0;
        }
        locationData[activity.location] += activity.distance;
    });

    const locations = Object.keys(locationData);
    const distances = Object.values(locationData);

    const chartWidth = 350;
    const chartHeight = 150;
    const barWidth = chartWidth / locations.length;
    const maxDistance = Math.max(...distances);

    locations.forEach((location, index) => {
        const x = 25 + index * barWidth;
        const height = (distances[index] / maxDistance) * chartHeight;
        const y = ctx.canvas.height - height - 30;

        ctx.fillStyle = '#8fbc8f';
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(distances[index].toFixed(1) + 'km', x + 5, y - 5);
        ctx.fillText(location.length > 8 ? location.substring(0, 8) + '...' : location, x + 5, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('activityHistory');
    historyEl.innerHTML = '';

    activities.slice(-5).reverse().forEach(activity => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${activity.date}: ${activity.activityType} at ${activity.location}</span>
            <span>${activity.distance}km in ${activity.duration}min</span>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
updateStats();
updateHistory();
drawChart();
getNewTip();