import { logWater, getProgress, getSuggestion, setReminder, getReminderStatus } from './hydration.js';

const logBtn = document.getElementById('log-btn');
const waterInput = document.getElementById('water-amount');
const progressDiv = document.getElementById('progress');
const suggestionDiv = document.getElementById('suggestion');
const reminderBtn = document.getElementById('reminder-btn');
const reminderStatusDiv = document.getElementById('reminder-status');

function render() {
  progressDiv.innerHTML = renderProgress(getProgress());
  suggestionDiv.innerHTML = renderSuggestion(getSuggestion());
  reminderStatusDiv.innerHTML = renderReminderStatus(getReminderStatus());
}

logBtn.addEventListener('click', () => {
  const amount = parseInt(waterInput.value, 10);
  if (!amount || amount < 50) return;
  logWater(amount);
  waterInput.value = '';
  render();
});

reminderBtn.addEventListener('click', () => {
  setReminder();
  render();
});

function renderProgress(progress) {
  return `<h3>Today's Intake</h3><div>${progress.total} ml / ${progress.goal} ml</div>`;
}

function renderSuggestion(suggestion) {
  return `<h3>AI Suggestion</h3><div>${suggestion}</div>`;
}

function renderReminderStatus(status) {
  return `<h3>Reminder</h3><div>${status}</div>`;
}

render();
