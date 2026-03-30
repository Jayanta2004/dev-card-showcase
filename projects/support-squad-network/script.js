const STORAGE_KEY = 'support-squad-network-v1';

const SAMPLE_DATA = {
  requests: [
    {
      id: 101,
      title: 'Need a study accountability buddy',
      category: 'study',
      description: 'Preparing for finals and need someone to check in daily for one week.',
      status: 'open',
      assignedOfferId: null,
      squadName: null,
      createdAt: Date.now() - 1000 * 60 * 60 * 10
    },
    {
      id: 102,
      title: 'Weekly motivation check-ins',
      category: 'motivation',
      description: 'Looking for a volunteer to encourage me while I rebuild healthy habits.',
      status: 'open',
      assignedOfferId: null,
      squadName: null,
      createdAt: Date.now() - 1000 * 60 * 60 * 28
    }
  ],
  offers: [
    {
      id: 201,
      name: 'Aarav',
      skill: 'study',
      message: 'I can provide 30-minute daily planning + revision support.',
      missionsCompleted: 1,
      createdAt: Date.now() - 1000 * 60 * 60 * 52
    },
    {
      id: 202,
      name: 'Maya',
      skill: 'wellness',
      message: 'I host kind, non-judgmental weekly wellness check-ins.',
      missionsCompleted: 2,
      createdAt: Date.now() - 1000 * 60 * 60 * 31
    }
  ],
  stories: [
    {
      id: 301,
      title: 'From burnout to balance',
      body: 'A volunteer check-in squad helped me create a simple weekly routine and stick to it.',
      by: 'Community Member'
    },
    {
      id: 302,
      title: 'Interview confidence boost',
      body: 'My support partner practiced mock interviews with me and I got the offer.',
      by: 'Student Volunteer'
    }
  ],
  timeline: [
    { id: 401, text: 'Welcome to Support Squad Network.', at: new Date().toISOString() }
  ]
};

const BADGES = [
  { id: 'first-help', icon: '🫶', name: 'First Responder', rule: 'Complete 1 mission', check: (state) => doneCount(state) >= 1 },
  { id: 'triple-help', icon: '🚀', name: 'Momentum Maker', rule: 'Complete 3 missions', check: (state) => doneCount(state) >= 3 },
  { id: 'squad-lead', icon: '👥', name: 'Squad Builder', rule: 'Build 2 squads', check: (state) => squadCount(state) >= 2 },
  { id: 'story-light', icon: '✨', name: 'Inspiration Beacon', rule: 'Have 2 stories', check: (state) => state.stories.length >= 2 },
  { id: 'support-star', icon: '🌟', name: 'Support Star', rule: 'Complete 5 missions', check: (state) => doneCount(state) >= 5 }
];

const CATEGORY_NAMES = {
  study: 'Study Help',
  wellness: 'Wellness',
  career: 'Career Guidance',
  motivation: 'Motivation',
  daily: 'Daily Support'
};

let state = loadState();

const requestForm = document.getElementById('requestForm');
const offerForm = document.getElementById('offerForm');
const requestFilter = document.getElementById('requestFilter');
const shareImpactBtn = document.getElementById('shareImpactBtn');

const requestsList = document.getElementById('requestsList');
const offersList = document.getElementById('offersList');
const badgesList = document.getElementById('badgesList');
const storiesList = document.getElementById('storiesList');
const timelineList = document.getElementById('timelineList');

const openRequestsEl = document.getElementById('openRequests');
const completedMissionsEl = document.getElementById('completedMissions');
const activeSquadsEl = document.getElementById('activeSquads');
const earnedBadgesEl = document.getElementById('earnedBadges');

requestForm.addEventListener('submit', onRequestSubmit);
offerForm.addEventListener('submit', onOfferSubmit);
requestFilter.addEventListener('change', renderRequests);
shareImpactBtn.addEventListener('click', shareImpact);

