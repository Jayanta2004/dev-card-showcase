// Mindful Breathing Buddy App
// Modular, well-commented code. Main SPA logic here.

const app = document.getElementById('app');

let stressLevel = 1; // 1=low, 2=medium, 3=high
let sessionActive = false;
let breathingStep = 0;
let breathingInterval = null;

const guides = [
  { name: 'Calm', pattern: [4, 4, 6], text: ['Inhale', 'Hold', 'Exhale'] },
  { name: 'Focus', pattern: [5, 2, 5], text: ['Inhale', 'Hold', 'Exhale'] },
  { name: 'Relax', pattern: [6, 6, 8], text: ['Inhale', 'Hold', 'Exhale'] }
];

function render() {
  app.innerHTML = '';
  renderHeader();
  renderStressInput();
  renderGuideSelector();
  renderBreathingGuide();
  renderControls();
}

function renderHeader() {
  const h = document.createElement('h1');
  h.textContent = 'Mindful Breathing Buddy';
  app.appendChild(h);
}

function renderStressInput() {
  const div = document.createElement('div');
  div.innerHTML = `
    <label for="stress">Your Stress Level:</label>
    <input type="range" id="stress" min="1" max="3" value="${stressLevel}">
    <span id="stress-status">${stressLabel(stressLevel)}</span>
  `;
  app.appendChild(div);
  document.getElementById('stress').oninput = (e) => {
    stressLevel = parseInt(e.target.value, 10);
    document.getElementById('stress-status').textContent = stressLabel(stressLevel);
    adaptGuide();
  };
}

function stressLabel(level) {
  if (level === 1) return 'Low';
  if (level === 2) return 'Medium';
  return 'High';
}

function renderGuideSelector() {
  const div = document.createElement('div');
  div.innerHTML = `
    <label for="guide">Breathing Guide:</label>
    <select id="guide">
      ${guides.map((g, i) => `<option value="${i}">${g.name}</option>`).join('')}
    </select>
  `;
  app.appendChild(div);
  document.getElementById('guide').value = selectGuideIndex();
  document.getElementById('guide').onchange = (e) => {
    breathingStep = 0;
    renderBreathingGuide();
  };
}

function selectGuideIndex() {
  if (stressLevel === 3) return 2;
  if (stressLevel === 2) return 1;
  return 0;
}

function renderBreathingGuide() {
  let div = document.getElementById('breathing-guide');
  if (!div) {
    div = document.createElement('div');
    div.id = 'breathing-guide';
    app.appendChild(div);
  }
  const guide = guides[parseInt(document.getElementById('guide')?.value || selectGuideIndex(), 10)];
  if (!sessionActive) {
    div.textContent = 'Ready for your breathing session.';
  } else {
    div.textContent = `${guide.text[breathingStep % 3]} for ${guide.pattern[breathingStep % 3]} seconds`;
  }
}

function renderControls() {
  const div = document.createElement('div');
  div.innerHTML = `
    <button id="start-btn">Start Session</button>
    <button id="stop-btn" disabled>Stop Session</button>
  `;
  app.appendChild(div);
  document.getElementById('start-btn').onclick = startSession;
  document.getElementById('stop-btn').onclick = stopSession;
}

function startSession() {
  sessionActive = true;
  document.getElementById('start-btn').disabled = true;
  document.getElementById('stop-btn').disabled = false;
  breathingStep = 0;
  runBreathing();
}

function stopSession() {
  sessionActive = false;
  document.getElementById('start-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
  clearInterval(breathingInterval);
  renderBreathingGuide();
}

function runBreathing() {
  const guide = guides[parseInt(document.getElementById('guide').value, 10)];
  renderBreathingGuide();
  breathingInterval = setInterval(() => {
    breathingStep++;
    renderBreathingGuide();
    if (!sessionActive) clearInterval(breathingInterval);
  }, guide.pattern[breathingStep % 3] * 1000);
}

function adaptGuide() {
  document.getElementById('guide').value = selectGuideIndex();
  breathingStep = 0;
  renderBreathingGuide();
}

render();
