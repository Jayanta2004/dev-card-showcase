const storageKey = "language-flashcards";

const cardForm = document.getElementById("cardForm");
const deckList = document.getElementById("deckList");
const studiedToday = document.getElementById("studiedToday");
const studyStreak = document.getElementById("studyStreak");
const masteryRate = document.getElementById("masteryRate");
const masteredCount = document.getElementById("masteredCount");
const nextReview = document.getElementById("nextReview");
const dueCount = document.getElementById("dueCount");
const studyFront = document.getElementById("studyFront");
const studyBack = document.getElementById("studyBack");
const studyExample = document.getElementById("studyExample");
const studyStatus = document.getElementById("studyStatus");
const shuffleBtn = document.getElementById("shuffleBtn");
const flipBtn = document.getElementById("flipBtn");
const speakBtn = document.getElementById("speakBtn");
const exportDeckBtn = document.getElementById("exportDeck");
const importDeckInput = document.getElementById("importDeck");

const challengePrompt = document.getElementById("challengePrompt");
const challengeHint = document.getElementById("challengeHint");
const challengeTimer = document.getElementById("challengeTimer");
const challengeOptions = document.getElementById("challengeOptions");
const challengeCorrect = document.getElementById("challengeCorrect");
const challengePoints = document.getElementById("challengePoints");
const startChallenge = document.getElementById("startChallenge");
const resetChallenge = document.getElementById("resetChallenge");

const progressChartEl = document.getElementById("progressChart");
let progressChart;

const state = {
  decks: {},
  activeDeck: null,
  dueQueue: [],
  currentCard: null,
  showBack: false,
  studyLog: [],
  challenge: {
    active: false,
    timer: 30,
    correct: 0,
    points: 0,
    pool: [],
    current: null,
    interval: null,
  },
};

const createDefaultData = () => {
  if (Object.keys(state.decks).length) return;
  const baseCards = [
    { front: "Hola", back: "Hello", example: "Hola, ¿cómo estás?", locale: "es-ES" },
    { front: "Gracias", back: "Thank you", example: "Muchas gracias", locale: "es-ES" },
    { front: "Adiós", back: "Goodbye", example: "Adiós, hasta luego", locale: "es-ES" },
  ];
  const deckId = crypto.randomUUID();
  state.decks[deckId] = {
    id: deckId,
    name: "Spanish Basics",
    cards: baseCards.map((card) => buildCard(card)),
  };
  state.activeDeck = deckId;
};

const buildCard = ({ front, back, example, locale }) => ({
  id: crypto.randomUUID(),
  front,
  back,
  example,
  locale,
  repetitions: 0,
  interval: 1,
  ease: 2.5,
  due: new Date().toISOString(),
  history: [],
});

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify({
    decks: state.decks,
    activeDeck: state.activeDeck,
    studyLog: state.studyLog,
    challengeScore: state.challenge.points,
  }));
};

const loadState = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  const data = JSON.parse(saved);
  state.decks = data.decks || {};
  state.activeDeck = data.activeDeck || null;
  state.studyLog = data.studyLog || [];
  state.challenge.points = data.challengeScore || 0;
};

const getDecks = () => Object.values(state.decks);

const getActiveDeck = () => state.decks[state.activeDeck];

const updateDeckList = () => {
  deckList.innerHTML = "";
  const decks = getDecks();
  decks.forEach((deck) => {
    const due = deck.cards.filter((card) => new Date(card.due) <= new Date()).length;
    const item = document.createElement("div");
    item.className = "deck-item";
    item.innerHTML = `
      <div>
        <h4>${deck.name}</h4>
        <span>${deck.cards.length} cards • ${due} due</span>
      </div>
      <div>
        <button data-action="select">Study</button>
        <button data-action="delete" class="danger">Delete</button>
      </div>
    `;
    item.querySelector("[data-action='select']").addEventListener("click", () => {
      state.activeDeck = deck.id;
      refreshStudyQueue();
      renderAll();
      saveState();
    });
    item.querySelector("[data-action='delete']").addEventListener("click", () => {
      delete state.decks[deck.id];
      if (state.activeDeck === deck.id) state.activeDeck = getDecks()[0]?.id || null;
      refreshStudyQueue();
      renderAll();
      saveState();
    });
    deckList.appendChild(item);
  });
};