renderAll();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(SAMPLE_DATA);
    const parsed = JSON.parse(raw);
    return {
      requests: Array.isArray(parsed.requests) ? parsed.requests : [],
      offers: Array.isArray(parsed.offers) ? parsed.offers : [],
      stories: Array.isArray(parsed.stories) ? parsed.stories : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : []
    };
  } catch {
    return structuredClone(SAMPLE_DATA);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function doneCount(input = state) {
  return input.requests.filter((r) => r.status === 'completed').length;
}

function squadCount(input = state) {
  return input.requests.filter((r) => r.squadName).length;
}

function unlockedBadges() {
  return BADGES.filter((badge) => badge.check(state));
}

function pushTimeline(text) {
  state.timeline.unshift({ id: Date.now() + Math.random(), text, at: new Date().toISOString() });
  state.timeline = state.timeline.slice(0, 50);
}

function onRequestSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('requestTitle').value.trim();
  const category = document.getElementById('requestCategory').value;
  const description = document.getElementById('requestDescription').value.trim();
  if (!title || !category || !description) return;

  state.requests.unshift({
    id: Date.now(),
    title,
    category,
    description,
    status: 'open',
    assignedOfferId: null,
    squadName: null,
    createdAt: Date.now()
  });

  pushTimeline(`New request posted: ${title}`);
  saveState();
  requestForm.reset();
  renderAll();
}

function onOfferSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('offerName').value.trim();
  const skill = document.getElementById('offerSkill').value;
  const message = document.getElementById('offerMessage').value.trim();
  if (!name || !skill || !message) return;

  state.offers.unshift({
    id: Date.now(),
    name,
    skill,
    message,
    missionsCompleted: 0,
    createdAt: Date.now()
  });

  pushTimeline(`Volunteer offer added by ${name}`);
  saveState();
  offerForm.reset();
  renderAll();
}

function renderAll() {
  renderRequests();
  renderOffers();
  renderBadges();
  renderStories();
  renderTimeline();
  renderStats();
}

function renderRequests() {
  const selected = requestFilter.value;
  const list = selected === 'all' ? state.requests : state.requests.filter((r) => r.category === selected);

  if (!list.length) {
    requestsList.innerHTML = '<div class="empty">No support requests found.</div>';
    return;
  }

  requestsList.innerHTML = list.map((req) => {
    const matchedOffer = state.offers.find((o) => o.id === req.assignedOfferId);
    const statusChip = req.status === 'completed' ? '<span class="chip wellness">Completed</span>' : req.status === 'assigned' ? '<span class="chip motivation">Assigned</span>' : '<span class="chip study">Open</span>';
    const actions = req.status === 'completed'
      ? `<button class="mini-btn warn" data-action="reopen" data-id="${req.id}"><i class="fa-solid fa-rotate-left"></i> Reopen</button>`
      : `<button class="mini-btn" data-action="assign" data-id="${req.id}"><i class="fa-solid fa-link"></i> Match Volunteer</button>
         <button class="mini-btn success" data-action="complete" data-id="${req.id}"><i class="fa-solid fa-check"></i> Mark Complete</button>`;

    return `
      <article class="item">
        <h4>${escapeHtml(req.title)}</h4>
        <p>${escapeHtml(req.description)}</p>
        <div class="meta-row">
          <div class="inline-actions">
            <span class="chip ${req.category}">${CATEGORY_NAMES[req.category]}</span>
            ${statusChip}
            ${req.squadName ? `<span class="chip career">${escapeHtml(req.squadName)}</span>` : ''}
          </div>
          <small>${timeAgo(req.createdAt)}</small>
        </div>
        ${matchedOffer ? `<p>Matched with <strong>${escapeHtml(matchedOffer.name)}</strong>.</p>` : ''}
        <div class="inline-actions">${actions}</div>
      </article>
    `;
  }).join('');

  requestsList.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === 'assign') assignRequest(id);
      if (action === 'complete') completeRequest(id);
      if (action === 'reopen') reopenRequest(id);
    });
  });
}

function renderOffers() {
  if (!state.offers.length) {
    offersList.innerHTML = '<div class="empty">No volunteers yet. Add your first offer.</div>';
    return;
  }

  offersList.innerHTML = state.offers.map((offer) => `
    <article class="item">
      <h4>${escapeHtml(offer.name)}</h4>
      <p>${escapeHtml(offer.message)}</p>
      <div class="meta-row">
        <span class="chip ${offer.skill}">${CATEGORY_NAMES[offer.skill]}</span>
        <small>Missions helped: ${offer.missionsCompleted}</small>
      </div>
    </article>
  `).join('');
}

