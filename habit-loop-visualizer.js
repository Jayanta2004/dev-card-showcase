const habitForm = document.getElementById('habit-form');
const habitLoopsDiv = document.getElementById('habit-loops');
const streaksDiv = document.getElementById('streaks');
const motivationDiv = document.getElementById('motivation');

let habits = [];
let streaks = {};

const motivationalQuotes = [
    "Small steps every day lead to big results!",
    "Consistency is the key to success.",
    "You’re building a better you!",
    "Every habit starts with a single action.",
    "Keep the streak alive!",
    "Progress, not perfection!"
];

function getRandomQuote() {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

function renderHabits() {
    habitLoopsDiv.innerHTML = '';
    habits.forEach((habit, idx) => {
        const loop = document.createElement('div');
        loop.className = 'habit-loop';
        loop.innerHTML = `
            <div class="loop-visual">
                <div class="loop-step">${habit.cue}<br><span style='font-size:0.8em;'>Cue</span></div>
                <span class="loop-arrow">&#8594;</span>
                <div class="loop-step">${habit.routine}<br><span style='font-size:0.8em;'>Routine</span></div>
                <span class="loop-arrow">&#8594;</span>
                <div class="loop-step">${habit.reward}<br><span style='font-size:0.8em;'>Reward</span></div>
            </div>
            <button onclick="markComplete(${idx})">Mark Complete</button>
            <div class="streak">Streak: <span id="streak-${idx}">${streaks[idx] || 0}</span> 🔥</div>
        `;
        habitLoopsDiv.appendChild(loop);
    });
}

window.markComplete = function(idx) {
    streaks[idx] = (streaks[idx] || 0) + 1;
    document.getElementById(`streak-${idx}`).textContent = streaks[idx];
    motivationDiv.textContent = getRandomQuote();
    saveHabits();
};

function saveHabits() {
    localStorage.setItem('hlv_habits', JSON.stringify(habits));
    localStorage.setItem('hlv_streaks', JSON.stringify(streaks));
}

function loadHabits() {
    const h = localStorage.getItem('hlv_habits');
    const s = localStorage.getItem('hlv_streaks');
    if (h) habits = JSON.parse(h);
    if (s) streaks = JSON.parse(s);
}

habitForm.addEventListener('submit', e => {
    e.preventDefault();
    const cue = document.getElementById('cue').value.trim();
    const routine = document.getElementById('routine').value.trim();
    const reward = document.getElementById('reward').value.trim();
    if (cue && routine && reward) {
        habits.push({ cue, routine, reward });
        streaks[habits.length - 1] = 0;
        renderHabits();
        saveHabits();
        habitForm.reset();
        motivationDiv.textContent = getRandomQuote();
    }
});

// Initial load
loadHabits();
renderHabits();
motivationDiv.textContent = getRandomQuote();
