//  TABS
document.querySelectorAll('.htab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.htab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});

//  BMI CALCULATOR
class BMICalc {
    constructor() {
        this.isMetric = true;
        this.gender = 'male';
        this.history = this.loadHist();
        this.chart = null;
        this.wChart = null;
        this.valid = { age: false, weight: false, height: false };
        this.bind();
        this.renderHistory();
        this.renderWellness();
    }

    bind() {
        document.getElementById('bmiForm').addEventListener('submit', e => { e.preventDefault(); this.calc(); });
        document.getElementById('metricBtn').addEventListener('click', () => this.setUnit(true));
        document.getElementById('imperialBtn').addEventListener('click', () => this.setUnit(false));
        document.getElementById('maleBtn').addEventListener('click', () => this.setGender('male'));
        document.getElementById('femaleBtn').addEventListener('click', () => this.setGender('female'));

        ['age', 'weight', 'height'].forEach(f => {
            document.getElementById(f + 'Input').addEventListener('input', () => this.validate(f));
            document.getElementById(f + 'Up').addEventListener('click', () => this.spin(f, 1));
            document.getElementById(f + 'Down').addEventListener('click', () => this.spin(f, -1));
        });

        document.getElementById('listBtn').addEventListener('click', () => this.showList());
        document.getElementById('chartBtn').addEventListener('click', () => this.showChart());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHist());
        document.getElementById('exportCSV').addEventListener('click', () => this.exportCSV());
    }

    setUnit(m) {
        this.isMetric = m;
        document.getElementById('metricBtn').classList.toggle('active', m);
        document.getElementById('imperialBtn').classList.toggle('active', !m);
        document.getElementById('weightUnit').textContent = m ? 'kg' : 'lbs';
        document.getElementById('heightUnit').textContent = m ? 'cm' : 'in';
        this.clearForm();
    }

    setGender(g) {
        this.gender = g;
        document.getElementById('maleBtn').classList.toggle('active', g === 'male');
        document.getElementById('femaleBtn').classList.toggle('active', g === 'female');
    }

    spin(f, d) {
        const inp = document.getElementById(f + 'Input');
        const step = f === 'age' ? 1 : 0.1;
        const v = (parseFloat(inp.value) || 0) + d * step;
        inp.value = f === 'age' ? Math.max(0, Math.round(v)) : Math.max(0, v).toFixed(1);
        inp.dispatchEvent(new Event('input'));
    }

    validate(f, force = false) {
        const inp = document.getElementById(f + 'Input');
        const err = document.getElementById(f + 'Error');
        const v = inp.value.trim();
        inp.classList.remove('is-err', 'is-ok');
        err.classList.remove('show'); err.textContent = '';

        if (!v) {
            this.valid[f] = false;
            if (force) this.showErr(inp, err, `Enter ${f}.`);
            this.updateBtn(); return false;
        }
        const n = parseFloat(v);
        if (isNaN(n) || n <= 0) {
            this.valid[f] = false;
            this.showErr(inp, err, 'Enter a valid positive number.');
            this.updateBtn(); return false;
        }

        const ranges = {
            age: [18, 120],
            weight: this.isMetric ? [20, 300] : [44, 660],
            height: this.isMetric ? [100, 250] : [39, 98]
        };
        const units = { age: 'yrs', weight: this.isMetric ? 'kg' : 'lbs', height: this.isMetric ? 'cm' : 'in' };
        const [mn, mx] = ranges[f];
        if (n < mn) { this.valid[f] = false; this.showErr(inp, err, `Min ${mn} ${units[f]}.`); this.updateBtn(); return false; }
        if (n > mx) { this.valid[f] = false; this.showErr(inp, err, `Max ${mx} ${units[f]}.`); this.updateBtn(); return false; }

        inp.classList.add('is-ok');
        this.valid[f] = true;
        this.updateBtn(); return true;
    }

    showErr(inp, err, msg) {
        inp.classList.add('is-err'); err.textContent = msg; err.classList.add('show');
    }

    updateBtn() {
        document.getElementById('submitBtn').disabled = !Object.values(this.valid).every(Boolean);
    }

    clearForm() {
        ['age', 'weight', 'height'].forEach(f => {
            const inp = document.getElementById(f + 'Input');
            inp.value = '';
            inp.classList.remove('is-err', 'is-ok');
            document.getElementById(f + 'Error').classList.remove('show');
        });
        this.valid = { age: false, weight: false, height: false };
        this.updateBtn();
    }

    calc() {
        if (!['age', 'weight', 'height'].every(f => this.validate(f, true))) return;
        const age = parseInt(document.getElementById('ageInput').value);
        const weight = parseFloat(document.getElementById('weightInput').value);
        const height = parseFloat(document.getElementById('heightInput').value);

        const wKg = this.isMetric ? weight : weight * 0.453592;
        const hM = this.isMetric ? height / 100 : height * 0.0254;
        const bmi = wKg / (hM * hM);
        const cat = this.getCat(bmi, age);

        // Deurenberg body fat estimate
        const bf = (1.20 * bmi) + (0.23 * age) - (10.8 * (this.gender === 'male' ? 1 : 0)) - 5.4;
        // Mifflin-St Jeor TDEE (sedentary)
        const bmr = this.gender === 'male'
            ? 10 * wKg + 6.25 * (hM * 100) - 5 * age + 5
            : 10 * wKg + 6.25 * (hM * 100) - 5 * age - 161;
        const tdee = Math.round(bmr * 1.2);

        const idealMin = Math.round(18.5 * hM * hM);
        const idealMax = Math.round(25 * hM * hM);
        const toDisplay = (kg) => this.isMetric ? `${kg}kg` : `${Math.round(kg * 2.205)}lbs`;

        this.showResult(bmi, cat, bf, tdee, toDisplay(idealMin), toDisplay(idealMax));
        this.saveHist({ age, weight, height, gender: this.gender, bmi: bmi.toFixed(1), catName: cat.name, catCls: cat.cls, unit: this.isMetric ? 'metric' : 'imperial', bf: bf.toFixed(1), tdee, date: new Date().toISOString() });
    }

    getCat(bmi, age) {
        const adj = age > 65 ? bmi - 0.5 : bmi;
        return [
            { name: 'Severely Underweight', cls: 'c1', min: -Infinity, max: 16, color: '#60a5fa', advice: 'Very low BMI. Please consult a healthcare professional urgently.' },
            { name: 'Underweight', cls: 'c2', min: 16, max: 18.5, color: '#93c5fd', advice: 'Consider a calorie-rich balanced diet. Speak to a clinician if concerned.' },
            { name: 'Normal Weight', cls: 'c3', min: 18.5, max: 25, color: '#34d399', advice: 'Great! Maintain a balanced diet and regular physical activity.' },
            { name: 'Overweight', cls: 'c4', min: 25, max: 30, color: '#fbbf24', advice: 'Small lifestyle changes with diet and activity can make a real difference.' },
            { name: 'Obese', cls: 'c5', min: 30, max: 35, color: '#f87171', advice: 'Higher health risk. Speak to a healthcare provider for guidance.' },
            { name: 'Extremely Obese', cls: 'c6', min: 35, max: Infinity, color: '#fca5a5', advice: 'Significant health risk. Please consult a healthcare professional promptly.' }
        ].find(c => adj >= c.min && adj < c.max);
    }

    showResult(bmi, cat, bf, tdee, idealMin, idealMax) {
        document.getElementById('resultEmpty').style.display = 'none';
        document.getElementById('resultContent').style.display = 'flex';

        const numEl = document.getElementById('bmiNumber');
        const catEl = document.getElementById('bmiCat');
        numEl.textContent = bmi.toFixed(1);
        numEl.style.color = cat.color;
        catEl.textContent = cat.name;
        catEl.style.color = cat.color;

        // Gauge (BMI 10-40 → dashoffset 251→0)
        const pct = Math.max(0, Math.min(1, (bmi - 10) / 30));
        document.getElementById('gaugeFill').style.strokeDashoffset = 251 - pct * 251;
        document.getElementById('gaugeFill').style.stroke = cat.color;

        // Zone needle (BMI 14-38 → 0-100%)
        document.getElementById('zoneNeedle').style.left = Math.max(0, Math.min(100, ((bmi - 14) / 24) * 100)) + '%';

        document.getElementById('statsGrid').innerHTML = `
      <div class="sbox"><div class="sbox-lbl">Body Fat Est.</div><div class="sbox-val">${Math.max(0, bf).toFixed(1)}%</div></div>
      <div class="sbox"><div class="sbox-lbl">Daily Calories</div><div class="sbox-val">${tdee} kcal</div></div>
      <div class="sbox"><div class="sbox-lbl">Ideal Weight</div><div class="sbox-val">${idealMin}–${idealMax}</div></div>
      <div class="sbox"><div class="sbox-lbl">Category</div><div class="sbox-val" style="font-size:.85rem;color:${cat.color}">${cat.name}</div></div>
    `;

        const advEl = document.getElementById('adviceBox');
        advEl.textContent = cat.advice;
        advEl.style.background = cat.color + '18';
        advEl.style.borderColor = cat.color + '44';

        const tr = document.getElementById('trendRow');
        if (this.history.length > 0) {
            const prev = parseFloat(this.history[0].bmi);
            const curr = parseFloat(bmi.toFixed(1));
            const diff = (curr - prev).toFixed(1);
            const [arrow, cls] = curr > prev ? ['↑', 't-up'] : curr < prev ? ['↓', 't-down'] : ['→', 't-same'];
            tr.style.display = 'flex';
            tr.innerHTML = `<span class="tarrow ${cls}">${arrow}</span><span>${Math.abs(diff)} vs last (${prev})</span>`;
        } else tr.style.display = 'none';
    }

    // HISTORY
    loadHist() { try { return JSON.parse(localStorage.getItem('bmiHistV3') || '[]'); } catch { return []; } }
    saveHist(e) {
        this.history.unshift(e);
        if (this.history.length > 20) this.history = this.history.slice(0, 20);
        localStorage.setItem('bmiHistV3', JSON.stringify(this.history));
        this.renderHistory();
    }
    clearHist() {
        this.history = []; localStorage.removeItem('bmiHistV3');
        this.renderHistory();
        if (this.chart) { this.chart.destroy(); this.chart = null; }
        document.getElementById('chartContainer').classList.remove('show');
        document.getElementById('historyList').style.display = 'flex';
        document.getElementById('listBtn').classList.add('active');
        document.getElementById('chartBtn').classList.remove('active');
    }

    showList() {
        document.getElementById('listBtn').classList.add('active');
        document.getElementById('chartBtn').classList.remove('active');
        document.getElementById('historyList').style.display = 'flex';
        document.getElementById('chartContainer').classList.remove('show');
        this.renderHistory();
    }

    showChart() {
        document.getElementById('chartBtn').classList.add('active');
        document.getElementById('listBtn').classList.remove('active');
        document.getElementById('historyList').style.display = 'none';
        document.getElementById('chartContainer').classList.add('show');
        this.renderChart();
    }

    renderHistory() {
        const el = document.getElementById('historyList');
        if (!this.history.length) { el.innerHTML = '<div class="hist-empty">No BMI records yet. Calculate above!</div>'; return; }
        el.innerHTML = this.history.map((e, i) => {
            const d = new Date(e.date);
            const fmt = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const prev = this.history[i + 1];
            let trend = '';
            if (prev) {
                const diff = parseFloat(e.bmi) - parseFloat(prev.bmi);
                trend = diff > 0 ? `<span style="color:#f87171">↑${diff.toFixed(1)}</span>`
                    : diff < 0 ? `<span style="color:#34d399">↓${Math.abs(diff).toFixed(1)}</span>` : '→';
            }
            return `<div class="hitem ${e.catCls}">
        <div class="hi-l">
          <div class="hi-bmi">${e.bmi}</div>
          <div class="hi-cat">${e.catName}</div>
          <div class="hi-det">${e.gender === 'male' ? 'Male' : 'Female'} · ${e.age}y · ${e.weight}${e.unit === 'metric' ? 'kg' : 'lbs'} · ${e.height}${e.unit === 'metric' ? 'cm' : 'in'}</div>
        </div>
        <div class="hi-r"><div class="hi-date">${fmt}</div><div class="hi-trend">${trend}</div></div>
      </div>`;
        }).join('');
    }

    renderChart() {
        if (!this.history.length) { document.getElementById('chartContainer').innerHTML = '<div class="hist-empty">No data yet.</div>'; return; }
        const rev = [...this.history].reverse();
        const labels = rev.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const data = rev.map(e => parseFloat(e.bmi));
        const colors = rev.map(e => { const b = parseFloat(e.bmi); return b < 16 ? '#60a5fa' : b < 18.5 ? '#93c5fd' : b < 25 ? '#34d399' : b < 30 ? '#fbbf24' : b < 35 ? '#f87171' : '#fca5a5'; });

        if (this.chart) this.chart.destroy();
        document.getElementById('chartContainer').innerHTML = '<canvas id="bmiCanvas"></canvas>';
        const ctx = document.getElementById('bmiCanvas').getContext('2d');
        const hzPlugin = {
            id: 'hz', beforeDraw(c) {
                const { ctx, chartArea, scales } = c; if (!chartArea) return;
                const y1 = scales.y.getPixelForValue(18.5), y2 = scales.y.getPixelForValue(25);
                ctx.save(); ctx.fillStyle = 'rgba(16,185,129,.08)';
                ctx.fillRect(chartArea.left, y2, chartArea.right - chartArea.left, y1 - y2); ctx.restore();
            }
        };
        this.chart = new Chart(ctx, {
            type: 'line', plugins: [hzPlugin],
            data: {
                labels, datasets: [{
                    label: 'BMI', data, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)',
                    pointBackgroundColor: colors, pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 6, fill: true, tension: .35
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(6,13,24,.95)', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1, callbacks: { label: c => `BMI: ${c.parsed.y}` } } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: 'rgba(255,255,255,.5)', font: { size: 11 } } },
                    y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: 'rgba(255,255,255,.5)', font: { size: 11 } }, suggestedMin: 14, suggestedMax: 38 }
                }
            }
        });
    }

    exportCSV() {
        if (!this.history.length) return;
        const rows = [['Date', 'BMI', 'Category', 'Gender', 'Age', 'Weight', 'Height', 'Unit', 'BodyFat%', 'TDEE']];
        this.history.forEach(e => rows.push([new Date(e.date).toLocaleString(), e.bmi, e.catName, e.gender, e.age, e.weight, e.height, e.unit, e.bf || '', e.tdee || '']));
        const a = document.createElement('a');
        a.href = 'data:text/csv,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'));
        a.download = 'bmi-history.csv'; a.click();
    }

    renderWellness() {
        const sessions = JSON.parse(localStorage.getItem('wellnesssessions') || '[]');
        const by = { active: 0, hydration: 0, mindful: 0, meal: 0 };
        sessions.forEach(s => { if (by[s.type] !== undefined) by[s.type]++; });
        document.getElementById('wellnessStats').innerHTML = `
      <div class="wstat"><div class="wstat-icon">🏃</div><div class="wstat-val">${by.active}</div><div class="wstat-lbl">Active Breaks</div></div>
      <div class="wstat"><div class="wstat-icon">💧</div><div class="wstat-val">${by.hydration}</div><div class="wstat-lbl">Hydrations</div></div>
      <div class="wstat"><div class="wstat-icon">🧘</div><div class="wstat-val">${by.mindful}</div><div class="wstat-lbl">Mindfulness</div></div>
      <div class="wstat"><div class="wstat-icon">🥗</div><div class="wstat-val">${by.meal}</div><div class="wstat-lbl">Meal Sessions</div></div>
    `;
        const wrap = document.getElementById('wellnessChartWrap');
        if (!sessions.length) { wrap.innerHTML = ''; return; }
        const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
        const counts = days.map(d => sessions.filter(s => new Date(s.date).toDateString() === d.toDateString()).length);
        const labels = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
        if (this.wChart) this.wChart.destroy();
        wrap.innerHTML = '<canvas id="wCanvas"></canvas>';
        this.wChart = new Chart(document.getElementById('wCanvas').getContext('2d'), {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Sessions', data: counts, backgroundColor: 'rgba(6,182,212,.45)', borderColor: '#06b6d4', borderWidth: 1, borderRadius: 6 }] },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,.45)', font: { size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: 'rgba(255,255,255,.45)', font: { size: 10 }, stepSize: 1 } }
                }
            }
        });
    }
}

