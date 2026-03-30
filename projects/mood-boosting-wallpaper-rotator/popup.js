// Mood-Boosting Wallpaper Rotator Popup Script
// ...existing code...
const moodSelect = document.getElementById('mood');
const setMoodBtn = document.getElementById('set-mood');
const rotateBtn = document.getElementById('rotate');
const currentWallpaperDiv = document.getElementById('current-wallpaper');
const galleryDiv = document.getElementById('gallery');
const wallpaperHistoryDiv = document.getElementById('wallpaper-history');

function displayCurrentWallpaper(url) {
  currentWallpaperDiv.innerHTML = `<img src="${url}" alt="Current Wallpaper" class="wallpaper-img">`;
}

function displayGallery(images) {
  galleryDiv.innerHTML = images.map(img => `<img src="${img.url}" alt="${img.mood}" class="gallery-img">`).join('');
}

function displayHistory(history) {
  wallpaperHistoryDiv.innerHTML = '<h3>Wallpaper History</h3>' + history.map(h => `<li>${new Date(h.time).toLocaleString()}: <img src="${h.url}" class="history-img"></li>`).join('');
}

function fetchWallpaperData() {
  chrome.storage.local.get(['currentWallpaper', 'gallery', 'history'], (data) => {
    displayCurrentWallpaper(data.currentWallpaper || '');
    displayGallery(data.gallery || []);
    displayHistory(data.history || []);
  });
}

setMoodBtn.addEventListener('click', () => {
  const mood = moodSelect.value;
  chrome.runtime.sendMessage({ action: 'setMood', mood });
});

rotateBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'rotateWallpaper' });
});

document.addEventListener('DOMContentLoaded', fetchWallpaperData);
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'updateUI') fetchWallpaperData();
});
