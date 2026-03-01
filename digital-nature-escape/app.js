// Digital Nature Escape App
// Modular, well-commented code. Main SPA logic here.

const app = document.getElementById('app');

// Mock nature scenes and sounds
const scenes = [
  { name: 'Forest', color: '#a5d6a7', sound: 'forest.mp3', ai: 'Calm forest with birds' },
  { name: 'Beach', color: '#81d4fa', sound: 'beach.mp3', ai: 'Gentle waves and seagulls' },
  { name: 'Mountain', color: '#b0bec5', sound: 'mountain.mp3', ai: 'Wind and distant eagles' },
  { name: 'Rain', color: '#90caf9', sound: 'rain.mp3', ai: 'Soft rain and thunder' }
];

let currentScene = scenes[0];
let stressLevel = 1; // 1=low, 2=medium, 3=high
let audio = null;

function render() {
  app.innerHTML = '';
  renderHeader();
  renderStressInput();
  renderSceneSelector();
  renderSceneCanvas();
  renderControls();
}

function renderHeader() {
  const h = document.createElement('h1');
  h.textContent = 'Digital Nature Escape';
  app.appendChild(h);
}

function renderStressInput() {
  const div = document.createElement('div');
  div.innerHTML = `
    <label for="stress">Your Stress Level:</label>
    <input type="range" id="stress" min="1" max="3" value="${stressLevel}">
    <span id="stress-level">${stressLabel(stressLevel)}</span>
  `;
  app.appendChild(div);
  document.getElementById('stress').oninput = (e) => {
    stressLevel = parseInt(e.target.value, 10);
    document.getElementById('stress-level').textContent = stressLabel(stressLevel);
    adaptToStress();
  };
}

function stressLabel(level) {
  if (level === 1) return 'Low';
  if (level === 2) return 'Medium';
  return 'High';
}

function renderSceneSelector() {
  const div = document.createElement('div');
  div.innerHTML = `
    <label for="scene">Choose a Nature Scene:</label>
    <select id="scene">
      ${scenes.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
    </select>
  `;
  app.appendChild(div);
  document.getElementById('scene').value = currentScene.name;
  document.getElementById('scene').onchange = (e) => {
    currentScene = scenes.find(s => s.name === e.target.value);
    renderSceneCanvas();
    playSound();
  };
}

function renderSceneCanvas() {
  let canvas = document.getElementById('scene-canvas');
  if (!canvas) {
    canvas = document.createElement('div');
    canvas.id = 'scene-canvas';
    canvas.className = 'scene-canvas';
    app.appendChild(canvas);
  }
  canvas.style.background = currentScene.color;
  canvas.textContent = currentScene.ai;
}

function renderControls() {
  const div = document.createElement('div');
  div.innerHTML = `
    <button id="play-btn">Play Sound</button>
    <button id="stop-btn">Stop Sound</button>
  `;
  app.appendChild(div);
  document.getElementById('play-btn').onclick = playSound;
  document.getElementById('stop-btn').onclick = stopSound;
}

function playSound() {
  stopSound();
  audio = new Audio(currentScene.sound);
  audio.loop = true;
  audio.play();
}

function stopSound() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }
}

function adaptToStress() {
  // For demo: change scene or sound based on stress
  if (stressLevel === 3) {
    currentScene = scenes.find(s => s.name === 'Rain');
  } else if (stressLevel === 2) {
    currentScene = scenes.find(s => s.name === 'Forest');
  } else {
    currentScene = scenes.find(s => s.name === 'Beach');
  }
  document.getElementById('scene').value = currentScene.name;
  renderSceneCanvas();
  playSound();
}

render();
