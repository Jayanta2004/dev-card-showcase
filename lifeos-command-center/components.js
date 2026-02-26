// ...existing code...
// UI Components for LifeOS Command Center
function renderDashboardSection(title, content) {
  return `<div class='dashboard-section'><div class='section-title'>${title}</div>${content}</div>`;
}
function renderGoalTracker(goals) {
  return `<div class='dashboard-section'><div class='section-title'>Weekly Goal Tracker</div><ul>${goals.map(g=>`<li>${g}</li>`).join('')}</ul></div>`;
}
function renderNextAction(action) {
  return `<div class='dashboard-section'><div class='section-title'>AI Next Best Action</div><p>${action}</p></div>`;
}
