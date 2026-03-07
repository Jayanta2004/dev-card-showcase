const startWord = "COLD";
const targetWord = "WARM";

const dictionary = [
    "COLD", "CORD", "WORD", "WARD", "WARM",
    "CARD", "CORM", "WORM", "FORM", "FARM"
];

let currentWord = startWord;
let ladder = [startWord];

const ladderDiv = document.getElementById("ladder");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

function renderLadder() {
    ladderDiv.innerHTML = "";
    ladder.forEach(word => {
        const div = document.createElement("div");
        div.classList.add("step");
        div.textContent = word;
        ladderDiv.appendChild(div);
    });
}

function isOneLetterDifferent(word1, word2) {
    let diff = 0;
    for (let i = 0; i < word1.length; i++) {
        if (word1[i] !== word2[i]) diff++;
    }
    return diff === 1;
}

document.getElementById("submitBtn").addEventListener("click", () => {
    let input = document.getElementById("inputWord").value.toUpperCase();

    if (input.length !== startWord.length) {
        message.textContent = "Word must be 4 letters!";
        return;
    }

    if (!dictionary.includes(input)) {
        message.textContent = "Word not in dictionary!";
        return;
    }

    if (!isOneLetterDifferent(currentWord, input)) {
        message.textContent = "Must change only one letter!";
        return;
    }

    ladder.push(input);
    currentWord = input;
    renderLadder();
    document.getElementById("inputWord").value = "";
    message.textContent = "";

    if (input === targetWord) {
        message.textContent = "🎉 You reached WARM!";
        restartBtn.classList.remove("hidden");
    }
});

restartBtn.addEventListener("click", () => {
    ladder = [startWord];
    currentWord = startWord;
    message.textContent = "";
    restartBtn.classList.add("hidden");
    renderLadder();
});

renderLadder();