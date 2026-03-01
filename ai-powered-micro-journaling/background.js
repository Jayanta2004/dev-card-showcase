// AI-Powered Micro-Journaling Background Script
// ...existing code...
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ journalEntries: [] });
});
