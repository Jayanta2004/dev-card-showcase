let entries = JSON.parse(localStorage.getItem('overstimulationData')) || [];

const tips = [
    "Take regular screen breaks using the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.",
    "Reduce blue light exposure by using night mode or blue light filters, especially in the evening.",
    "Practice mindfulness and meditation to manage digital stress and overstimulation.",
    "Set specific times for checking emails and social media instead of constant monitoring.",
    "Create a 'digital sunset' routine - no screens 1 hour before bedtime.",
    "Use the 'digital detox' approach: designate screen-free zones in your home.",
    "Stay hydrated and maintain regular physical activity to combat digital fatigue.",
    "Prioritize quality sleep - digital overstimulation can significantly impact sleep quality.",
    "Practice deep breathing exercises when feeling overwhelmed by digital information.",
    "Limit multitasking on digital devices - focus on one task at a time."
];

let correlationChart;

function init() {
    document.getElementById('logDate').valueAsDate = new Date();
    document.getElementById('severity').addEventListener('input', updateSeverityValue);
    updateSeverityValue();
    updateStats();
    updateHistory();
    getNewTip();
}

function updateSeverityValue() {
    document.getElementById('severityValue').textContent = document.getElementById('severity').value;
}

function logEntry() {
    const symptoms = [];
    const symptomCheckboxes = document.querySelectorAll('.symptoms input[type="checkbox"]');
    symptomCheckboxes.forEach(cb => {
        if (cb.checked) {
            symptoms.push(cb.parentElement.textContent.trim());
        }
    });

    const screenTime = parseFloat(document.getElementById('screenTime').value);
    const severity = parseInt(document.getElementById('severity').value);
    const date = document.getElementById('logDate').value;
    const notes = document.getElementById('notes').value;

    if (symptoms.length === 0 || isNaN(screenTime) || !date) {
        alert('Please fill in all required fields.');
        return;
    }

    const entry = {
        symptoms,
        screenTime,
        severity,
        date,
        notes,
        timestamp: new Date().toISOString()
    };

    entries.push(entry);
    localStorage.setItem('overstimulationData', JSON.stringify(entries));

    // Reset form
    symptomCheckboxes.forEach(cb => cb.checked = false);
    document.getElementById('screenTime').value = '';
    document.getElementById('severity').value = '5';
    document.getElementById('notes').value = '';
    updateSeverityValue();

    updateStats();
    updateHistory();
    alert('Entry logged successfully!');
}

function updateStats() {
    if (entries.length === 0) {
        document.getElementById('avgSymptomsPerHour').textContent = '0';
        document.getElementById('mostCommonSymptom').textContent = 'None';
        document.getElementById('totalScreenTime').textContent = '0';
        document.getElementById('totalEntries').textContent = '0';
        return;
    }

    const totalScreenTime = entries.reduce((sum, entry) => sum + entry.screenTime, 0);
    const totalSymptoms = entries.reduce((sum, entry) => sum + entry.symptoms.length, 0);
    const avgSymptomsPerHour = (totalSymptoms / totalScreenTime).toFixed(2);

    const symptomCount = {};
    entries.forEach(entry => {
        entry.symptoms.forEach(symptom => {
            symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
    });
    const mostCommonSymptom = Object.keys(symptomCount).reduce((a, b) => symptomCount[a] > symptomCount[b] ? a : b, 'None');

    document.getElementById('avgSymptomsPerHour').textContent = avgSymptomsPerHour;
    document.getElementById('mostCommonSymptom').textContent = mostCommonSymptom;
    document.getElementById('totalScreenTime').textContent = totalScreenTime.toFixed(1);
    document.getElementById('totalEntries').textContent = entries.length;

    updateChart();
}

function updateChart() {
    const ctx = document.getElementById('correlationChart').getContext('2d');

    if (correlationChart) {
        correlationChart.destroy();
    }

    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedEntries.map(entry => entry.date);
    const screenTimeData = sortedEntries.map(entry => entry.screenTime);
    const symptomCountData = sortedEntries.map(entry => entry.symptoms.length);

    correlationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Screen Time (hours)',
                data: screenTimeData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                yAxisID: 'y',
            }, {
                label: 'Symptoms Count',
                data: symptomCountData,
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                yAxisID: 'y1',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Screen Time (hours)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Symptoms Count'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateHistory() {
    const historyList = document.getElementById('entryHistory');
    historyList.innerHTML = '';

    const recentEntries = entries.slice(-10).reverse(); // Show last 10 entries

    recentEntries.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${entry.date}</strong><br>
            Symptoms: ${entry.symptoms.join(', ')}<br>
            Screen Time: ${entry.screenTime} hours<br>
            Severity: ${entry.severity}/10<br>
            ${entry.notes ? `Notes: ${entry.notes}` : ''}
        `;
        historyList.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);