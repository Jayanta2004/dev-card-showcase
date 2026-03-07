// Sleep Cycle Optimizer Content Script
// ...existing code...
(function() {
  let lastActivity = Date.now();
  function updateActivity() {
    lastActivity = Date.now();
    chrome.storage.local.get(['activityLog'], (data) => {
      const log = data.activityLog || [];
      log.push({ time: lastActivity, url: window.location.href });
      chrome.storage.local.set({ activityLog: log });
    });
  }
  ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
    window.addEventListener(evt, updateActivity);
  });
})();
