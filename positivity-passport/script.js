const STORAGE_KEY = 'positivity-passport-data-v1';

const MISSIONS = [
  { id: 'm1', title: 'Help a classmate with a task', category: 'helping' },
  { id: 'm2', title: 'Carry something for someone', category: 'helping' },
  { id: 'm3', title: 'Share useful notes or resources', category: 'sharing' },
  { id: 'm4', title: 'Offer your seat / space kindly', category: 'sharing' },
  { id: 'm5', title: 'Listen to someone without interrupting', category: 'listening' },
  { id: 'm6', title: 'Check in on a friend emotionally', category: 'listening' },
  { id: 'm7', title: 'Write a gratitude message', category: 'gratitude' },
  { id: 'm8', title: 'Thank someone publicly', category: 'gratitude' },
  { id: 'm9', title: 'Join a local volunteer activity', category: 'community' },
  { id: 'm10', title: 'Support a community initiative', category: 'community' }
];

const BADGES = [
  { id: 'b1', icon: '🌍', title: 'Global Starter', rule: 'Complete 2 missions', check: (state) => completedCount(state) >= 2 },
  { id: 'b2', icon: '✈️', title: 'Route Builder', rule: 'Complete 5 missions', check: (state) => completedCount(state) >= 5 },
  { id: 'b3', icon: '🎧', title: 'Deep Listener', rule: 'Complete both Listening missions', check: (state) => categoryDone(state, 'listening') >= 2 },
  { id: 'b4', icon: '🤝', title: 'Kind Connector', rule: 'Complete both Helping missions', check: (state) => categoryDone(state, 'helping') >= 2 },
  { id: 'b5', icon: '💌', title: 'Gratitude Ambassador', rule: 'Complete both Gratitude missions', check: (state) => categoryDone(state, 'gratitude') >= 2 },
  { id: 'b6', icon: '🏁', title: 'World of Kindness', rule: 'Complete all missions', check: (state) => completedCount(state) === MISSIONS.length }
];

const CATEGORIES = ['helping', 'sharing', 'listening', 'gratitude', 'community'];

const state = loadState();

const missionsList = document.getElementById('missionsList');
const passportGrid = document.getElementById('passportGrid');
const badgesGrid = document.getElementById('badgesGrid');
const timelineList = document.getElementById('timelineList');
const categoryFilter = document.getElementById('categoryFilter');

const totalStampsEl = document.getElementById('totalStamps');
const totalMissionsEl = document.getElementById('totalMissions');
const totalBadgesEl = document.getElementById('totalBadges');
const journeyLevelEl = document.getElementById('journeyLevel');
const passportCompletionEl = document.getElementById('passportCompletion');
const sharePassportBtn = document.getElementById('sharePassportBtn');

categoryFilter.addEventListener('change', renderMissions);
sharePassportBtn.addEventListener('click', sharePassport);

renderAll();

function loadState() {
  const fallback = {
    completedMissionIds: [],
    timeline: []
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      completedMissionIds: Array.isArray(parsed.completedMissionIds) ? parsed.completedMissionIds : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : []
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function completedCount(inputState = state) {
  return inputState.completedMissionIds.length;
}

function categoryDone(inputState, category) {
  const missionIds = MISSIONS.filter((m) => m.category === category).map((m) => m.id);
  return missionIds.filter((id) => inputState.completedMissionIds.includes(id)).length;
}

function getUnlockedBadges() {
  return BADGES.filter((badge) => badge.check(state));
}

function getJourneyLevel(done) {
  if (done === MISSIONS.length) return 'Global Hero';
  if (done >= 8) return 'Sky Traveler';
  if (done >= 5) return 'Kind Voyager';
  if (done >= 2) return 'Passport Holder';
  return 'Explorer';
}

function renderAll() {
  renderMissions();
  renderPassport();
  renderBadges();
  renderTimeline();
  renderStats();
}

function renderMissions() {
  const selectedCategory = categoryFilter.value;
  const visibleMissions = selectedCategory === 'all' ? MISSIONS : MISSIONS.filter((m) => m.category === selectedCategory);

  missionsList.innerHTML = visibleMissions.map((mission) => {
    const checked = state.completedMissionIds.includes(mission.id);
    return `
      <label class="mission" for="${mission.id}">
        <input id="${mission.id}" type="checkbox" ${checked ? 'checked' : ''} data-id="${mission.id}" />
        <div class="meta">
          <b>${mission.title}</b>
          <small>${checked ? 'Completed' : 'Pending'}</small>
        </div>
        <span class="chip ${mission.category}">${mission.category}</span>
      </label>
    `;
  }).join('');

  missionsList.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    box.addEventListener('change', () => toggleMission(box.dataset.id, box.checked));
  });
}

