// Modular UI components for Dream Heist Simulator
function createLobby(players, roles) {
  return `<div class="lobby-card">
    <h2>Lobby (4 Players)</h2>
    <ul class="player-list">${players.map((p,i)=>`<li>${p} <select class="role-select" data-idx="${i}">${roles.map(r=>`<option value="${r}">${r}</option>`).join('')}</select></li>`).join('')}</ul>
    <button class="btn start-mission-btn">Start Mission</button>
  </div>`;
}
function createMissionMap(map, challenges) {
  return `<div class="mission-map">
    <h2>Mission: ${map.name}</h2>
    <div class="map-desc">${map.desc}</div>
    <ul class="challenge-list">${challenges.map((c,i)=>`<li>Challenge ${i+1}: ${c}</li>`).join('')}</ul>
    <button class="btn solve-btn">Solve Challenges</button>
  </div>`;
}
function createOutcome(win, ending) {
  return `<div class="outcome-card ${win ? 'win' : 'lose'}">
    <h2>${win ? 'Heist Success!' : 'Heist Failed'}</h2>
    <div>${ending}</div>
    <button class="btn restart-btn">Restart</button>
  </div>`;
}
window.Components = { createLobby, createMissionMap, createOutcome };
