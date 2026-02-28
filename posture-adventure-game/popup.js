import { startGame, stopGame, getPoints, getLevel, getAchievements } from './game.js';

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusDiv = document.getElementById('status');
const pointsDiv = document.getElementById('points');
const levelDiv = document.getElementById('level');
const achievementsDiv = document.getElementById('achievements');

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusDiv.textContent = 'Game started!';
  pointsDiv.innerHTML = renderPoints(getPoints());
  levelDiv.innerHTML = renderLevel(getLevel());
  achievementsDiv.innerHTML = renderAchievements(getAchievements());
  await startGame({
    onFeedback: (msg) => {
      statusDiv.textContent = msg;
    },
    onProgress: () => {
      pointsDiv.innerHTML = renderPoints(getPoints());
      levelDiv.innerHTML = renderLevel(getLevel());
      achievementsDiv.innerHTML = renderAchievements(getAchievements());
    }
  });
});

stopBtn.addEventListener('click', () => {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusDiv.textContent = 'Game stopped.';
  stopGame();
});

function renderPoints(points) {
  return `<h3>Points</h3><div>${points}</div>`;
}

function renderLevel(level) {
  return `<h3>Level</h3><div>${level}</div>`;
}

function renderAchievements(achievements) {
  return `<h3>Achievements</h3><ul>${achievements.map(a => `<li>${a}</li>`).join('')}</ul>`;
}
