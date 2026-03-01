// Hydration Timing Optimizer JavaScript

let hydrationEntries = JSON.parse(localStorage.getItem('hydrationEntries')) || [];
let dailyGoal = parseInt(localStorage.getItem('dailyGoal')) || 64;

// Hydration tips
const HYDRATION_TIPS = [
    {
        title: 'Start Your Day Right',
        text: 'Drink a glass of water first thing in the morning to rehydrate after sleep.'
    },
    {
        title: 'Pre-Meal Hydration',
        text: 'Drink water 30 minutes before meals to aid digestion and prevent overeating.'
    },
    {
        title: 'Exercise Boost',
        text: 'Drink water before, during, and after exercise. For every pound lost during activity, drink 16-24 oz.'
    },
    {
        title: 'Caffeine Balance',
        text: 'For every caffeinated drink, add an extra glass of water to compensate for the diuretic effect.'
    },
    {
        title: 'Weather Awareness',
        text: 'Increase intake on hot days or when you\'re in air-conditioned environments.'
    },
    {
        title: 'Listen to Your Body',
        text: 'Dark yellow urine indicates you need more water. Clear or light yellow is ideal.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
});

function initializeApp() {
    // Set default time to now
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('logTime').value = timeString;

    // Event listeners
    document.getElementById('hydrationForm').addEventListener('submit', logHydrationEntry);
    document.getElementById('updateGoalBtn').addEventListener('click', updateGoal);
    document.getElementById('customLogBtn').addEventListener('click', logCustomAmount);

    // Quick log buttons
    document.querySelectorAll('.water-btn').forEach(btn => {
        btn.addEventListener('click', () => quickLog(btn.dataset.amount));
    });

    // Set initial goal display
    document.getElementById('goalAmount').value = dailyGoal;
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

function quickLog(amount) {
    const now = new Date();
    const entry = {
        id: Date.now(),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        amount: parseInt(amount),
        drinkType: 'water',
        notes: 'Quick log',
        timestamp: now.toISOString()
    };

    hydrationEntries.push(entry);
    localStorage.setItem('hydrationEntries', JSON.stringify(hydrationEntries));

    updateDisplay();

    // Visual feedback
    const btn = document.querySelector(`[data-amount="${amount}"]`);
    btn.style.background = 'var(--primary-color)';
    btn.style.color = 'white';
    setTimeout(() => {
        btn.style.background = 'var(--bg-secondary)';
        btn.style.color = 'var(--text-primary)';
    }, 200);
}

function logCustomAmount() {
    const amount = parseInt(document.getElementById('customAmount').value);
    if (amount && amount > 0) {
        quickLog(amount);
        document.getElementById('customAmount').value = '';
    }
}

function logHydrationEntry(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: document.getElementById('logTime').value,
        amount: parseInt(document.getElementById('amount').value),
        drinkType: document.getElementById('drinkType').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };

    hydrationEntries.push(entry);
    localStorage.setItem('hydrationEntries', JSON.stringify(hydrationEntries));

    // Reset form
    document.getElementById('hydrationForm').reset();
    document.getElementById('logTime').value = new Date().toTimeString().slice(0, 5);

    updateDisplay();

    // Show success message
    alert('Hydration entry logged successfully!');
}

function updateGoal() {
    const newGoal = parseInt(document.getElementById('goalAmount').value);
    if (newGoal && newGoal >= 16 && newGoal <= 200) {
        dailyGoal = newGoal;
        localStorage.setItem('dailyGoal', dailyGoal);
        updateDisplay();
        alert('Daily goal updated successfully!');
    } else {
        alert('Please enter a goal between 16 and 200 oz.');
    }
}

function updateDisplay() {
    updateProgress();
    updateTimeline();
    updateAnalytics();
    updateChart();
    updateTips();
}

