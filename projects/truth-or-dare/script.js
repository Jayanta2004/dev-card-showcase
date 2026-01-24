const truths = [
  "What is your biggest fear?",
  "Have you ever lied to your best friend?",
  "What is a secret you never told anyone?",
  "Who was your first crush?",
  "What is something embarrassing that happened to you?",
  "What habit do you want to change?",
  "What is the last thing you searched on Google?"
];

const dares = [
  "Do 10 push-ups right now 💪",
  "Send a funny emoji to a friend 😂",
  "Speak in an accent for 30 seconds",
  "Sing your favorite song loudly 🎤",
  "Do a silly dance for 15 seconds 💃",
  "Say the alphabet backwards 🤯",
  "Post a funny status (or imagine you did 😄)"
];

const resultCard = document.getElementById("resultCard");

function generateTruth() {
  const random = truths[Math.floor(Math.random() * truths.length)];
  resultCard.textContent = "🤫 Truth: " + random;
  animateCard();
}

function generateDare() {
  const random = dares[Math.floor(Math.random() * dares.length)];
  resultCard.textContent = "🔥 Dare: " + random;
  animateCard();
}

function animateCard() {
  resultCard.style.animation = "none";
  resultCard.offsetHeight; // trigger reflow
  resultCard.style.animation = "slideUp 0.5s ease";
}
