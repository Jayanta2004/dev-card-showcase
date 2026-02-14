function pop() {
  const messages = [
    "Breathe out 🌬️",
    "You're doing fine 💙",
    "Let it go ✨",
    "One click at a time 🫶"
  ];
  document.getElementById("calm").innerText =
    messages[Math.floor(Math.random() * messages.length)];
}