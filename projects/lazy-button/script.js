const messages = [
  "Still nothing 😴",
  "Why are you clicking again?",
  "Relax. I'm lazy by design.",
  "Congratulations, nothing happened."
];

function doNothing() {
  document.getElementById("text").innerText =
    messages[Math.floor(Math.random() * messages.length)];
}