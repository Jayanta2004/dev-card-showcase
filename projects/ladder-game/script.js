const wordPairs = [
    // 4-letter pairs
    ["cold", "warm"],
    ["head", "tail"],
    ["dark", "light"],
    ["love", "hate"],
    ["good", "evil"],
    ["rise", "fall"],
    ["live", "dead"],
    ["east", "west"],
    ["fire", "wood"],
    ["ship", "dock"],

    // 3-letter pairs (faster mode)
    ["cat", "dog"],
    ["sun", "sky"],
    ["hot", "ice"],
    ["man", "boy"],
    ["pen", "ink"],

    // 5-letter pairs (harder mode)
    ["smile", "frown"],
    ["stone", "money"],
    ["start", "finish"],
    ["brave", "scared"],
    ["clean", "dirty"],
    ["laugh", "cried"],
    ["sweet", "sour"],
    ["right", "wrong"],
    ["light", "heavy"],
    ["black", "white"]
];

let startWord, targetWord;
let timer = 0;
let score = 0;
let interval;

const input = document.getElementById("wordInput");
const historyDiv = document.getElementById("history");

function newGame() {
    const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    startWord = pair[0];
    targetWord = pair[1];

    document.getElementById("startWord").textContent = startWord;
    document.getElementById("targetWord").textContent = targetWord;
    historyDiv.innerHTML = "";
    document.getElementById("message").textContent = "";
    input.value = "";

    timer = 0;
    clearInterval(interval);
    interval = setInterval(() => {
        timer++;
        document.getElementById("timer").textContent = timer;
    }, 1000);
}

input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        submitWord();
    }
});

function submitWord() {
    const word = input.value.trim();
    if (word.length !== startWord.length) {
        showMessage("Invalid length!");
        return;
    }

    if (letterDiff(startWord, word) !== 1) {
        showMessage("Change exactly ONE letter!");
        return;
    }

    appendHistory(word);
    startWord = word;

    if (word === targetWord) {
        score += 10;
        document.getElementById("score").textContent = score;
        document.getElementById("message").innerHTML = "<span class='success'>ACCESS GRANTED ✔</span>";
        clearInterval(interval);
    }

    input.value = "";
}

function appendHistory(word) {
    const p = document.createElement("p");
    p.textContent = word;
    historyDiv.appendChild(p);
}

function letterDiff(a, b) {
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) diff++;
    }
    return diff;
}

function showMessage(msg) {
    document.getElementById("message").textContent = msg;
}

newGame();