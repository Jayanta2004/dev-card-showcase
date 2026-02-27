// Habit Loop Visualizer App
let habits = JSON.parse(localStorage.getItem('habitLoops') || '[]');

function saveHabits() {
  localStorage.setItem('habitLoops', JSON.stringify(habits));
}

function renderHabits() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">My Habits</h2>
    <ul class="habit-list">
      ${habits.length ? habits.map((h, idx) => `
        <li>
          <span><strong>${h.name}</strong></span>
          <span>Trigger: ${h.trigger}</span>
          <span>Action: ${h.action}</span>
          <span>Reward: ${h.reward}</span>
          <button class="action" onclick="visualizeLoop(${idx})">Visualize</button>
          <button class="action" onclick="editHabit(${idx})">Edit</button>
        </li>
      `).join('') : '<li>No habits yet. Add one!</li>'}
    </ul>
  `;
}

function renderAddHabit() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Add a Habit</h2>
    <form id="habit-form">
      <label>Habit Name
        <input type="text" id="habit-name" required>
      </label>
      <label>Trigger
        <input type="text" id="habit-trigger" required>
      </label>
      <label>Action
        <input type="text" id="habit-action" required>
      </label>
      <label>Reward
        <input type="text" id="habit-reward" required>
      </label>
      <button class="action" type="submit">Add Habit</button>
    </form>
  `;
  document.getElementById('habit-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('habit-name').value;
    const trigger = document.getElementById('habit-trigger').value;
    const action = document.getElementById('habit-action').value;
    const reward = document.getElementById('habit-reward').value;
    habits.push({ name, trigger, action, reward });
    saveHabits();
    renderHabits();
  };
}

function editHabit(idx) {
  const h = habits[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Edit Habit</h2>
    <form id="edit-habit-form">
      <label>Habit Name
        <input type="text" id="edit-habit-name" value="${h.name}" required>
      </label>
      <label>Trigger
        <input type="text" id="edit-habit-trigger" value="${h.trigger}" required>
      </label>
      <label>Action
        <input type="text" id="edit-habit-action" value="${h.action}" required>
      </label>
      <label>Reward
        <input type="text" id="edit-habit-reward" value="${h.reward}" required>
      </label>
      <button class="action" type="submit">Save</button>
      <button class="action" type="button" onclick="renderHabits()">Cancel</button>
    </form>
  `;
  document.getElementById('edit-habit-form').onsubmit = function(e) {
    e.preventDefault();
    h.name = document.getElementById('edit-habit-name').value;
    h.trigger = document.getElementById('edit-habit-trigger').value;
    h.action = document.getElementById('edit-habit-action').value;
    h.reward = document.getElementById('edit-habit-reward').value;
    saveHabits();
    renderHabits();
  };
}

function visualizeLoop(idx) {
  const h = habits[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Habit Loop: ${h.name}</h2>
    <div class="loop-diagram">
      <div class="loop-step"><strong>Trigger:</strong> ${h.trigger}</div>
      <div style="font-size:2rem;">&#8595;</div>
      <div class="loop-step"><strong>Action:</strong> ${h.action}</div>
      <div style="font-size:2rem;">&#8595;</div>
      <div class="loop-step"><strong>Reward:</strong> ${h.reward}</div>
    </div>
    <button class="action" onclick="renderHabits()">Back to Habits</button>
  `;
}

document.getElementById('nav-habits').onclick = renderHabits;
document.getElementById('nav-add').onclick = renderAddHabit;
document.getElementById('nav-visualize').onclick = function() {
  if (habits.length) visualizeLoop(0);
  else renderHabits();
};

// Initial load
renderHabits();
