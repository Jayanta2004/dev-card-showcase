
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const playBtn   = document.getElementById('playBtn');
const fileInput = document.getElementById('fileInput');
const demoBtn   = document.getElementById('demoBtn');
const moodBadge = document.getElementById('moodBadge');

let audioCtx, analyser, source, dataArray, bufferLength;
let isPlaying    = false;
let animId;
let mode         = 'bars';
let particles    = [];
let fireParticles = [];
let demoInterval;
let demoMode     = false;
let lastMood     = '';


function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = Math.min(rect.width - 40, 900);
  canvas.height = 400;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    const tmpCtx = new (window.AudioContext || window.webkitAudioContext)();
    tmpCtx.decodeAudioData(ev.target.result, buffer => {
      setupAudio(buffer);
    });
  };
  reader.readAsArrayBuffer(file);
});

function setupAudio(buffer) {
  if (audioCtx) audioCtx.close();

  audioCtx    = new (window.AudioContext || window.webkitAudioContext)();
  analyser    = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray   = new Uint8Array(bufferLength);

  source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  source.loop = true;
  source.start(0);

  isPlaying = true;
  playBtn.textContent = '⏸';
  animate();
}


demoBtn.addEventListener('click', () => {
  if (audioCtx) audioCtx.close();

  audioCtx    = new (window.AudioContext || window.webkitAudioContext)();
  analyser    = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray   = new Uint8Array(bufferLength);

  function playKick() {
    const now  = audioCtx.currentTime;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  function playHiHat() {
    const now  = audioCtx.currentTime;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  demoMode = true;
  let beat = 0;
  if (demoInterval) clearInterval(demoInterval);
  demoInterval = setInterval(() => {
    beat++;
    playKick();
    if (beat % 2 === 0) playHiHat();
  }, 400);

  isPlaying = true;
  playBtn.textContent = '⏸';
  animate();
});


playBtn.addEventListener('click', () => {
  if (!audioCtx) return;

  if (isPlaying) {
    audioCtx.suspend();
    isPlaying = false;
    playBtn.textContent = '▶';
    cancelAnimationFrame(animId);
    if (demoInterval) { clearInterval(demoInterval); demoInterval = null; }
  } else {
    audioCtx.resume();
    isPlaying = true;
    playBtn.textContent = '⏸';
    animate();
    if (demoMode && !demoInterval) demoBtn.click();
  }
});


document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    document.getElementById('infoMode').textContent = mode.toUpperCase();
    particles     = [];
    fireParticles = [];
  });
});


const moods = [
  { name: 'SILENT',    color: '#555555', emoji: '😶' },
  { name: 'CALM',      color: '#00b4d8', emoji: '😌' },
  { name: 'CHILL',     color: '#06d6a0', emoji: '😎' },
  { name: 'GROOVY',    color: '#ffd166', emoji: '🕺' },
  { name: 'ENERGETIC', color: '#ff6b35', emoji: '⚡' },
  { name: 'EUPHORIC',  color: '#ff006e', emoji: '🔥' },
];

function getMood(energy) {
  if (energy < 5)  return moods[0];
  if (energy < 20) return moods[1];
  if (energy < 35) return moods[2];
  if (energy < 50) return moods[3];
  if (energy < 70) return moods[4];
  return moods[5];
}


function drawBars(data, W, H, energy) {
  const barW = (W / bufferLength) * 2.5;
  const hue  = 180 + energy * 1.8;

  for (let i = 0; i < bufferLength; i++) {
    const v = data[i] / 255;
    const h = v * H * 0.9;
    const x = i * (barW + 1);

    const grad = ctx.createLinearGradient(0, H, 0, H - h);
    grad.addColorStop(0,   `hsla(${hue},      100%, 50%, 0.9)`);
    grad.addColorStop(0.5, `hsla(${hue + 40}, 100%, 60%, 0.8)`);
    grad.addColorStop(1,   `hsla(${hue + 80}, 100%, 80%, 0.4)`);

    ctx.fillStyle = grad;
    ctx.fillRect(x, H - h, barW, h);

    // Floor reflection
    ctx.globalAlpha = 0.15;
    ctx.fillStyle   = grad;
    ctx.fillRect(x, H, barW, h * 0.3);
    ctx.globalAlpha = 1;
  }
}


function drawWave(data, W, H) {
  const slice = W / bufferLength;

  // Primary wave
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const v = data[i] / 128;
    const y = v * H / 2;
    i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * slice, y);
  }
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0,   '#00f5ff');
  grad.addColorStop(0.5, '#7b2fff');
  grad.addColorStop(1,   '#ff006e');
  ctx.strokeStyle = grad;
  ctx.shadowBlur  = 20;
  ctx.shadowColor = '#00f5ff';
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // Secondary ghost wave
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const v = data[(i + 10) % bufferLength] / 128;
    const y = H - v * H / 2;
    i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * slice, y);
  }
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;
}


