// Sleep Cycle Optimizer Popup Script
// ...existing code...
const suggestionDiv = document.getElementById('suggestion');
const remindersDiv = document.getElementById('reminders');
const tipsDiv = document.getElementById('tips');
const tipsList = document.getElementById('tips-list');
const refreshBtn = document.getElementById('refresh');

function displaySuggestion(suggestion) {
  suggestionDiv.textContent = suggestion;
}

function displayReminders(reminders) {
  remindersDiv.innerHTML = reminders.map(r => `<li>${r}</li>`).join('');
}

function displayTips(tips) {
  tipsList.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
}

function fetchSleepData() {
  chrome.storage.local.get(['sleepSuggestion', 'reminders', 'tips'], (data) => {
    displaySuggestion(data.sleepSuggestion || 'No suggestion yet.');
    displayReminders(data.reminders || []);
    displayTips(data.tips || []);
  });
}

refreshBtn.addEventListener('click', fetchSleepData);

document.addEventListener('DOMContentLoaded', fetchSleepData);