function updateProgress() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = hydrationEntries.filter(e => e.date === today);
    const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);

    // Update progress circle
    const percentage = Math.min((todayTotal / dailyGoal) * 100, 100);
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (percentage / 100) * circumference;

    document.getElementById('progressCircle').style.strokeDashoffset = offset;
    document.getElementById('currentIntake').textContent = todayTotal;
    document.getElementById('dailyGoal').textContent = `${dailyGoal} oz`;
    document.getElementById('remaining').textContent = `${Math.max(0, dailyGoal - todayTotal)} oz`;

    // Color coding
    const circle = document.getElementById('progressCircle');
    if (percentage >= 100) {
        circle.style.stroke = '#4CAF50'; // Green
    } else if (percentage >= 75) {
        circle.style.stroke = 'var(--primary-color)'; // Blue
    } else if (percentage >= 50) {
        circle.style.stroke = '#FF9800'; // Orange
    } else {
        circle.style.stroke = '#F44336'; // Red
    }
}

function updateTimeline() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = hydrationEntries.filter(e => e.date === today)
        .sort((a, b) => a.time.localeCompare(b.time));

    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    if (todayEntries.length === 0) {
        timeline.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entries today. Start logging your hydration!</p>';
        return;
    }

    todayEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'timeline-item';

        item.innerHTML = `
            <div class="timeline-time">${entry.time}</div>
            <div class="timeline-content">
                <div class="timeline-amount">${entry.amount} oz ${entry.drinkType !== 'water' ? `(${entry.drinkType})` : ''}</div>
                ${entry.notes ? `<div class="timeline-details">${entry.notes}</div>` : ''}
            </div>
            <div class="timeline-actions">
                <button class="btn-small btn-secondary" onclick="deleteEntry(${entry.id})">Delete</button>
            </div>
        `;

        timeline.appendChild(item);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        hydrationEntries = hydrationEntries.filter(e => e.id !== id);
        localStorage.setItem('hydrationEntries', JSON.stringify(hydrationEntries));
        updateDisplay();
    }
}

function updateAnalytics() {
    // Calculate metrics
    const totalEntries = hydrationEntries.length;
    if (totalEntries === 0) return;

    // Average daily intake
    const uniqueDates = [...new Set(hydrationEntries.map(e => e.date))];
    const totalIntake = hydrationEntries.reduce((sum, e) => sum + e.amount, 0);
    const avgDaily = Math.round(totalIntake / uniqueDates.length);
    document.getElementById('avgDaily').textContent = `${avgDaily} oz`;

    // Consistency (how many days met goal)
    const goalMetDays = uniqueDates.filter(date => {
        const dayEntries = hydrationEntries.filter(e => e.date === date);
        const dayTotal = dayEntries.reduce((sum, e) => sum + e.amount, 0);
        return dayTotal >= dailyGoal;
    }).length;
    const consistency = uniqueDates.length > 0 ? Math.round((goalMetDays / uniqueDates.length) * 100) : 0;
    document.getElementById('consistency').textContent = `${consistency}%`;

    // Peak hour
    const hourCounts = {};
    hydrationEntries.forEach(entry => {
        const hour = entry.time.split(':')[0];
        hourCounts[hour] = (hourCounts[hour] || 0) + entry.amount;
    });
    const peakHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, '12');
    document.getElementById('peakHour').textContent = `${peakHour}:00`;

    // Longest gap
    const todayEntries = hydrationEntries.filter(e => e.date === new Date().toISOString().split('T')[0])
        .sort((a, b) => a.time.localeCompare(b.time));

    let longestGap = 0;
    for (let i = 1; i < todayEntries.length; i++) {
        const prevTime = todayEntries[i-1].time.split(':').map(Number);
        const currTime = todayEntries[i].time.split(':').map(Number);
        const prevMinutes = prevTime[0] * 60 + prevTime[1];
        const currMinutes = currTime[0] * 60 + currTime[1];
        const gap = currMinutes - prevMinutes;
        longestGap = Math.max(longestGap, gap);
    }

    const gapHours = Math.floor(longestGap / 60);
    const gapMinutes = longestGap % 60;
    document.getElementById('longestGap').textContent = `${gapHours}:${gapMinutes.toString().padStart(2, '0')}`;
}

