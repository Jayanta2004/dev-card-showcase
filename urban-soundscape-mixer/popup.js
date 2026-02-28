// Urban Soundscape Mixer Popup Script
// ...existing code...
const SOUNDS = [
  { name: 'Traffic', src: 'sounds/traffic.mp3' },
  { name: 'Cafe', src: 'sounds/cafe.mp3' },
  { name: 'Park', src: 'sounds/park.mp3' },
  { name: 'Subway', src: 'sounds/subway.mp3' },
  { name: 'Rain', src: 'sounds/rain.mp3' }
];

class SoundscapeMixer {
  constructor() {
    this.volumes = {};
    SOUNDS.forEach(s => { this.volumes[s.name] = 0.5; });
    this.audioElements = {};
    this.presets = [];
    this.loadPresets();
    this.initAudio();
  }
  initAudio() {
    SOUNDS.forEach(s => {
      const audio = new Audio(chrome.runtime.getURL(s.src));
      audio.loop = true;
      audio.volume = this.volumes[s.name];
      this.audioElements[s.name] = audio;
    });
  }
  setVolume(name, value) {
    this.volumes[name] = value;
    if (this.audioElements[name]) {
      this.audioElements[name].volume = value;
    }
    this.savePreset('Current');
  }
  playAll() {
    Object.values(this.audioElements).forEach(a => a.play());
  }
  pauseAll() {
    Object.values(this.audioElements).forEach(a => a.pause());
  }
  savePreset(name) {
    const preset = { name, volumes: { ...this.volumes } };
    this.presets = this.presets.filter(p => p.name !== name);
    this.presets.push(preset);
    localStorage.setItem('soundPresets', JSON.stringify(this.presets));
    renderPresetsList();
  }
  loadPresets() {
    const data = localStorage.getItem('soundPresets');
    if (data) this.presets = JSON.parse(data);
  }
  applyPreset(name) {
    const preset = this.presets.find(p => p.name === name);
    if (preset) {
      this.volumes = { ...preset.volumes };
      SOUNDS.forEach(s => {
        if (this.audioElements[s.name]) {
          this.audioElements[s.name].volume = this.volumes[s.name];
        }
      });
      renderMixerSection();
    }
  }
}

const mixer = new SoundscapeMixer();

function renderMixerSection() {
  const div = document.getElementById('mixer-section');
  div.innerHTML = `<h2>Mix Your Soundscape</h2>` + SOUNDS.map(s => `
    <label>${s.name}</label>
    <input type="range" min="0" max="1" step="0.01" value="${mixer.volumes[s.name]}" onchange="setSoundVolume('${s.name}', this.value)">
  `).join('') + `
    <button onclick="playAllSounds()">Play</button>
    <button onclick="pauseAllSounds()">Pause</button>
    <button onclick="saveCurrentPreset()">Save Preset</button>
  `;
}

function setSoundVolume(name, value) {
  mixer.setVolume(name, parseFloat(value));
}
function playAllSounds() {
  mixer.playAll();
}
function pauseAllSounds() {
  mixer.pauseAll();
}
function saveCurrentPreset() {
  const name = prompt('Preset name:', 'Custom');
  if (name) mixer.savePreset(name);
}

function renderPresetsList() {
  const div = document.getElementById('presets-list');
  div.innerHTML = mixer.presets.length ? mixer.presets.map(p => `<div class="preset-card"><strong>${p.name}</strong><br>${Object.entries(p.volumes).map(([k,v]) => `${k}: ${(v*100).toFixed(0)}%`).join(', ')}<br><button onclick="applyPreset('${p.name}')">Apply</button></div>`).join('') : '<p>No presets yet.</p>';
}
function applyPreset(name) {
  mixer.applyPreset(name);
}

renderMixerSection();
renderPresetsList();
