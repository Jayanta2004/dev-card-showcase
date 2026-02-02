
/* -------------------- SETUP -------------------- */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let audioCtx, analyser, micSource;
let buffer = new Float32Array(2048);

/* -------------------- PLAYER -------------------- */
const player = {
  x: 100,
  y: 300,
  w: 30,
  h: 40,
  vy: 0,
  onGround: true
};

const GRAVITY = 0.6;
const GROUND = 340;

/* -------------------- CALIBRATION -------------------- */
let calibrated = false;
let noiseFloor = 0.02;
let jumpPitch = 300;

/* -------------------- AUDIO -------------------- */
async function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  micSource = audioCtx.createMediaStreamSource(stream);
  micSource.connect(analyser);

  calibrate();
  loop();
}

/* -------------------- CALIBRATION -------------------- */
function calibrate() {
  let samples = [];
  let frames = 0;

  function measure() {
    analyser.getFloatTimeDomainData(buffer);
    samples.push(getRMS(buffer));
    frames++;

    if (frames < 60) {
      requestAnimationFrame(measure);
    } else {
      noiseFloor = Math.max(...samples) + 0.01;
      calibrated = true;
      document.getElementById("info").innerText =
        "Calibrated ✔ Speak louder to run, higher pitch to jump!";
    }
  }

  measure();
}

/* -------------------- AUDIO ANALYSIS -------------------- */
function getRMS(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = getRMS(buf);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < 0.2) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < 0.2) { r2 = SIZE - i; break; }
  }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] += buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  return sampleRate / maxpos;
}

/* -------------------- GAME LOOP -------------------- */
function loop() {
  requestAnimationFrame(loop);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  analyser.getFloatTimeDomainData(buffer);

  const volume = getRMS(buffer);
  const pitch = autoCorrelate(buffer, audioCtx.sampleRate);

  /* ---------- MOVEMENT ---------- */
  if (calibrated && volume > noiseFloor) {
    player.x += Math.min(volume * 120, 6);
  }

  if (pitch > jumpPitch && player.onGround) {
    player.vy = -12;
    player.onGround = false;
  }

  /* ---------- PHYSICS ---------- */
  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y >= GROUND - player.h) {
    player.y = GROUND - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  /* ---------- DRAW ---------- */
  drawGround();
  drawPlayer();
  drawWaveform();
  drawHUD(volume, pitch);
}

/* -------------------- DRAWING -------------------- */
function drawGround() {
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, GROUND, canvas.width, 4);
}

function drawPlayer() {
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawWaveform() {
  ctx.strokeStyle = "#22c55e";
  ctx.beginPath();
  for (let i = 0; i < buffer.length; i++) {
    let x = (i / buffer.length) * canvas.width;
    let y = 100 + buffer[i] * 50;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawHUD(vol, pitch) {
  ctx.fillStyle = "#e5e7eb";
  ctx.fillText(`Volume (RMS): ${vol.toFixed(3)}`, 10, 20);
  ctx.fillText(`Pitch (Hz): ${pitch > 0 ? pitch.toFixed(1) : "—"}`, 10, 40);
}

/* -------------------- START -------------------- */
initAudio();
