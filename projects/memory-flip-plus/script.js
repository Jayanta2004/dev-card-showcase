const board = document.getElementById('game-board');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const comboEl = document.getElementById('combo');

let level = 1;
let score = 0;
let time = 30;
let combo = 0;
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let timerInterval;
let gameActive = false;

const symbols = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍑', '🍒', '🥝', '🍍', '🥭', '🍈', '🍉'];

function initGame() {
  clearInterval(timerInterval);
  board.innerHTML = '';
  flippedCards = [];
  matchedPairs = 0;
  combo = 0;
  time = Math.max(10, 30 - (level - 1) * 5); // Shrink time per level
  updateUI();

  const numPairs = 4 + level; // Increase pairs per level
  const selectedSymbols = symbols.slice(0, numPairs);
  const cardValues = [...selectedSymbols, ...selectedSymbols]; // Duplicate for pairs

  // Shuffle
  for (let i = cardValues.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
  }

  cards = cardValues.map((value, index) => createCard(value, index));
  cards.forEach(card => board.appendChild(card.element));

  gameActive = true;
  startTimer();
}

function createCard(value, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-front"></div>
    <div class="card-back">${value}</div>
  `;
  card.addEventListener('click', () => flipCard(card, index));
  return { element: card, value, index, flipped: false, matched: false };
}

function flipCard(cardElement, index) {
  if (!gameActive || flippedCards.length >= 2 || cards[index].flipped || cards[index].matched) return;

  cardElement.classList.add('flipped');
  cards[index].flipped = true;
  flippedCards.push(index);

  if (flippedCards.length === 2) {
    setTimeout(checkMatch, 1000);
  }
}

function checkMatch() {
  const [i1, i2] = flippedCards;
  if (cards[i1].value === cards[i2].value) {
    // Match
    cards[i1].matched = true;
    cards[i2].matched = true;
    matchedPairs++;
    combo++;
    score += 10 * combo; // Combo bonus
    time += 2; // Time bonus
    if (matchedPairs === cards.length / 2) {
      level++;
      setTimeout(initGame, 1000);
    }
  } else {
    // No match
    cards[i1].element.classList.remove('flipped');
    cards[i2].element.classList.remove('flipped');
    cards[i1].flipped = false;
    cards[i2].flipped = false;
    combo = 0;
  }
  flippedCards = [];
  updateUI();
}

function startTimer() {
  timerInterval = setInterval(() => {
    time--;
    updateUI();
    if (time <= 0) {
      gameOver();
    }
  }, 1000);
}

function gameOver() {
  clearInterval(timerInterval);
  gameActive = false;
  alert(`Game Over! Final Score: ${score}`);
}

function updateUI() {
  levelEl.textContent = level;
  scoreEl.textContent = score;
  timeEl.textContent = time;
  comboEl.textContent = combo;
}

document.getElementById('restart').addEventListener('click', () => {
  level = 1;
  score = 0;
  initGame();
});

initGame();