function toggleMission(missionId, checked) {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return;

  const exists = state.completedMissionIds.includes(missionId);

  if (checked && !exists) {
    state.completedMissionIds.push(missionId);
    addTimeline(`Completed mission: ${mission.title}`);
  }

  if (!checked && exists) {
    state.completedMissionIds = state.completedMissionIds.filter((id) => id !== missionId);
    addTimeline(`Reopened mission: ${mission.title}`);
  }

  const unlockedNow = getUnlockedBadges();
  const previousBadgeCount = Number(totalBadgesEl.textContent) || 0;
  if (unlockedNow.length > previousBadgeCount) {
    const latest = unlockedNow[unlockedNow.length - 1];
    addTimeline(`Unlocked badge: ${latest.title}`);
  }

  saveState();
  renderAll();
}

function renderPassport() {
  const html = CATEGORIES.map((category) => {
    const done = categoryDone(state, category);
    const total = MISSIONS.filter((m) => m.category === category).length;
    const filled = done >= total;
    return `
      <article class="stamp-slot">
        <div class="name">${category} ${done}/${total}</div>
        ${filled ? `<div class="stamp ${category}">VISA</div>` : '<div class="pill">Locked</div>'}
      </article>
    `;
  }).join('');

  passportGrid.innerHTML = html;

  const completion = Math.round((completedCount() / MISSIONS.length) * 100);
  passportCompletionEl.textContent = `${completion}% complete`;
}

function renderBadges() {
  const unlocked = new Set(getUnlockedBadges().map((b) => b.id));

  badgesGrid.innerHTML = BADGES.map((badge) => {
    const isOpen = unlocked.has(badge.id);
    return `
      <article class="badge ${isOpen ? '' : 'locked'}">
        <div class="icon">${badge.icon}</div>
        <div class="title">${badge.title}</div>
        <div class="rule">${badge.rule}</div>
      </article>
    `;
  }).join('');
}

function addTimeline(text) {
  state.timeline.unshift({ text, at: new Date().toISOString() });
  state.timeline = state.timeline.slice(0, 40);
}

function renderTimeline() {
  if (!state.timeline.length) {
    timelineList.innerHTML = '<li class="timeline-item"><p>Start your kindness journey by completing your first mission.</p><span>Now</span></li>';
    return;
  }

  timelineList.innerHTML = state.timeline.map((item) => `
    <li class="timeline-item">
      <p>${item.text}</p>
      <span>${formatTime(item.at)}</span>
    </li>
  `).join('');
}

function renderStats() {
  const done = completedCount();
  const badges = getUnlockedBadges().length;
  const stamps = CATEGORIES.filter((cat) => categoryDone(state, cat) === MISSIONS.filter((m) => m.category === cat).length).length;

  totalStampsEl.textContent = String(stamps);
  totalMissionsEl.textContent = String(done);
  totalBadgesEl.textContent = String(badges);
  journeyLevelEl.textContent = getJourneyLevel(done);
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function sharePassport() {
  const done = completedCount();
  const total = MISSIONS.length;
  const badges = getUnlockedBadges().length;
  const text = `My Positivity Passport: ${done}/${total} missions complete, ${badges} global badges unlocked! 🌍✨`;

  if (navigator.share) {
    navigator.share({ title: 'Positivity Passport', text }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    sharePassportBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => {
      sharePassportBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Share Passport';
    }, 1200);
  }).catch(() => {
    alert(text);
  });
}
