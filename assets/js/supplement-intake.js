let supplements = JSON.parse(localStorage.getItem('supplements')) || [];
let intakeHistory = JSON.parse(localStorage.getItem('intakeHistory')) || [];

const safetyNotes = [
    "Always consult with a healthcare professional before starting new supplements.",
    "Do not exceed recommended dosages to avoid potential side effects.",
    "Store supplements in a cool, dry place away from direct sunlight.",
    "Check for interactions with medications or other supplements.",
    "Quality matters - choose supplements from reputable manufacturers.",
    "Keep supplements out of reach of children.",
    "Read labels carefully and follow expiration dates.",
    "Stay hydrated when taking supplements, especially vitamins.",
    "Monitor your body's response and discontinue if adverse effects occur.",
    "Supplements are not a substitute for a balanced diet."
];

function addSupplement() {
    const name = document.getElementById('supplementName').value.trim();
    const dosage = document.getElementById('dosage').value.trim();
    const timesPerDay = parseInt(document.getElementById('timesPerDay').value);

    if (!name || !dosage || !timesPerDay) {
        alert('Please fill in all fields');
        return;
    }

    const supplement = {
        id: Date.now(),
        name,
        dosage,
        timesPerDay,
        doses: Array(timesPerDay).fill().map((_, i) => ({
            id: i + 1,
            taken: false,
            takenTime: null
        }))
    };

    supplements.push(supplement);
    localStorage.setItem('supplements', JSON.stringify(supplements));

    updateSchedule();
    updateHistory();

    // Clear inputs
    document.getElementById('supplementName').value = '';
    document.getElementById('dosage').value = '';
    document.getElementById('timesPerDay').value = '';
}

function takeDose(supplementId, doseId) {
    const supplement = supplements.find(s => s.id === supplementId);
    if (!supplement) return;

    const dose = supplement.doses.find(d => d.id === doseId);
    if (!dose) return;

    if (dose.taken) return; // Already taken

    dose.taken = true;
    dose.takenTime = new Date().toISOString();

    // Add to history
    intakeHistory.push({
        supplementName: supplement.name,
        dosage: supplement.dosage,
        doseId,
        takenTime: dose.takenTime
    });

    localStorage.setItem('supplements', JSON.stringify(supplements));
    localStorage.setItem('intakeHistory', JSON.stringify(intakeHistory));

    updateSchedule();
    updateHistory();
}

function updateSchedule() {
    const scheduleEl = document.getElementById('scheduleList');
    scheduleEl.innerHTML = '';

    if (supplements.length === 0) {
        scheduleEl.innerHTML = '<p>No supplements added yet.</p>';
        return;
    }

    supplements.forEach(supplement => {
        const item = document.createElement('div');
        item.className = 'supplement-item';

        const info = document.createElement('div');
        info.className = 'supplement-info';
        info.innerHTML = `
            <h3>${supplement.name}</h3>
            <p>Dosage: ${supplement.dosage}</p>
        `;

        const buttons = document.createElement('div');
        supplement.doses.forEach(dose => {
            const btn = document.createElement('button');
            btn.className = `take-btn ${dose.taken ? 'taken' : ''}`;
            btn.textContent = dose.taken ? `Taken ${dose.id}` : `Take ${dose.id}`;
            btn.onclick = () => takeDose(supplement.id, dose.id);
            buttons.appendChild(btn);
        });

        item.appendChild(info);
        item.appendChild(buttons);
        scheduleEl.appendChild(item);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('historyList');
    historyEl.innerHTML = '';

    if (intakeHistory.length === 0) {
        historyEl.innerHTML = '<li>No intake history yet.</li>';
        return;
    }

    intakeHistory.slice(-10).reverse().forEach(entry => {
        const li = document.createElement('li');
        const date = new Date(entry.takenTime);
        li.innerHTML = `
            <span>${entry.supplementName} (${entry.dosage}) - Dose ${entry.doseId}</span>
            <span>${date.toLocaleString()}</span>
        `;
        historyEl.appendChild(li);
    });
}

function getNewSafetyNote() {
    const randomNote = safetyNotes[Math.floor(Math.random() * safetyNotes.length)];
    document.getElementById('safetyNote').textContent = randomNote;
}

// Reset doses daily (simple implementation - resets all at midnight)
function resetDosesIfNewDay() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastReset');

    if (lastReset !== today) {
        supplements.forEach(supplement => {
            supplement.doses.forEach(dose => {
                dose.taken = false;
                dose.takenTime = null;
            });
        });
        localStorage.setItem('supplements', JSON.stringify(supplements));
        localStorage.setItem('lastReset', today);
    }
}

// Initialize
resetDosesIfNewDay();
updateSchedule();
updateHistory();
getNewSafetyNote();