//  WELLNESS TIMER
class WellnessTimer {
    constructor(bmiRef) {
        this.bmi = bmiRef;
        this.sessions = JSON.parse(localStorage.getItem('wellnesssessions') || '[]');
        this.streak = parseInt(localStorage.getItem('wellnessStreak') || '0');
        this.autoAdv = false;
        this.soundMode = 'none';
        this.running = false;
        this.interval = null;
        this.audioCtx = null;
        this.ambient = null;
        this.breathTimer = null;
        this.qIdx = 0;
        this.queue = [
            { type: 'active', dur: 300, name: 'Active Break', icon: '🏃' },
            { type: 'hydration', dur: 120, name: 'Hydration', icon: '💧' },
            { type: 'mindful', dur: 600, name: 'Mindfulness', icon: '🧘' },
            { type: 'meal', dur: 1200, name: 'Meal Mindfulness', icon: '🥗' }
        ];
        this.cur = this.queue[0];
        this.timeLeft = this.cur.dur;
        this.totalTime = this.cur.dur;
        this.initAudio();
        this.bindEvents();
        this.updateDisplay();
        this.updateStreak();
        this.renderLog();
    }

    initAudio() {
        try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { }
    }

    tone(freq, dur = 0.4, type = 'sine', vol = 0.15) {
        if (!this.audioCtx) return;
        try {
            this.audioCtx.resume();
            const o = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
            o.connect(g); g.connect(this.audioCtx.destination);
            o.frequency.value = freq; o.type = type;
            const t = this.audioCtx.currentTime;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dur);
            o.start(t); o.stop(t + dur);
        } catch { }
    }

    doneSound() { [528, 660, 792].forEach((f, i) => setTimeout(() => this.tone(f, .5, 'sine', .18), i * 150)); }

    startAmbient(m) {
        this.stopAmbient();
        if (!this.audioCtx || m === 'none') return;
        try {
            this.audioCtx.resume();
            const len = this.audioCtx.sampleRate * 2;
            const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate);
            const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
            const src = this.audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
            const f = this.audioCtx.createBiquadFilter();
            f.type = m === 'rain' ? 'bandpass' : 'lowpass'; f.frequency.value = m === 'rain' ? 800 : 400; f.Q.value = m === 'rain' ? .5 : 1;
            const g = this.audioCtx.createGain(); g.gain.value = .04;
            src.connect(f); f.connect(g); g.connect(this.audioCtx.destination); src.start();
            this.ambient = { src, g };
        } catch { }
    }

    stopAmbient() { if (this.ambient) { try { this.ambient.src.stop(); } catch { } this.ambient = null; } }

    bindEvents() {
        document.getElementById('timerToggle').addEventListener('click', () => this.toggle());
        document.getElementById('timerReset').addEventListener('click', () => this.reset());
        document.getElementById('soundToggleBtn').addEventListener('click', () => {
            const r = document.getElementById('soundRow');
            r.style.display = r.style.display === 'none' ? 'flex' : 'none';
        });
        document.getElementById('autoAdvBtn').addEventListener('click', () => {
            this.autoAdv = !this.autoAdv;
            const b = document.getElementById('autoAdvBtn');
            b.textContent = `Auto-advance: ${this.autoAdv ? 'ON' : 'OFF'}`;
            b.classList.toggle('on', this.autoAdv);
        });
        document.getElementById('clearSessions').addEventListener('click', () => {
            this.sessions = []; this.streak = 0;
            localStorage.removeItem('wellnesssessions');
            localStorage.removeItem('wellnessStreak');
            this.renderLog(); this.updateStreak(); this.bmi.renderWellness();
        });

        document.querySelectorAll('.stab').forEach(b => b.addEventListener('click', () => {
            if (this.running) return;
            const type = b.dataset.type, dur = parseInt(b.dataset.dur);
            this.selectSession(type, dur);
        }));

        document.querySelectorAll('.qitem').forEach((item, i) => item.addEventListener('click', () => {
            if (this.running) return;
            this.qIdx = i; const s = this.queue[i];
            this.selectSession(s.type, s.dur);
            this.updateQueueUI();
        }));

        document.querySelectorAll('.sopt').forEach(b => b.addEventListener('click', () => {
            document.querySelectorAll('.sopt').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); this.soundMode = b.dataset.sound;
            if (this.running) this.startAmbient(this.soundMode); else this.stopAmbient();
        }));
    }

    selectSession(type, dur) {
        this.cur = this.queue.find(q => q.type === type) || this.queue[0];
        this.timeLeft = dur; this.totalTime = dur;
        document.querySelectorAll('.stab').forEach(b => b.classList.toggle('active', b.dataset.type === type));
        this.updateDisplay(); this.updateRing();
    }

    toggle() { this.running ? this.pause() : this.start(); }

    start() {
        if (this.audioCtx) this.audioCtx.resume();
        this.running = true; this.tone(440, .25);
        this.startAmbient(this.soundMode); this.startBreath();
        this.updateBtn();
        this.interval = setInterval(() => { this.timeLeft--; this.updateDisplay(); this.updateRing(); if (this.timeLeft <= 0) this.complete(); }, 1000);
    }

    pause() {
        this.running = false; clearInterval(this.interval); this.interval = null;
        this.stopAmbient(); this.stopBreath(); this.updateBtn();
    }

    reset() {
        this.pause(); this.timeLeft = this.totalTime;
        this.updateDisplay(); this.updateRing();
    }

    complete() {
        this.pause(); this.doneSound();
        this.sessions.unshift({ type: this.cur.type, name: this.cur.name, icon: this.cur.icon, date: new Date().toISOString(), dur: this.totalTime });
        if (this.sessions.length > 50) this.sessions = this.sessions.slice(0, 50);
        localStorage.setItem('wellnesssessions', JSON.stringify(this.sessions));
        this.streak++; localStorage.setItem('wellnessStreak', this.streak);
        this.renderLog(); this.updateStreak(); this.bmi.renderWellness();
        if ('Notification' in window && Notification.permission === 'granted')
            new Notification('Wellness Timer', { body: `${this.cur.icon} ${this.cur.name} complete!` });
        if (this.autoAdv) {
            this.qIdx = (this.qIdx + 1) % this.queue.length;
            const next = this.queue[this.qIdx];
            setTimeout(() => { this.selectSession(next.type, next.dur); this.updateQueueUI(); this.start(); }, 1500);
        }
    }

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${m}:${s}`;
        document.getElementById('timerSName').textContent = this.cur.name;
    }

    updateRing() {
        const c = 2 * Math.PI * 96;
        const pct = this.totalTime > 0 ? this.timeLeft / this.totalTime : 1;
        document.getElementById('timerRing').style.strokeDashoffset = c * (1 - pct);
    }

    updateBtn() {
        document.querySelector('#timerToggle .icon-play').style.display = this.running ? 'none' : '';
        document.querySelector('#timerToggle .icon-pause').style.display = this.running ? '' : 'none';
    }

    updateStreak() {
        document.getElementById('streakVal').textContent = this.streak;
        document.getElementById('streakDots').innerHTML =
            Array.from({ length: 10 }, (_, i) => `<div class="sdot${i < Math.min(this.streak, 10) ? ' lit' : ''}"></div>`).join('');
    }

    updateQueueUI() {
        document.querySelectorAll('.qitem').forEach((item, i) => {
            item.classList.toggle('aq', i === this.qIdx);
            const s = item.querySelector('.qi-status');
            if (s) item.removeChild(s);
            if (i === this.qIdx) {
                const el = document.createElement('span'); el.className = 'qi-status'; el.textContent = 'Next'; item.appendChild(el);
            }
        });
    }

    startBreath() {
        this.stopBreath();
        const phases = ['Breathe in...', 'Hold...', 'Breathe out...', 'Rest...'];
        const durs = [4000, 2000, 4000, 2000];
        let i = 0;
        const cycle = () => {
            document.getElementById('breatheHint').textContent = phases[i];
            i = (i + 1) % phases.length;
            this.breathTimer = setTimeout(cycle, durs[i]);
        };
        cycle();
    }

    stopBreath() {
        clearTimeout(this.breathTimer);
        document.getElementById('breatheHint').textContent = 'Breathe in...';
    }

    renderLog() {
        const el = document.getElementById('sessionLog');
        if (!this.sessions.length) { el.innerHTML = '<div class="log-empty">No sessions yet.</div>'; return; }
        el.innerHTML = this.sessions.slice(0, 12).map(s => {
            const d = new Date(s.date);
            const fmt = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return `<div class="logitem"><div class="log-in">${s.icon} ${s.name}</div><div class="log-time">${Math.floor(s.dur / 60)}m · ${fmt}</div></div>`;
        }).join('');
    }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
    const bmi = new BMICalc();
    const timer = new WellnessTimer(bmi);
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
});