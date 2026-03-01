const words = [
  {
    word: "Resilient",
    meaning: "Able to recover quickly from difficulties",
    example: "She remained resilient despite repeated failures.",
    synonyms: "Strong, Tough, Adaptable"
  },
  {
    word: "Meticulous",
    meaning: "Showing great attention to detail",
    example: "He was meticulous in documenting the experiment.",
    synonyms: "Careful, Precise, Thorough"
  },
  {
    word: "Ambiguous",
    meaning: "Having more than one possible meaning",
    example: "The instructions were ambiguous.",
    synonyms: "Unclear, Vague, Confusing"
  },
  {
    word: "Eloquent",
    meaning: "Fluent or persuasive in speaking or writing",
    example: "She gave an eloquent speech on education reform.",
    synonyms: "Articulate, Expressive, Persuasive"
  },
  {
    word: "Pragmatic",
    meaning: "Dealing with things sensibly and realistically",
    example: "He took a pragmatic approach to the problem.",
    synonyms: "Practical, Realistic, Sensible"
  },
  {
    word: "Tenacious",
    meaning: "Holding firmly to a position or goal",
    example: "Her tenacious attitude led to success.",
    synonyms: "Persistent, Determined, Resolute"
  },
  {
    word: "Concise",
    meaning: "Giving a lot of information clearly and briefly",
    example: "Keep your answers concise.",
    synonyms: "Brief, Clear, Compact"
  },
  {
    word: "Inevitable",
    meaning: "Certain to happen; unavoidable",
    example: "Change is inevitable in technology.",
    synonyms: "Unavoidable, Certain, Inescapable"
  },
  {
    word: "Subtle",
    meaning: "So delicate or precise as to be difficult to analyze",
    example: "There was a subtle change in his tone.",
    synonyms: "Slight, Delicate, Faint"
  },
  {
    word: "Versatile",
    meaning: "Able to adapt or be adapted to many functions",
    example: "JavaScript is a versatile language.",
    synonyms: "Flexible, Adaptable, Multifunctional"
  },
  {
    word: "Coherent",
    meaning: "Logical and consistent",
    example: "She presented a coherent argument.",
    synonyms: "Logical, Clear, Consistent"
  },
  {
    word: "Empirical",
    meaning: "Based on observation or experience",
    example: "The theory lacks empirical evidence.",
    synonyms: "Experimental, Observed, Practical"
  },
  {
    word: "Alleviate",
    meaning: "Make suffering or a problem less severe",
    example: "New policies aim to alleviate poverty.",
    synonyms: "Reduce, Ease, Relieve"
  },
  {
    word: "Innovative",
    meaning: "Featuring new methods or ideas",
    example: "The company introduced an innovative solution.",
    synonyms: "Creative, Novel, Groundbreaking"
  },
  {
    word: "Candid",
    meaning: "Truthful and straightforward",
    example: "He gave a candid interview.",
    synonyms: "Honest, Frank, Direct"
  }
];

let index = 0;
let knownCount = 0;

const wordEl = document.getElementById("word");
const meaningEl = document.getElementById("meaning");
const exampleEl = document.getElementById("example");
const synonymsEl = document.getElementById("synonyms");
const detailsEl = document.getElementById("details");
const actionsEl = document.getElementById("actions");
const progressBar = document.getElementById("progressBar");
const counterEl = document.getElementById("counter");

function loadWord() {
  const current = words[index];
  wordEl.textContent = current.word;
  meaningEl.textContent = current.meaning;
  exampleEl.textContent = current.example;
  synonymsEl.textContent = current.synonyms;

  detailsEl.classList.add("hidden");
  actionsEl.classList.add("hidden");
  updateProgress();
}

function revealMeaning() {
  detailsEl.classList.remove("hidden");
  actionsEl.classList.remove("hidden");
}

function markKnown(known) {
  if (known) knownCount++;

  index++;

  if (index < words.length) {
    loadWord();
  } else {
    finishSession();
  }
}

function updateProgress() {
  const percent = (index / words.length) * 100;
  progressBar.style.width = percent + "%";
  counterEl.textContent = `Word ${index + 1} of ${words.length}`;
}

function finishSession() {
  document.querySelector(".card").innerHTML = `
    <h2>🎉 Session Complete</h2>
    <p style="text-align:center;">
      You knew <strong>${knownCount}</strong> out of <strong>${words.length}</strong> words.
    </p>
    <button class="reveal-btn" onclick="location.reload()">Restart</button>
  `;
  progressBar.style.width = "100%";
}

loadWord();
