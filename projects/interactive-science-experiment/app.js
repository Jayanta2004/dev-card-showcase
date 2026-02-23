// Interactive Science Experiment Simulator
// Plant Growth Simulation

const waterEl = document.getElementById('water');
const sunlightEl = document.getElementById('sunlight');
const soilEl = document.getElementById('soil');
const runBtn = document.getElementById('run-btn');
const resultEl = document.getElementById('result');
const historyListEl = document.getElementById('history-list');
const waterValueEl = document.getElementById('water-value');
const sunlightValueEl = document.getElementById('sunlight-value');

let history = [];

waterEl.oninput = () => {
    waterValueEl.textContent = waterEl.value;
};
sunlightEl.oninput = () => {
    sunlightValueEl.textContent = sunlightEl.value;
};

runBtn.onclick = () => {
    const water = parseInt(waterEl.value);
    const sunlight = parseInt(sunlightEl.value);
    const soil = soilEl.value;
    const outcome = simulatePlantGrowth(water, sunlight, soil);
    resultEl.innerHTML = outcome.message;
    history.unshift({ water, sunlight, soil, outcome });
    renderHistory();
};

function simulatePlantGrowth(water, sunlight, soil) {
    // Basic simulation logic
    let growth = 0;
    let health = 100;
    let msg = '';
    if (soil === 'poor') health -= 30;
    if (soil === 'rich') health += 20;
    if (water < 20) {
        health -= 40;
        msg += 'Too little water. ';
    } else if (water > 80) {
        health -= 20;
        msg += 'Too much water. ';
    } else {
        growth += water / 2;
    }
    if (sunlight < 4) {
        health -= 30;
        msg += 'Not enough sunlight. ';
    } else if (sunlight > 20) {
        health -= 10;
        msg += 'Too much sunlight. ';
    } else {
        growth += sunlight * 2;
    }
    growth += health / 10;
    msg += `Plant growth: ${Math.round(growth)}cm, Health: ${Math.max(0, health)}%`;
    return { growth, health, message: msg };
}

function renderHistory() {
    historyListEl.innerHTML = '';
    history.slice(0, 10).forEach(exp => {
        const li = document.createElement('li');
        li.innerHTML = `Water: ${exp.water}ml, Sunlight: ${exp.sunlight}h, Soil: ${exp.soil}<br>${exp.outcome.message}`;
        historyListEl.appendChild(li);
    });
}

// ...extend with more experiments and variables as needed...
