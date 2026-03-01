const emojiData = [
  { emoji: "😎", answer: "Cool" },
  { emoji: "🎉", answer: "Party" },
  { emoji: "🍕", answer: "Pizza" },
  { emoji: "🐱", answer: "Cat" },
  { emoji: "🚀", answer: "Rocket" },
];

const emojiDisplay = document.getElementById("emojiDisplay");
const optionsContainer = document.getElementById("optionsContainer");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("nextBtn");

let currentIndex = 0;
let score = 0;

// Shuffle function
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Load a question
function loadQuestion() {
    feedback.textContent = "";
    optionsContainer.innerHTML = "";
    const current = emojiData[currentIndex];
    emojiDisplay.textContent = current.emoji;

    // Create options
    const options = shuffle([...emojiData.map(e => e.answer)]);
    options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.addEventListener("click", () => checkAnswer(option));
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selected) {
    const correct = emojiData[currentIndex].answer;
    if (selected === correct) {
        feedback.textContent = "✅ Correct!";
        score += 1;
    } else {
        feedback.textContent = `❌ Wrong! Answer: ${correct}`;
    }
    scoreEl.textContent = score;
}

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % emojiData.length;
    loadQuestion();
});

// Initial load
loadQuestion();