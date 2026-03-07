const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const THEMES = {
    monday: {
        name: 'Monday',
        style: 'Brutalism',
        tagline: 'Raw. Unfiltered. Confrontational. The week begins with no apologies.',
        bg: '#f5f0e8',
        dots: '#ff2d00',
        cards: [
            { n: '01', t: 'BLOCK BY BLOCK', b: 'No gradients. No rounded corners. Just pure structure and hierarchy doing all the heavy lifting.' },
            { n: '02', t: 'STARK CONTRAST', b: 'Black borders. Hard shadows. Bold typography that refuses to be ignored by anyone.' },
            { n: '03', t: 'RAW GRID', b: 'Layout follows logic, not beauty. Function carved into form without compromise or decoration.' }
        ],
        easter: [
            '🟥 MONDAY: THE MOST HONEST DAY.',
            '💪 NO GRADIENTS. NO MERCY.',
            '⚡ BRUTALISM IS NOT A BUG. IT\'S A FEATURE.'
        ]
    },
    tuesday: {
        name: 'Tuesday',
        style: 'Glassmorphism',
        tagline: 'Soft light through frosted glass. Reality seen through a beautiful blur.',
        bg: '#0a0015',
        dots: '#b57bff',
        cards: [
            { n: '01', t: 'Frosted Depth', b: 'Blur layers create hierarchy. Nothing is quite solid — everything exists in a translucent dream.' },
            { n: '02', t: 'Soft Light', b: 'Radial gradients bloom in the background, lending warmth and glow to the cold dark void.' },
            { n: '03', t: 'Hover Lift', b: 'Cards float upward when touched. Every interaction is feather-light and full of quiet delight.' }
        ],
        easter: [
            '✨ You\'ve found the glass behind the glass.',
            '🫧 Everything is transparent on Tuesdays.',
            '💜 Blur is just focus wearing a dream.'
        ]
    },
    wednesday: {
        name: 'Wednesday',
        style: 'Retro 90s',
        tagline: '> WELCOME TO CYBERSPACE_. DIAL-UP REQUIRED. NO FLASH PLUGIN DETECTED.',
        bg: '#000080',
        dots: '#ff00ff',
        cards: [
            { n: '01', t: 'PIXEL PUSH', b: 'Chunky borders and monospace fonts. This site is best viewed in Netscape Navigator 4.0.' },
            { n: '02', t: '// GLITCH //  ', b: 'Reality keeps slipping. Text flickers. The matrix is leaking through the old CRT display.' },
            { n: '03', t: 'GIF VIBES', b: 'Imagine animated flames here. And a hit counter. And a guestbook. Sign it with your handle.' }
        ],
        easter: [
            'YOU HAVE 1 NEW MESSAGE IN YOUR INBOX.',
            '⚠️ VIRUS SCAN COMPLETE: 0 THREATS FOUND.',
            'LEET HAXOR DETECTED. ACCESS GRANTED.'
        ]
    },
    thursday: {
        name: 'Thursday',
        style: 'Minimal Dark',
        tagline: 'Silence is the loudest form of design. Only what matters, nothing more.',
        bg: '#0c0c0c',
        dots: 'rgba(255,255,255,0.3)',
        cards: [
            { n: '001', t: 'Negative Space', b: 'What is removed speaks as loudly as what remains. Emptiness is not nothing — it is structure.' },
            { n: '002', t: 'Monochrome', b: 'A single color palette forces you to find beauty in proportion, weight, and subtle restraint.' },
            { n: '003', t: 'Stillness', b: 'No animations for their own sake. Motion earns its place or stays quiet in the darkness.' }
        ],
        easter: [
            'The absence of color is still a choice.',
            'You found silence in the dark.',
            'Minimalism took the most work to build.'
        ]
    },
    friday: {
        name: 'Friday',
        style: 'Editorial',
        tagline: 'The week unfolds like a magazine you actually want to read from cover to cover.',
        bg: '#faf8f4',
        dots: '#1a1a1a',
        cards: [
            { n: 'I', t: 'The Long Read', b: 'Typography as architecture. Columns, kerning, and leading are the bones of every great page.' },
            { n: 'II', t: 'White Space', b: 'The luxury of breathing room. Only publications that trust their content can afford this silence.' },
            { n: 'III', t: 'Italic Soul', b: 'A slant tells a story of voice and intention. Even the angle of type carries its own meaning.' }
        ],
        easter: [
            'You found the editor\'s note.',
            'This issue sold out in print.',
            'Cover story: The Website That Changed Its Clothes.'
        ]
    },
    saturday: {
        name: 'Saturday',
        style: 'Vaporwave',
        tagline: 'A E S T H E T I C S  //  PALM TREES IN CYBERSPACE  //  ☆ 1 9 8 4 ☆',
        bg: '#1a0533',
        dots: '#ff71ce',
        cards: [
            { n: '01', t: 'SYNTHWAVE', b: 'The grid stretches to infinity. Neon light cuts through digital fog on the drive home.' },
            { n: '02', t: 'SLOWED DOWN', b: 'Everything is 20bpm slower here. Time pools in the fluorescent corners of the mall.' },
            { n: '03', t: 'RETRO FUTURE', b: 'A tomorrow that never arrived, preserved in chrome and coral pink, perfect forever.' }
        ],
        easter: [
            '🌴 ✧ HOTLINE MIAMI CALLED ✧ 🌴',
            '📼 V A P O R W A V E  N E V E R  D I E S',
            '☆ YOU FOUND THE SECRET MALL LEVEL ☆'
        ]
    },
    sunday: {
        name: 'Sunday',
        style: 'Art Déco',
        tagline: 'Rest in gilded geometry. The week returns to its own beginning.',
        bg: '#0d0b07',
        dots: '#c9a84c',
        cards: [
            { n: 'I', t: 'Golden Ratio', b: 'Mathematics as ornament. Every proportion deliberate, every angle a testament to elegance.' },
            { n: 'II', t: 'Symmetry', b: 'The decorative border frames existence itself. Beauty requires a boundary to become meaningful.' },
            { n: 'III', t: 'Gilt Edge', b: 'Gold does not shout. It glows, waiting for those patient enough to notice its quiet warmth.' }
        ],
        easter: [
            '◆ You found the hidden medallion.',
            '✦ Sundays are for the patient observer.',
            '◈ Art Déco never truly went away.'
        ]
    }
};

