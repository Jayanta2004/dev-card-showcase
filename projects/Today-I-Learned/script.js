const facts = [
  "Git was created by Linus Torvalds in 2005.",
  "HTML is not a programming language, it is a markup language.",
  "JavaScript was created in just 10 days.",
  "The first computer bug was an actual moth.",
  "CSS stands for Cascading Style Sheets.",
  "GitHub is owned by Microsoft.",
  "The original name of Java was Oak.",
  "The first website is still online."
];

function showFact() {
  const randomIndex = Math.floor(Math.random() * facts.length);
  document.getElementById("fact").textContent = facts[randomIndex];
}