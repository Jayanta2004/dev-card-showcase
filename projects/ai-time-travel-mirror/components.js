// Modular UI components for AI Time-Travel Mirror
function createFutureAvatar(path, photoURL) {
  // Placeholder avatar based on path
  const avatars = {
    entrepreneur: '👔',
    athlete: '🏅',
    'digital-nomad': '🌍',
    artist: '🎨'
  };
  return `<div class="future-avatar">
    <div class="avatar-img">${photoURL ? `<img src="${photoURL}" alt="Future Self"/>` : avatars[path] || '👤'}</div>
    <div class="avatar-label">Future: ${path.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
  </div>`;
}
function createLifestylePlan(path) {
  const plans = {
    entrepreneur: ['6am: Morning routine', '8am: Team standup', '10am: Deep work', '1pm: Networking', '6pm: Review goals'],
    athlete: ['6am: Cardio', '8am: Nutrition', '10am: Training', '2pm: Recovery', '8pm: Sleep hygiene'],
    'digital-nomad': ['7am: Remote work', '10am: Explore city', '1pm: Online learning', '4pm: Coworking', '8pm: Social time'],
    artist: ['8am: Sketching', '10am: Studio work', '1pm: Art class', '4pm: Gallery visit', '9pm: Creative journaling']
  };
  return `<ul class="lifestyle-plan">${(plans[path]||[]).map(item=>`<li>${item}</li>`).join('')}</ul>`;
}
function createActionPlan(path) {
  // Simulated 30-day plan
  return `<div class="action-plan">
    <h3>30-Day Action Plan</h3>
    <ol>${Array.from({length:30},(_,i)=>`<li>Day ${i+1}: ${path} milestone</li>`).join('')}</ol>
  </div>`;
}
function createDashboard(path) {
  return `<div class="dashboard">
    <h3>Life Simulation Dashboard</h3>
    <div class="dashboard-stats">
      <div>Motivation: <span class="stat-bar" style="width:90%"></span></div>
      <div>Energy: <span class="stat-bar" style="width:80%"></span></div>
      <div>Progress: <span class="stat-bar" style="width:60%"></span></div>
    </div>
  </div>`;
}
window.Components = { createFutureAvatar, createLifestylePlan, createActionPlan, createDashboard };
