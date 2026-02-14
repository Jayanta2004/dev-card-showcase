function generate() {
  const levels = [
    "Very peaceful 🌿",
    "Mild chaos 😅",
    "Emotionally unstable 💀",
    "Why is everything happening 😭"
  ];
  document.getElementById("level").innerText =
    levels[Math.floor(Math.random() * levels.length)];
}