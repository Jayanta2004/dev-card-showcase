// Dream Heist Simulator Frontend Logic
const { createLobby, createMissionMap, createOutcome } = window.Components;

const roles = ['Hacker', 'Planner', 'Infiltrator', 'Driver'];
const maps = [
  { name: 'Neon Vault', desc: 'A futuristic city bank with laser security.' },
  { name: 'Dream Lab', desc: 'A secret research facility with shifting corridors.' }
];
const challenges = [
  ['Disable lasers', 'Crack vault code', 'Evade guards', 'Escape in getaway car'],
  ['Hack security terminal', 'Find hidden lab', 'Coordinate team puzzle', 'Escape before lockdown']
];
let players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
let playerRoles = Array(4).fill(roles[0]);
let currentMapIdx = 0;

document.addEventListener('DOMContentLoaded', () => {
  renderLobby();
});

function renderLobby() {
  document.getElementById('lobby').innerHTML = createLobby(players, roles);
  document.getElementById('lobby').style.display = '';
  document.getElementById('mission-area').style.display = 'none';
  document.getElementById('outcome-area').style.display = 'none';
  document.querySelectorAll('.role-select').forEach(sel => {
    sel.value = playerRoles[+sel.dataset.idx];
    sel.onchange = e => {
      playerRoles[+sel.dataset.idx] = e.target.value;
    };
  });
  document.querySelector('.start-mission-btn').onclick = () => startMission();
}

function startMission() {
  currentMapIdx = Math.floor(Math.random()*maps.length);
  document.getElementById('lobby').style.display = 'none';
  renderMissionArea();
}

function renderMissionArea() {
  document.getElementById('mission-area').style.display = '';
  document.getElementById('mission-area').innerHTML = createMissionMap(maps[currentMapIdx], challenges[currentMapIdx]);
  document.querySelector('.solve-btn').onclick = () => solveChallenges();
}

function solveChallenges() {
  // Simulate win/lose and branching ending
  const win = Math.random() > 0.4;
  const ending = win ? 'Your team coordinated perfectly and escaped with the loot!' : 'Security was too tight. Try a new strategy next time.';
  document.getElementById('mission-area').style.display = 'none';
  renderOutcome(win, ending);
}

function renderOutcome(win, ending) {
  document.getElementById('outcome-area').style.display = '';
  document.getElementById('outcome-area').innerHTML = createOutcome(win, ending);
  document.querySelector('.restart-btn').onclick = () => renderLobby();
}
