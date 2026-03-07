// Sleep Cycle Optimizer Background Script
// ...existing code...
const SLEEP_CYCLE_MINUTES = 90;
const DEFAULT_SLEEP_HOURS = 8;
const SLEEP_TIPS = [
  "Maintain a consistent sleep schedule.",
  "Avoid caffeine late in the day.",
  "Limit screen time before bed.",
  "Create a relaxing bedtime routine.",
  "Keep your bedroom cool and dark.",
  "Exercise regularly, but not too close to bedtime.",
  "Avoid heavy meals before sleep.",
  "Limit naps to 20-30 minutes.",
  "Get sunlight exposure during the day.",
  "Manage stress with mindfulness or journaling."
];

function getOptimalSleepTimes(activityLog) {
  // ...existing code...
  const now = new Date();
  let sleepTime = new Date(now.getTime() + 60 * 60 * 1000); // Suggest sleep in 1 hour
  let wakeTime = new Date(sleepTime.getTime() + DEFAULT_SLEEP_HOURS * 60 * 60 * 1000);
  let cycles = Math.floor(DEFAULT_SLEEP_HOURS * 60 / SLEEP_CYCLE_MINUTES);
  return {
    suggestion: `Optimal sleep time: ${sleepTime.toLocaleTimeString()}\nOptimal wake time: ${wakeTime.toLocaleTimeString()}\nRecommended cycles: ${cycles}`,
    reminders: [
      "Prepare for bed in 1 hour.",
      "Set your alarm for optimal wake time.",
      "Review sleep hygiene tips."
    ],
    tips: SLEEP_TIPS
  };
}

function updateSleepData() {
  // ...existing code...
  chrome.storage.local.get(['activityLog'], (data) => {
    const sleepData = getOptimalSleepTimes(data.activityLog || []);
    chrome.storage.local.set({
      sleepSuggestion: sleepData.suggestion,
      reminders: sleepData.reminders,
      tips: sleepData.tips
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  updateSleepData();
});

chrome.runtime.onStartup.addListener(() => {
  updateSleepData();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sleepReminder') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Sleep Cycle Optimizer',
      message: 'Time to prepare for bed!'
    });
  }
});

chrome.alarms.create('sleepReminder', { delayInMinutes: 60, periodInMinutes: 1440 });

chrome.tabs.onActivated.addListener(() => {
  updateSleepData();
});
