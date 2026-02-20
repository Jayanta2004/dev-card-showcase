const goalForm = document.getElementById("goalForm");
const goalList = document.getElementById("goalList");

let goals = JSON.parse(localStorage.getItem("goals")) || [];

goalForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("goalTitle").value;
  const type = document.getElementById("goalType").value;
  const progress = document.getElementById("goalProgress").value;

  const goal = {
    id: Date.now(),
    title,
    type,
    progress,
    completed: progress == 100
  };

  goals.push(goal);
  saveGoals();
  renderGoals();
  goalForm.reset();
});

function renderGoals() {
  goalList.innerHTML = "";

  goals.forEach(goal => {
    const goalCard = document.createElement("div");
    goalCard.classList.add("goal-card");
    if (goal.completed) goalCard.classList.add("completed");

    goalCard.innerHTML = `
      <div class="goal-header">
        <h3>${goal.title}</h3>
        <span class="goal-type">${goal.type}</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${goal.progress}%"></div>
      </div>

      <small>Progress: ${goal.progress}%</small>

      <div class="goal-actions">
        <button class="complete-btn" onclick="markComplete(${goal.id})">
          Complete
        </button>
        <button class="delete-btn" onclick="deleteGoal(${goal.id})">
          Delete
        </button>
      </div>
    `;

    goalList.appendChild(goalCard);
  });
}

function markComplete(id) {
  goals = goals.map(goal =>
    goal.id === id ? { ...goal, progress: 100, completed: true } : goal
  );
  saveGoals();
  renderGoals();
}

function deleteGoal(id) {
  goals = goals.filter(goal => goal.id !== id);
  saveGoals();
  renderGoals();
}

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

renderGoals();
