const quotes = [
  "Believe in yourself.",
  "Consistency beats motivation.",
  "Small steps every day.",
  "Learning never stops.",
  "Code. Learn. Improve."
];

function generateQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById("quote").textContent = quotes[randomIndex];
}