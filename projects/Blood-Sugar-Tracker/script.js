document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('glucoseForm');
    const entriesList = document.getElementById('entriesList');
    const adviceP = document.getElementById('advice');
    const ctx = document.getElementById('glucoseChart').getContext('2d');
    
    let chart;
    
    // Load existing entries
    loadEntries();
    updateChart();
    updateAdvice();
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const glucose = parseInt(document.getElementById('glucose').value);
        const notes = document.getElementById('notes').value;
        
        const entry = {
            date,
            time,
            glucose,
            notes,
            timestamp: new Date().getTime()
        };
        
        saveEntry(entry);
        loadEntries();
        updateChart();
        updateAdvice();
        
        // Reset form
        form.reset();
        document.getElementById('date').valueAsDate = new Date();
    });
    
    function saveEntry(entry) {
        let entries = JSON.parse(localStorage.getItem('glucoseEntries')) || [];
        entries.push(entry);
        localStorage.setItem('glucoseEntries', JSON.stringify(entries));
    }
    
    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('glucoseEntries')) || [];
        entries.sort((a, b) => b.timestamp - a.timestamp);
        
        entriesList.innerHTML = '';
        entries.slice(0, 10).forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.date} ${entry.time}: ${entry.glucose} mg/dL - ${entry.notes}`;
            entriesList.appendChild(li);
        });
    }
    
    function updateChart() {
        const entries = JSON.parse(localStorage.getItem('glucoseEntries')) || [];
        
        // Group by date
        const dailyData = {};
        entries.forEach(entry => {
            if (!dailyData[entry.date]) {
                dailyData[entry.date] = [];
            }
            dailyData[entry.date].push(entry.glucose);
        });
        
        const labels = Object.keys(dailyData).sort();
        const data = labels.map(date => {
            const levels = dailyData[date];
            return levels.reduce((sum, level) => sum + level, 0) / levels.length;
        });
        
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Glucose (mg/dL)',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50
                    }
                }
            }
        });
    }
    
    function updateAdvice() {
        const entries = JSON.parse(localStorage.getItem('glucoseEntries')) || [];
        if (entries.length === 0) return;
        
        const latest = entries[entries.length - 1];
        const level = latest.glucose;
        
        let advice = '';
        if (level < 70) {
            advice = 'Low blood sugar! Eat a quick source of sugar like fruit juice or candy.';
        } else if (level >= 70 && level <= 140) {
            advice = 'Normal range. Keep up the good work with balanced meals and regular exercise.';
        } else if (level > 140 && level <= 180) {
            advice = 'Elevated. Consider light exercise or adjusting your meal portions.';
        } else {
            advice = 'High blood sugar. Consult your doctor and consider dietary changes.';
        }
        
        adviceP.textContent = advice;
    }
    
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
});