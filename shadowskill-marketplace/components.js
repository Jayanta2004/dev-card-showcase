// ...existing code...
// UI Components for ShadowSkill Marketplace
function renderSessionList(sessions) {
  return `<div class='session-list'>${sessions.map(renderSessionCard).join('')}</div>`;
}
function renderSessionCard(session) {
  return `<div class='session-card'>
    <div class='session-title'>${session.title}</div>
    <div class='session-expert'>Expert: ${session.expert}</div>
    <div class='session-notes'>${session.notes}</div>
    <div>Bookmarks: ${session.bookmarks.map(b=>`<span class='bookmark'>${b}</span>`).join('')}</div>
    <button class='join-btn'>Join Live</button>
  </div>`;
}
