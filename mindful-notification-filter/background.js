// Mindful Notification Filter Background Script
// ...existing code...
let focusLevel = 'normal';
let stressLevel = 'low';
let notifications = [
  { title: 'Meeting at 2pm', important: true },
  { title: 'New email from boss', important: true },
  { title: 'Social media update', important: false },
  { title: 'System update available', important: false },
  { title: 'Project deadline tomorrow', important: true },
  { title: 'Friend sent a meme', important: false }
];
let allowedNotifications = [];
let filteredNotifications = [];

function filterNotifications() {
  allowedNotifications = [];
  filteredNotifications = [];
  for (let n of notifications) {
    if (focusLevel === 'deep' && stressLevel === 'high') {
      if (n.important) allowedNotifications.push(n);
      else filteredNotifications.push(n);
    } else if (focusLevel === 'deep') {
      if (n.important || stressLevel === 'low') allowedNotifications.push(n);
      else filteredNotifications.push(n);
    } else if (stressLevel === 'high') {
      if (n.important) allowedNotifications.push(n);
      else filteredNotifications.push(n);
    } else {
      allowedNotifications.push(n);
    }
  }
  chrome.storage.local.set({ allowedNotifications, filteredNotifications });
  chrome.runtime.sendMessage({ action: 'updateUI' });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'updateFilter') {
    chrome.storage.local.get(['focusLevel', 'stressLevel'], (data) => {
      focusLevel = data.focusLevel || 'normal';
      stressLevel = data.stressLevel || 'low';
      filterNotifications();
      sendResponse({ success: true });
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ focusLevel: 'normal', stressLevel: 'low' });
  filterNotifications();
});
