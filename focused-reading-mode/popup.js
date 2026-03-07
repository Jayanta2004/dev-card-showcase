// Focused Reading Mode Popup Script
// ...existing code...
const activateBtn = document.getElementById('activate');
const applyBtn = document.getElementById('apply');
const fontSelect = document.getElementById('font');
const colorInput = document.getElementById('color');
const ambientSelect = document.getElementById('ambient');

activateBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    });
  });
});

applyBtn.addEventListener('click', () => {
  const settings = {
    font: fontSelect.value,
    color: colorInput.value,
    ambient: ambientSelect.value
  };
  chrome.storage.local.set({ readerSettings: settings }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => window.applyReaderSettings && window.applyReaderSettings(),
      });
    });
  });
});
