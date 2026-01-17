const sentences = [
  "Practice makes perfect and speed comes with accuracy.",
  "Typing fast is a skill you can build every day.",
  "The quick brown fox jumps over the lazy dog."
];

const sentenceBox = document.getElementById("sentenceBox");
const inputBox = document.getElementById("inputBox");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const errEl = document.getElementById("errors");
const resetBtn = document.getElementById("resetBtn");
const keyboard = document.getElementById("keyboard");

let current = "";
let startTime = null;
let errors = 0;
let lockedIndex = 0;

const layout = [
  ["1","2","3","4","5","6","7","8","9","0","Backspace"],
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l","Enter"],
  ["z","x","c","v","b","n","m"],
  ["Space"]
];

const keyMap = {};

function buildKeyboard() {
  keyboard.innerHTML = "";
  layout.forEach(row => {
    const r = document.createElement("div");
    r.className = "k-row";
    row.forEach(k => {
      const key = document.createElement("div");
      key.className = "key";
      key.textContent = k === "Space" ? "" : k;
      if (k === "Backspace" || k === "Enter") key.classList.add("wide");
      if (k === "Space") key.classList.add("space");
      keyMap[k.toLowerCase()] = key;
      r.appendChild(key);
    });
    keyboard.appendChild(r);
  });
}
buildKeyboard();

function loadSentence() {
  current = sentences[Math.floor(Math.random() * sentences.length)];
  sentenceBox.innerHTML = "";
  current.split("").forEach((ch, i) => {
    const s = document.createElement("span");
    s.textContent = ch;
    if (i === 0) s.classList.add("active");
    sentenceBox.appendChild(s);
  });

  inputBox.value = "";
  lockedIndex = 0;
  startTime = null;
  errors = 0;
  wpmEl.textContent = "0";
  accEl.textContent = "100%";
  errEl.textContent = "0";
}
loadSentence();

inputBox.addEventListener("input", e => {
  if (!startTime) startTime = Date.now();
  const value = inputBox.value;

  // stop on error
  if (value[lockedIndex] !== current[lockedIndex]) {
    inputBox.value = value.slice(0, lockedIndex);
    errors++;
    errEl.textContent = errors;

    const wrong = (e.data || "").toLowerCase();
    const k = keyMap[wrong];
    if (k) {
      k.classList.add("error");
      setTimeout(() => k.classList.remove("error"), 180);
    }
    return;
  }

  lockedIndex = value.length;

  const chars = sentenceBox.querySelectorAll("span");
  chars.forEach((s,i)=>{
    s.className = "";
    if (i < value.length) s.classList.add("correct");
    else if (i === value.length) s.classList.add("active");
  });

  const t = (Date.now() - startTime) / 60000;
  const wpm = Math.round((value.length/5)/t || 0);
  wpmEl.textContent = wpm;

  const acc = Math.max(0, Math.round(((value.length - errors) / value.length) * 100) || 100);
  accEl.textContent = acc + "%";
});

window.addEventListener("keydown", e => {
  const key = e.key === " " ? "space" : e.key.toLowerCase();
  const el = keyMap[key];
  if (el) {
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 120);
  }
});

resetBtn.addEventListener("click", loadSentence);
