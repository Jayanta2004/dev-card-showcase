import { startPostureDetection, stopPostureDetection } from './posture.js';

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusDiv = document.getElementById('status');
const reminderDiv = document.getElementById('reminder');

let monitoring = false;

startBtn.addEventListener('click', async () => {
  monitoring = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusDiv.textContent = 'Monitoring posture...';
  reminderDiv.textContent = '';
  await startPostureDetection({
    onBadPosture: () => {
      reminderDiv.textContent = 'Please sit upright or stretch!';
      chrome.runtime.sendMessage({ type: 'bad_posture' });
    },
    onGoodPosture: () => {
      reminderDiv.textContent = '';
    },
    onStatus: (msg) => {
      statusDiv.textContent = msg;
    }
  });
});

stopBtn.addEventListener('click', () => {
  monitoring = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusDiv.textContent = 'Monitoring stopped.';
  reminderDiv.textContent = '';
  stopPostureDetection();
});
