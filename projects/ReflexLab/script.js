

var TOTAL_ROUNDS = 5;
var MIN_WAIT = 1500;
var MAX_WAIT = 5000;

var COLORS_MODE = ['#00F5A0','#FF4757','#FFD93D','#00D4FF','#9D4EDD'];

// Ratings by ms
function getRating(ms) {
  if (ms < 180) return { label: 'SUPERHUMAN', cls: 'great' };
  if (ms < 240) return { label: 'LIGHTNING',  cls: 'great' };
  if (ms < 300) return { label: 'GREAT',       cls: 'great' };
  if (ms < 380) return { label: 'GOOD',         cls: 'good'  };
  if (ms < 500) return { label: 'AVERAGE',      cls: 'good'  };
  return { label: 'SLOW',  cls: 'slow' };
}

// Rank by average
function getRank(avg) {
  if (avg < 180) return { rank: 'S', heading: 'Superhuman Reflexes!' };
  if (avg < 230) return { rank: 'A', heading: 'Lightning Fast!' };
  if (avg < 280) return { rank: 'B', heading: 'Great Reflexes!' };
  if (avg < 350) return { rank: 'C', heading: 'Average Speed' };
  if (avg < 450) return { rank: 'D', heading: 'Keep Practicing!' };
  return { rank: 'F', heading: 'Need More Practice' };
}

// ── State ──
var G = {
  mode:        'classic',
  round:       0,
  results:     [],
  waitTimeout: null,
  startTime:   0,
  phase:       'idle',   // idle | waiting | ready | too-early | round-result
  colorTarget: null
};

// ── DOM ──
function el(id) { return document.getElementById(id); }

function showScreen(id) {
  ['sHome','sTest','sResult'].forEach(function(s) { el(s).classList.remove('active'); });
  el(id).classList.add('active');
}

function showState(id) {
  ['stateWait','stateReady','stateTooEarly','stateRoundResult'].forEach(function(s) {
    el(s).classList.add('hidden');
  });
  el(id).classList.remove('hidden');
}

// ── Storage ──
function saveBest(avg, fastest) {
  var prevAvg     = parseInt(localStorage.getItem('rlAvg')     || '9999');
  var prevFastest = parseInt(localStorage.getItem('rlFastest') || '9999');
  var tests       = parseInt(localStorage.getItem('rlTests')   || '0');
  var isNew       = false;
  if (avg < prevAvg) { localStorage.setItem('rlAvg', String(avg)); isNew = true; }
  if (fastest < prevFastest) localStorage.setItem('rlFastest', String(fastest));
  localStorage.setItem('rlTests', String(tests + 1));
  return isNew;
}

function loadRecords() {
  var avg     = localStorage.getItem('rlAvg');
  var fastest = localStorage.getItem('rlFastest');
  var tests   = localStorage.getItem('rlTests') || '0';
  el('pbAvg').textContent     = avg     ? avg + ' ms'     : '---';
  el('pbFastest').textContent = fastest ? fastest + ' ms' : '---';
  el('pbTests').textContent   = tests;
}

// ── Build round dots ──
function buildDots() {
  var container = el('roundDots');
  container.innerHTML = '';
  for (var i = 0; i < TOTAL_ROUNDS; i++) {
    var dot = document.createElement('div');
    dot.className = 'r-dot' + (i === 0 ? ' current' : '');
    dot.id = 'dot' + i;
    container.appendChild(dot);
  }
}

function updateDots(round) {
  for (var i = 0; i < TOTAL_ROUNDS; i++) {
    var dot = el('dot' + i);
    if (!dot) continue;
    dot.className = 'r-dot';
    if (i < round)  dot.classList.add('done');
    if (i === round) dot.classList.add('current');
  }
}

// ── Start test ──
function startTest() {
  G.round    = 0;
  G.results  = [];
  G.phase    = 'idle';

  buildDots();
  el('hudMode').textContent = G.mode.toUpperCase();
  el('liveRounds').innerHTML = '';
  el('reactionZone').className = 'reaction-zone state-wait';

  showScreen('sTest');
  startRound();
}

// ── Start a round ──
function startRound() {
  G.phase = 'waiting';
  updateDots(G.round);
  showState('stateWait');
  el('reactionZone').className = 'reaction-zone state-wait';

  // Set random wait
  var wait = MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT);

  // Color mode: randomize target color
  if (G.mode === 'color') {
    G.colorTarget = '#00F5A0'; // always green = correct
    // sometimes show red instead (trick round)
    if (Math.random() > 0.5) {
      G.colorTarget = COLORS_MODE[Math.floor(Math.random() * COLORS_MODE.length)];
    }
  }

  G.waitTimeout = setTimeout(function() {
    showGo();
  }, wait);
}

// ── Show GO signal ──
function showGo() {
  G.phase     = 'ready';
  G.startTime = performance.now();

  el('reactionZone').className = 'reaction-zone state-ready';
  showState('stateReady');

  if (G.mode === 'classic') {
    el('flashIcon').textContent  = '\u26A1';
    el('readyTitle').textContent = 'CLICK NOW!';
    el('readyTitle').style.color = 'var(--neon)';
    el('readyTitle').style.textShadow = '0 0 20px var(--neon)';
  } else if (G.mode === 'audio') {
    playBeep();
    el('flashIcon').textContent  = '\uD83D\uDD14';
    el('readyTitle').textContent = 'CLICK NOW!';
  } else if (G.mode === 'color') {
    if (G.colorTarget === '#00F5A0') {
      el('flashIcon').textContent  = '\uD83D\uDFE2';
      el('readyTitle').textContent = 'GREEN - CLICK!';
      el('readyTitle').style.color = 'var(--neon)';
    } else {
      el('flashIcon').textContent  = '\uD83D\uDD34';
      el('readyTitle').textContent = 'NOT GREEN - WAIT!';
      el('readyTitle').style.color = 'var(--red)';
    }
  }

  // Auto-miss if no click within 3s
  G.waitTimeout = setTimeout(function() {
    if (G.phase === 'ready') {
      recordResult(3000);
    }
  }, 3000);
}

