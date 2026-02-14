const input = document.getElementById("inputText");
const summaryBox = document.getElementById("summaryBox");
const counter = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const lengthSelect = document.getElementById("length");

input.value = localStorage.getItem("summaryText") || "";

function updateCounter() {
  const words = input.value.trim().split(/\s+/).filter(Boolean);
  counter.textContent = `${words.length} words`;
  localStorage.setItem("summaryText", input.value);
}

updateCounter();
input.addEventListener("input", updateCounter);

document.getElementById("summarizeBtn").onclick = () => {
  const text = input.value.trim();
  if (!text) {
    summaryBox.textContent = "Please enter text to summarize.";
    scoreEl.textContent = "—";
    return;
  }

  const maxWords = Number(lengthSelect.value);
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
  let sentence = sentences.sort((a, b) => b.length - a.length)[0];

  sentence = sentence.replace(
    /\b(very|really|basically|actually|just|quite)\b/gi,
    ""
  );

  const words = sentence.split(/\s+/);
  if (words.length > maxWords) {
    sentence = words.slice(0, maxWords).join(" ") + ".";
  }

  summaryBox.textContent = sentence.trim();
  scoreEl.textContent = Math.min(100, sentence.length + 20);
};

document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(summaryBox.textContent);
  scoreEl.textContent = "Copied ✔";
};

document.getElementById("clearBtn").onclick = () => {
  input.value = "";
  summaryBox.textContent = "Your summary will appear here.";
  counter.textContent = "0 words";
  scoreEl.textContent = "—";
  localStorage.removeItem("summaryText");
};

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "Enter") {
    document.getElementById("summarizeBtn").click();
  }
});