function drawCircle(data, W, H, energy) {
  const cx    = W / 2;
  const cy    = H / 2;
  const baseR = Math.min(W, H) * 0.22;
  const step  = (Math.PI * 2) / bufferLength;

  // Glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,245,255,0.08)';
  ctx.lineWidth   = 30;
  ctx.stroke();

  // Frequency bars around circle
  for (let i = 0; i < bufferLength; i++) {
    const v     = data[i] / 255;
    const len   = v * baseR * 1.2;
    const angle = i * step + performance.now() * 0.0003;
    const x1 = cx + Math.cos(angle) * baseR;
    const y1 = cy + Math.sin(angle) * baseR;
    const x2 = cx + Math.cos(angle) * (baseR + len);
    const y2 = cy + Math.sin(angle) * (baseR + len);
    const hue = (i / bufferLength) * 360;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.6 + v * 0.4})`;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  // Center pulsing orb
  const pulse = baseR * 0.4 + energy * 0.8;
  const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse);
  cGrad.addColorStop(0, 'rgba(123,47,255,0.8)');
  cGrad.addColorStop(1, 'rgba(123,47,255,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
  ctx.fillStyle = cGrad;
  ctx.fill();
}


function drawParticles(data, W, H, energy) {
  // Spawn new particles on beat
  if (Math.random() < energy / 100 * 0.8) {
    const i = Math.floor(Math.random() * bufferLength);
    const v = data[i] / 255;
    particles.push({
      x:    Math.random() * W,
      y:    H,
      vx:   (Math.random() - 0.5) * 4,
      vy:   -(2 + v * 8 + energy * 0.05),
      life: 1,
      size: 2 + v * 6,
      hue:  180 + Math.random() * 180,
    });
  }

  particles = particles.filter(p => {
    p.x    += p.vx;
    p.y    += p.vy;
    p.vy   += 0.05;   // gravity
    p.life -= 0.012;
    if (p.life <= 0) return false;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle   = `hsla(${p.hue}, 100%, 65%, ${p.life})`;
    ctx.shadowBlur  = 15;
    ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, 0.5)`;
    ctx.fill();
    ctx.shadowBlur  = 0;
    return true;
  });

  // Bass shockwave ring
  const bass = data[2] / 255;
  if (bass > 0.7) {
    ctx.beginPath();
    ctx.arc(W / 2, H, bass * 200, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,0,110,${(bass - 0.7) * 0.8})`;
    ctx.lineWidth   = 3;
    ctx.stroke();
  }
}

// ============================================
//  DRAW — FIRE
// ============================================
function drawFire(data, W, H, energy) {
  const cols = 80;
  const colW = W / cols;

  for (let i = 0; i < cols; i++) {
    const idx = Math.floor((i / cols) * bufferLength);
    const v   = data[idx] / 255;
    const h   = v * H * (0.5 + (energy / 100) * 0.8);
    const x   = i * colW;

    const grad = ctx.createLinearGradient(0, H, 0, H - h);
    grad.addColorStop(0,   'rgba(255,255,0,0.95)');
    grad.addColorStop(0.3, 'rgba(255,140,0,0.85)');
    grad.addColorStop(0.6, 'rgba(255,30, 0,0.7)');
    grad.addColorStop(1,   'rgba(100,0, 100,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(x, H - h, colW * 0.9, h);
  }

  // Fire embers
  if (Math.random() < 0.4) {
    fireParticles.push({
      x:    Math.random() * W,
      y:    H - 20 - Math.random() * 80,
      vx:   (Math.random() - 0.5) * 2,
      vy:   -(1 + Math.random() * 3),
      life: 1,
      size: 3 + Math.random() * 5,
    });
  }

  fireParticles = fireParticles.filter(p => {
    p.x    += p.vx;
    p.y    += p.vy;
    p.life -= 0.02;
    if (p.life <= 0) return false;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    const hue = 30 + Math.random() * 40;
    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${p.life * 0.8})`;
    ctx.fill();
    return true;
  });
}

// ============================================
//  MAIN ANIMATION LOOP
// ============================================
function animate() {
  animId = requestAnimationFrame(animate);
  const W = canvas.width;
  const H = canvas.height;

  // Pull frequency data
  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
  } else {
    if (!dataArray) dataArray = new Uint8Array(128).fill(0);
  }

  // Trailing clear — fire needs less clearing for glow effect
  ctx.fillStyle = mode === 'fire' ? 'rgba(2,4,8,0.6)' : 'rgba(2,4,8,0.85)';
  ctx.fillRect(0, 0, W, H);

  // Compute energy (0–100)
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
  const energy = Math.min(100, sum / dataArray.length / 2.55);
  const bass   = (dataArray[2] / 255) * 100;

  // Update HUD
  document.getElementById('infoEnergy').textContent = Math.round(energy) + '%';
  document.getElementById('infoBeat').textContent   = bass > 60 ? '●' : '○';

  // Mood detection
  const mood = getMood(energy);
  if (mood.name !== lastMood) {
    lastMood = mood.name;
    moodBadge.textContent              = `${mood.emoji} ${mood.name}`;
    moodBadge.style.borderColor        = mood.color;
    moodBadge.style.color              = mood.color;
    const infoMood                     = document.getElementById('infoMood');
    infoMood.textContent               = mood.name;
    infoMood.style.color               = mood.color;
  }

  // Draw the selected visualization
  if (dataArray) {
    switch (mode) {
      case 'bars':      drawBars(dataArray, W, H, energy);      break;
      case 'wave':      drawWave(dataArray, W, H);              break;
      case 'circle':    drawCircle(dataArray, W, H, energy);    break;
      case 'particles': drawParticles(dataArray, W, H, energy); break;
      case 'fire':      drawFire(dataArray, W, H, energy);      break;
    }
  }

  // Subtle grid overlay
  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  ctx.lineWidth   = 1;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

// ---- Start idle animation on page load ----
animate();