function updateChart() {
    const canvas = document.getElementById('timingChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    // Get last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayEntries = hydrationEntries.filter(e => e.date === dateStr);
        const dayTotal = dayEntries.reduce((sum, e) => sum + e.amount, 0);
        last7Days.push({
            date: dateStr,
            total: dayTotal,
            goal: dailyGoal
        });
    }

    if (last7Days.every(day => day.total === 0)) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Start logging to see your hydration trends', width / 2, height / 2);
        return;
    }

    const maxValue = Math.max(...last7Days.map(d => Math.max(d.total, d.goal)));
    const barWidth = (width - 60) / last7Days.length;
    const barSpacing = barWidth * 0.2;

    last7Days.forEach((day, index) => {
        const x = 40 + index * barWidth;
        const barHeight = (day.total / maxValue) * (height - 60);
        const goalHeight = (day.goal / maxValue) * (height - 60);

        // Goal line
        ctx.strokeStyle = 'var(--border-color)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, height - 30 - goalHeight);
        ctx.lineTo(x + barWidth - barSpacing, height - 30 - goalHeight);
        ctx.stroke();

        // Intake bar
        const barColor = day.total >= day.goal ? '#4CAF50' : day.total >= day.goal * 0.75 ? 'var(--primary-color)' : '#FF9800';
        ctx.fillStyle = barColor;
        ctx.fillRect(x, height - 30 - barHeight, barWidth - barSpacing, barHeight);

        // Date label
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const date = new Date(day.date);
        ctx.fillText(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), x + (barWidth - barSpacing) / 2, height - 10);
    });

    // Y-axis labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${maxValue} oz`, 35, 20);
    ctx.fillText('0 oz', 35, height - 35);
}

function updateTips() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = hydrationEntries.filter(e => e.date === today);
    const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);

    // Timing tip
    const timingElement = document.getElementById('timingTip');
    if (todayEntries.length >= 3) {
        const times = todayEntries.map(e => e.time).sort();
        const firstTime = times[0];
        const lastTime = times[times.length - 1];
        timingElement.innerHTML = `<p>Your hydration window today: ${firstTime} to ${lastTime}. Aim for more even distribution.</p>`;
    } else {
        timingElement.innerHTML = `<p>Log more entries throughout the day for optimal hydration timing.</p>`;
    }

    // Activity tip
    const activityElement = document.getElementById('activityTip');
    const recentCaffeine = todayEntries.filter(e => e.drinkType === 'coffee' || e.drinkType === 'soda').length;
    if (recentCaffeine > 0) {
        activityElement.innerHTML = `<p>You've had ${recentCaffeine} caffeinated drink(s) today. Remember to balance with extra water.</p>`;
    } else {
        activityElement.innerHTML = `<p>Great job staying hydrated with water! Keep up the good work.</p>`;
    }

    // Body signals
    const bodyElement = document.getElementById('bodySignals');
    const progressPercent = (todayTotal / dailyGoal) * 100;
    if (progressPercent < 50) {
        bodyElement.innerHTML = `<p>You're ${Math.round(50 - progressPercent)}% below your goal. Listen to your body's thirst signals.</p>`;
    } else if (progressPercent >= 100) {
        bodyElement.innerHTML = `<p>Excellent! You've met your hydration goal. Keep listening to your body.</p>`;
    } else {
        bodyElement.innerHTML = `<p>You're on track! Continue drinking regularly throughout the day.</p>`;
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');
    tipsContainer.innerHTML = '';

    HYDRATION_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <div class="tip-icon">
                <i data-lucide="lightbulb"></i>
            </div>
            <div class="tip-content">
                <h4>${tip.title}</h4>
                <p>${tip.text}</p>
            </div>
        `;
        tipsContainer.appendChild(tipElement);
    });

    // Re-initialize icons
    lucide.createIcons();
}