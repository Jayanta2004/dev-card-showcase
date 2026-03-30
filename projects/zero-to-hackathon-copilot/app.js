// ...existing code...
// Simulated logic for Zero-to-Hackathon Copilot
let idea = '';
const roadmap = [
  'Define team roles: Frontend, Backend, Designer, Pitch Lead',
  'Break down features and milestones',
  'Set up repo and tools',
  'Plan demo and pitch',
  'Assign tasks and deadlines'
];
const tasks = [
  'Build landing page',
  'Implement core feature',
  'Design logo and assets',
  'Prepare pitch script',
  'Test demo flow'
];
const pitchScript = 'Our project solves X by doing Y. We built it in 24 hours, demoing key features and teamwork. Here’s our story.';
const demoChecklist = [
  'Show main feature',
  'Demo user flow',
  'Highlight teamwork',
  'Pitch in under 3 minutes'
];
function renderApp() {
  document.getElementById('app').innerHTML = `
    <h1>Zero-to-Hackathon Copilot</h1>
    <p>AI teammate that takes your rough idea and creates team roles, build plan, pitch script, and demo checklist for hackathons.</p>
    ${renderIdeaInput(idea)}
    ${renderRoadmap(roadmap)}
    ${renderTaskBoard(tasks)}
    ${renderPitchScript(pitchScript)}
    ${renderDemoChecklist(demoChecklist)}
  `;
  document.querySelector('.idea-input').oninput = e => {
    idea = e.target.value;
  };
}
document.addEventListener('DOMContentLoaded', renderApp);
