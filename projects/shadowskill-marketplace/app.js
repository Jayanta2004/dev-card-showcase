// ...existing code...
// Simulated logic for ShadowSkill Marketplace
const sessions = [
  {
    title: 'Live Coding: Build a Portfolio',
    expert: 'Jane Dev',
    notes: 'Watch Jane build a React portfolio live. Ask questions and bookmark key moments.',
    bookmarks: ['00:12 Setup', '00:45 CSS Tricks', '01:10 Deploy']
  },
  {
    title: 'Design Workflow: Figma to Web',
    expert: 'Alex Designer',
    notes: 'Shadow Alex as he designs and implements a landing page. Voice Q&A and live screen.',
    bookmarks: ['00:05 Wireframe', '00:30 Color Palette', '00:55 Export']
  },
  {
    title: 'Marketing Campaign Launch',
    expert: 'Sam Marketer',
    notes: 'See Sam launch a campaign, edit copy, and analyze results. Timestamp bookmarks for key actions.',
    bookmarks: ['00:10 Copywriting', '00:40 Analytics', '01:00 Feedback']
  }
];
function renderApp() {
  document.getElementById('app').innerHTML = `
    <h1>ShadowSkill Marketplace</h1>
    <p>Learn by shadowing experts live while they work. Join sessions, take notes, and bookmark key moments.</p>
    ${renderSessionList(sessions)}
  `;
  document.querySelectorAll('.join-btn').forEach(btn => {
    btn.onclick = () => {
      alert('Joining live session! (Simulated)');
    };
  });
}
document.addEventListener('DOMContentLoaded', renderApp);
