




var THEMES = [
  { name: 'Adventure', icon: '\uD83C\uDFDE\uFE0F', emojis: ['\uD83C\uDFD4\uFE0F','\u26F5','\uD83D\uDDDD\uFE0F','\uD83D\uDC09','\uD83C\uDFF9','\uD83D\uDC8E','\u2694\uFE0F','\uD83D\uDC0D','\uD83D\uDD25','\uD83C\uDF0B','\u26EA','\uD83C\uDFF0','\uD83D\uDEA2','\uD83C\uDF05','\uD83D\uDC3A','\uD83E\uDD85'] },
  { name: 'Romance',   icon: '\uD83D\uDC95', emojis: ['\uD83C\uDF39','\u2764\uFE0F','\uD83D\uDC8D','\uD83C\uDF77','\uD83D\uDC8C','\uD83C\uDF70','\uD83C\uDF1C','\uD83C\uDF84','\uD83D\uDC51','\uD83C\uDF0A','\uD83C\uDF38','\uD83D\uDC8F','\uD83C\uDFB5','\uD83D\uDE18','\uD83C\uDF6B','\u2B50'] },
  { name: 'Mystery',   icon: '\uD83D\uDD75\uFE0F', emojis: ['\uD83D\uDD2E','\uD83D\uDC80','\uD83D\uDD13','\uD83D\uDC08','\uD83C\uDF19','\uD83D\uDC67','\uD83D\uDDD3\uFE0F','\uD83D\uDD26','\uD83C\uDFDA\uFE0F','\uD83D\uDC51','\uD83D\uDD70\uFE0F','\uD83D\uDC40','\uD83D\uDCDE','\uD83D\uDEAA','\uD83E\uDDF2','\uD83D\uDCA3'] },
  { name: 'Sci-Fi',    icon: '\uD83D\uDE80', emojis: ['\uD83E\uDD16','\uD83C\uDF0C','\uD83D\uDEF8','\u2604\uFE0F','\uD83E\uDDEC','\uD83D\uDD2C','\uD83C\uDF10','\uD83D\uDCBB','\u26A1','\uD83D\uDC7D','\uD83C\uDF9B\uFE0F','\uD83D\uDD2B','\uD83E\uDDE0','\uD83D\uDD2D','\uD83C\uDF0E','\uD83D\uDEF0\uFE0F'] },
  { name: 'Comedy',    icon: '\uD83D\uDE02', emojis: ['\uD83E\uDD21','\uD83C\uDF55','\uD83D\uDC12','\uD83E\uDD78','\uD83D\uDC93','\uD83E\uDD73','\uD83C\uDF89','\uD83D\uDE08','\uD83D\uDCA9','\uD83C\uDF54','\uD83D\uDC1D','\uD83E\uDD26','\uD83C\uDF3D','\uD83D\uDC2F','\uD83E\uDDE8','\uD83C\uDFA2'] },
  { name: 'Fantasy',   icon: '\uD83E\uDDD9', emojis: ['\uD83E\uDD84','\uD83C\uDF32','\u2728','\uD83D\uDC09','\uD83C\uDF08','\uD83E\uDDB9','\uD83D\uDC78','\uD83C\uDF19','\uD83D\uDC22','\uD83E\uDDB6','\uD83C\uDFB6','\u26A1','\uD83D\uDC8E','\uD83C\uDF3B','\uD83D\uDD2E','\uD83D\uDC51'] }
];

''
var ALL_EMOJIS = [
  '\uD83D\uDE00','\uD83D\uDE02','\uD83D\uDE0D','\uD83E\uDD73','\uD83D\uDE22','\uD83D\uDE21',
  '\u2764\uFE0F','\uD83D\uDC95','\uD83D\uDC4D','\uD83D\uDC4E','\uD83D\uDC40','\uD83D\uDC80',
  '\uD83C\uDF39','\uD83C\uDF32','\uD83C\uDF0A','\u26A1','\uD83C\uDF19','\u2B50',
  '\uD83D\uDE80','\uD83C\uDF08','\uD83C\uDF55','\uD83C\uDF54','\uD83C\uDF70','\uD83C\uDF6B',
  '\uD83D\uDC36','\uD83D\uDC31','\uD83D\uDC09','\uD83E\uDD84','\uD83D\uDC12','\uD83E\uDD81',
  '\u26BD','\uD83C\uDFB8','\uD83C\uDFB5','\uD83D\uDCDA','\uD83D\uDCBB','\uD83D\uDCF1',
  '\uD83C\uDFF0','\uD83C\uDFD4\uFE0F','\uD83C\uDF05','\uD83C\uDF0C','\uD83E\uDD85','\uD83D\uDC3A'
];

