const sentences = {
    easy: [
        "Focus builds discipline",
        "Practice makes perfect",
        "Small steps matter"
    ],
    medium: [
        "Consistency beats motivation every time",
        "Success grows from daily effort",
        "Discipline creates freedom"
    ],
    hard: [
        "Push beyond limits and evolve daily",
        "Growth begins where comfort ends",
        "Precision and persistence win"
    ]
};

let currentText = "";
let reversedText = "";
let timer;
let timeLeft = 60;
let streak = 0;
let mistakes = 0;
let xp = 0;

function startGame() {
    const difficulty = document.getElementById("difficulty").value;
    currentText = sentences[difficulty][Math.floor(Math.random() * sentences[difficulty].length)];
    reversedText = currentText.split("").reverse().join("");

    document.getElementById("originalText").innerText = currentText;
    document.getElementById("typingInput").value = "";
    document.getElementById("typingInput").disabled = false;

    timeLeft = 60;
    streak = 0;
    mistakes = 0;
    xp = 0;

    updateStats();
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time").innerText = timeLeft;
        document.getElementById("progress").style.width = timeLeft + "%";

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Game Over!");
            document.getElementById("typingInput").disabled = true;
        }
    }, 1000);
}

document.getElementById("typingInput").addEventListener("input", function() {
    const value = this.value;

    if (reversedText.startsWith(value)) {
        this.style.background = "#003300";
    } else {
        this.style.background = "#330000";
        mistakes++;
    }

    if (value === reversedText) {
        streak++;
        xp += 10 * streak;
        updateStats();
        startGame();
    }
});

function updateStats() {
    document.getElementById("streak").innerText = streak;
    document.getElementById("mistakes").innerText = mistakes;
    document.getElementById("xp").innerText = xp;
}