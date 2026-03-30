// Hydration logic, AI suggestion, and reminder management
// For brevity, this is a simplified version. Expand for production use.

let intake = 0;
const goal = 2000; // ml per day
let reminderSet = false;

export function logWater(amount) {
  intake += amount;
}

export function getProgress() {
  return { total: intake, goal };
}

export function getSuggestion() {
  // Mock AI: suggest based on intake and random weather/activity
  const weather = ['hot', 'cold', 'humid', 'dry'][Math.floor(Math.random()*4)];
  const activity = ['active', 'sedentary'][Math.floor(Math.random()*2)];
  let suggestion = 'Keep hydrated!';
  if (weather === 'hot' || activity === 'active') {
    suggestion = 'Increase your water intake today.';
  } else if (intake < goal/2) {
    suggestion = 'Try to drink more water.';
  }
  return `Weather: ${weather}, Activity: ${activity}. ${suggestion}`;
}

export function setReminder() {
  reminderSet = true;
  chrome.runtime.sendMessage({ type: 'hydration_reminder' });
}

export function getReminderStatus() {
  return reminderSet ? 'Reminder is set!' : 'No reminder set.';
}
