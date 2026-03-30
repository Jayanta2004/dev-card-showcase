// Focused Reading Mode Content Script
// ...existing code...
function applyReaderMode() {
  // Remove distractions
  document.body.querySelectorAll('header, nav, aside, footer, .sidebar, .ad, [role="banner"], [role="navigation"], [role="complementary"], [role="contentinfo"], [class*="ad"], [id*="ad"]').forEach(e => e.remove());
  // Style main content
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.background = '#f5f7fa';
  document.body.style.fontFamily = 'serif';
  document.body.style.color = '#222';
  // Center content
  let main = document.querySelector('main') || document.body;
  main.style.maxWidth = '700px';
  main.style.margin = '40px auto';
  main.style.padding = '32px';
  main.style.background = '#fff';
  main.style.borderRadius = '8px';
  // Remove overlays/popups
  document.body.querySelectorAll('[class*="modal"], [class*="popup"], [id*="modal"], [id*="popup"]').forEach(e => e.remove());
}

function applyReaderSettings() {
  chrome.storage.local.get(['readerSettings'], (data) => {
    const settings = data.readerSettings || {};
    document.body.style.fontFamily = settings.font || 'serif';
    document.body.style.background = settings.color || '#f5f7fa';
    if (settings.ambient && settings.ambient !== 'none') {
      playAmbientSound(settings.ambient);
    } else {
      stopAmbientSound();
    }
  });
}

function playAmbientSound(type) {
  stopAmbientSound();
  let src = '';
  switch(type) {
    case 'rain': src = 'sounds/rain.mp3'; break;
    case 'forest': src = 'sounds/forest.mp3'; break;
    case 'waves': src = 'sounds/waves.mp3'; break;
    case 'cafe': src = 'sounds/cafe.mp3'; break;
    default: return;
  }
  let audio = document.createElement('audio');
  audio.src = chrome.runtime.getURL(src);
  audio.loop = true;
  audio.autoplay = true;
  audio.id = 'ambient-audio';
  document.body.appendChild(audio);
}

function stopAmbientSound() {
  let audio = document.getElementById('ambient-audio');
  if (audio) audio.remove();
}

window.applyReaderSettings = applyReaderSettings;

applyReaderMode();
applyReaderSettings();