// LocalStorage: visit tracking
function trackVisit() {
    const today = new Date().toDateString();
    const visits = JSON.parse(localStorage.getItem('dailyshift_visits') || '{}');
    visits[today] = (visits[today] || 0) + 1;
    const totalVisits = Object.values(visits).reduce((a, b) => a + b, 0);
    localStorage.setItem('dailyshift_visits', JSON.stringify(visits));
    localStorage.setItem('dailyshift_total', totalVisits);
    return { todayVisits: visits[today], totalVisits };
}

function getActiveDay() {
    const stored = localStorage.getItem('dailyshift_preview');
    if (stored !== null) return parseInt(stored);
    return new Date().getDay();
}

let currentDay = getActiveDay();

function buildContent(dayName) {
    const t = THEMES[dayName];
    const wrapper = document.getElementById('siteWrapper');

    let extraBits = '';
    if (dayName === 'monday') extraBits = '<div class="bg-accent"></div>';
    if (dayName === 'tuesday') extraBits = '<div class="orb orb-1"></div><div class="orb orb-2"></div>';
    if (dayName === 'wednesday') extraBits = '<div class="scanline"></div>';
    if (dayName === 'saturday') extraBits = '<div class="grid-bg"></div>';
    if (dayName === 'sunday') extraBits = '<div class="deco-border"></div>';

    let heroExtra = '';
    if (dayName === 'tuesday') {
        heroExtra = '';
    }
    if (dayName === 'wednesday') {
        heroExtra = `
      <div class="marquee-wrap">
        <div class="marquee-inner">★ BEST WEBSITE ON THE WEB ★ VISITOR #000384 ★ YOU ARE VISITOR NUMBER 000384 ★ SIGN OUR GUESTBOOK ★ BEST VIEWED 800×600 ★ IE 4.0 ★ BEST WEBSITE ON THE WEB ★</div>
      </div>
    `;
    }

    if (dayName === 'saturday') {
        heroExtra = `<div class="vw-sun"></div>`;
    }

    let heroLabel = '';
    if (dayName === 'friday') {
        heroLabel = `<div class="issue-num">Daily Shift — Issue 0${DAYS.indexOf('friday') + 1}</div>`;
    }
    if (dayName === 'sunday') {
        heroLabel = `
      <div class="deco-line">
        <span></span>
        <em>Day of Rest</em>
        <span></span>
      </div>
    `;
    }

    const cards = t.cards.map(c => `
    <div class="card">
      <span class="card-num">${c.n}</span>
      <div class="card-title">${c.t}</div>
      <div class="card-body">${c.b}</div>
    </div>
  `).join('');

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    wrapper.innerHTML = `
    ${extraBits}
    <div class="hero">
      ${heroLabel}
      ${heroExtra && dayName === 'saturday' ? heroExtra : ''}
      <div class="day-label">${t.name}${dayName === 'monday' ? '<span>.</span>' : ''}</div>
      <div class="tagline">${t.tagline}</div>
      ${heroExtra && dayName !== 'saturday' ? heroExtra : ''}
    </div>
    <div class="content-grid">${cards}</div>
    <div class="footer">
      <span>DAILY.SHIFT — ${t.style.toUpperCase()}</span>
      <span>${dateStr}</span>
      <span>LOCAL TIME: ${timeStr}</span>
    </div>
  `;
}

