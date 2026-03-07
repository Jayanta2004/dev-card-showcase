// ── DOM refs ──
const statusEl = document.getElementById('status');
const btns = document.querySelectorAll('.btn');
const startBtn = document.getElementById('startBtn');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const streakEl = document.getElementById('streak');
const streakBar = document.getElementById('streakBar');
const progressBar = document.getElementById('progressBar');
const seqPreview = document.getElementById('seqPreview');
const diffWrap = document.getElementById('diffWrap');
const bgGlow = document.getElementById('bgGlow');
const toast = document.getElementById('toast');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const overScore = document.getElementById('overScore');
const overHighLabel = document.getElementById('overHighLabel');
const newRecordBadge = document.getElementById('newRecordBadge');
const retryBtn = document.getElementById('retryBtn');
const menuBtn = document.getElementById('menuBtn');

// ── State ──
const colorList = ['red', 'green', 'blue', 'yellow'];
const colorFreqs = { red: 261.63, green: 329.63, blue: 392.00, yellow: 523.25 };
const keyMap = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };

let gameSeq = [], userSeq = [];
let started = false, isPlayingSeq = false;
let level = 0, streak = 0;
let highScore = parseInt(localStorage.getItem('simonHSv2')) || 0;
let seqSpeed = 600;
let toastTimer = null;

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

highScoreEl.textContent = highScore;

// ── Audio ──
function playTone(freq, dur = 380, type = 'sine') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();
    osc.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    filt.type = 'lowpass'; filt.frequency.value = 2200;
    const t = audioCtx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur / 1000);
    osc.start(t); osc.stop(t + dur / 1000);
}

function playError() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 90; osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.6);
}

function playSuccess() {
    [523.25, 659.25, 783.99].forEach((f, i) => {
        setTimeout(() => playTone(f, 220), i * 100);
    });
}

// ── Difficulty ──
diffWrap.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (started) return;
        diffWrap.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        seqSpeed = parseInt(btn.dataset.speed);
    });
});

// ── Start ──
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', () => { hideOverlay(); startGame(); });
menuBtn.addEventListener('click', () => { hideOverlay(); resetUI(); });

function startGame() {
    audioCtx.resume();
    started = true;
    streak = 0;
    startBtn.classList.add('hidden');
    diffWrap.style.opacity = '0.3';
    diffWrap.style.pointerEvents = 'none';
    setStatus('Get ready…', 'active');
    updateStreakUI();
    levelUp();
}

// ── Level up ──
async function levelUp() {
    userSeq = [];
    level++;
    levelEl.textContent = level;
    levelEl.classList.add('bump');
    setTimeout(() => levelEl.classList.remove('bump'), 300);

    const col = colorList[Math.floor(Math.random() * 4)];
    gameSeq.push(col);

    updateSeqPreview();
    updateProgress();
    setStatus(`Level ${level}`, 'active');

    await delay(600);
    await playSequence();
}

// ── Play sequence ──
async function playSequence() {
    isPlayingSeq = true;
    btns.forEach(b => b.classList.add('disabled'));
    setStatus('Watch carefully…', 'active');

    for (let i = 0; i < gameSeq.length; i++) {
        const col = gameSeq[i];
        await delay(seqSpeed * 0.5);
        flashBtn(col, 'game');
        playTone(colorFreqs[col]);
        highlightSeqDot(i);
        await delay(seqSpeed);
    }

    btns.forEach(b => b.classList.remove('disabled'));
    isPlayingSeq = false;
    setStatus('Your turn!', 'active');
}

// ── Flash ──
function flashBtn(color, type) {
    const btn = document.getElementById(color);
    const cls = type === 'game' ? `flash-${color}` : 'user-flash';
    btn.classList.add(cls);
    pulseGlow(color);
    setTimeout(() => btn.classList.remove(cls), type === 'game' ? 420 : 160);
}

