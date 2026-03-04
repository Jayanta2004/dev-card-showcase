const categories = [
    {
        name: "Fruits",
        words: ["Apple", "Banana", "Orange", "Mango"]
    },
    {
        name: "Colors",
        words: ["Red", "Blue", "Green", "Yellow"]
    },
    {
        name: "Animals",
        words: ["Dog", "Cat", "Lion", "Tiger"]
    },
    {
        name: "Programming Languages",
        words: ["Java", "Python", "C++", "JavaScript"]
    }
];

let allWords = [];
let selectedWords = [];
let solvedGroups = 0;
let mistakes = 4;

const grid = document.getElementById("grid");
const message = document.getElementById("message");
const mistakesDisplay = document.getElementById("mistakes");
const restartBtn = document.getElementById("restartBtn");

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startGame() {
    grid.innerHTML = "";
    selectedWords = [];
    solvedGroups = 0;
    mistakes = 4;
    message.textContent = "";
    restartBtn.classList.add("hidden");
    mistakesDisplay.textContent = "Mistakes Left: " + mistakes;

    allWords = shuffle(categories.flatMap(cat => cat.words));

    allWords.forEach(word => {
        const div = document.createElement("div");
        div.classList.add("word");
        div.textContent = word;

        div.addEventListener("click", () => selectWord(div, word));

        grid.appendChild(div);
    });
}

function selectWord(element, word) {
    if (element.classList.contains("locked")) return;

    if (selectedWords.includes(word)) {
        selectedWords = selectedWords.filter(w => w !== word);
        element.classList.remove("selected");
    } else {
        if (selectedWords.length < 4) {
            selectedWords.push(word);
            element.classList.add("selected");
        }
    }
}

document.getElementById("submitBtn").addEventListener("click", () => {
    if (selectedWords.length !== 4) {
        message.textContent = "Select exactly 4 words!";
        return;
    }

    let foundCategory = categories.find(cat =>
        selectedWords.every(word => cat.words.includes(word))
    );

    if (foundCategory) {
        message.textContent = "✅ Correct Group: " + foundCategory.name;
        lockWords();
        solvedGroups++;

        if (solvedGroups === 4) {
            message.textContent = "🎉 You solved all groups!";
            restartBtn.classList.remove("hidden");
        }
    } else {
        mistakes--;
        mistakesDisplay.textContent = "Mistakes Left: " + mistakes;
        message.textContent = "❌ Wrong Group!";
        clearSelection();

        if (mistakes === 0) {
            message.textContent = "💀 Game Over!";
            revealAnswers();
            restartBtn.classList.remove("hidden");
        }
    }
});

function lockWords() {
    document.querySelectorAll(".word").forEach(div => {
        if (selectedWords.includes(div.textContent)) {
            div.classList.remove("selected");
            div.classList.add("locked");
        }
    });
    selectedWords = [];
}

function clearSelection() {
    document.querySelectorAll(".selected").forEach(div =>
        div.classList.remove("selected")
    );
    selectedWords = [];
}

function revealAnswers() {
    document.querySelectorAll(".word").forEach(div => {
        div.classList.add("locked");
    });
}

restartBtn.addEventListener("click", startGame);

startGame();