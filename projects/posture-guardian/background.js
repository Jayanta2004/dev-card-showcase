chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'bad_posture') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Posture Guardian',
      message: 'Please sit upright or stretch!'
    });
  }
});
