// Mindful Break Reminder
// Author: EWOC Contributors
// Description: Suggests short, science-backed mindfulness or movement breaks based on user stress/activity.

const breaks = [
    { type: 'mindfulness', text: 'Try 2 minutes of deep breathing. Inhale for 4, exhale for 6. Science shows this calms the nervous system.' },
    { type: 'mindfulness', text: 'Do a 3-minute body scan. Notice sensations from head to toe. This increases present-moment awareness.' },
    { type: 'movement', text: 'Stand up and stretch your arms overhead, then touch your toes. Movement breaks reduce fatigue and boost focus.' },
    { type: 'movement', text: 'Take a brisk 5-minute walk. Even short walks improve mood and creativity.' },
    { type: 'mindfulness', text: 'Close your eyes and listen to surrounding sounds for 2 minutes. Mindful listening reduces stress.' },
    { type: 'movement', text: 'Do 10 slow shoulder rolls forward and backward. This relieves tension from sitting.' },
    { type: 'mindfulness', text: 'Try box breathing: Inhale 4, hold 4, exhale 4, hold 4. Repeat for 1 minute.' },
    { type: 'movement', text: 'March in place for 2 minutes. Light activity increases circulation.' },
    { type: 'mindfulness', text: 'Write down 3 things you’re grateful for. Gratitude practices are proven to boost well-being.' },
    { type: 'movement', text: 'Do 10 gentle neck stretches side to side. This helps prevent stiffness.' }
];

const STORAGE_KEY = 'mindfulBreakHistory';

const form = document.getElementById('logForm');
const suggestionDiv = document.getElementById('suggestion');
const logBreakBtn = document.getElementById('logBreakBtn');
const confirmation = document.getElementById('confirmation');
const historyDiv = document.getElementById('history');

let currentBreak = null;

function getHistory() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function suggestBreak(stress, activity) {
    // Simple logic: higher stress = mindfulness, low stress = movement
    let filtered;
    if (stress >= 7) filtered = breaks.filter(b => b.type === 'mindfulness');
    else if (activity === 'sitting' || activity === 'working' || activity === 'studying') filtered = breaks.filter(b => b.type === 'movement');
    else filtered = breaks;
    return filtered[Math.floor(Math.random() * filtered.length)];
}

function renderHistory() {
    const history = getHistory();
    if (!history.length) {
        historyDiv.innerHTML = '<em>No breaks logged yet.</em>';
        return;
    }
    historyDiv.innerHTML = history.slice().reverse().map(h =>
        `<div class="history-card">
            <div class="meta">${h.date} | Stress: ${h.stress} | Activity: ${h.activity}</div>
            <div>${h.text}</div>
        </div>`
    ).join('');
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const stress = parseInt(form.stress.value);
    const activity = form.activity.value;
    if (!stress || !activity) return;
    currentBreak = suggestBreak(stress, activity);
    suggestionDiv.textContent = currentBreak.text;
    suggestionDiv.classList.remove('hidden');
    logBreakBtn.classList.remove('hidden');
});

logBreakBtn.addEventListener('click', function() {
    if (!currentBreak) return;
    const stress = parseInt(form.stress.value);
    const activity = form.activity.value;
    const history = getHistory();
    history.push({
        date: new Date().toISOString().split('T')[0],
        stress,
        activity,
        text: currentBreak.text
    });
    saveHistory(history);
    confirmation.textContent = 'Break logged!';
    confirmation.classList.remove('hidden');
    renderHistory();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
    suggestionDiv.classList.add('hidden');
    logBreakBtn.classList.add('hidden');
    currentBreak = null;
    form.reset();
});

// Initial load
renderHistory();