// Scoring words (creative vocabulary bonus)
var CREATIVE_WORDS = [
  'suddenly','meanwhile','however','although','therefore','furthermore',
  'nevertheless','consequently','unexpectedly','mysteriously','desperately',
  'triumphantly','reluctantly','passionately','courageously','whispered',
  'trembled','glanced','clutched','vanished','emerged','discovered',
  'transformed','realized','wondered','remembered','forgotten'
];

// ── State ──
var G = {
  theme:       THEMES[0],
  timeLimit:   180,
  assignedEmojis: [],
  seconds:     0,
  interval:    null,
  started:     false,
  lastScore:   0
};

// ── DOM ──
function el(id) { return document.getElementById(id); }

function showScreen(id) {
  ['sHome','sWrite','sScore'].forEach(function(s) { el(s).classList.remove('active'); });
  el(id).classList.add('active');
}

// ── Storage ──
function getHS()  { return parseInt(localStorage.getItem('esHS') || '0'); }
function saveHS(score) {
  var prev = getHS();
  if (score > prev) { localStorage.setItem('esHS', String(score)); return true; }
  return false;
}

function updateHSDisplay() {
  el('hsVal').textContent = getHS() + ' pts';
}

// ── Home Setup ──
function buildHomeEmojis() {
  var row = el('homeEmojiRow');
  row.innerHTML = '';
  var sample = shuffle(THEMES[0].emojis).slice(0, 8);
  for (var i = 0; i < sample.length; i++) {
    var span = document.createElement('span');
    span.textContent = sample[i];
    row.appendChild(span);
  }
}

