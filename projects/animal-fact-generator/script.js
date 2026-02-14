const facts = [
  "Otters hold hands so they don’t drift apart 🦦",
  "Cows have best friends and get stressed when separated 🐄",
  "Elephants recognize themselves in mirrors 🐘",
  "Dolphins call each other by name 🐬"
];

function generate() {
  document.getElementById("fact").innerText =
    facts[Math.floor(Math.random() * facts.length)];
}