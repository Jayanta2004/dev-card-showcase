const synonyms = {
    "happy": ["joyful", "cheerful", "delighted"],
    "sad": ["unhappy", "sorrowful", "downcast"],
    "fast": ["quick", "rapid", "speedy"],
    "slow": ["sluggish", "lethargic", "delayed"]
};

let board = document.getElementById("board");
let scoreEl = document.getElementById("score");
let streakEl = document.getElementById("streak");
let input = document.getElementById("synonym-input");
let submitBtn = document.getElementById("submit-btn");
let hintBtn = document.getElementById("hint-btn");
let notification = document.getElementById("notification");
let toggleModeBtn = document.getElementById("toggle-mode");

let currentWord = getRandomWord();
let score = 0;
let streak = 0;

// Initialize first word
addWordBubble(currentWord, true);

function getRandomWord() {
    const keys = Object.keys(synonyms);
    return keys[Math.floor(Math.random()*keys.length)];
}

function showNotification(msg, correct=true) {
    notification.innerText = msg;
    notification.style.background = correct?"#4caf50":"#f44336";
    notification.style.display = "block";
    setTimeout(()=> notification.style.display="none",1200);
}

function addWordBubble(word, correct=true){
    const bubble = document.createElement("div");
    bubble.classList.add("word-bubble");
    if(!correct) bubble.classList.add("incorrect");
    bubble.innerText = word;
    board.appendChild(bubble);
}

submitBtn.addEventListener("click", ()=>{
    const userWord = input.value.trim().toLowerCase();
    input.value = "";
    if(!userWord) return;

    if(synonyms[currentWord] && synonyms[currentWord].includes(userWord)){
        addWordBubble(userWord,true);
        score++; streak++;
        scoreEl.innerText = score;
        streakEl.innerText = streak;
        showNotification("Correct!");
        currentWord = userWord;
    } else {
        addWordBubble(userWord,false);
        streak = 0;
        streakEl.innerText = streak;
        showNotification("Incorrect!", false);
    }
});

// Hint button
hintBtn.addEventListener("click", ()=>{
    if(synonyms[currentWord]){
        const hint = synonyms[currentWord][0];
        showNotification(`Hint: Try "${hint}"`);
    }
});

// Dark/light toggle
toggleModeBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
});