// ── Handle zone click ──
function onZoneClick() {
  if (G.phase === 'waiting') {
    // Too early!
    clearTimeout(G.waitTimeout);
    G.phase = 'too-early';
    el('reactionZone').className = 'reaction-zone state-too-early';
    showState('stateTooEarly');

    // Resume after short pause
    G.waitTimeout = setTimeout(function() {
      startRound();
    }, 1500);
    return;
  }

  if (G.phase === 'ready') {
    clearTimeout(G.waitTimeout);

    // Color mode: check if correct color
    if (G.mode === 'color' && G.colorTarget !== '#00F5A0') {
      // Wrong color clicked — penalty
      G.phase = 'too-early';
      el('reactionZone').className = 'reaction-zone state-too-early';
      showState('stateTooEarly');
      el('stateTooEarly').querySelector('.zone-title').textContent = 'Wrong Color!';
      G.waitTimeout = setTimeout(function() {
        el('stateTooEarly').querySelector('.zone-title').textContent = 'Too Early!';
        startRound();
      }, 1400);
      return;
    }

    var elapsed = Math.round(performance.now() - G.startTime);
    recordResult(elapsed);
    return;
  }

  if (G.phase === 'round-result') {
    // Advance to next round
    G.round++;
    if (G.round >= TOTAL_ROUNDS) {
      showResult();
    } else {
      startRound();
    }
  }
}

// ── Record result ──
function recordResult(ms) {
  G.phase = 'round-result';
  G.results.push(ms);

  var rating = getRating(ms);
  el('roundMs').textContent       = String(ms);
  el('roundRating').textContent   = rating.label;
  el('roundRating').className     = 'round-rating ' + rating.cls;
  el('roundNext').textContent     = G.round < TOTAL_ROUNDS - 1
    ? 'Click anywhere for next round'
    : 'Click anywhere for results';

  el('reactionZone').className = 'reaction-zone state-result';
  showState('stateRoundResult');

  // Add to live bar
  var item = document.createElement('div');
  item.className = 'live-round-item';
  item.innerHTML = '<span class="lr-ms">' + ms + 'ms</span><span class="lr-lbl">R' + (G.round + 1) + '</span>';
  el('liveRounds').appendChild(item);
}

// ── Show final result ──
function showResult() {
  var total = 0;
  var min   = Infinity;
  for (var i = 0; i < G.results.length; i++) {
    total += G.results[i];
    if (G.results[i] < min) min = G.results[i];
  }
  var avg  = Math.round(total / G.results.length);
  var info = getRank(avg);
  var isNew = saveBest(avg, min);

  el('resultRank').textContent    = info.rank;
  el('resultHeading').textContent = info.heading;
  el('avgNum').textContent        = String(avg);
  el('newBestMsg').textContent    = isNew ? '\u2605 NEW PERSONAL BEST!' : '';

  // Bar chart
  var maxMs   = Math.max.apply(null, G.results);
  var barChart = el('barChart');
  barChart.innerHTML = '';
  for (var j = 0; j < G.results.length; j++) {
    var pct  = Math.round((G.results[j] / maxMs) * 100);
    var item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML =
      '<div class="bar-fill" style="height:' + pct + '%;"></div>' +
      '<div class="bar-ms">' + G.results[j] + '</div>';
    barChart.appendChild(item);
  }

  // You bar comparison (relative to 600ms = 100%)
  var youPct = Math.max(10, Math.round((1 - avg / 600) * 100));
  el('cmpYou').style.height = youPct + '%';

  showScreen('sResult');
}

// ── Audio beep ──
function playBeep() {
  try {
    var ctx  = new (window.AudioContext || window.webkitAudioContext)();
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + .3);
  } catch(e) {}
}

// ── Helpers ──
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// ── Event Listeners ──

// Mode selection
var modeCards = document.querySelectorAll('.mode-card');
for (var i = 0; i < modeCards.length; i++) {
  (function(card) {
    card.addEventListener('click', function() {
      for (var j = 0; j < modeCards.length; j++) modeCards[j].classList.remove('active');
      card.classList.add('active');
      G.mode = card.getAttribute('data-mode');
    });
  })(modeCards[i]);
}

el('btnStart').addEventListener('click', startTest);

el('reactionZone').addEventListener('click', onZoneClick);

el('btnQuit').addEventListener('click', function() {
  clearTimeout(G.waitTimeout);
  G.phase = 'idle';
  showScreen('sHome');
  loadRecords();
});

el('btnRetry').addEventListener('click', startTest);

el('btnHome').addEventListener('click', function() {
  showScreen('sHome');
  loadRecords();
});

// Spacebar support
document.addEventListener('keydown', function(e) {
  if (e.code === 'Space' && el('sTest').classList.contains('active')) {
    e.preventDefault();
    onZoneClick();
  }
});

// ── Init ──
loadRecords();