function applyTheme(dayIndex) {
    const dayName = DAYS[dayIndex];
    const body = document.body;

    // Remove all theme classes
    DAYS.forEach(d => body.classList.remove('theme-' + d));
    body.classList.add('theme-' + dayName);

    // Re-trigger animations
    const wrapper = document.getElementById('siteWrapper');
    wrapper.style.animation = 'none';
    void wrapper.offsetWidth;
    wrapper.style.animation = '';

    buildContent(dayName);

    const badge = document.getElementById('themeBadge');
    badge.textContent = THEMES[dayName].style.toUpperCase();

    // Day nav dots
    const nav = document.getElementById('dayNav');
    nav.innerHTML = DAYS.map((d, i) => `
    <button class="day-dot ${i === dayIndex ? 'active' : ''}" 
      style="background: ${i === dayIndex ? THEMES[d].dots : 'rgba(255,255,255,0.25)'}"
      data-day="${i}" title="${d.charAt(0).toUpperCase() + d.slice(1)} — ${THEMES[d].style}"></button>
  `).join('');

    nav.querySelectorAll('.day-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const d = parseInt(dot.dataset.day);
            localStorage.setItem('dailyshift_preview', d);
            switchDay(d);
        });
    });

    currentDay = dayIndex;
}

function switchDay(dayIndex) {
    const overlay = document.getElementById('transition');
    const themeColors = {
        0: '#0d0b07', 1: '#f5f0e8', 2: '#0a0015',
        3: '#000080', 4: '#0c0c0c', 5: '#faf8f4', 6: '#1a0533'
    };
    overlay.style.background = themeColors[dayIndex] || '#000';
    overlay.classList.add('active');

    setTimeout(() => {
        applyTheme(dayIndex);
        setTimeout(() => overlay.classList.remove('active'), 300);
    }, 300);
}

function showEasterEgg(dayName, visits) {
    const eggs = THEMES[dayName].easter;
    const el = document.getElementById('easterEgg');

    let msg = '';
    if (visits >= 5) msg = eggs[2];
    else if (visits >= 3) msg = eggs[1];
    else msg = eggs[0];

    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 4000);
}

function updateVisitInfo(visits) {
    const el = document.getElementById('visitInfo');
    el.textContent = `${visits.totalVisits} total visit${visits.totalVisits !== 1 ? 's' : ''}  ·  ${visits.todayVisits} today`;
}

// Init
const visits = trackVisit();
applyTheme(currentDay);
updateVisitInfo(visits);

// Show easter egg after slight delay
setTimeout(() => {
    showEasterEgg(DAYS[currentDay], visits.totalVisits);
}, 2000);

// Konami code easter egg
let konamiSeq = [];
const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
document.addEventListener('keydown', e => {
    konamiSeq.push(e.keyCode);
    if (konamiSeq.length > 10) konamiSeq.shift();
    if (konamiSeq.join(',') === KONAMI.join(',')) {
        const el = document.getElementById('easterEgg');
        el.textContent = '🎮 ↑↑↓↓←→←→BA — CHEAT CODE ACTIVATED. +99 LIVES.';
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 5000);
    }
});

// Click counter easter egg (click logo 5 times)
let heroClicks = 0;
document.addEventListener('click', e => {
    if (e.target.classList.contains('day-label')) {
        heroClicks++;
        if (heroClicks === 5) {
            heroClicks = 0;
            const el = document.getElementById('easterEgg');
            el.textContent = '⭐ POWER USER UNLOCKED. You clicked the title 5 times.';
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 4000);
        }
    }
});