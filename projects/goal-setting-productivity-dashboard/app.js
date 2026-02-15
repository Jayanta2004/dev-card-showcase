// Goal Setting & Productivity Dashboard App
let goals = JSON.parse(localStorage.getItem('goalList') || '[]');
let steps = JSON.parse(localStorage.getItem('goalSteps') || '[]');

function saveAll() {
  localStorage.setItem('goalList', JSON.stringify(goals));
  localStorage.setItem('goalSteps', JSON.stringify(steps));
}

function renderGoals() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Goals</h2>
    <form id="goal-form">
      <label>Goal Name
        <input type="text" id="goal-name" required>
      </label>
      <label>Description
        <textarea id="goal-desc" rows="2"></textarea>
      </label>
      <button class="action" type="submit">Add Goal</button>
    </form>
    <ul class="goal-list">
      ${goals.length ? goals.map((g, idx) => `
        <li>
          <span><strong>${g.name}</strong></span>
          <span>${g.desc}</span>
          <button class="action" onclick="renderSteps(${idx})">View Steps</button>
          <button class="action" onclick="editGoal(${idx})">Edit</button>
        </li>
      `).join('') : '<li>No goals yet.</li>'}
    </ul>
  `;
  document.getElementById('goal-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('goal-name').value;
    const desc = document.getElementById('goal-desc').value;
    goals.push({ name, desc });
    saveAll();
    renderGoals();
  };
}

function editGoal(idx) {
  const g = goals[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Edit Goal</h2>
    <form id="edit-goal-form">
      <label>Goal Name
        <input type="text" id="edit-goal-name" value="${g.name}" required>
      </label>
      <label>Description
        <textarea id="edit-goal-desc" rows="2">${g.desc}</textarea>
      </label>
      <button class="action" type="submit">Save</button>
      <button class="action" type="button" onclick="renderGoals()">Cancel</button>
    </form>
  `;
  document.getElementById('edit-goal-form').onsubmit = function(e) {
    e.preventDefault();
    g.name = document.getElementById('edit-goal-name').value;
    g.desc = document.getElementById('edit-goal-desc').value;
    saveAll();
    renderGoals();
  };
}

function renderSteps(goalIdx) {
  const main = document.getElementById('main-content');
  const g = goals[goalIdx];
  const goalSteps = steps.filter(s => s.goal === g.name);
  main.innerHTML = `
    <h2 class="section-title">Steps for: ${g.name}</h2>
    <form id="step-form">
      <label>Step Name
        <input type="text" id="step-name" required>
      </label>
      <label>Status
        <select id="step-status">
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </label>
      <button class="action" type="submit">Add Step</button>
    </form>
    <ul class="step-list">
      ${goalSteps.length ? goalSteps.map((s, idx) => `
        <li>
          <span><strong>${s.name}</strong> - ${s.status}</span>
          <button class="action" onclick="editStep(${steps.indexOf(s)})">Edit</button>
        </li>
      `).join('') : '<li>No steps yet.</li>'}
    </ul>
    <button class="action" onclick="renderGoals()">Back to Goals</button>
  `;
  document.getElementById('step-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('step-name').value;
    const status = document.getElementById('step-status').value;
    steps.push({ goal: g.name, name, status });
    saveAll();
    renderSteps(goalIdx);
  };
}

function editStep(idx) {
  const s = steps[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Edit Step</h2>
    <form id="edit-step-form">
      <label>Step Name
        <input type="text" id="edit-step-name" value="${s.name}" required>
      </label>
      <label>Status
        <select id="edit-step-status">
          <option value="Not Started" ${s.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
          <option value="In Progress" ${s.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${s.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
      </label>
      <button class="action" type="submit">Save</button>
      <button class="action" type="button" onclick="renderSteps(${goals.findIndex(g => g.name === s.goal)})">Cancel</button>
    </form>
  `;
  document.getElementById('edit-step-form').onsubmit = function(e) {
    e.preventDefault();
    s.name = document.getElementById('edit-step-name').value;
    s.status = document.getElementById('edit-step-status').value;
    saveAll();
    renderSteps(goals.findIndex(g => g.name === s.goal));
  };
}

function renderProgress() {
  const main = document.getElementById('main-content');
  const completed = steps.filter(s => s.status === 'Completed').length;
  const total = steps.length;
  const percent = total ? ((completed / total) * 100).toFixed(1) : 0;
  main.innerHTML = `
    <h2 class="section-title">Progress Overview</h2>
    <div class="card">
      <p>Steps Completed: <strong>${completed}</strong> / ${total}</p>
      <p>Completion: <strong>${percent}%</strong></p>
      <canvas id="progressChart"></canvas>
    </div>
  `;
  setTimeout(drawProgressChart, 0);
}

function drawProgressChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  const statuses = ['Not Started', 'In Progress', 'Completed'];
  const counts = statuses.map(st => steps.filter(s => s.status === st).length);
  if (window.progressChartInstance) window.progressChartInstance.destroy();
  window.progressChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: statuses,
      datasets: [{
        label: 'Step Status',
        data: counts,
        backgroundColor: ['#b3e5fc', '#43cea2', '#185a9d']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Step Status Distribution' }
      }
    }
  });
}

function renderTrends() {
  const main = document.getElementById('main-content');
  const dates = steps.map((s, idx) => `Day ${idx+1}`);
  const completed = steps.map(s => s.status === 'Completed' ? 1 : 0);
  if (!steps.length) {
    main.innerHTML = `<h2 class="section-title">Productivity Trends</h2><p>No steps tracked yet.</p>`;
    return;
  }
  main.innerHTML = `
    <h2 class="section-title">Productivity Trends</h2>
    <div class="card">
      <canvas id="trendsChart"></canvas>
    </div>
  `;
  setTimeout(() => drawTrendsChart(dates, completed), 0);
}

function drawTrendsChart(dates, completed) {
  const ctx = document.getElementById('trendsChart').getContext('2d');
  if (window.trendsChartInstance) window.trendsChartInstance.destroy();
  window.trendsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Steps Completed',
        data: completed,
        borderColor: '#185a9d',
        backgroundColor: '#43cea2',
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Productivity Over Time' }
      }
    }
  });
}

document.getElementById('nav-goals').onclick = renderGoals;
document.getElementById('nav-steps').onclick = function() {
  if (goals.length) renderSteps(0);
  else renderGoals();
};
document.getElementById('nav-progress').onclick = renderProgress;
document.getElementById('nav-trends').onclick = renderTrends;

// Initial load
renderGoals();
