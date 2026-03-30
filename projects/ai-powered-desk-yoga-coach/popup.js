import { startYogaSession, stopYogaSession, getRoutine, getProgress } from './yoga.js';

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusDiv = document.getElementById('status');
const routineDiv = document.getElementById('routine');
const progressDiv = document.getElementById('progress');

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusDiv.textContent = 'Session started!';
  routineDiv.innerHTML = renderRoutine(getRoutine());
  progressDiv.innerHTML = renderProgress(getProgress());
  await startYogaSession({
    onFeedback: (msg) => {
      statusDiv.textContent = msg;
    },
    onProgress: () => {
      progressDiv.innerHTML = renderProgress(getProgress());
    }
  });
});

stopBtn.addEventListener('click', () => {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusDiv.textContent = 'Session stopped.';
  stopYogaSession();
});

function renderRoutine(routine) {
  return `<h3>Today's Routine</h3><ul>${routine.map(move => `<li>${move.name}</li>`).join('')}</ul>`;
}

function renderProgress(progress) {
  return `<h3>Flexibility Progress</h3><ul>${progress.map(p => `<li>${p.move}: ${p.score}</li>`).join('')}</ul>`;
}
