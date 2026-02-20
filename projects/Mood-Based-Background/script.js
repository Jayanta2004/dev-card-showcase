let activityLevel = 0;
let interactionCount = 0;
const maxActivity = 100;
const decayRate = 0.1; // How fast activity decays
const boostAmount = 5; // How much each interaction boosts activity

const body = document.body;
const moodLevelSpan = document.getElementById('moodLevel');
const interactionCountSpan = document.getElementById('interactionCount');
const resetBtn = document.getElementById('resetBtn');

function updateBackground() {
    // Map activity level to hue: 240 (blue) to 0 (red)
    const hue = 240 - (activityLevel / maxActivity) * 240;
    const saturation = 70;
    const lightness = 50;
    body.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function boostActivity() {
    activityLevel = Math.min(maxActivity, activityLevel + boostAmount);
    interactionCount++;
    updateDisplay();
    updateBackground();
}

function decayActivity() {
    if (activityLevel > 0) {
        activityLevel -= decayRate;
        if (activityLevel < 0) activityLevel = 0;
        updateDisplay();
        updateBackground();
    }
}

function updateDisplay() {
    moodLevelSpan.textContent = Math.round(activityLevel);
    interactionCountSpan.textContent = interactionCount;
}

// Event listeners for different interactions
document.addEventListener('mousemove', boostActivity);
document.addEventListener('click', boostActivity);
document.addEventListener('keydown', boostActivity);
document.addEventListener('scroll', boostActivity);

// Decay activity over time
setInterval(decayActivity, 100); // Decay every 100ms

resetBtn.addEventListener('click', () => {
    activityLevel = 0;
    interactionCount = 0;
    updateDisplay();
    updateBackground();
});

// Initial setup
updateDisplay();
updateBackground();