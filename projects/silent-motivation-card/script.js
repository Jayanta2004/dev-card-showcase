const messages = [
  "You are doing better than you think.",
  "Rest is productive.",
  "Small steps still move you forward.",
  "You don’t need to rush."
];

let used = false;

function showMessage() {
  if (used) return;
  used = true;
  const msg = messages[Math.floor(Math.random() * messages.length)];
  document.getElementById("message").innerText = msg;
}