// Background script for Mindful Microbreak Scheduler
// Handles break scheduling and notifications

let lastBreak = Date.now();
let breakInterval = 20 * 60 * 1000; // 20 minutes default

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({lastBreak, breakInterval});
});

function scheduleBreak() {
  chrome.alarms.create('microbreak', {delayInMinutes: breakInterval / 60000});
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'microbreak') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Time for a Microbreak!',
      message: 'Take a science-backed break: stretch, breathe, or play a quick game!'
    });
    lastBreak = Date.now();
    chrome.storage.local.set({lastBreak});
    scheduleBreak();
  }
});

scheduleBreak();