const refreshStudyQueue = () => {
  const deck = getActiveDeck();
  if (!deck) {
    state.dueQueue = [];
    return;
  }
  const now = new Date();
  state.dueQueue = deck.cards.filter((card) => new Date(card.due) <= now);
  state.currentCard = state.dueQueue[0] || null;
  state.showBack = false;
};

const updateStudyCard = () => {
  if (!state.currentCard) {
    studyFront.textContent = "Pick a deck to start.";
    studyBack.textContent = "—";
    studyExample.textContent = "";
    studyStatus.textContent = "0 cards due";
    return;
  }
  studyFront.textContent = state.currentCard.front;
  studyBack.textContent = state.showBack ? state.currentCard.back : "";
  studyExample.textContent = state.showBack ? state.currentCard.example : "";
  studyStatus.textContent = `${state.dueQueue.length} cards due`;
};

const speakCard = () => {
  if (!state.currentCard) return;
  const utterance = new SpeechSynthesisUtterance(state.currentCard.front);
  utterance.lang = state.currentCard.locale || "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const applySM2 = (card, quality) => {
  let { repetitions, interval, ease } = card;
  if (quality <= 1) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ease);
  }
  ease = Math.max(1.3, ease + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02)));
  const due = new Date();
  due.setDate(due.getDate() + interval);
  card.repetitions = repetitions;
  card.interval = interval;
  card.ease = ease;
  card.due = due.toISOString();
  card.history.push({ quality, date: new Date().toISOString() });
};

const logStudy = () => {
  const today = new Date().toISOString().slice(0, 10);
  const record = state.studyLog.find((entry) => entry.date === today);
  if (record) record.count += 1;
  else state.studyLog.push({ date: today, count: 1 });
};

const handleReview = (score) => {
  if (!state.currentCard) return;
  applySM2(state.currentCard, score);
  logStudy();
  state.dueQueue.shift();
  state.currentCard = state.dueQueue[0] || null;
  state.showBack = false;
  renderAll();
  saveState();
};

const updateSummary = () => {
  const today = new Date().toISOString().slice(0, 10);
  const todayLog = state.studyLog.find((entry) => entry.date === today);
  studiedToday.textContent = todayLog ? todayLog.count : 0;

  const days = [...state.studyLog]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((entry) => entry.date);
  let streak = 0;
  if (days.length) {
    const todayDate = new Date(today);
    for (let i = 0; i < 365; i += 1) {
      const check = new Date(todayDate);
      check.setDate(check.getDate() - i);
      const key = check.toISOString().slice(0, 10);
      if (days.includes(key)) streak += 1;
      else break;
    }
  }
  studyStreak.textContent = `Streak ${streak} days`;

  const cards = getDecks().flatMap((deck) => deck.cards);
  const mastered = cards.filter((card) => card.interval >= 21).length;
  masteryRate.textContent = cards.length ? `${Math.round((mastered / cards.length) * 100)}%` : "0%";
  masteredCount.textContent = `${mastered} mastered`;

  const dueCards = cards.filter((card) => new Date(card.due) <= new Date());
  dueCount.textContent = `${dueCards.length} due now`;
  nextReview.textContent = dueCards[0] ? new Date(dueCards[0].due).toLocaleDateString() : "--";

  challengePoints.textContent = `${state.challenge.points} pts`;
  challengeRank.textContent = state.challenge.points > 200 ? "Gold" : state.challenge.points > 80 ? "Silver" : "Bronze";
};

