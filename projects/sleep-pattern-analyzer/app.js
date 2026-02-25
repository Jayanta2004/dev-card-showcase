// Sleep Pattern Analyzer JavaScript
// Handles sleep logging, visualization, and advice

const sleepLogForm = document.getElementById('sleep-log-form');
const sleepChart = document.getElementById('sleep-chart');
const sleepAdvice = document.getElementById('sleep-advice');
let sleepData = [];

sleepLogForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('sleep-date').value;
    const sleepTime = document.getElementById('sleep-time').value;
    const wakeTime = document.getElementById('wake-time').value;
    if (date && sleepTime && wakeTime) {
        sleepData.push({ date, sleepTime, wakeTime });
        renderChart();
        renderAdvice();
        sleepLogForm.reset();
    }
});

function renderChart() {
    const ctx = sleepChart.getContext('2d');
    ctx.clearRect(0, 0, sleepChart.width, sleepChart.height);
    ctx.font = '16px Arial';
    ctx.fillText('Sleep Duration (hours)', 10, 20);
    if (sleepData.length === 0) return;
    let maxHours = 12;
    let barWidth = 40;
    let gap = 20;
    sleepData.forEach((entry, i) => {
        let sleep = parseTime(entry.sleepTime);
        let wake = parseTime(entry.wakeTime);
        let duration = calcDuration(sleep, wake);
        let x = 10 + i * (barWidth + gap);
        let y = sleepChart.height - (duration / maxHours) * (sleepChart.height - 40);
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(x, y, barWidth, sleepChart.height - y - 20);
        ctx.fillStyle = '#333';
        ctx.fillText(entry.date, x, sleepChart.height - 5);
        ctx.fillText(duration.toFixed(2), x, y - 5);
    });
}

function parseTime(timeStr) {
    let [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
}

function calcDuration(sleep, wake) {
    let duration = wake - sleep;
    if (duration < 0) duration += 24;
    return duration;
}

function renderAdvice() {
    if (sleepData.length === 0) {
        sleepAdvice.innerHTML = '<p>Log your sleep to get advice!</p>';
        return;
    }
    let durations = sleepData.map(entry => calcDuration(parseTime(entry.sleepTime), parseTime(entry.wakeTime)));
    let avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    let advice = '';
    if (avg < 6) {
        advice = 'You are getting less than recommended sleep. Try to increase your sleep duration.';
    } else if (avg > 9) {
        advice = 'You are sleeping more than average. Ensure it is not affecting your daily productivity.';
    } else {
        advice = 'Your sleep duration is within the healthy range. Keep it up!';
    }
    let consistency = checkConsistency(durations);
    advice += '<br>' + consistency;
    sleepAdvice.innerHTML = `<p>${advice}</p>`;
}

function checkConsistency(durations) {
    let std = standardDeviation(durations);
    if (std > 1.5) {
        return 'Your sleep schedule is inconsistent. Try to maintain regular sleep times.';
    } else {
        return 'Your sleep schedule is consistent.';
    }
}

function standardDeviation(arr) {
    let mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    let sqDiff = arr.map(x => Math.pow(x - mean, 2));
    let avgSqDiff = sqDiff.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(avgSqDiff);
}