function buildThemeGrid() {
  var grid = el('themeGrid');
  grid.innerHTML = '';
  for (var i = 0; i < THEMES.length; i++) {
    (function(theme, idx) {
      var btn = document.createElement('button');
      btn.className = 'theme-btn' + (idx === 0 ? ' active' : '');
      btn.innerHTML = '<span class="tb-icon">' + theme.icon + '</span><span class="tb-name">' + theme.name + '</span>';
      btn.addEventListener('click', function() {
        document.querySelectorAll('.theme-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        G.theme = theme;
      });
      grid.appendChild(btn);
    })(THEMES[i], i);
  }
}

// ── Assign emojis ──
function assignEmojis() {
  var pool = shuffle(G.theme.emojis.slice());
  G.assignedEmojis = pool.slice(0, 6);
}

// ── Build emoji chips ──
function buildEmojiChips() {
  var container = el('emojiChips');
  container.innerHTML = '';
  for (var i = 0; i < G.assignedEmojis.length; i++) {
    var chip = document.createElement('div');
    chip.className = 'e-chip';
    chip.id = 'chip' + i;
    chip.textContent = G.assignedEmojis[i];
    container.appendChild(chip);
  }
}

// ── Update chips based on story content ──
function updateChips(text) {
  for (var i = 0; i < G.assignedEmojis.length; i++) {
    var chip = el('chip' + i);
    if (!chip) continue;
    if (text.indexOf(G.assignedEmojis[i]) !== -1) {
      chip.classList.add('used');
    } else {
      chip.classList.remove('used');
    }
  }
}

// ── Build emoji picker ──
function buildPicker() {
  var grid = el('pickerGrid');
  grid.innerHTML = '';
  var all = G.assignedEmojis.concat(ALL_EMOJIS.filter(function(e) { return G.assignedEmojis.indexOf(e) === -1; }));
  for (var i = 0; i < all.length; i++) {
    (function(emoji) {
      var btn = document.createElement('button');
      btn.className = 'pick-emoji';
      btn.textContent = emoji;
      btn.addEventListener('click', function() {
        insertAtCursor(emoji);
        el('emojiPicker').classList.remove('open');
      });
      grid.appendChild(btn);
    })(all[i]);
  }
}

function insertAtCursor(text) {
  var input = el('storyInput');
  var start = input.selectionStart;
  var end   = input.selectionEnd;
  var val   = input.value;
  input.value = val.slice(0, start) + text + val.slice(end);
  input.selectionStart = input.selectionEnd = start + text.length;
  input.focus();
  onStoryInput();
}

// ── Timer ──
function startTimer() {
  G.seconds = G.timeLimit;
  var totalW = G.timeLimit;
  updateTimerDisplay();
  el('timerBar').style.width = '100%';
  el('timerBar').classList.remove('danger');
  el('timerText').classList.remove('warn');

  G.interval = setInterval(function() {
    G.seconds--;
    updateTimerDisplay();
    var pct = (G.seconds / totalW) * 100;
    el('timerBar').style.width = pct + '%';
    if (G.seconds <= 30) {
      el('timerBar').classList.add('danger');
      el('timerText').classList.add('warn');
    }
    if (G.seconds <= 0) {
      clearInterval(G.interval);
      submitStory();
    }
  }, 1000);
}

function stopTimer() { clearInterval(G.interval); G.interval = null; }

function updateTimerDisplay() {
  var m = Math.floor(G.seconds / 60);
  var s = G.seconds % 60;
  el('timerText').textContent = m + ':' + (s < 10 ? '0' : '') + s;
}

// ── Story input handler ──
function onStoryInput() {
  var text  = el('storyInput').value;
  var words = countWords(text);
  el('wordCount').textContent = String(words);
  el('charCount').textContent = String(text.length);
  updateChips(text);
}

function countWords(text) {
  var t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

// ── Start game ──
function startGame() {
  assignEmojis();
  buildEmojiChips();
  buildPicker();

  el('themeTag').textContent   = G.theme.icon + ' ' + G.theme.name;
  el('storyInput').value       = '';
  el('wordCount').textContent  = '0';
  el('charCount').textContent  = '0';

  showScreen('sWrite');
  setTimeout(function() {
    el('storyInput').focus();
    startTimer();
  }, 200);
}

// ── Submit story ──
function submitStory() {
  stopTimer();
  var text    = el('storyInput').value.trim();
  var words   = countWords(text);
  var timeUsed = G.timeLimit - G.seconds;

  if (words < 5) {
    alert('Please write at least 5 words!');
    startTimer();
    return;
  }

  var scores  = calculateScore(text, words, timeUsed);
  var total   = scores.length + scores.emoji + scores.creative + scores.speed;
  G.lastScore = total;

  var isNew   = saveHS(total);
  updateHSDisplay();

  showResults(text, scores, total, isNew);
}

// ── Score calculation ──
function calculateScore(text, words, timeUsed) {
  // Length score (max 300)
  var lengthPts = Math.min(300, words * 3);

  // Emoji score (max 300 — 50 per emoji used)
  var emojiUsed = 0;
  for (var i = 0; i < G.assignedEmojis.length; i++) {
    if (text.indexOf(G.assignedEmojis[i]) !== -1) emojiUsed++;
  }
  var emojiPts = emojiUsed * 50;

  // Creativity score (max 200)
  var creativeCount = 0;
  var textLower = text.toLowerCase();
  for (var j = 0; j < CREATIVE_WORDS.length; j++) {
    if (textLower.indexOf(CREATIVE_WORDS[j]) !== -1) creativeCount++;
  }
  // Also reward punctuation variety
  var hasDots    = (text.match(/\./g) || []).length;
  var hasExclaim = (text.match(/!/g) || []).length;
  var hasQuestion= (text.match(/\?/g) || []).length;
  var punctBonus = Math.min(30, (hasDots + hasExclaim + hasQuestion) * 5);
  var creativePts = Math.min(200, creativeCount * 20 + punctBonus);

  // Speed bonus (max 100 — reward finishing early)
  var pctLeft  = Math.max(0, (G.timeLimit - timeUsed) / G.timeLimit);
  var speedPts = Math.round(pctLeft * 100);

  return {
    length:   lengthPts,
    emoji:    emojiPts,
    creative: creativePts,
    speed:    speedPts,
    emojiUsed: emojiUsed
  };
}

// ── Show results ──
function showResults(text, scores, total, isNew) {
  var maxScore = 900;
  var pct = total / maxScore;

  var grade, badge, title, sub;
  if (pct >= .9)      { grade='S'; badge='\uD83C\uDFC6'; title='Masterpiece!';       sub='Absolutely incredible writing!'; }
  else if (pct >= .75){ grade='A'; badge='\uD83C\uDF1F'; title='Brilliant!';          sub='Your story was amazing!'; }
  else if (pct >= .6) { grade='B'; badge='\uD83D\uDC4D'; title='Great Story!';        sub='Really enjoyed reading this!'; }
  else if (pct >= .4) { grade='C'; badge='\uD83D\uDCDD'; title='Good Effort!';        sub='Nice story, keep writing!'; }
  else                { grade='D'; badge='\u270F\uFE0F'; title='Keep Practicing!';    sub='Try using more emojis and words!'; }

  el('scoreBadge').textContent   = badge;
  el('scoreGrade').textContent   = grade;
  el('scoreTitle').textContent   = title;
  el('scoreSub').textContent     = sub;
  el('totalScore').textContent   = String(total);
  el('newHs').textContent        = isNew ? '\u2B50 New High Score: ' + total + ' pts!' : '';

  // Score bars
  el('ptLength').textContent   = scores.length + ' pts';
  el('ptEmoji').textContent    = scores.emoji + ' pts';
  el('ptCreative').textContent = scores.creative + ' pts';
  el('ptSpeed').textContent    = scores.speed + ' pts';

  showScreen('sScore');

  // Animate bars after screen shows
  setTimeout(function() {
    el('barLength').style.width   = Math.round((scores.length / 300) * 100) + '%';
    el('barEmoji').style.width    = Math.round((scores.emoji  / 300) * 100) + '%';
    el('barCreative').style.width = Math.round((scores.creative/200) * 100) + '%';
    el('barSpeed').style.width    = Math.round((scores.speed  / 100) * 100) + '%';
  }, 200);

  // Emoji result chips
  var emojiResult = el('emojiResult');
  emojiResult.innerHTML = '';
  for (var i = 0; i < G.assignedEmojis.length; i++) {
    var chip = document.createElement('div');
    var found = text.indexOf(G.assignedEmojis[i]) !== -1;
    chip.className = 'er-chip ' + (found ? 'found' : 'missing');
    chip.innerHTML = G.assignedEmojis[i] + ' ' + (found ? '\u2713 Used' : '\u2717 Missed');
    emojiResult.appendChild(chip);
  }

  // Story preview (truncate if long)
  var preview = text.length > 300 ? text.slice(0, 300) + '...' : text;
  el('storyPreview').textContent = preview;
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

// ── Time option buttons ──
var timeOpts = document.querySelectorAll('.topt');
for (var i = 0; i < timeOpts.length; i++) {
  (function(btn) {
    btn.addEventListener('click', function() {
      timeOpts.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      G.timeLimit = parseInt(btn.getAttribute('data-val'));
    });
  })(timeOpts[i]);
}

// ── Event Listeners ──
el('btnStart').addEventListener('click', startGame);

el('storyInput').addEventListener('input', onStoryInput);

el('btnSubmit').addEventListener('click', function() { submitStory(); });

el('btnInsertEmoji').addEventListener('click', function(e) {
  e.stopPropagation();
  el('emojiPicker').classList.toggle('open');
});

document.addEventListener('click', function(e) {
  var picker = el('emojiPicker');
  if (picker && !picker.contains(e.target) && e.target !== el('btnInsertEmoji')) {
    picker.classList.remove('open');
  }
});

el('btnBack').addEventListener('click', function() {
  stopTimer();
  showScreen('sHome');
});

el('btnPlayAgain').addEventListener('click', function() {
  showScreen('sHome');
});

el('btnScoreHome').addEventListener('click', function() {
  showScreen('sHome');
});

// ── Init ──
buildHomeEmojis();
buildThemeGrid();
updateHSDisplay();
