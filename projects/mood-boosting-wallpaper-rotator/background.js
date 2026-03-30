// Mood-Boosting Wallpaper Rotator Background Script
// ...existing code...
const WALLPAPER_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', mood: 'happy', time: 'morning' },
  { url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca', mood: 'calm', time: 'afternoon' },
  { url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', mood: 'energized', time: 'evening' },
  { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', mood: 'focused', time: 'night' },
  { url: 'https://images.unsplash.com/photo-1465101178521-c1a2b3cfd7d4', mood: 'relaxed', time: 'morning' },
  { url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca', mood: 'sad', time: 'afternoon' },
  { url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', mood: 'stressed', time: 'evening' }
];

let currentMood = 'happy';
let currentWallpaper = WALLPAPER_GALLERY[0].url;
let history = [];

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function selectWallpaper(mood, timeOfDay) {
  const filtered = WALLPAPER_GALLERY.filter(img => img.mood === mood && img.time === timeOfDay);
  if (filtered.length > 0) return filtered[0].url;
  // fallback
  const fallback = WALLPAPER_GALLERY.filter(img => img.mood === mood);
  return fallback.length > 0 ? fallback[0].url : WALLPAPER_GALLERY[0].url;
}

function rotateWallpaper() {
  const timeOfDay = getTimeOfDay();
  currentWallpaper = selectWallpaper(currentMood, timeOfDay);
  history.push({ time: Date.now(), url: currentWallpaper });
  chrome.storage.local.set({ currentWallpaper, history });
  chrome.runtime.sendMessage({ action: 'updateUI' });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'setMood') {
    currentMood = msg.mood;
    rotateWallpaper();
    sendResponse({ success: true });
  }
  if (msg.action === 'rotateWallpaper') {
    rotateWallpaper();
    sendResponse({ success: true });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ gallery: WALLPAPER_GALLERY, currentWallpaper, history });
});
