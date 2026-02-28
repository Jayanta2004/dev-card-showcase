const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusDiv = document.getElementById('status');
const durationInput = document.getElementById('duration');
const opacityInput = document.getElementById('opacity');
const animationSelect = document.getElementById('animation');

let focusActive = false;

function updateStatus(msg) {
  statusDiv.textContent = msg;
}

startBtn.addEventListener('click', async () => {
  focusActive = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  updateStatus('Focus session started!');
  const settings = {
    duration: parseInt(durationInput.value, 10),
    opacity: parseFloat(opacityInput.value),
    animation: animationSelect.value
  };
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'START_FOCUS', settings });
  });
});

stopBtn.addEventListener('click', () => {
  focusActive = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  updateStatus('Focus session stopped.');
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_FOCUS' });
  });
});