const updateProgressChart = () => {
  const sorted = [...state.studyLog].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sorted.map((entry) => entry.date.slice(5));
  const counts = sorted.map((entry) => entry.count);

  if (progressChart) progressChart.destroy();
  progressChart = new Chart(progressChartEl, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Cards Studied",
          data: counts,
          backgroundColor: "rgba(37, 99, 235, 0.7)",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
};

const startChallengeRound = () => {
  const deck = getActiveDeck();
  if (!deck || deck.cards.length < 4) {
    challengePrompt.textContent = "Add at least 4 cards to play.";
    return;
  }
  const pool = [...deck.cards].sort(() => Math.random() - 0.5).slice(0, 10);
  state.challenge.pool = pool;
  state.challenge.correct = 0;
  state.challenge.active = true;
  state.challenge.timer = 30;
  state.challenge.current = null;
  updateChallengeUI();
  nextChallengeQuestion();
  if (state.challenge.interval) clearInterval(state.challenge.interval);
  state.challenge.interval = setInterval(() => {
    state.challenge.timer -= 1;
    updateChallengeUI();
    if (state.challenge.timer <= 0) finishChallenge();
  }, 1000);
};

const updateChallengeUI = () => {
  challengeTimer.textContent = `00:${String(state.challenge.timer).padStart(2, "0")}`;
  challengeCorrect.textContent = `${state.challenge.correct} correct`;
};

const nextChallengeQuestion = () => {
  if (!state.challenge.pool.length || state.challenge.timer <= 0) {
    finishChallenge();
    return;
  }
  const question = state.challenge.pool.shift();
  state.challenge.current = question;
  challengePrompt.textContent = `Translate: ${question.front}`;
  const options = [question.back];
  const deck = getActiveDeck();
  const distractors = deck.cards
    .filter((card) => card.id !== question.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((card) => card.back);
  options.push(...distractors);
  const shuffled = options.sort(() => Math.random() - 0.5);
  challengeOptions.innerHTML = "";
  shuffled.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => {
      if (!state.challenge.active) return;
      if (option === question.back) {
        state.challenge.correct += 1;
        state.challenge.points += 10;
      }
      updateChallengeUI();
      nextChallengeQuestion();
    });
    challengeOptions.appendChild(button);
  });
};

const finishChallenge = () => {
  state.challenge.active = false;
  clearInterval(state.challenge.interval);
  challengePrompt.textContent = `Challenge complete! ${state.challenge.correct} correct.`;
  challengeOptions.innerHTML = "";
  challengePoints.textContent = `${state.challenge.points} pts`;
  saveState();
};

const resetChallengeState = () => {
  state.challenge.active = false;
  state.challenge.timer = 30;
  state.challenge.correct = 0;
  state.challenge.pool = [];
  state.challenge.current = null;
  clearInterval(state.challenge.interval);
  challengePrompt.textContent = "Start a challenge to test your knowledge.";
  challengeHint.textContent = "30 seconds · 10 questions";
  challengeOptions.innerHTML = "";
  updateChallengeUI();
};

const renderAll = () => {
  updateDeckList();
  refreshStudyQueue();
  updateStudyCard();
  updateSummary();
  updateProgressChart();
};

cardForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const deckName = document.getElementById("deckName").value.trim();
  const front = document.getElementById("frontText").value.trim();
  const back = document.getElementById("backText").value.trim();
  const example = document.getElementById("exampleText").value.trim();
  const locale = document.getElementById("voiceLocale").value;

  let deck = getDecks().find((item) => item.name.toLowerCase() === deckName.toLowerCase());
  if (!deck) {
    const id = crypto.randomUUID();
    deck = { id, name: deckName, cards: [] };
    state.decks[id] = deck;
  }
  const card = buildCard({ front, back, example, locale });
  deck.cards.push(card);
  state.activeDeck = deck.id;
  cardForm.reset();
  saveState();
  renderAll();
});

flipBtn.addEventListener("click", () => {
  state.showBack = !state.showBack;
  updateStudyCard();
});

speakBtn.addEventListener("click", speakCard);
shuffleBtn.addEventListener("click", () => {
  state.dueQueue.sort(() => Math.random() - 0.5);
  state.currentCard = state.dueQueue[0] || null;
  updateStudyCard();
});

document.querySelectorAll(".review-actions button").forEach((button) => {
  button.addEventListener("click", () => handleReview(Number(button.dataset.score)));
});

startChallenge.addEventListener("click", startChallengeRound);
resetChallenge.addEventListener("click", resetChallengeState);

exportDeckBtn.addEventListener("click", () => {
  const data = JSON.stringify({ decks: state.decks }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "flashcards-decks.json";
  link.click();
});

importDeckInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.decks) {
        state.decks = data.decks;
        state.activeDeck = Object.keys(state.decks)[0] || null;
        saveState();
        renderAll();
      }
    } catch (error) {
      console.error(error);
    }
  };
  reader.readAsText(file);
});

loadState();
createDefaultData();
renderAll();
resetChallengeState();
