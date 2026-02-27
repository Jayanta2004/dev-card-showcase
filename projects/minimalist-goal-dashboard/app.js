const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalList = document.getElementById('goal-list');
const milestone = document.getElementById('milestone');

let goals = [];

function renderGoals() {
  goalList.innerHTML = '';
  let completedCount = 0;
  goals.forEach((goal, idx) => {
    const li = document.createElement('li');
    li.className = 'goal-item' + (goal.completed ? ' completed' : '');
    li.innerHTML = `
      <span>${goal.text}</span>
      <input type="checkbox" ${goal.completed ? 'checked' : ''} data-idx="${idx}">
    `;
    goalList.appendChild(li);
    if (goal.completed) completedCount++;
  });
  renderProgress(completedCount, goals.length);
  if (goals.length > 0 && completedCount === goals.length) {
    milestone.classList.remove('hidden');
  } else {
    milestone.classList.add('hidden');
  }
}

function renderProgress(completed, total) {
  let progressBar = document.querySelector('.progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progress = document.createElement('div');
    progress.className = 'progress';
    progressBar.appendChild(progress);
    goalList.parentNode.insertBefore(progressBar, goalList.nextSibling);
  }
  const progress = progressBar.querySelector('.progress');
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progress.style.width = percent + '%';
}

goalForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = goalInput.value.trim();
  if (text) {
    goals.push({ text, completed: false });
    goalInput.value = '';
    renderGoals();
  }
});

goalList.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const idx = e.target.getAttribute('data-idx');
    goals[idx].completed = e.target.checked;
    renderGoals();
  }
});

renderGoals();