function pulseGlow(color) {
    const glowMap = {
        red: 'rgba(255,45,85,0.15)',
        green: 'rgba(0,230,118,0.15)',
        blue: 'rgba(41,121,255,0.15)',
        yellow: 'rgba(255,214,0,0.15)',
    };
    bgGlow.style.background = `radial-gradient(circle, ${glowMap[color]} 0%, transparent 70%)`;
    setTimeout(() => {
        bgGlow.style.background = 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)';
    }, 500);
}

// ── User input ──
btns.forEach(btn => btn.addEventListener('click', handlePress));

function handlePress() {
    if (!started || isPlayingSeq) return;
    const color = this.id;
    flashBtn(color, 'user');
    playTone(colorFreqs[color], 200);
    userSeq.push(color);
    checkAnswer(userSeq.length - 1);
}

function checkAnswer(idx) {
    if (userSeq[idx] !== gameSeq[idx]) {
        gameOver();
        return;
    }
    if (userSeq.length === gameSeq.length) {
        streak++;
        streakEl.textContent = streak;
        streakEl.classList.add('bump');
        setTimeout(() => streakEl.classList.remove('bump'), 300);
        updateStreakUI();

        if (streak > 0 && streak % 5 === 0) {
            showToast(`🔥 ${streak} STREAK!`);
            playSuccess();
        }

        setStatus('✓ Correct!', 'success');
        updateProgress(true);
        setTimeout(levelUp, 900);
    }
}

// ── Game Over ──
function gameOver() {
    playError();
    isPlayingSeq = false;
    started = false;

    document.querySelector('.btn-container').classList.add('shake');
    setTimeout(() => document.querySelector('.btn-container').classList.remove('shake'), 500);

    const score = level - 1;
    const isRecord = score > highScore;

    if (isRecord) {
        highScore = score;
        localStorage.setItem('simonHSv2', highScore);
        highScoreEl.textContent = highScore;
    }

    setTimeout(() => showOverlay(score, isRecord), 700);
    resetGameState();
}

// ── Overlay ──
function showOverlay(score, isRecord) {
    overScore.textContent = score;
    overHighLabel.textContent = `High Score: ${highScore}`;
    newRecordBadge.style.display = isRecord ? 'inline-block' : 'none';
    gameOverOverlay.classList.add('show');
}

function hideOverlay() {
    gameOverOverlay.classList.remove('show');
}

// ── UI helpers ──
function setStatus(msg, cls = '') {
    statusEl.textContent = msg;
    statusEl.className = cls;
}

function updateStreakUI() {
    const dots = streakBar.querySelectorAll('.streak-dot');
    dots.forEach((d, i) => d.classList.toggle('lit', i < (streak % 5)));
}

function updateSeqPreview() {
    seqPreview.innerHTML = gameSeq.map((c, i) =>
        `<div class="seq-dot ${c}" data-i="${i}"></div>`
    ).join('');
}

function highlightSeqDot(idx) {
    const dot = seqPreview.querySelector(`[data-i="${idx}"]`);
    if (dot) { dot.classList.add('done'); setTimeout(() => dot.classList.remove('done'), 400); }
}

function updateProgress(completed = false) {
    const pct = completed ? 100 : Math.min((gameSeq.length / 20) * 100, 100);
    progressBar.style.width = pct + '%';
    if (completed) setTimeout(() => progressBar.style.width = '0%', 500);
}

function showToast(msg) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function resetGameState() {
    gameSeq = []; userSeq = [];
    level = 0; streak = 0;
    levelEl.textContent = 0;
    streakEl.textContent = 0;
    updateStreakUI();
    progressBar.style.width = '0%';
    seqPreview.innerHTML = '';
    btns.forEach(b => b.classList.remove('disabled'));
}

function resetUI() {
    resetGameState();
    startBtn.classList.remove('hidden');
    diffWrap.style.opacity = '1';
    diffWrap.style.pointerEvents = 'auto';
    setStatus('Press Start to play');
}

// ── Keyboard controls ──
document.addEventListener('keydown', e => {
    const color = keyMap[e.key.toLowerCase()];
    if (color && started && !isPlayingSeq) {
        document.getElementById(color).click();
    }
    if (e.key === 'Enter' && !started) startBtn.click();
});

// ── Utility ──
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
