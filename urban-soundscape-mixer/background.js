// Urban Soundscape Mixer Background Script
// ...existing code...
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ soundPresets: [] });
});