function assignRequest(requestId) {
  const request = state.requests.find((r) => r.id === requestId);
  if (!request || request.status === 'completed') return;

  const matched = state.offers.find((o) => o.skill === request.category) || state.offers[0];
  if (!matched) {
    alert('Add at least one volunteer offer first.');
    return;
  }

  request.assignedOfferId = matched.id;
  request.status = 'assigned';
  request.squadName = `${CATEGORY_NAMES[request.category]} Squad`;

  pushTimeline(`Request "${request.title}" matched with ${matched.name}`);
  saveState();
  renderAll();
}

function completeRequest(requestId) {
  const request = state.requests.find((r) => r.id === requestId);
  if (!request || request.status === 'completed') return;

  request.status = 'completed';
  if (!request.squadName) request.squadName = `${CATEGORY_NAMES[request.category]} Squad`;

  const volunteer = state.offers.find((o) => o.id === request.assignedOfferId);
  if (volunteer) volunteer.missionsCompleted += 1;

  const newStory = {
    id: Date.now(),
    title: `${CATEGORY_NAMES[request.category]} mission completed`,
    body: `A support mission was completed for "${request.title}" with ${volunteer ? volunteer.name : 'a volunteer'} and ongoing squad encouragement.`,
    by: volunteer ? volunteer.name : 'Support Squad'
  };
  state.stories.unshift(newStory);
  state.stories = state.stories.slice(0, 12);

  pushTimeline(`Support mission completed: ${request.title}`);
  const before = Number(earnedBadgesEl.textContent || '0');
  const after = unlockedBadges().length;
  if (after > before) {
    const lastBadge = unlockedBadges()[after - 1];
    pushTimeline(`Badge unlocked: ${lastBadge.name}`);
  }

  saveState();
  renderAll();
}

function reopenRequest(requestId) {
  const request = state.requests.find((r) => r.id === requestId);
  if (!request) return;
  request.status = 'open';
  pushTimeline(`Mission reopened: ${request.title}`);
  saveState();
  renderAll();
}

function renderBadges() {
  const unlocked = new Set(unlockedBadges().map((b) => b.id));
  badgesList.innerHTML = BADGES.map((badge) => {
    const isOpen = unlocked.has(badge.id);
    return `
      <article class="badge ${isOpen ? '' : 'locked'}">
        <div class="icon">${badge.icon}</div>
        <div class="name">${badge.name}</div>
        <div class="rule">${badge.rule}</div>
      </article>
    `;
  }).join('');
}

function renderStories() {
  if (!state.stories.length) {
    storiesList.innerHTML = '<div class="empty">No inspiring stories yet.</div>';
    return;
  }

  storiesList.innerHTML = state.stories.slice(0, 8).map((story) => `
    <article class="story">
      <b>${escapeHtml(story.title)}</b>
      <p>${escapeHtml(story.body)}</p>
      <small>— ${escapeHtml(story.by)}</small>
    </article>
  `).join('');
}

function renderTimeline() {
  if (!state.timeline.length) {
    timelineList.innerHTML = '<li><p>No timeline entries yet.</p><span>Now</span></li>';
    return;
  }

  timelineList.innerHTML = state.timeline.slice(0, 18).map((item) => `
    <li>
      <p>${escapeHtml(item.text)}</p>
      <span>${formatDate(item.at)}</span>
    </li>
  `).join('');
}

function renderStats() {
  const open = state.requests.filter((r) => r.status !== 'completed').length;
  const complete = doneCount();
  const squads = squadCount();
  const badges = unlockedBadges().length;

  openRequestsEl.textContent = String(open);
  completedMissionsEl.textContent = String(complete);
  activeSquadsEl.textContent = String(squads);
  earnedBadgesEl.textContent = String(badges);
}

function shareImpact() {
  const missions = doneCount();
  const squads = squadCount();
  const badges = unlockedBadges().length;
  const message = `Support Squad Network impact: ${missions} missions completed, ${squads} squads built, ${badges} badges unlocked.`;

  if (navigator.share) {
    navigator.share({ title: 'Support Squad Network', text: message }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(message).then(() => {
    shareImpactBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
    setTimeout(() => {
      shareImpactBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Share Impact';
    }, 1200);
  }).catch(() => alert(message));
}

function timeAgo(timestamp) {
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
