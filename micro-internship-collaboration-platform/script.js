const STORAGE_KEY = 'microInternshipCollabData';

const state = {
  students: [],
  sprints: [],
  applications: [],
  outcomes: []
};

const studentForm = document.getElementById('studentForm');
const sprintForm = document.getElementById('sprintForm');
const activeStudent = document.getElementById('activeStudent');
const matchesList = document.getElementById('matchesList');
const applicationsList = document.getElementById('applicationsList');
const outcomesList = document.getElementById('outcomesList');
const seedBtn = document.getElementById('seedBtn');
const toast = document.getElementById('toast');

function uid() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function normalizeSkills(rawSkills) {
  return rawSkills
    .split(',')
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  const parsed = JSON.parse(data);
  state.students = parsed.students || [];
  state.sprints = parsed.sprints || [];
  state.applications = parsed.applications || [];
  state.outcomes = parsed.outcomes || [];
}

function seedData() {
  if (state.students.length || state.sprints.length) {
    showToast('Demo data only loads on empty board');
    return;
  }

  state.students.push(
    { id: uid(), name: 'Riya Sharma', skills: ['javascript', 'react', 'figma'], availability: 2 },
    { id: uid(), name: 'Aditya Rao', skills: ['seo', 'copywriting', 'analytics'], availability: 3 }
  );

  state.sprints.push(
    {
      id: uid(),
      startup: 'LaunchLabs',
      title: 'Onboarding Flow Sprint',
      requiredSkills: ['react', 'ui design', 'analytics'],
      duration: 2,
      deliverable: 'Interactive onboarding with event tracking',
      status: 'open'
    },
    {
      id: uid(),
      startup: 'GrowthNest',
      title: 'Landing Page SEO Sprint',
      requiredSkills: ['seo', 'copywriting', 'content strategy'],
      duration: 3,
      deliverable: 'Conversion-ready SEO landing page package',
      status: 'open'
    }
  );

  save();
  renderAll();
  showToast('Demo data loaded');
}

function updateStats() {
  const openSprints = state.sprints.filter((sprint) => sprint.status === 'open').length;
  const activeMatches = state.applications.filter((application) => application.status === 'active').length;
  const verified = state.outcomes.length;
  const students = state.students.length;

  document.getElementById('openSprintsCount').textContent = openSprints;
  document.getElementById('activeMatchesCount').textContent = activeMatches;
  document.getElementById('verifiedCount').textContent = verified;
  document.getElementById('studentsCount').textContent = students;
}

function renderStudentSelect() {
  if (!state.students.length) {
    activeStudent.innerHTML = '<option value="">Add a student first</option>';
    return;
  }

  activeStudent.innerHTML = state.students
    .map((student) => `<option value="${student.id}">${student.name} (${student.availability}w)</option>`)
    .join('');
}

function skillOverlap(studentSkills, sprintSkills) {
  const set = new Set(studentSkills);
  const common = sprintSkills.filter((skill) => set.has(skill));
  return { count: common.length, common };
}

