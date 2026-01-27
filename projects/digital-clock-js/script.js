function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  document.getElementById("time").textContent = time;
}

setInterval(updateClock, 1000);
updateClock();