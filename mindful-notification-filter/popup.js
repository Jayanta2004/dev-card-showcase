// Mindful Notification Filter Popup Script
// ...existing code...
const focusSelect = document.getElementById('focus');
const stressSelect = document.getElementById('stress');
const applyBtn = document.getElementById('apply');
const allowedList = document.getElementById('allowed-list');
const filteredList = document.getElementById('filtered-list');
const statusDiv = document.getElementById('status');

function renderLists(allowed, filtered) {
  allowedList.innerHTML = allowed.map(n => `<li>${n.title}</li>`).join('');
  filteredList.innerHTML = filtered.map(n => `<li>${n.title}</li>`).join('');
}

function fetchNotificationData() {
  chrome.storage.local.get(['allowedNotifications', 'filteredNotifications', 'focusLevel', 'stressLevel'], (data) => {
    renderLists(data.allowedNotifications || [], data.filteredNotifications || []);
    statusDiv.textContent = `Focus: ${data.focusLevel || 'normal'}, Stress: ${data.stressLevel || 'low'}`;
    focusSelect.value = data.focusLevel || 'normal';
    stressSelect.value = data.stressLevel || 'low';
  });
}

applyBtn.addEventListener('click', () => {
  const focus = focusSelect.value;
  const stress = stressSelect.value;
  chrome.storage.local.set({ focusLevel: focus, stressLevel: stress }, () => {
    chrome.runtime.sendMessage({ action: 'updateFilter' });
  });
});

document.addEventListener('DOMContentLoaded', fetchNotificationData);
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'updateUI') fetchNotificationData();
});
