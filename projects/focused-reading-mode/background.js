// Focused Reading Mode Background Script
// ...existing code...
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ readerSettings: { font: 'serif', color: '#f5f7fa', ambient: 'none' } });
});
