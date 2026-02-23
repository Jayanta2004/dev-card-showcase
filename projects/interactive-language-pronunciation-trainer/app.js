// Interactive language pronunciation trainer logic
let history = [];
let userProfile = {
  name: "Guest",
  practices: 0
};

// Navigation
const practiceBtn = document.getElementById("practiceBtn");
const historyBtn = document.getElementById("historyBtn");
const profileBtn = document.getElementById("profileBtn");
const practiceSection = document.getElementById("practiceSection");
const historySection = document.getElementById("historySection");
const profileSection = document.getElementById("profileSection");
const wordForm = document.getElementById("wordForm");
const wordInput = document.getElementById("wordInput");
const audioControls = document.getElementById("audioControls");
const startSpeech = document.getElementById("startSpeech");
const feedback = document.getElementById("feedback");
const historyList = document.getElementById("historyList");
const profileInfo = document.getElementById("profileInfo");

function showSection(section) {
  practiceSection.style.display = section === "practice" ? "block" : "none";
  historySection.style.display = section === "history" ? "block" : "none";
  profileSection.style.display = section === "profile" ? "block" : "none";
}

practiceBtn.addEventListener("click", () => showSection("practice"));
historyBtn.addEventListener("click", () => {
  showSection("history");
  renderHistory();
});
profileBtn.addEventListener("click", () => {
  showSection("profile");
  renderProfile();
});

// Practice pronunciation
wordForm.addEventListener("submit", e => {
  e.preventDefault();
  const word = wordInput.value.trim();
  if (!word) return;
  playAudio(word);
  feedback.innerHTML = "";
  history.push({ word, date: new Date().toLocaleString(), result: "" });
  userProfile.practices++;
  wordForm.reset();
});

function playAudio(text) {
  audioControls.innerHTML = "";
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
  audioControls.innerHTML = `<div>Audio played for: <strong>${text}</strong></div>`;
}

// Speech recognition
startSpeech.addEventListener("click", () => {
  if (!('webkitSpeechRecognition' in window)) {
    feedback.innerHTML = "Speech recognition not supported in this browser.";
    return;
  }
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();
  feedback.innerHTML = "Listening...";
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    const lastPractice = history[history.length - 1];
    if (lastPractice) {
      lastPractice.result = transcript;
      feedback.innerHTML = `You said: <strong>${transcript}</strong><br>Target: <strong>${lastPractice.word}</strong><br>${comparePronunciation(transcript, lastPractice.word)}`;
      renderHistory();
    }
  };
  recognition.onerror = function() {
    feedback.innerHTML = "Speech recognition error.";
  };
});

function comparePronunciation(spoken, target) {
  // Simple comparison
  return spoken.toLowerCase() === target.toLowerCase() ? "✅ Good pronunciation!" : "❌ Try again.";
}

function renderHistory() {
  historyList.innerHTML = "";
  history.slice().reverse().forEach(h => {
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div><strong>Word:</strong> ${h.word}</div>
      <div><strong>Date:</strong> ${h.date}</div>
      <div><strong>Your Pronunciation:</strong> ${h.result}</div>
    `;
    historyList.appendChild(card);
  });
}

function renderProfile() {
  profileInfo.innerHTML = `
    <strong>Name:</strong> ${userProfile.name}<br>
    <strong>Practices:</strong> ${userProfile.practices}
  `;
}

// Initial render
showSection("practice");
