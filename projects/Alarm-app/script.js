const clock = document.getElementById("clock");
const alarmTimeInput = document.getElementById("alarmTime");
const setAlarmBtn = document.getElementById("setAlarmBtn");
const clearAlarmBtn = document.getElementById("clearAlarmBtn");
const statusText = document.getElementById("status");
const alarmSound = document.getElementById("alarmSound");

let alarmTime = null;
let alarmActive = false;

// Update clock every second
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  clock.textContent = `${hours}:${minutes}:${seconds}`;

  // Check alarm
  if (alarmActive && alarmTime === `${hours}:${minutes}`) {
    triggerAlarm();
  }
}

function setAlarm() {
  const value = alarmTimeInput.value;
  if (!value) {
    statusText.textContent = "Please select a valid time.";
    return;
  }

  alarmTime = value;
  alarmActive = true;
  statusText.textContent = `Alarm set for ${alarmTime}`;
}

function clearAlarm() {
  alarmActive = false;
  alarmTime = null;
  alarmSound.pause();
  alarmSound.currentTime = 0;
  statusText.textContent = "Alarm cleared";
}

function triggerAlarm() {
  alarmSound.play();
  statusText.textContent = "⏰ Alarm ringing!";
  alarmActive = false; // prevent repeat spam
}

setAlarmBtn.addEventListener("click", setAlarm);
clearAlarmBtn.addEventListener("click", clearAlarm);

setInterval(updateClock, 1000);
updateClock();
