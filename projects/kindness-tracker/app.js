// Kindness Tracker Logic
const form = document.getElementById('kindness-form');
const input = document.getElementById('kindness-input');
const list = document.getElementById('kindness-list');
const visualization = document.getElementById('visualization');
const rewards = document.getElementById('rewards');
const shareBtn = document.getElementById('share-btn');

let acts = [];
let points = 0;

function renderActs() {
    list.innerHTML = acts.map((act, i) => `<div class="act">${i+1}. ${act}</div>`).join('');
}

function renderVisualization() {
    visualization.innerHTML = `<h2>Visualization</h2><p>Total Acts: ${acts.length}</p>`;
}

function renderRewards() {
    let badge = '';
    if (acts.length >= 10) badge = '🌟 Kindness Star!';
    else if (acts.length >= 5) badge = '💖 Kindness Champion!';
    else if (acts.length >= 1) badge = '😊 Kindness Starter!';
    rewards.innerHTML = `<h2>Rewards</h2><p>${badge}</p><p>Points: ${points}</p>`;
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const act = input.value.trim();
    if (act) {
        acts.push(act);
        points += 10;
        input.value = '';
        renderActs();
        renderVisualization();
        renderRewards();
    }
});

shareBtn.addEventListener('click', () => {
    const text = `I've logged ${acts.length} acts of kindness! Join me: [link]`;
    navigator.clipboard.writeText(text);
    alert('Kindness shared! Text copied to clipboard.');
});

// Initial render
renderActs();
renderVisualization();
renderRewards();
