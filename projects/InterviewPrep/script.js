// DSA Topics
const dsaTopics = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Recursion",
  "Trees",
  "Graphs",
  "Dynamic Programming"
];

// HR Questions
const hrQuestions = [
  "Tell me about yourself.",
  "Why should we hire you?",
  "What are your strengths and weaknesses?",
  "Describe a challenging situation.",
  "Where do you see yourself in 5 years?"
];

// Mock Questions
const mockQuestions = [
  "Explain how a hash map works.",
  "What is event delegation in JavaScript?",
  "Explain REST API.",
  "Difference between SQL and NoSQL?",
  "Explain closures in JavaScript."
];

function loadDSA() {
  const container = document.getElementById("dsaList");
  container.innerHTML = "";

  dsaTopics.forEach(topic => {
    const isChecked = localStorage.getItem(topic) === "true";

    const div = document.createElement("div");
    div.className = "topic";

    div.innerHTML = `
      <span>${topic}</span>
      <input type="checkbox" ${isChecked ? "checked" : ""} 
        onchange="toggleProgress('${topic}', this.checked)">
    `;

    container.appendChild(div);
  });
}

function loadHR() {
  const container = document.getElementById("hrList");
  container.innerHTML = "";

  hrQuestions.forEach(question => {
    const div = document.createElement("div");
    div.className = "topic";
    div.innerHTML = `<span>${question}</span>`;
    container.appendChild(div);
  });
}

function toggleProgress(topic, value) {
  localStorage.setItem(topic, value);
}

function generateMock() {
  const randomIndex = Math.floor(Math.random() * mockQuestions.length);
  document.getElementById("mockQuestion").textContent =
    mockQuestions[randomIndex];
}

// Initialize
loadDSA();
loadHR();