function renderMatches() {
  const selectedStudent = state.students.find((student) => String(student.id) === activeStudent.value) || state.students[0];

  if (!selectedStudent) {
    matchesList.innerHTML = '<div class="empty">Add a student profile to view sprint matches.</div>';
    return;
  }

  const openSprints = state.sprints.filter((sprint) => sprint.status === 'open');
  if (!openSprints.length) {
    matchesList.innerHTML = '<div class="empty">No open sprints. Post one from startup side.</div>';
    return;
  }

  const ranked = openSprints
    .map((sprint) => {
      const overlap = skillOverlap(selectedStudent.skills, sprint.requiredSkills);
      const availabilityFit = selectedStudent.availability >= sprint.duration ? 1 : 0;
      const score = overlap.count * 30 + availabilityFit * 20;
      return { sprint, overlap, score };
    })
    .sort((a, b) => b.score - a.score);

  matchesList.innerHTML = ranked
    .map(({ sprint, overlap, score }) => {
      const alreadyApplied = state.applications.some(
        (application) => application.sprintId === sprint.id && application.studentId === selectedStudent.id
      );
      return `
        <article class="item">
          <div class="item-head">
            <div>
              <div class="item-title">${sprint.title}</div>
              <div class="meta">${sprint.startup} · ${sprint.duration} week sprint · Match score ${score}</div>
            </div>
          </div>
          <div class="meta">Deliverable: ${sprint.deliverable}</div>
          <div class="tags">
            ${sprint.requiredSkills.map((skill) => `<span class="tag">${skill}</span>`).join('')}
          </div>
          <div class="meta">Skill overlap: ${overlap.common.length ? overlap.common.join(', ') : 'No direct overlap yet'}</div>
          <div class="action-row">
            <button class="small-btn primary" data-action="apply" data-sprint="${sprint.id}" ${alreadyApplied ? 'disabled' : ''}>
              ${alreadyApplied ? 'Applied' : 'Apply to Sprint'}
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderApplications() {
  if (!state.applications.length) {
    applicationsList.innerHTML = '<div class="empty">No active applications yet.</div>';
    return;
  }

  applicationsList.innerHTML = state.applications
    .map((application) => {
      const student = state.students.find((entry) => entry.id === application.studentId);
      const sprint = state.sprints.find((entry) => entry.id === application.sprintId);
      if (!student || !sprint) return '';
      return `
        <article class="item">
          <div class="item-title">${student.name} ↔ ${sprint.startup}</div>
          <div class="meta">${sprint.title} · Status: ${application.status}</div>
          <div class="action-row">
            <button class="small-btn" data-action="complete" data-app="${application.id}" ${application.status !== 'active' ? 'disabled' : ''}>Mark Completed</button>
            <button class="small-btn primary" data-action="verify" data-app="${application.id}" ${application.status !== 'completed' ? 'disabled' : ''}>Verify Outcome</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderOutcomes() {
  if (!state.outcomes.length) {
    outcomesList.innerHTML = '<div class="empty">Verified project outcomes will appear here.</div>';
    return;
  }

  outcomesList.innerHTML = state.outcomes
    .slice()
    .reverse()
    .map(
      (outcome) => `
      <article class="item">
        <div class="item-title">${outcome.studentName} · ${outcome.sprintTitle}</div>
        <div class="meta">Startup: ${outcome.startup} · Certificate: ${outcome.certificateId}</div>
        <div class="meta">Outcome: ${outcome.deliverable}</div>
      </article>
    `
    )
    .join('');
}

function renderAll() {
  updateStats();
  renderStudentSelect();
  renderMatches();
  renderApplications();
  renderOutcomes();
}

studentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('studentName').value.trim();
  const skills = normalizeSkills(document.getElementById('studentSkills').value);
  const availability = Number(document.getElementById('studentAvailability').value);

  if (!name || !skills.length || !availability) {
    showToast('Please complete all student fields');
    return;
  }

  state.students.push({ id: uid(), name, skills, availability });
  studentForm.reset();
  save();
  renderAll();
  showToast('Student added');
});

sprintForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const startup = document.getElementById('startupName').value.trim();
  const title = document.getElementById('sprintTitle').value.trim();
  const requiredSkills = normalizeSkills(document.getElementById('requiredSkills').value);
  const duration = Number(document.getElementById('sprintDuration').value);
  const deliverable = document.getElementById('deliverable').value.trim();

  if (!startup || !title || !requiredSkills.length || !duration || !deliverable) {
    showToast('Please complete all sprint fields');
    return;
  }

  state.sprints.push({
    id: uid(),
    startup,
    title,
    requiredSkills,
    duration,
    deliverable,
    status: 'open'
  });

  sprintForm.reset();
  save();
  renderAll();
  showToast('Sprint posted');
});

activeStudent.addEventListener('change', renderMatches);

matchesList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action="apply"]');
  if (!button) return;

  const sprintId = Number(button.dataset.sprint);
  const studentId = Number(activeStudent.value);
  if (!studentId) {
    showToast('Select a student first');
    return;
  }

  const existing = state.applications.some((application) => application.sprintId === sprintId && application.studentId === studentId);
  if (existing) {
    showToast('Already applied to this sprint');
    return;
  }

  state.applications.push({ id: uid(), sprintId, studentId, status: 'active' });
  save();
  renderAll();
  showToast('Application submitted');
});

applicationsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-app]');
  if (!button) return;

  const appId = Number(button.dataset.app);
  const application = state.applications.find((entry) => entry.id === appId);
  if (!application) return;

  if (button.dataset.action === 'complete' && application.status === 'active') {
    application.status = 'completed';
    save();
    renderAll();
    showToast('Marked as completed');
    return;
  }

  if (button.dataset.action === 'verify' && application.status === 'completed') {
    const student = state.students.find((entry) => entry.id === application.studentId);
    const sprint = state.sprints.find((entry) => entry.id === application.sprintId);
    if (!student || !sprint) return;

    application.status = 'verified';
    state.outcomes.push({
      id: uid(),
      studentName: student.name,
      startup: sprint.startup,
      sprintTitle: sprint.title,
      deliverable: sprint.deliverable,
      certificateId: `MICRO-${Math.floor(100000 + Math.random() * 900000)}`
    });

    save();
    renderAll();
    showToast('Outcome verified');
  }
});

seedBtn.addEventListener('click', seedData);

load();
renderAll();
