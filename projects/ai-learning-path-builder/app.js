// AI Learning Path Builder Frontend Logic
const { createPlanCard } = window.Components;

let plan = [];
let completed = JSON.parse(localStorage.getItem('planCompleted') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goalForm');
  const output = document.getElementById('plan-output');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const goal = document.getElementById('goal').value.trim();
    if (!goal) return;
    plan = generateFakePlan(goal);
    completed = Array(plan.length).fill(false);
    saveAndRender();
  });

  output.addEventListener('click', function (e) {
    if (!e.target.classList.contains('mark-done-btn')) return;
    const card = e.target.closest('.plan-card');
    const idx = Array.from(document.querySelectorAll('.plan-card')).indexOf(card);
    completed[idx] = true;
    saveAndRender();
  });

  renderPlan();
});

function generateFakePlan(goal) {
  // Simulate a 7-day plan for demo
  return [
    { steps: [`Research basics of ${goal}`, 'Watch 1 intro video'], encouragement: 'Start strong!' },
    { steps: ['Take notes on key concepts', 'Try a simple exercise'], encouragement: 'Keep the momentum!' },
    { steps: ['Read a tutorial', 'Summarize what you learned'], encouragement: 'You’re making progress!' },
    { steps: ['Build a mini project', 'Share your work'], encouragement: 'Apply your knowledge!' },
    { steps: ['Review mistakes', 'Ask questions on forums'], encouragement: 'Learning is growing.' },
    { steps: ['Try a challenge', 'Reflect on your journey'], encouragement: 'Almost there!' },
    { steps: ['Recap all days', 'Plan next steps'], encouragement: 'You did it! Celebrate!' }
  ];
}

function saveAndRender() {
  localStorage.setItem('planCompleted', JSON.stringify(completed));
  renderPlan();
}

function renderPlan() {
  const output = document.getElementById('plan-output');
  if (!plan.length) {
    output.innerHTML = '<div style="text-align:center;color:#888;">No plan yet. Enter a goal above!</div>';
    return;
  }
  output.innerHTML = plan.map((day, i) =>
    `<div class="plan-card-wrapper${completed[i] ? ' done' : ''}">` +
    createPlanCard(i + 1, day.steps, day.encouragement) +
    (completed[i] ? '<div class="done-badge">Done</div>' : '') +
    '</div>'
  ).join('');
}
