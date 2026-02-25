    // Sensory Diary Logic
// Log daily sensory experiences (touch, taste, sound) and visualize patterns

const diaryForm = document.getElementById('diary-form');
const dateInput = document.getElementById('date-input');
const touchInput = document.getElementById('touch-input');
const tasteInput = document.getElementById('taste-input');
const soundInput = document.getElementById('sound-input');
const diaryLogDiv = document.getElementById('diary-log');
const patternVisualDiv = document.getElementById('pattern-visual');

let diaryLog = JSON.parse(localStorage.getItem('sensoryDiary')) || [];

function renderDiaryLog() {
    diaryLogDiv.innerHTML = '';
    diaryLog.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'diary-entry';
        div.innerHTML = `<strong>Date:</strong> ${entry.date}<br><strong>Touch:</strong> ${entry.touch}<br><strong>Taste:</strong> ${entry.taste}<br><strong>Sound:</strong> ${entry.sound}`;
        diaryLogDiv.appendChild(div);
    });
    renderPatternVisual();
}

diaryForm.addEventListener('submit', e => {
    e.preventDefault();
    const date = dateInput.value;
    const touch = touchInput.value.trim();
    const taste = tasteInput.value.trim();
    const sound = soundInput.value.trim();
    if (!date || !touch || !taste || !sound) return;
    diaryLog.push({ date, touch, taste, sound });
    localStorage.setItem('sensoryDiary', JSON.stringify(diaryLog));
    renderDiaryLog();
    diaryForm.reset();
});

function renderPatternVisual() {
    patternVisualDiv.innerHTML = '';
    // Simple pattern visualization: frequency chart
    let touchFreq = {}, tasteFreq = {}, soundFreq = {};
    diaryLog.forEach(entry => {
        touchFreq[entry.touch] = (touchFreq[entry.touch] || 0) + 1;
        tasteFreq[entry.taste] = (tasteFreq[entry.taste] || 0) + 1;
        soundFreq[entry.sound] = (soundFreq[entry.sound] || 0) + 1;
    });
    const chart = document.createElement('div');
    chart.innerHTML = '<strong>Touch Patterns:</strong>';
    Object.keys(touchFreq).forEach(t => {
        const bar = document.createElement('div');
        bar.style.background = '#4caf50';
        bar.style.height = '18px';
        bar.style.width = `${touchFreq[t]*40}px`;
        bar.style.margin = '4px 0';
        bar.style.borderRadius = '6px';
        bar.innerHTML = `<span style="color:#fff;padding-left:8px;">${t} (${touchFreq[t]})</span>`;
        chart.appendChild(bar);
    });
    const tasteChart = document.createElement('div');
    tasteChart.innerHTML = '<strong>Taste Patterns:</strong>';
    Object.keys(tasteFreq).forEach(t => {
        const bar = document.createElement('div');
        bar.style.background = '#ff9800';
        bar.style.height = '18px';
        bar.style.width = `${tasteFreq[t]*40}px`;
        bar.style.margin = '4px 0';
        bar.style.borderRadius = '6px';
        bar.innerHTML = `<span style="color:#fff;padding-left:8px;">${t} (${tasteFreq[t]})</span>`;
        tasteChart.appendChild(bar);
    });
    const soundChart = document.createElement('div');
    soundChart.innerHTML = '<strong>Sound Patterns:</strong>';
    Object.keys(soundFreq).forEach(s => {
        const bar = document.createElement('div');
        bar.style.background = '#2196f3';
        bar.style.height = '18px';
        bar.style.width = `${soundFreq[s]*40}px`;
        bar.style.margin = '4px 0';
        bar.style.borderRadius = '6px';
        bar.innerHTML = `<span style="color:#fff;padding-left:8px;">${s} (${soundFreq[s]})</span>`;
        soundChart.appendChild(bar);
    });
    patternVisualDiv.appendChild(chart);
    patternVisualDiv.appendChild(tasteChart);
    patternVisualDiv.appendChild(soundChart);
}

renderDiaryLog();
