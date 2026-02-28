// Focused Music Mixer App
// Modular, well-commented code. Main SPA logic here.

const app = document.getElementById('app');

let focusMode = 'Deep';
let productivity = 1; // 1=low, 2=medium, 3=high
let mood = 'neutral'; // happy, sad, stressed, neutral
let musicPlaying = false;
let musicInfo = '';
let audio = null;

const modes = [
  { name: 'Deep', tempo: 60, style: 'Ambient' },
  { name: 'Light', tempo: 90, style: 'Chill' },
  { name: 'Creative', tempo: 120, style: 'Upbeat' }
];

function render() {
  app.innerHTML = '';
  renderHeader();
  renderStatus();
  renderModeSelector();
  renderMusicInfo();
  renderControls();
}

function renderHeader() {
  const h = document.createElement('h1');
  h.textContent = 'Focused Music Mixer';
  app.appendChild(h);
}

function renderStatus() {
  const div = document.createElement('div');
  div.id = 'status';
  div.innerHTML = `Productivity: ${productivityLabel(productivity)} | Mood: ${moodLabel(mood)}`;
  app.appendChild(div);
  setTimeout(detectProductivityAndMood, 3000);
}

function productivityLabel(p) {
  if (p === 3) return 'High';
  if (p === 2) return 'Medium';
  return 'Low';
}

function moodLabel(m) {
  if (m === 'happy') return '😊 Happy';
  if (m === 'sad') return '😢 Sad';
  if (m === 'stressed') return '😣 Stressed';
  return '😐 Neutral';
}

function renderModeSelector() {
  const div = document.createElement('div');
  div.innerHTML = `
    <label for="mode">Focus Mode:</label>
    <select id="mode">
      ${modes.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
    </select>
  `;
  app.appendChild(div);
  document.getElementById('mode').value = focusMode;
  document.getElementById('mode').onchange = (e) => {
    focusMode = e.target.value;
    renderMusicInfo();
  };
}

function renderMusicInfo() {
  let div = document.getElementById('music-info');
  if (!div) {
    div = document.createElement('div');
    div.id = 'music-info';
    app.appendChild(div);
  }
  div.textContent = musicPlaying ? musicInfo : 'Ready to play adaptive music.';
}

function renderControls() {
  const div = document.createElement('div');
  div.innerHTML = `
    <button id="play-btn">Play Music</button>
    <button id="stop-btn" disabled>Stop Music</button>
  `;
  app.appendChild(div);
  document.getElementById('play-btn').onclick = playMusic;
  document.getElementById('stop-btn').onclick = stopMusic;
}

function playMusic() {
  musicPlaying = true;
  document.getElementById('play-btn').disabled = true;
  document.getElementById('stop-btn').disabled = false;
  const mode = modes.find(m => m.name === focusMode);
  musicInfo = `Playing ${mode.style} music at ${mode.tempo + productivity * 10} BPM for ${focusMode} focus. Mood: ${moodLabel(mood)}`;
  renderMusicInfo();
  // For demo: play a sample sound
  stopMusic();
  audio = new Audio('sample.mp3');
  audio.loop = true;
  audio.play();
}

function stopMusic() {
  musicPlaying = false;
  document.getElementById('play-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }
  renderMusicInfo();
}

function detectProductivityAndMood() {
  // Simulate detection (random for demo)
  productivity = Math.floor(Math.random() * 3) + 1;
  const moods = ['happy', 'sad', 'stressed', 'neutral'];
  mood = moods[Math.floor(Math.random() * moods.length)];
  if (musicPlaying) playMusic();
  render();
}

render();
