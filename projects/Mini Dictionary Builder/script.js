const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveBtn = document.getElementById("saveBtn");

const wordInput = document.getElementById("wordInput");
const meaningInput = document.getElementById("meaningInput");
const exampleInput = document.getElementById("exampleInput");
const categoryInput = document.getElementById("categoryInput");

const searchInput = document.getElementById("searchInput");
const wordList = document.getElementById("wordList");
const tagsBar = document.getElementById("tagsBar");

/* ---------- SMART SEEDING ---------- */
function make(arr, cat) {
  return arr.map(w => {
    let meaning = "";
    let example = "";

    switch (cat) {
      case "Noun":
        meaning = `A thing, place, or idea represented by "${w}".`;
        example = `The ${w.toLowerCase()} played an important role in her life.`;
        break;

      case "Verb":
        meaning = `An action that means to "${w.toLowerCase()}".`;
        example = `She decided to ${w.toLowerCase()} every day to improve herself.`;
        break;

      case "Technical":
        meaning = `A computing term related to "${w.toLowerCase()}".`;
        example = `The developer optimized the app using a better ${w.toLowerCase()}.`;
        break;

      case "Daily-use":
        meaning = `A common word used in everyday life related to "${w.toLowerCase()}".`;
        example = `Every morning, he remembers to ${w.toLowerCase()} before leaving.`;
        break;
    }

    return { word: w, meaning, example, category: cat };
  });
}

function seedIfEmpty() {
  let existing = JSON.parse(localStorage.getItem("dictionary"));
  if (existing && existing.length) return existing;

  const nouns = [
    "Ocean","Mountain","River","Forest","City","Dream","Friendship","Knowledge",
    "Energy","Future","Culture","History","Vision","Journey","Balance","Power",
    "Growth","Freedom","Nature","Success","Time","Hope","Courage","Memory","Peace"
  ];

  const verbs = [
    "Create","Build","Explore","Learn","Grow","Imagine","Achieve","Develop",
    "Improve","Design","Connect","Lead","Solve","Discover","Transform","Inspire",
    "Adapt","Focus","Practice","Share","Guide","Support","Analyze","Plan","Execute"
  ];

  const technical = [
    "Algorithm","Database","API","Framework","Compiler","Encryption","Protocol",
    "Variable","Function","Class","Object","Server","Client","Cloud","Cache",
    "Authentication","Deployment","Versioning","Repository","Middleware",
    "Interface","Debugging","Iteration","Recursion","Optimization"
  ];

  const daily = [
    "Greet","Relax","Organize","Remember","Prepare","Travel","Communicate",
    "Exercise","Read","Write","Listen","Observe","Reflect","Prioritize","Cook",
    "Clean","Shop","Save","Spend","Rest","Wake","Plan","Call","Meet","Enjoy"
  ];

  const seeded = [
    ...make(nouns, "Noun"),
    ...make(verbs, "Verb"),
    ...make(technical, "Technical"),
    ...make(daily, "Daily-use")
  ]; // 100 words

  localStorage.setItem("dictionary", JSON.stringify(seeded));
  return seeded;
}

let dictionary = seedIfEmpty();
let activeTag = "All";

/* ---------- MODAL ---------- */
openModalBtn.onclick = () => modal.classList.add("show");
closeModalBtn.onclick = () => modal.classList.remove("show");

saveBtn.onclick = () => {
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = exampleInput.value.trim();
  const category = categoryInput.value;

  if (!word || !meaning || !category) {
    alert("Word, Meaning, and Category are required!");
    return;
  }

  dictionary.push({ word, meaning, example, category });
  localStorage.setItem("dictionary", JSON.stringify(dictionary));

  wordInput.value = "";
  meaningInput.value = "";
  exampleInput.value = "";
  categoryInput.value = "";

  modal.classList.remove("show");
  render();
};

/* ---------- RENDER ---------- */
function render() {
  renderTags();
  renderList();
}

function renderTags() {
  const categories = ["All", ...new Set(dictionary.map(d => d.category))];
  tagsBar.innerHTML = "";

  categories.forEach(cat => {
    const tag = document.createElement("div");
    tag.className = "tag" + (cat === activeTag ? " active" : "");
    tag.textContent = cat;

    tag.onclick = () => {
      activeTag = cat;
      render();
    };

    tagsBar.appendChild(tag);
  });
}

function renderList() {
  const q = searchInput.value.toLowerCase();

  const filtered = dictionary.filter(item => {
    const matchText = item.word.toLowerCase().includes(q);
    const matchTag = activeTag === "All" || item.category === activeTag;
    return matchText && matchTag;
  });

  wordList.innerHTML = "";

  if (!filtered.length) {
    wordList.innerHTML = "<p style='color:#777'>No words found.</p>";
    return;
  }

  filtered.forEach((item, i) => {
    const realIndex = dictionary.indexOf(item);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="class-header">
        <h3>${item.word}</h3>
        <div class="actions">
            <button class="edit-btn button" onclick="editWord(${realIndex})">📝</button>
            <button class="delete-btn button" onclick="deleteWord(${realIndex})">🗑️</button>
        </div>
      </div>
      <p><strong>Meaning:</strong> ${item.meaning}</p>
      <p><strong>Example:</strong> ${item.example || "-"}</p>
      <div class="card-tags">
        <span>${item.category}</span>
      </div>
    `;

    wordList.appendChild(card);
  });
}

window.deleteWord = function (index) {
  if (!confirm("Delete this word?")) return;

  dictionary.splice(index, 1);
  localStorage.setItem("dictionary", JSON.stringify(dictionary));
  render();
};

window.editWord = function (index) {
  const item = dictionary[index];

  // Open modal with existing values
  wordInput.value = item.word;
  meaningInput.value = item.meaning;
  exampleInput.value = item.example;
  categoryInput.value = item.category;

  modal.classList.add("show");

  // Temporarily override save behavior
  saveBtn.onclick = () => {
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    const example = exampleInput.value.trim();
    const category = categoryInput.value;

    if (!word || !meaning || !category) {
      alert("Word, Meaning, and Category are required!");
      return;
    }

    dictionary[index] = { word, meaning, example, category };
    localStorage.setItem("dictionary", JSON.stringify(dictionary));

    wordInput.value = "";
    meaningInput.value = "";
    exampleInput.value = "";
    categoryInput.value = "";

    modal.classList.remove("show");
    resetSaveHandler();
    render();
  };
};

function resetSaveHandler() {
  saveBtn.onclick = () => {
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    const example = exampleInput.value.trim();
    const category = categoryInput.value;

    if (!word || !meaning || !category) {
      alert("Word, Meaning, and Category are required!");
      return;
    }

    dictionary.push({ word, meaning, example, category });
    localStorage.setItem("dictionary", JSON.stringify(dictionary));

    wordInput.value = "";
    meaningInput.value = "";
    exampleInput.value = "";
    categoryInput.value = "";

    modal.classList.remove("show");
    render();
  };
}

searchInput.oninput = render;
render();
