/* ---------- DATA ---------- */
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

const hrQuestions = [
  "Tell me about yourself",
  "Why should we hire you?",
  "What are your strengths and weaknesses?",
  "Describe a challenging situation",
  "Where do you see yourself in 5 years?"
];

const mockQuestions = [
  "Explain how a HashMap works",
  "Difference between SQL and NoSQL",
  "Explain closures in JavaScript",
  "What is REST API?",
  "Explain event delegation"
];

/* ---------- DSA TRACKER ---------- */
function loadDSA() {
  const list = document.getElementById("dsaList");
  list.innerHTML = "";

  let completed = 0;

  dsaTopics.forEach(topic => {
    const checked = localStorage.getItem(topic) === "true";
    if (checked) completed++;

    const div = document.createElement("div");
    div.className = "topic";
    div.innerHTML = `
      <span>${topic}</span>
      <input type="checkbox" ${checked ? "checked" : ""}
        onchange="toggleTopic('${topic}', this.checked)">
    `;
    list.appendChild(div);
  });

  const percent = (completed / dsaTopics.length) * 100;
  document.getElementById("progressBar").style.width = percent + "%";

  loadBadges();
}

function toggleTopic(topic, value) {
  localStorage.setItem(topic, value);
  loadDSA();
}

/* ---------- HR QUESTIONS ---------- */
function loadHR() {
  const ul = document.getElementById("hrList");
  ul.innerHTML = "";

  hrQuestions.forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    ul.appendChild(li);
  });
}

/* ---------- MOCK INTERVIEW ---------- */
let time = 60;
let timerInterval;

function startMock() {
  clearInterval(timerInterval);
  time = 60;

  document.getElementById("mockQuestion").textContent =
    mockQuestions[Math.floor(Math.random() * mockQuestions.length)];

  document.getElementById("timer").textContent = "Time: 60s";

  timerInterval = setInterval(() => {
    time--;
    document.getElementById("timer").textContent = `Time: ${time}s`;

    if (time === 0) {
      clearInterval(timerInterval);
      document.getElementById("mockQuestion").textContent =
        "⏰ Time up! Answer out loud.";
    }
  }, 1000);
}

/* ---------- NOTES ---------- */
function saveNotes() {
  const notes = document.getElementById("notes").value;
  localStorage.setItem("notes", notes);
  document.getElementById("noteStatus").textContent = "✅ Notes saved";
}

document.getElementById("notes").value =
  localStorage.getItem("notes") || "";

/* ---------- ACHIEVEMENTS ---------- */
function loadBadges() {
  const ul = document.getElementById("badges");
  ul.innerHTML = "";

  const completed = dsaTopics.filter(
    t => localStorage.getItem(t) === "true"
  ).length;

  if (completed >= 3) ul.innerHTML += "<li>🥉 Beginner</li>";
  if (completed >= 6) ul.innerHTML += "<li>🥈 Intermediate</li>";
  if (completed === dsaTopics.length)
    ul.innerHTML += "<li>🥇 DSA Master</li>";
}

/* ---------- INIT ---------- */
loadDSA();
loadHR();
