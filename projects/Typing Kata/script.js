/**
 * Typing-Kata Logic
 * Handles snippet rendering, typing events, wpm calculation, and timers.
 */

// --- Data: Code Snippets ---
const SNIPPETS = {
    js: [
        `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        `const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
  }
};`,
        `class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  add(element) {
    const node = new Node(element);
    if (this.head === null) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this.size++;
  }
}`
    ],
    html: [
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <div id="app"></div>
    <script src="main.js"></script>
</body>
</html>`,
        `<form action="/submit" method="post">
    <label for="email">Email:</label>
    <input type="email" id="email" required>
    <button type="submit">Send</button>
</form>`
    ],
    css: [
        `:root {
    --primary: #007bff;
    --secondary: #6c757d;
}
body {
    margin: 0;
    font-family: sans-serif;
    background-color: #f8f9fa;
}`,
        `.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}`
    ]
};

// --- DOM Elements ---
const codeWrapper = document.getElementById('codeWrapper');
const inputField = document.getElementById('inputField');
const wpmEl = document.getElementById('wpm');
const accEl = document.getElementById('accuracy');
const timeEl = document.getElementById('timeLeft');
const resetBtn = document.getElementById('resetBtn');
const newGameBtn = document.getElementById('newGameBtn');
const modal = document.getElementById('resultModal');
const modeBtns = document.querySelectorAll('.mode-btn');

// --- State Variables ---
let currentLang = 'js';
let timer = 60;
let maxTime = 60;
let timeLeft = maxTime;
let timerInterval = null;
let isTyping = false;
let charIndex = 0;
let mistakes = 0;
let currentText = "";

// --- Initialization ---
function init() {
    loadSnippet();
    
    // Event Listeners
    codeWrapper.addEventListener('click', () => inputField.focus());
    document.addEventListener('keydown', () => inputField.focus());
    inputField.addEventListener('input', initTyping);
    resetBtn.addEventListener('click', resetGame);
    newGameBtn.addEventListener('click', resetGame);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            resetGame();
        });
    });
}

// --- Core Logic ---

function loadSnippet() {
    const list = SNIPPETS[currentLang];
    const randIndex = Math.floor(Math.random() * list.length);
    currentText = list[randIndex];
    
    codeWrapper.innerHTML = "";
    // Split text into characters and wrap in spans
    currentText.split('').forEach(char => {
        let span = document.createElement('span');
        span.innerText = char;
        span.classList.add('char');
        codeWrapper.appendChild(span);
    });
    
    // Set initial active char
    codeWrapper.querySelectorAll('.char')[0].classList.add('active');
}

function initTyping(e) {
    const chars = codeWrapper.querySelectorAll('.char');
    let typedChar = inputField.value.split('')[charIndex];

    // Handle initial timer start
    if (!isTyping) {
        timerInterval = setInterval(initTimer, 1000);
        isTyping = true;
    }

    // Input Handling (Backspace vs Char)
    if (e.inputType === 'deleteContentBackward') {
        if (charIndex > 0) {
            charIndex--;
            if (chars[charIndex].classList.contains('incorrect')) {
                mistakes--;
            }
            chars[charIndex].classList.remove('correct', 'incorrect');
        }
    } else {
        if (!typedChar) return; // Guard against weird input events

        if (chars[charIndex].innerText === typedChar) {
            chars[charIndex].classList.add('correct');
        } else {
            mistakes++;
            chars[charIndex].classList.add('incorrect');
        }
        charIndex++;
    }

    // Cursor Movement
    chars.forEach(span => span.classList.remove('active'));
    if (chars[charIndex]) {
        chars[charIndex].classList.add('active');
        
        // Auto-scroll logic if cursor goes out of view
        const charRect = chars[charIndex].getBoundingClientRect();
        const wrapperRect = codeWrapper.getBoundingClientRect();
        if (charRect.bottom > wrapperRect.bottom) {
            codeWrapper.scrollTop += 30; // Scroll down roughly one line height
        }
    } else {
        // End of snippet
        endGame();
    }

    // Update Live Stats
    let wpm = Math.round(((charIndex - mistakes) / 5) / ((maxTime - timeLeft) / 60));
    wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
    
    let accuracy = Math.floor(((charIndex - mistakes) / charIndex) * 100);
    accuracy = accuracy < 0 || !accuracy || accuracy === Infinity ? 100 : accuracy;

    wpmEl.innerText = wpm;
    accEl.innerText = `${accuracy}%`;
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeEl.innerText = `${timeLeft}s`;
    } else {
        endGame();
    }
}

function resetGame() {
    loadSnippet();
    clearInterval(timerInterval);
    timeLeft = maxTime;
    charIndex = mistakes = 0;
    isTyping = false;
    inputField.value = "";
    timeEl.innerText = `${timeLeft}s`;
    wpmEl.innerText = 0;
    accEl.innerText = "100%";
    modal.classList.remove('show');
    codeWrapper.scrollTop = 0;
}

function endGame() {
    clearInterval(timerInterval);
    inputField.value = "";
    
    // Final Calculations
    const timeSpent = maxTime - timeLeft;
    let wpm = Math.round(((charIndex - mistakes) / 5) / (timeSpent / 60));
    wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
    
    let accuracy = Math.floor(((charIndex - mistakes) / charIndex) * 100);
    
    // Populate Modal
    document.getElementById('finalWpm').innerText = wpm;
    document.getElementById('finalAcc').innerText = `${accuracy}%`;
    document.getElementById('finalChars').innerText = `${charIndex}/${currentText.length}`;
    document.getElementById('finalErrors').innerText = mistakes;
    
    modal.classList.add('show');
}

// Start
init();