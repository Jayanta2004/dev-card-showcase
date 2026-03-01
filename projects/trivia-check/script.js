const questions = [
    {question: "What is the capital of France?", options: ["Paris", "London", "Rome", "Berlin"], answer: "Paris"},
    {question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars"},
    {question: "Who wrote 'Romeo and Juliet'?", options: ["Shakespeare", "Dickens", "Hemingway", "Twain"], answer: "Shakespeare"},
    {question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific"},
    {question: "Which element has the chemical symbol 'O'?", options: ["Gold", "Oxygen", "Silver", "Iron"], answer: "Oxygen"},
    {question: "Who painted the Mona Lisa?", options: ["Leonardo da Vinci", "Van Gogh", "Picasso", "Michelangelo"], answer: "Leonardo da Vinci"},
    {question: "Which country hosted the 2016 Summer Olympics?", options: ["Brazil", "China", "UK", "USA"], answer: "Brazil"},
    {question: "What is the hardest natural substance on Earth?", options: ["Diamond", "Gold", "Iron", "Quartz"], answer: "Diamond"},
    {question: "In which year did World War II end?", options: ["1945", "1939", "1918", "1965"], answer: "1945"},
    {question: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Carbon Dioxide"},
    {question: "What is the tallest mountain in the world?", options: ["K2", "Everest", "Kangchenjunga", "Lhotse"], answer: "Everest"},
    {question: "Who discovered penicillin?", options: ["Marie Curie", "Alexander Fleming", "Isaac Newton", "Albert Einstein"], answer: "Alexander Fleming"},
    {question: "Which planet is closest to the Sun?", options: ["Mercury", "Venus", "Earth", "Mars"], answer: "Mercury"},
    {question: "Which country is known as the Land of the Rising Sun?", options: ["China", "Japan", "Thailand", "South Korea"], answer: "Japan"},
    {question: "What is the largest mammal in the world?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"], answer: "Blue Whale"}
];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const scoreEl = document.getElementById("score");
const progressFill = document.getElementById("progress-fill");

function loadQuestion() {
    optionsEl.innerHTML = "";
    const q = questions[currentQuestion];
    questionEl.textContent = q.question;

    q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("option-btn");
        btn.addEventListener("click", () => checkAnswer(btn, q.answer));
        optionsEl.appendChild(btn);
    });

    progressFill.style.width = `${(currentQuestion / questions.length) * 100}%`;
}

function checkAnswer(selectedBtn, correctAnswer) {
    const allOptions = document.querySelectorAll(".option-btn");
    allOptions.forEach(btn => btn.disabled = true);

    if (selectedBtn.textContent === correctAnswer) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("wrong");
        allOptions.forEach(btn => {
            if (btn.textContent === correctAnswer) btn.classList.add("correct");
        });
    }

    scoreEl.textContent = `Score: ${score}`;
}

nextBtn.addEventListener("click", () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        questionEl.textContent = "🎉 Quiz Completed!";
        optionsEl.innerHTML = "";
        nextBtn.disabled = true;
        progressFill.style.width = "100%";
    }
});

// Load first question
loadQuestion();