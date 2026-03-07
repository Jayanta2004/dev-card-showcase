chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'hydration_reminder') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Hydration Hero',
      message: 'Time to drink water!'
    });
  }
});
