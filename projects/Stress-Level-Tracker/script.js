// Stress Level Tracker Script
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const stressForm = document.getElementById('stressForm');
    const stressLevelInput = document.getElementById('stressLevel');
    const currentStressCircle = document.getElementById('currentStressCircle');
    const currentStressNumber = document.getElementById('currentStressNumber');
    const currentStressLabel = document.getElementById('currentStressLabel');
    const lastUpdatedEl = document.getElementById('lastUpdated');
    const timeRangeSelect = document.getElementById('timeRange');
    const entriesList = document.getElementById('entriesList');
    const avgStressEl = document.getElementById('avgStress');
    const stressTrendEl = document.getElementById('stressTrend');
    const recommendationsEl = document.getElementById('recommendations');

    // Chart Canvases
    const stressChartCanvas = document.getElementById('stressChart');
    const moodChartCanvas = document.getElementById('moodChart');

    // Charts
    let stressChart;
    let moodChart;

    // Coping tips database
    const copingTips = {
        low: [
            { title: '🧘‍♀️ Mindfulness', content: 'Practice mindfulness meditation for 5-10 minutes daily.' },
            { title: '📚 Learning', content: 'Engage in a new hobby or skill to keep your mind active.' },
            { title: '🤝 Social Connection', content: 'Reach out to friends or family for meaningful conversations.' }
        ],
        moderate: [
            { title: '🫁 Deep Breathing', content: 'Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7, exhale for 8.' },
            { title: '🚶‍♀️ Physical Activity', content: 'Take a 20-minute walk in nature to clear your mind.' },
            { title: '📝 Journaling', content: 'Write down three things you\'re grateful for today.' }
        ],
        high: [
            { title: '⏸️ Take a Break', content: 'Step away from stressful situations and do something enjoyable.' },
            { title: '💪 Progressive Relaxation', content: 'Tense and release each muscle group from toes to head.' },
            { title: '🗣️ Talk It Out', content: 'Share your feelings with a trusted friend or professional.' },
            { title: '🎵 Music Therapy', content: 'Listen to calming music or sounds that help you relax.' }
        ]
    };

    // Initialize
    initializeApp();

    function initializeApp() {
        loadData();
        setupEventListeners();
        updateAllDisplays();
    }

    function setupEventListeners() {
        stressForm.addEventListener('submit', handleStressSubmit);
        stressLevelInput.addEventListener('input', updateStressDisplay);
        timeRangeSelect.addEventListener('change', updateStressChart);
    }

    function handleStressSubmit(e) {
        e.preventDefault();

        const stressEntry = {
            date: new Date().toISOString(),
            stressLevel: parseInt(stressLevelInput.value),
            mood: document.getElementById('mood').value,
            triggers: document.getElementById('triggers').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().getTime()
        };

        saveStressEntry(stressEntry);
        stressForm.reset();
        updateStressDisplay();
        loadData();
        updateAllDisplays();
    }

    function updateStressDisplay() {
        const level = parseInt(stressLevelInput.value);
        currentStressNumber.textContent = level;

        let label, className;
        if (level <= 3) {
            label = 'Low';
            className = 'low';
        } else if (level <= 7) {
            label = 'Moderate';
            className = 'moderate';
        } else {
            label = 'High';
            className = 'high';
        }

        currentStressLabel.textContent = label;
        currentStressCircle.className = `stress-circle ${className}`;
    }

    function saveStressEntry(entry) {
        let entries = getStoredEntries();
        entries.push(entry);
        localStorage.setItem('stressEntries', JSON.stringify(entries));
    }

    function getStoredEntries() {
        return JSON.parse(localStorage.getItem('stressEntries')) || [];
    }

    function loadData() {
        // This function triggers updates
    }

    function updateAllDisplays() {
        updateCurrentStress();
        updateStressChart();
        updateMoodChart();
        updateCopingTips();
        updateRecentEntries();
        updateInsights();
    }

    function updateCurrentStress() {
        const entries = getStoredEntries();
        if (entries.length === 0) {
            currentStressNumber.textContent = '5';
            currentStressLabel.textContent = 'Moderate';
            currentStressCircle.className = 'stress-circle moderate';
            lastUpdatedEl.textContent = 'Not logged yet';
            return;
        }

        const latest = entries[entries.length - 1];
        currentStressNumber.textContent = latest.stressLevel;

        let label, className;
        if (latest.stressLevel <= 3) {
            label = 'Low';
            className = 'low';
        } else if (latest.stressLevel <= 7) {
            label = 'Moderate';
            className = 'moderate';
        } else {
            label = 'High';
            className = 'high';
        }

        currentStressLabel.textContent = label;
        currentStressCircle.className = `stress-circle ${className}`;
        lastUpdatedEl.textContent = `Last updated: ${formatDateTime(latest.date)}`;
    }

    function updateStressChart() {
        const entries = getStoredEntries();
        const days = parseInt(timeRangeSelect.value);

        // Filter entries for the selected time range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const filteredEntries = entries.filter(entry =>
            new Date(entry.date) >= cutoffDate
        );

        // Group by date
        const dailyData = {};
        filteredEntries.forEach(entry => {
            const dateKey = new Date(entry.date).toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = [];
            }
            dailyData[dateKey].push(entry.stressLevel);
        });

        // Calculate daily averages
        const labels = [];
        const data = [];
        const sortedDates = Object.keys(dailyData).sort();

        sortedDates.forEach(date => {
            labels.push(new Date(date));
            const levels = dailyData[date];
            const avg = levels.reduce((sum, level) => sum + level, 0) / levels.length;
            data.push(avg);
        });

        if (stressChart) {
            stressChart.destroy();
        }

        stressChart = new Chart(stressChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Stress Level',
                    data: data,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM dd'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function updateMoodChart() {
        const entries = getStoredEntries();
        const moodCounts = {};

        entries.forEach(entry => {
            if (entry.mood) {
                moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            }
        });

        const labels = Object.keys(moodCounts);
        const data = Object.values(moodCounts);

        if (moodChart) {
            moodChart.destroy();
        }

        moodChart = new Chart(moodChartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels.map(mood => getMoodEmoji(mood) + ' ' + mood.charAt(0).toUpperCase() + mood.slice(1)),
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',   // happy
                        'rgba(139, 195, 74, 0.8)',  // content
                        'rgba(255, 193, 7, 0.8)',   // neutral
                        'rgba(255, 152, 0, 0.8)',   // anxious
                        'rgba(244, 67, 54, 0.8)',   // stressed
                        'rgba(121, 85, 72, 0.8)',   // sad
                        'rgba(255, 87, 34, 0.8)',   // angry
                        'rgba(233, 30, 99, 0.8)'    // overwhelmed
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    function updateCopingTips() {
        const entries = getStoredEntries();
        if (entries.length === 0) return;

        const latest = entries[entries.length - 1];
        const level = latest.stressLevel;

        let tips;
        if (level <= 3) {
            tips = copingTips.low;
        } else if (level <= 7) {
            tips = copingTips.moderate;
        } else {
            tips = copingTips.high;
        }

        const copingContent = document.getElementById('copingContent');
        copingContent.innerHTML = tips.map(tip => `
            <div class="tip-item">
                <h3>${tip.title}</h3>
                <p>${tip.content}</p>
            </div>
        `).join('');
    }

    function updateRecentEntries() {
        const entries = getStoredEntries();
        const recent = entries.slice(-5).reverse(); // Last 5 entries, most recent first

        if (recent.length === 0) {
            entriesList.innerHTML = '<p class="no-data">No stress logs yet. Start tracking your stress levels!</p>';
            return;
        }

        entriesList.innerHTML = recent.map(entry => {
            const stressClass = entry.stressLevel <= 3 ? 'low' : entry.stressLevel <= 7 ? 'moderate' : 'high';
            return `
                <div class="entry-item">
                    <div class="entry-header">
                        <span class="entry-date">${formatDateTime(entry.date)}</span>
                        <span class="entry-stress ${stressClass}">${entry.stressLevel}/10</span>
                    </div>
                    ${entry.mood ? `<div class="entry-mood">${getMoodEmoji(entry.mood)} ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</div>` : ''}
                    <div class="entry-details">
                        ${entry.triggers ? `<strong>Triggers:</strong> ${entry.triggers}<br>` : ''}
                        ${entry.notes ? `<strong>Notes:</strong> ${entry.notes}` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateInsights() {
        const entries = getStoredEntries();

        if (entries.length === 0) {
            avgStressEl.textContent = 'No data available';
            stressTrendEl.textContent = 'Start logging to see trends';
            recommendationsEl.textContent = 'Log your stress levels regularly to get personalized insights';
            return;
        }

        // Average stress
        const totalStress = entries.reduce((sum, entry) => sum + entry.stressLevel, 0);
        const avgStress = (totalStress / entries.length).toFixed(1);
        avgStressEl.textContent = `${avgStress}/10 (${getStressDescription(parseFloat(avgStress))})`;

        // Stress trend (compare first half vs second half)
        const midpoint = Math.floor(entries.length / 2);
        const firstHalf = entries.slice(0, midpoint);
        const secondHalf = entries.slice(midpoint);

        if (firstHalf.length > 0 && secondHalf.length > 0) {
            const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.stressLevel, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.stressLevel, 0) / secondHalf.length;
            const difference = secondAvg - firstAvg;

            if (Math.abs(difference) < 0.5) {
                stressTrendEl.textContent = 'Your stress levels have been relatively stable';
            } else if (difference > 0) {
                stressTrendEl.textContent = `Stress levels have increased by ${difference.toFixed(1)} points recently`;
            } else {
                stressTrendEl.textContent = `Stress levels have decreased by ${Math.abs(difference).toFixed(1)} points - great progress!`;
            }
        } else {
            stressTrendEl.textContent = 'Need more data to analyze trends';
        }

        // Recommendations
        const latest = entries[entries.length - 1];
        let recommendation = '';

        if (latest.stressLevel >= 8) {
            recommendation = 'Your stress levels are high. Consider speaking with a mental health professional and try the coping strategies above.';
        } else if (latest.stressLevel >= 6) {
            recommendation = 'You\'re experiencing moderate stress. Try incorporating daily relaxation techniques and regular exercise.';
        } else if (latest.stressLevel <= 3) {
            recommendation = 'Your stress levels are low - keep up the good work with your current stress management strategies!';
        } else {
            recommendation = 'Your stress levels are moderate. Continue monitoring and use coping strategies when needed.';
        }

        recommendationsEl.textContent = recommendation;
    }

    // Helper functions
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function getStressDescription(level) {
        if (level <= 3) return 'Low';
        if (level <= 7) return 'Moderate';
        return 'High';
    }

    function getMoodEmoji(mood) {
        const emojis = {
            happy: '😊',
            content: '🙂',
            neutral: '😐',
            anxious: '😰',
            stressed: '😫',
            sad: '😢',
            angry: '😠',
            overwhelmed: '😵'
        };
        return emojis[mood] || '😐';
    }
});